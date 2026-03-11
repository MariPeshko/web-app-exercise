from datetime import datetime, timezone
from app.db.session import SessionLocal
from app.db.repository import rollup_daily

def run() -> None:
    today_utc = datetime.now(timezone.utc).date()
    db = SessionLocal()
    try:
        count = rollup_daily(db, today_utc)
        print(f"[aggregate_minutely] upserted rows={count} day={today_utc}")
    finally:
        db.close()

if __name__ == "__main__":
    run()