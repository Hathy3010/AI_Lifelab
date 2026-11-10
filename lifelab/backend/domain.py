"""Deterministic rules for the small balance experiment; no LLM calculations."""

from dataclasses import dataclass, field
import hashlib, json, threading
from datetime import datetime, timezone
from uuid import uuid4

MASSES = {"A": 1, "B": 2}
SLOTS = {-4, -3, -2, -1, 1, 2, 3, 4}


def canonical_plan(placements):
    if len(placements) != 2 or {p["object_id"] for p in placements} != {"A", "B"}:
        raise ValueError("Cần đặt đủ hai vật A và B.")
    if any(type(p["slot"]) is not int or p["slot"] not in SLOTS for p in placements):
        raise ValueError("Vật phải nằm trong ô đặt hợp lệ.")
    if placements[0]["slot"] * placements[1]["slot"] >= 0:
        raise ValueError("Hãy đặt một vật ở mỗi phía điểm tựa.")
    return sorted(placements, key=lambda p: p["object_id"])


def simulate(placements):
    plan = canonical_plan(placements)
    left = sum(MASSES[p["object_id"]] * 9.8 * abs(p["slot"]) * 0.1 for p in plan if p["slot"] < 0)
    right = sum(MASSES[p["object_id"]] * 9.8 * p["slot"] * 0.1 for p in plan if p["slot"] > 0)
    net = right - left
    return {
        "left_torque_nm": round(left, 2),
        "right_torque_nm": round(right, 2),
        "net_torque_nm": round(net, 2),
        "outcome": "BALANCED" if abs(net) <= 0.01 else "RIGHT_DOWN" if net > 0 else "LEFT_DOWN",
    }


def fingerprint(data):
    return hashlib.sha256(
        json.dumps(data, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()
    ).hexdigest()


def now():
    return datetime.now(timezone.utc).isoformat()


@dataclass
class Session:
    id: str = field(default_factory=lambda: str(uuid4()))
    challenge_id: str = "balance"
    attempts: list = field(default_factory=list)
    turns: list = field(default_factory=list)
    requests: dict = field(default_factory=dict)
    completed: bool = False
    reflection: str = ""
    selected_attempt_id: str = ""
    lock: threading.RLock = field(default_factory=threading.RLock)


def add_attempt(session, data):
    payload = {k: v for k, v in data.items() if k != "request_id"}
    hashed = fingerprint(payload)
    key = "run:" + data["request_id"]
    with session.lock:
        if key in session.requests:
            old_hash, result = session.requests[key]
            if old_hash != hashed:
                raise ValueError("Mã yêu cầu đã dùng cho phương án khác.")
            return result
        if session.completed:
            raise ValueError("Phiên đã hoàn thành. Hãy tạo phiên mới để làm tiếp.")
        if len(session.attempts) >= 50:
            raise ValueError("Phiên thử giới hạn 50 lượt. Hãy bắt đầu phiên mới.")
        plan = canonical_plan(data["placements"])
        expected_b = 1 if session.challenge_id == "tip" else 2
        if (
            next(p["slot"] for p in plan if p["object_id"] == "B") != expected_b
            or next(p["slot"] for p in plan if p["object_id"] == "A") >= 0
        ):
            raise ValueError("Vị trí vật không khớp nhiệm vụ hiện tại.")
        result = {
            "id": str(uuid4()),
            "number": len(session.attempts) + 1,
            "placements": plan,
            "prediction": data["prediction"],
            "source": data["source"],
            "result": simulate(plan),
            "created_at": now(),
        }
        session.attempts.append(result)
        session.requests[key] = (hashed, result)
        return result
