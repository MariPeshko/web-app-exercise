import argparse
from datetime import datetime, timedelta, timezone
from app.db.session import SessionLocal
from app.db.repository import rollup_daily

def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Daily analytics rollup")
    parser.add_argument(
        "--day",
        type=str,
        default=None,
        help="Target day in YYYY-MM-DD (default: yesterday UTC)",
    )
    return parser.parse_args()


def run() -> None:
    args = parse_args()

    if args.day:
        target_day = datetime.strptime(args.day, "%Y-%m-%d").date()
    else:
        target_day = (datetime.now(timezone.utc) - timedelta(days=1)).date()

    db = SessionLocal()
    try:
        count = rollup_daily(db, target_day)
        print(f"[aggregate_daily] upserted rows={count} day={target_day}")
    finally:
        db.close()


if __name__ == "__main__":
    run()