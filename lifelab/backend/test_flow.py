"""Integration checks for the local prototype, independent of an LLM provider."""

import os
import unittest
from uuid import uuid4
from unittest.mock import patch
from fastapi.testclient import TestClient
from .app import app, sessions


class StudentFlowTest(unittest.TestCase):
    def setUp(self):
        sessions.clear()
        self.client = TestClient(app)

    def run_attempt(self, session_id, slot, request_id=None, b=2):
        return self.client.post(
            f"/api/sessions/{session_id}/attempts",
            json={
                "request_id": request_id or str(uuid4()),
                "placements": [{"object_id": "A", "slot": slot}, {"object_id": "B", "slot": b}],
                "prediction": {
                    "outcome": "BALANCED",
                    "explanation": "So sánh khối lượng và khoảng cách.",
                },
                "source": "gesture",
            },
        )

    @patch.dict(os.environ, {"OLLAMA_MODEL": ""})
    def test_attempt_coach_reflection_restore(self):
        created = self.client.post("/api/sessions", json={"challenge_id": "balance"})
        self.assertEqual(created.status_code, 200)
        sid = created.json()["id"]
        first = self.run_attempt(sid, -2).json()
        self.assertEqual(first["result"]["outcome"], "RIGHT_DOWN")
        premature = self.client.post(
            f"/api/sessions/{sid}/complete",
            json={"selected_attempt_id": first["id"], "reflection": "Em thử giữ B và thay đổi A."},
        )
        self.assertEqual(premature.status_code, 422)
        request_id = str(uuid4())
        second = self.run_attempt(sid, -4, request_id).json()
        self.assertEqual(second["result"]["outcome"], "BALANCED")
        self.assertEqual(self.run_attempt(sid, -4, request_id).json()["id"], second["id"])
        self.assertEqual(self.run_attempt(sid, -3, request_id).status_code, 409)
        reply = self.client.post(
            f"/api/sessions/{sid}/coach",
            json={
                "request_id": str(uuid4()),
                "mode": "COMPARE",
                "question": "Hai lượt khác nhau thế nào?",
                "source_ids": [first["id"], second["id"]],
                "hint_level": 2,
            },
        )
        self.assertEqual(reply.status_code, 200)
        self.assertTrue(reply.json()["fallback"])
        self.assertEqual(reply.json()["referenced_attempt_ids"], [first["id"], second["id"]])
        completed = self.client.post(
            f"/api/sessions/{sid}/complete",
            json={
                "selected_attempt_id": second["id"],
                "reflection": "A nhẹ hơn nên phải đặt xa điểm tựa hơn B.",
            },
        )
        self.assertEqual(completed.status_code, 200)
        restored = self.client.get(f"/api/sessions/{sid}").json()
        self.assertTrue(restored["completed"])
        self.assertEqual(len(restored["attempts"]), 2)
        self.assertTrue(restored["turns"][0]["reply"]["fallback"])
        self.assertEqual(self.run_attempt(sid, -3).status_code, 409)

    def test_task_boundary_and_foreign_source(self):
        sid = self.client.post("/api/sessions", json={"challenge_id": "tip"}).json()["id"]
        self.assertEqual(self.run_attempt(sid, -3, b=2).status_code, 422)
        self.assertEqual(self.run_attempt(sid, -3, b=1).status_code, 200)
        reply = self.client.post(
            f"/api/sessions/{sid}/coach",
            json={
                "request_id": str(uuid4()),
                "mode": "EXPLAIN",
                "question": "Giải thích giúp em",
                "source_ids": [str(uuid4())],
                "hint_level": 2,
            },
        )
        self.assertEqual(reply.status_code, 422)
        self.assertEqual(
            self.client.post("/api/sessions", json={"challenge_id": "water"}).status_code, 422
        )


if __name__ == "__main__":
    unittest.main()
