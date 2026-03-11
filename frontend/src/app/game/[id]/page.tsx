"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { apiGetGameState, apiSubmitAnswer } from "@/lib/api";
import { GameState } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trophy, Clock, CheckCircle } from "lucide-react";
import { springBouncy, fadeInUp, popIn } from "@/lib/animations";

const POLL_INTERVAL = 1500;
const OPTION_LABELS = ["A", "B", "C", "D"];
const OPTION_COLORS = [
  "border-blue-500 bg-blue-50 text-blue-900 hover:bg-blue-100",
  "border-green-500 bg-green-50 text-green-900 hover:bg-green-100",
  "border-yellow-500 bg-yellow-50 text-yellow-900 hover:bg-yellow-100",
  "border-red-500 bg-red-50 text-red-900 hover:bg-red-100",
];
const OPTION_SELECTED = [
  "border-blue-500 bg-blue-200 text-blue-900 ring-2 ring-blue-500",
  "border-green-500 bg-green-200 text-green-900 ring-2 ring-green-500",
  "border-yellow-500 bg-yellow-200 text-yellow-900 ring-2 ring-yellow-500",
  "border-red-500 bg-red-200 text-red-900 ring-2 ring-red-500",
];

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export default function GamePlayPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const gameId = params.id as string;

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [lastAnswerResult, setLastAnswerResult] = useState<{
    is_correct: boolean;
    score: number;
  } | null>(null);

  // Local timer interpolation
  const [displayTime, setDisplayTime] = useState(0);
  const lastPollTime = useRef<number>(Date.now());
  const serverTimeRemaining = useRef<number>(0);

  const fetchState = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const data = await apiGetGameState(token, gameId);
      setGameState(data);
      serverTimeRemaining.current = data.time_remaining;
      lastPollTime.current = Date.now();
      setDisplayTime(data.time_remaining);
      setError(null);

      if (data.status === "finished") {
        router.push(`/game/${gameId}/results`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load game");
    } finally {
      setLoading(false);
    }
  }, [gameId, router]);

  // Poll
  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchState]);

  // Local timer interpolation (update every 100ms)
  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = (Date.now() - lastPollTime.current) / 1000;
      const remaining = Math.max(0, serverTimeRemaining.current - elapsed);
      setDisplayTime(remaining);
    }, 100);
    return () => clearInterval(timer);
  }, []);

  // Clear answer feedback when round changes
  const prevRound = useRef<number>(0);
  useEffect(() => {
    if (gameState && gameState.current_round !== prevRound.current) {
      prevRound.current = gameState.current_round;
      setLastAnswerResult(null);
    }
  }, [gameState]);

  const handleAnswer = async (index: number) => {
    const token = getToken();
    if (!token || submitting) return;
    setSubmitting(true);
    try {
      const result = await apiSubmitAnswer(token, gameId, index);
      setLastAnswerResult(result);
      await fetchState();
    } catch (err) {
      console.error("Failed to submit answer:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <Loader2 className="h-8 w-8 text-primary" />
        </motion.div>
      </main>
    );
  }

  if (error || !gameState) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6">
        <h1 className="font-heading text-2xl font-black uppercase">
          Game Error
        </h1>
        <p className="text-muted-foreground">{error || "Game not found"}</p>
      </main>
    );
  }

  const { question, scores, current_round, total_rounds, my_answer } =
    gameState;
  const timerPercent = gameState.status === "active"
    ? (displayTime / 30) * 100
    : 0;
  const options = question
    ? [question.option_a, question.option_b, question.option_c, question.option_d]
    : [];

  return (
    <main className="min-h-screen px-6 pt-24 pb-12">
      <div className="pointer-events-none fixed inset-0 bg-dots opacity-15" />

      <div className="relative mx-auto max-w-5xl">
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          {/* Main game area */}
          <div className="space-y-4">
            {/* Round badge + timer */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="flex items-center justify-between"
            >
              <Badge className="bg-primary text-primary-foreground font-heading text-sm px-3 py-1 shadow-[2px_2px_0px_0px_#000000]">
                Round {current_round} of {total_rounds}
              </Badge>

              <div className="flex items-center gap-2 font-mono text-sm font-bold">
                <Clock className="h-4 w-4" />
                {Math.ceil(displayTime)}s
              </div>
            </motion.div>

            {/* Timer bar */}
            <div className="h-3 w-full border-2 border-foreground bg-muted shadow-[2px_2px_0px_0px_#000000]">
              <motion.div
                className={`h-full ${
                  timerPercent > 33 ? "bg-primary" : timerPercent > 15 ? "bg-yellow-500" : "bg-destructive"
                }`}
                style={{ width: `${timerPercent}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>

            {/* Question card */}
            {question && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={current_round}
                  variants={popIn}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                >
                  <Card className="shadow-[4px_4px_0px_0px_#000000]">
                    <CardContent className="p-6">
                      <h2 className="font-heading text-xl font-black leading-tight">
                        {question.question_text}
                      </h2>
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatePresence>
            )}

            {/* Answer feedback */}
            {lastAnswerResult && (
              <motion.div
                variants={popIn}
                initial="hidden"
                animate="visible"
                className={`flex items-center gap-2 p-3 border-2 border-foreground font-heading text-sm font-bold shadow-[2px_2px_0px_0px_#000000] ${
                  lastAnswerResult.is_correct
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                <CheckCircle className="h-5 w-5" />
                {lastAnswerResult.is_correct
                  ? `Correct! +${lastAnswerResult.score} points`
                  : "Wrong answer!"}
              </motion.div>
            )}

            {/* Options grid */}
            {question && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {options.map((opt, i) => {
                  const isSelected = my_answer === i;
                  const isDisabled = my_answer !== null || submitting;

                  return (
                    <motion.button
                      key={`${current_round}-${i}`}
                      whileHover={isDisabled ? {} : { scale: 1.02, y: -2 }}
                      whileTap={isDisabled ? {} : { scale: 0.98 }}
                      transition={springBouncy}
                      onClick={() => !isDisabled && handleAnswer(i)}
                      disabled={isDisabled}
                      className={`flex items-start gap-3 border-2 border-foreground p-4 text-left font-medium shadow-[3px_3px_0px_0px_#000000] transition-colors ${
                        isSelected
                          ? OPTION_SELECTED[i]
                          : isDisabled
                            ? "bg-muted/50 opacity-70 cursor-not-allowed"
                            : OPTION_COLORS[i] + " cursor-pointer"
                      }`}
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-gray-800 bg-white text-gray-900 font-heading text-sm font-black shadow-[1px_1px_0px_0px_#000000]">
                        {OPTION_LABELS[i]}
                      </span>
                      <span className="pt-1">{opt}</span>
                    </motion.button>
                  );
                })}
              </div>
            )}

            {/* Waiting message when answered */}
            {my_answer !== null && !lastAnswerResult && (
              <p className="text-center text-sm text-muted-foreground">
                Waiting for next round...
              </p>
            )}
          </div>

          {/* Scoreboard sidebar */}
          <motion.div variants={fadeInUp} initial="hidden" animate="visible">
            <Card className="shadow-[4px_4px_0px_0px_#000000] lg:sticky lg:top-24">
              <CardContent className="p-4">
                <div className="mb-3 flex items-center gap-2 font-heading text-sm font-bold uppercase">
                  <Trophy className="h-4 w-4" />
                  Scoreboard
                </div>
                <div className="space-y-2">
                  {scores.map((s, i) => (
                    <div
                      key={s.player_id}
                      className={`flex items-center justify-between border-2 border-foreground p-2 text-sm shadow-[2px_2px_0px_0px_#000000] ${
                        i === 0
                          ? "bg-yellow-50 text-yellow-900"
                          : i === 1
                            ? "bg-gray-50 text-gray-900"
                            : "bg-white text-gray-900"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center border border-gray-800 bg-white text-gray-900 font-mono text-xs font-bold">
                          {i + 1}
                        </span>
                        <Link
                          href={`/profile/${s.player_id}`}
                          className="font-bold truncate max-w-[120px] underline decoration-dotted underline-offset-2 hover:text-blue-600 transition-colors"
                        >
                          {s.nickname}
                        </Link>
                      </div>
                      <span className="font-mono font-bold">{s.score}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
