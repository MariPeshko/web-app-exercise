from fastapi.testclient import TestClient

from app.main import app


def test_kpis_endpoint_returns_payload(monkeypatch) -> None:
    client = TestClient(app)

    def _fake_get_kpis(from_, to, mode=None, user_id=None):
        return {
            "games_played": 10,
            "avg_score": 56.7,
            "best_score": 120,
            "avg_answer_time_ms": 4321.0,
            "active_users": 4,
        }

    monkeypatch.setattr("app.api.routes_kpis.get_kpis", _fake_get_kpis)

    response = client.get(
        "/analytics/kpis",
        params={"from": "2026-01-01T00:00:00Z", "to": "2026-01-31T00:00:00Z"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["games_played"] == 10
    assert data["best_score"] == 120


def test_timeseries_endpoint_returns_points(monkeypatch) -> None:
    client = TestClient(app)

    def _fake_get_timeseries(metric, interval, from_, to, mode=None, user_id=None):
        return {
            "metric": metric,
            "interval": interval,
            "points": [
                {"timestamp": "2026-01-01T00:00:00+00:00", "value": 11.0},
                {"timestamp": "2026-01-02T00:00:00+00:00", "value": 13.0},
            ],
        }

    monkeypatch.setattr("app.api.routes_timeseries.get_timeseries", _fake_get_timeseries)

    response = client.get(
        "/analytics/timeseries",
        params={
            "metric": "games_played",
            "interval": "day",
            "from": "2026-01-01T00:00:00Z",
            "to": "2026-01-31T00:00:00Z",
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["metric"] == "games_played"
    assert len(data["points"]) == 2


def test_kpis_rejects_invalid_date_range() -> None:
    client = TestClient(app)
    response = client.get(
        "/analytics/kpis",
        params={"from": "2026-02-01T00:00:00Z", "to": "2026-01-01T00:00:00Z"},
    )
    assert response.status_code == 422
