from pathlib import Path
from typing import Literal, Annotated
from uuid import UUID
import asyncio
from fastapi import FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field, ConfigDict, StrictInt
from .domain import Session, add_attempt, fingerprint, canonical_plan
from . import coach

app = FastAPI(title="AI LifeLab · Balance prototype", version="0.1.0")
sessions: dict[str, Session] = {}


class Model(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)


class CreateSession(Model):
    challenge_id: Literal["balance", "tip"] = "balance"


class Placement(Model):
    object_id: Literal["A", "B"]
    slot: StrictInt


class Prediction(Model):
    outcome: Literal["LEFT_DOWN", "RIGHT_DOWN", "BALANCED"]
    explanation: Annotated[str, Field(min_length=1, max_length=1000)]


class Run(Model):
    request_id: UUID
    placements: Annotated[list[Placement], Field(min_length=2, max_length=2)]
    prediction: Prediction
    source: Literal["pointer", "keyboard", "gesture"]


class Chat(Model):
    request_id: UUID
    mode: Literal["PREDICT", "HINT", "EXPLAIN", "COMPARE", "REFLECT"]
    question: Annotated[str, Field(min_length=1, max_length=2000)]
    source_ids: Annotated[list[UUID], Field(max_length=4)]
    hint_level: Annotated[int, Field(ge=1, le=3)]


class Complete(Model):
    selected_attempt_id: UUID
    reflection: Annotated[str, Field(min_length=10, max_length=2000)]


@app.middleware("http")
async def local_only(request: Request, call_next):
    origin = request.headers.get("origin")
    if (
        request.method == "POST"
        and origin
        and origin
        not in [
            "http://127.0.0.1:5173",
            "http://localhost:5173",
            "http://127.0.0.1:8000",
            "http://localhost:8000",
            "http://127.0.0.1:4173",
            "http://localhost:4173",
        ]
    ):
        from starlette.responses import JSONResponse

        return JSONResponse({"detail": "Nguồn yêu cầu không được phép."}, status_code=403)
    return await call_next(request)


def get_session(id: str):
    if id not in sessions:
        raise HTTPException(404, "Phiên không còn tồn tại. Hãy bắt đầu phiên mới.")
    return sessions[id]


@app.get("/api/health")
def health():
    return {"ok": True, "coach_configured": coach.configured(), "storage": "memory"}


@app.post("/api/sessions")
def create_session(body: CreateSession):
    if len(sessions) >= 100:
        # Local single-user prototype; discard oldest session to bound memory use.
        sessions.pop(next(iter(sessions)))
    session = Session(challenge_id=body.challenge_id)
    sessions[session.id] = session
    return {"id": session.id, "coach_configured": coach.configured()}


@app.post("/api/sessions/{id}/attempts")
def run(id: str, body: Run):
    try:
        return add_attempt(get_session(id), body.model_dump(mode="json"))
    except ValueError as e:
        raise HTTPException(
            409 if "Mã yêu cầu" in str(e) or "hoàn thành" in str(e) else 422, str(e)
        )


@app.get("/api/sessions/{id}")
def read(id: str):
    s = get_session(id)
    return {
        "id": s.id,
        "challenge_id": s.challenge_id,
        "attempts": s.attempts,
        "completed": s.completed,
        "reflection": s.reflection,
        "selected_attempt_id": s.selected_attempt_id,
        "turns": s.turns,
    }


@app.post("/api/sessions/{id}/coach")
async def ask(id: str, body: Chat):
    s = get_session(id)
    data = body.model_dump(mode="json")
    key = "chat:" + str(body.request_id)
    hashed = fingerprint(data)
    with s.lock:
        if key in s.requests:
            old, result = s.requests[key]
            if old != hashed:
                raise HTTPException(409, "Mã yêu cầu đã dùng cho câu hỏi khác.")
            if result is None:
                raise HTTPException(409, "Câu hỏi đang được xử lý.")
            return result
        if len(s.turns) >= 40:
            raise HTTPException(429, "Phiên thử giới hạn 40 câu hỏi Coach.")
        if any(k.startswith("chat:") and v[1] is None for k, v in s.requests.items()):
            raise HTTPException(409, "Hãy chờ Coach trả lời câu hỏi trước.")
        sources = [str(x) for x in body.source_ids]
        if any(x not in {a["id"] for a in s.attempts} for x in sources):
            raise HTTPException(422, "Nguồn tham chiếu không thuộc phiên này.")
        if body.mode == "COMPARE" and len(set(sources)) != 2:
            raise HTTPException(422, "Cần chọn hai lượt thử khác nhau để so sánh.")
        attempts = [a for a in s.attempts if a["id"] in sources]
        s.requests[key] = (hashed, None)
    try:
        async with asyncio.timeout(11):
            reply = await asyncio.to_thread(
                coach.respond,
                body.mode,
                body.question,
                body.hint_level,
                attempts,
                list(s.turns),
                s.challenge_id,
            )
    except TimeoutError:
        reply = coach.fallback(body.mode, body.hint_level, attempts, "timeout")
    except Exception:
        reply = coach.fallback(body.mode, body.hint_level, attempts, "unavailable")
    with s.lock:
        s.turns.append(
            {
                "question": body.question,
                "answer": reply["message"],
                "mode": body.mode,
                "reply": reply,
            }
        )
        s.requests[key] = (hashed, reply)
    return reply


@app.post("/api/sessions/{id}/complete")
def complete(id: str, body: Complete):
    s = get_session(id)
    with s.lock:
        if len({fingerprint(a["placements"]) for a in s.attempts}) < 2:
            raise HTTPException(422, "Hãy thử ít nhất hai phương án khác nhau.")
        if str(body.selected_attempt_id) not in {a["id"] for a in s.attempts}:
            raise HTTPException(422, "Lượt thử cuối không thuộc phiên này.")
        if s.completed and (
            s.reflection != body.reflection
            or s.selected_attempt_id != str(body.selected_attempt_id)
        ):
            raise HTTPException(409, "Phiên đã được hoàn thành với nội dung khác.")
        s.completed = True
        s.reflection = body.reflection
        s.selected_attempt_id = str(body.selected_attempt_id)
    return {"completed": True}


dist = Path(__file__).resolve().parents[1] / "dist"
if dist.is_dir():
    app.mount("/", StaticFiles(directory=dist, html=True), name="frontend")
