import random
from datetime import datetime, timedelta, timezone
import httpx

BASE_URL = "http://127.0.0.1:8001/analytics/events"
USERS = [f"user_{i}" for i in range(1, 16)]
MODES = ["solo", "group"]

now = datetime.now(timezone.utc)
start = now - timedelta(days=14)

events = []
for d in range(15):
    day = start + timedelta(days=d)
    for _ in range(random.randint(20, 50)):  # games/day
        user = random.choice(USERS)
        mode = random.choice(MODES)
        game_id = f"game_{d}_{random.randint(1000,9999)}"

        # game_started
        events.append({
            "event_type": "game_started",
            "timestamp": (day + timedelta(minutes=random.randint(0, 1200))).isoformat(),
            "user_id": user,
            "game_id": game_id,
            "session_id": f"s_{random.randint(1,99999)}",
            "mode": mode,
            "payload": {}
        })

        score = 0
        # question_answered (5 to 12 questions)
        for q in range(random.randint(5, 12)):
            correct = random.random() < 0.65
            answer_ms = random.randint(1500, 12000)
            delta = 10 if correct else 0
            score += delta
            events.append({
                "event_type": "question_answered",
                "timestamp": (day + timedelta(minutes=random.randint(0, 1200))).isoformat(),
                "user_id": user,
                "game_id": game_id,
                "session_id": f"s_{random.randint(1,99999)}",
                "mode": mode,
                "payload": {
                    "question_id": f"q_{q}",
                    "is_correct": correct,
                    "answer_time_ms": answer_ms,
                    "score_delta": delta
                }
            })

        # game_finished
        events.append({
            "event_type": "game_finished",
            "timestamp": (day + timedelta(minutes=random.randint(0, 1200))).isoformat(),
            "user_id": user,
            "game_id": game_id,
            "session_id": f"s_{random.randint(1,99999)}",
            "mode": mode,
            "payload": {"score": score}
        })

with httpx.Client(timeout=20) as client:
    sent = 0
    for e in events:
        r = client.post(BASE_URL, json=e)
        r.raise_for_status()
        sent += 1
    print(f"Seeded {sent} events")