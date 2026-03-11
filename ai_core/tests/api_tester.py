#!/usr/bin/env python3
"""
Simple API tester for ai_core FastAPI service.

It supports:
- smoke mode: full end-to-end automatic test flow
- interactive mode: manual endpoint testing with prompts
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
import uuid
from dataclasses import dataclass
from typing import Any, Dict, List, Optional

try:
    import requests
except ImportError:
    print(
        "Missing dependency: requests\n"
        "Install it with: pip install requests",
        file=sys.stderr,
    )
    sys.exit(1)


DEFAULT_BASE_URL = "http://127.0.0.1:8000"


def print_connection_help(base_url: str, error: Exception) -> None:
    print(
        "\nCannot connect to the API.\n"
        f"Requested base URL: {base_url}\n"
        f"Error: {error}\n\n"
        "Make sure your FastAPI server is running, for example:\n"
        "  cd ai_core\n"
        "  uvicorn main:app --reload --host 127.0.0.1 --port 8000\n\n"
        "If your server uses a different host/port, run the tester with:\n"
        "  --base-url http://<host>:<port>\n\n"
        "If you are behind a corporate proxy, try setting:\n"
        "  $env:NO_PROXY = '127.0.0.1,localhost'\n"
    )


@dataclass
class ApiTester:
    base_url: str
    timeout: int = 120

    def _url(self, path: str) -> str:
        return f"{self.base_url.rstrip('/')}{path}"

    def check_server(self) -> Optional[Exception]:
        # /docs is available by default in FastAPI and is a simple liveness check.
        try:
            response = requests.get(self._url("/docs"), timeout=min(self.timeout, 10))
            if response.status_code < 500:
                return None
            return Exception(f"Server returned status {response.status_code}")
        except requests.RequestException as e:
            return e

    def _print_response(self, label: str, response: requests.Response) -> Dict[str, Any]:
        print(f"\n[{label}] status={response.status_code}")
        try:
            payload = response.json()
            print(json.dumps(payload, indent=2, ensure_ascii=False))
            return payload
        except ValueError:
            print(response.text)
            return {"raw": response.text}

    def upload(self, game_id: str, pdf_path: str) -> Dict[str, Any]:
        if not os.path.exists(pdf_path):
            raise FileNotFoundError(f"PDF not found: {pdf_path}")

        with open(pdf_path, "rb") as pdf_file:
            files = {"file": (os.path.basename(pdf_path), pdf_file, "application/pdf")}
            response = requests.post(
                self._url("/upload"),
                params={"game_id": game_id},
                files=files,
                timeout=self.timeout,
            )
        return self._print_response("UPLOAD", response)

    def generate_questions(self, game_id: str, num_questions: int) -> Dict[str, Any]:
        response = requests.post(
            self._url("/generate-questions"),
            json={"game_id": game_id, "num_questions": num_questions},
            timeout=self.timeout,
        )
        return self._print_response("GENERATE_QUESTIONS", response)

    def validate_answer(self, user_answer: str, correct_answer: str, context: str) -> Dict[str, Any]:
        response = requests.post(
            self._url("/validate-answer"),
            json={
                "user_answer": user_answer,
                "correct_answer": correct_answer,
                "context": context,
            },
            timeout=self.timeout,
        )
        return self._print_response("VALIDATE_ANSWER", response)

    def chat(self, game_id: str, message: str, history: Optional[List[str]] = None) -> Dict[str, Any]:
        response = requests.post(
            self._url("/chat"),
            json={"game_id": game_id, "message": message, "history": history or []},
            timeout=self.timeout,
        )
        return self._print_response("CHAT", response)


def pick_first_question(questions_payload: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    questions = questions_payload.get("questions")
    if not isinstance(questions, list) or not questions:
        return None
    first = questions[0]
    return first if isinstance(first, dict) else None


def run_smoke_test(
    tester: ApiTester,
    game_id: str,
    pdf_path: str,
    num_questions: int,
    chat_message: str,
) -> int:
    print("Running smoke test...")
    print(f"base_url={tester.base_url}")
    print(f"game_id={game_id}")
    print(f"pdf={pdf_path}")
    started = time.time()

    try:
        upload_payload = tester.upload(game_id, pdf_path)
    except requests.RequestException as e:
        print_connection_help(tester.base_url, e)
        return 1

    if upload_payload.get("game_id") != game_id:
        print("\nSmoke test failed: upload did not return expected game_id.")
        return 1

    questions_payload = tester.generate_questions(game_id, num_questions)
    first_question = pick_first_question(questions_payload)
    if not first_question:
        print("\nSmoke test failed: no valid questions returned.")
        return 1

    correct_answer = str(first_question.get("answer", ""))
    context = str(first_question.get("context", ""))
    if not correct_answer or not context:
        print("\nSmoke test failed: first question missing answer/context.")
        return 1

    validate_payload = tester.validate_answer(correct_answer, correct_answer, context)
    if "is_correct" not in validate_payload:
        print("\nSmoke test failed: validate-answer payload missing is_correct.")
        return 1

    chat_payload = tester.chat(game_id, chat_message, history=[])
    if "response" not in chat_payload:
        print("\nSmoke test failed: chat payload missing response.")
        return 1

    elapsed = time.time() - started
    print(f"\nSmoke test passed in {elapsed:.1f}s.")
    return 0


def run_interactive_mode(tester: ApiTester, game_id: str, pdf_path: Optional[str], num_questions: int) -> int:
    print("Interactive tester")
    print(f"base_url={tester.base_url}")
    print(f"game_id={game_id}")

    cached_questions: List[Dict[str, Any]] = []
    chat_history: List[str] = []

    while True:
        print(
            "\nChoose an action:\n"
            "1) Upload PDF\n"
            "2) Generate Questions\n"
            "3) Validate Answer (from first generated question)\n"
            "4) Chat\n"
            "5) Exit"
        )
        choice = input("> ").strip()

        if choice == "1":
            chosen_pdf = input(f"PDF path [{pdf_path or ''}]: ").strip() or (pdf_path or "")
            if not chosen_pdf:
                print("No PDF path provided.")
                continue
            try:
                tester.upload(game_id, chosen_pdf)
            except Exception as exc:
                print(f"Upload failed: {exc}")

        elif choice == "2":
            raw_n = input(f"Number of questions [{num_questions}]: ").strip()
            selected_n = int(raw_n) if raw_n else num_questions
            try:
                payload = tester.generate_questions(game_id, selected_n)
                raw_questions = payload.get("questions", [])
                cached_questions = [q for q in raw_questions if isinstance(q, dict)]
            except Exception as exc:
                print(f"Generate questions failed: {exc}")

        elif choice == "3":
            if not cached_questions:
                print("No generated questions in memory. Run option 2 first.")
                continue
            q = cached_questions[0]
            print("\nQuestion:")
            print(q.get("question", "<missing question text>"))
            print("Expected answer:")
            print(q.get("answer", "<missing answer>"))
            user_answer = input("Type answer to validate (leave blank to use expected answer): ").strip()
            if not user_answer:
                user_answer = str(q.get("answer", ""))
            context = str(q.get("context", ""))
            try:
                tester.validate_answer(user_answer, str(q.get("answer", "")), context)
            except Exception as exc:
                print(f"Validate answer failed: {exc}")

        elif choice == "4":
            message = input("Message: ").strip()
            if not message:
                print("Message cannot be empty.")
                continue
            try:
                payload = tester.chat(game_id, message, chat_history)
                response_text = payload.get("response")
                if isinstance(response_text, str):
                    chat_history.extend([f"user: {message}", f"assistant: {response_text}"])
            except Exception as exc:
                print(f"Chat failed: {exc}")

        elif choice == "5":
            print("Exiting interactive tester.")
            return 0

        else:
            print("Invalid option. Choose 1-5.")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="ai_core endpoint tester")
    parser.add_argument("--base-url", default=DEFAULT_BASE_URL, help="API base URL")
    parser.add_argument(
        "--game-id",
        default=f"test-{uuid.uuid4().hex[:8]}",
        help="Game ID used for upload/question/chat flow",
    )
    parser.add_argument("--pdf", help="Path to local PDF file for /upload")
    parser.add_argument("--num-questions", type=int, default=3, help="Number of questions to request")
    parser.add_argument(
        "--chat-message",
        default="Give me a short summary of this document.",
        help="Message used in smoke test chat",
    )
    parser.add_argument(
        "--mode",
        choices=["smoke", "interactive"],
        default="smoke",
        help="smoke: full automated flow; interactive: manual actions",
    )
    parser.add_argument("--timeout", type=int, default=120, help="HTTP timeout in seconds")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    tester = ApiTester(base_url=args.base_url, timeout=args.timeout)

    error = tester.check_server()
    if error:
        print_connection_help(tester.base_url, error)
        return 1

    if args.mode == "smoke":
        if not args.pdf:
            print("Smoke mode requires --pdf path.", file=sys.stderr)
            return 2
        return run_smoke_test(
            tester=tester,
            game_id=args.game_id,
            pdf_path=args.pdf,
            num_questions=args.num_questions,
            chat_message=args.chat_message,
        )

    return run_interactive_mode(
        tester=tester,
        game_id=args.game_id,
        pdf_path=args.pdf,
        num_questions=args.num_questions,
    )


if __name__ == "__main__":
    raise SystemExit(main())
