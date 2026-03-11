"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiGetGameResults } from "@/lib/api";
import { GameResults } from "@/lib/types";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, ArrowLeft, Loader2 } from "lucide-react";
import { fadeInUp, popIn, staggerContainer, staggerChild, springBouncy } from "@/lib/animations";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

const PODIUM_COLORS = [
  "bg-yellow-100 border-yellow-500 text-yellow-900",
  "bg-gray-100 border-gray-400 text-gray-900",
  "bg-orange-100 border-orange-400 text-orange-900",
];

const PODIUM_ICONS = ["text-yellow-500", "text-gray-400", "text-orange-400"];

export default function GameResultsPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.id as string;

  const [results, setResults] = useState<GameResults | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchResults = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const data = await apiGetGameResults(token, gameId);
      setResults(data);
    } catch (err) {
      console.error("Failed to fetch results:", err);
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

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

  if (!results) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6">
        <h1 className="font-heading text-2xl font-black uppercase">
          No Results
        </h1>
        <Button onClick={() => router.push("/dashboard")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </main>
    );
  }

  const { leaderboard } = results;
  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <main className="min-h-screen px-6 pt-24 pb-12">
      <div className="pointer-events-none fixed inset-0 bg-dots opacity-15" />

      <div className="relative mx-auto max-w-2xl">
        {/* Title */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mb-8 text-center"
        >
          <h1 className="font-heading text-4xl font-black uppercase tracking-wide">
            Game Over
          </h1>
          <p className="mt-2 text-muted-foreground">
            Final standings
          </p>
        </motion.div>

        {/* Podium */}
        <div className="mb-8 flex items-end justify-center gap-4">
          {/* Reorder: 2nd, 1st, 3rd */}
          {[1, 0, 2].map((podiumIdx) => {
            const entry = top3[podiumIdx];
            if (!entry) return null;

            const heights = ["h-36", "h-28", "h-20"];
            const sizes = ["text-3xl", "text-2xl", "text-xl"];

            return (
              <motion.div
                key={entry.player_id}
                variants={popIn}
                initial="hidden"
                animate="visible"
                className="flex flex-col items-center"
              >
                {/* Player name */}
                <Link
                  href={`/profile/${entry.player_id}`}
                  className="mb-2 font-heading text-sm font-bold uppercase truncate max-w-[100px] underline decoration-dotted underline-offset-2 hover:text-primary transition-colors"
                >
                  {entry.nickname}
                </Link>

                {/* Podium block */}
                <div
                  className={`flex ${heights[podiumIdx]} w-24 flex-col items-center justify-center border-2 border-foreground ${PODIUM_COLORS[podiumIdx]} shadow-[4px_4px_0px_0px_#000000]`}
                >
                  <Trophy className={`h-8 w-8 ${PODIUM_ICONS[podiumIdx]}`} />
                  <span className={`font-heading ${sizes[podiumIdx]} font-black text-gray-900`}>
                    #{entry.rank}
                  </span>
                  <span className="font-mono text-xs font-bold text-gray-700">
                    {entry.score} pts
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Full leaderboard table */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <h2 className="mb-4 font-heading text-lg font-bold uppercase tracking-wide">
            Leaderboard
          </h2>

          <div className="space-y-2">
            {leaderboard.map((entry) => (
              <motion.div key={entry.player_id} variants={staggerChild}>
                <Card
                  className={`shadow-[3px_3px_0px_0px_#000000] ${
                    entry.rank <= 3
                      ? PODIUM_COLORS[entry.rank - 1]
                      : ""
                  }`}
                >
                  <CardContent className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center border-2 border-gray-800 bg-white text-gray-900 font-heading text-sm font-black shadow-[1px_1px_0px_0px_#000000]">
                        {entry.rank}
                      </span>
                      <div>
                        <Link
                          href={`/profile/${entry.player_id}`}
                          className="font-heading text-sm font-bold uppercase underline decoration-dotted underline-offset-2 hover:text-primary transition-colors"
                        >
                          {entry.nickname}
                        </Link>
                        <p className="text-xs text-gray-600">
                          {entry.correct_count} correct
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {entry.rank <= 3 && (
                        <Medal className={`h-5 w-5 ${PODIUM_ICONS[entry.rank - 1]}`} />
                      )}
                      <span className="font-mono text-lg font-bold">
                        {entry.score}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Back button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex justify-center"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={springBouncy}
          >
            <Button
              onClick={() => router.push("/dashboard")}
              className="gap-2"
              size="lg"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
