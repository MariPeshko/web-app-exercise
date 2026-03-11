"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiGetPlayerStats, apiGetMyStats } from "@/lib/api";
import { PlayerStats } from "@/lib/types";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Loader2,
  Trophy,
  Target,
  Zap,
  Clock,
  Flame,
  TrendingUp,
  Award,
  Crown,
  Gamepad2,
} from "lucide-react";
import {
  fadeInUp,
  staggerContainer,
  staggerChild,
  springBouncy,
  popIn,
} from "@/lib/animations";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const profileId = params.id as string;

  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isOwnProfile = user && (user.id === profileId || user.email === profileId);

  const fetchStats = useCallback(async () => {
    try {
      let data: PlayerStats;
      if (profileId === "me") {
        const token = getToken();
        if (!token) return;
        data = await apiGetMyStats(token);
      } else {
        data = await apiGetPlayerStats(profileId);
      }
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

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

  if (error || !stats) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6">
        <div className="flex h-16 w-16 items-center justify-center border-2 border-foreground bg-destructive shadow-[3px_3px_0px_0px_#000000]">
          <Zap className="h-8 w-8 text-destructive-foreground" />
        </div>
        <h1 className="font-heading text-2xl font-black uppercase">
          Player not found
        </h1>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => router.push("/dashboard")} className="mt-2 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </main>
    );
  }

  const winRate = stats.games_played > 0
    ? Math.round((stats.games_won / stats.games_played) * 100)
    : 0;

  const statCards = [
    { icon: Gamepad2, label: "Games Played", value: stats.games_played, color: "bg-blue-500", textColor: "text-blue-900" },
    { icon: Trophy, label: "Games Won", value: stats.games_won, color: "bg-yellow-500", textColor: "text-yellow-900" },
    { icon: Crown, label: "Win Rate", value: `${winRate}%`, color: "bg-purple-500", textColor: "text-purple-900" },
    { icon: Target, label: "Accuracy", value: `${stats.accuracy}%`, color: "bg-green-500", textColor: "text-green-900" },
    { icon: TrendingUp, label: "Total Score", value: stats.total_score.toLocaleString(), color: "bg-primary", textColor: "text-orange-900" },
    { icon: Award, label: "Best Game", value: stats.best_score.toLocaleString(), color: "bg-pink-500", textColor: "text-pink-900" },
    { icon: Clock, label: "Avg Response", value: `${stats.avg_response_time}s`, color: "bg-cyan-500", textColor: "text-cyan-900" },
    { icon: Flame, label: "Streak", value: stats.current_streak, color: "bg-red-500", textColor: "text-red-900" },
  ];

  return (
    <main className="min-h-screen px-6 pt-24 pb-12">
      <div className="pointer-events-none fixed inset-0 bg-dots opacity-15" />

      <div className="relative mx-auto max-w-4xl">
        {/* Back button */}
        <motion.div variants={fadeInUp} initial="hidden" animate="visible">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </motion.div>

        {/* Profile Header */}
        <motion.div variants={fadeInUp} initial="hidden" animate="visible">
          <Card className="mb-6 shadow-[4px_4px_0px_0px_#000000]">
            <CardContent className="flex items-center gap-5 p-6">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center border-2 border-foreground bg-primary font-heading text-3xl font-black text-primary-foreground shadow-[3px_3px_0px_0px_#000000]">
                {stats.nickname.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="font-heading text-3xl font-black uppercase tracking-wide">
                  {stats.nickname}
                </h1>
                <p className="text-sm text-muted-foreground">{stats.email}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {stats.games_won > 0 && (
                    <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-500">
                      <Trophy className="mr-1 h-3 w-3" />
                      {stats.games_won} {stats.games_won === 1 ? "Win" : "Wins"}
                    </Badge>
                  )}
                  {stats.current_streak > 0 && (
                    <Badge className="bg-red-100 text-red-800 border border-red-500">
                      <Flame className="mr-1 h-3 w-3" />
                      {stats.current_streak} Streak
                    </Badge>
                  )}
                  {stats.accuracy >= 80 && stats.games_played > 0 && (
                    <Badge className="bg-green-100 text-green-800 border border-green-500">
                      <Target className="mr-1 h-3 w-3" />
                      Sharpshooter
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4"
        >
          {statCards.map((stat) => (
            <motion.div key={stat.label} variants={staggerChild}>
              <motion.div
                whileHover={{ y: -3, x: -2 }}
                whileTap={{ y: 1, x: 1 }}
                transition={springBouncy}
              >
                <Card className="shadow-[3px_3px_0px_0px_#000000] transition-all hover:shadow-[5px_5px_0px_0px_#000000]">
                  <CardContent className="p-4 text-center">
                    <div className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center border-2 border-foreground ${stat.color} shadow-[2px_2px_0px_0px_#000000]`}>
                      <stat.icon className="h-5 w-5 text-white" />
                    </div>
                    <motion.p
                      variants={popIn}
                      className="font-heading text-2xl font-black"
                    >
                      {stat.value}
                    </motion.p>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {stat.label}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Accuracy + Score Bars */}
        <motion.div variants={fadeInUp} initial="hidden" animate="visible">
          <Card className="mb-6 shadow-[4px_4px_0px_0px_#000000]">
            <CardHeader className="pb-2">
              <h2 className="font-heading text-lg font-bold uppercase tracking-wide">
                Performance
              </h2>
            </CardHeader>
            <CardContent className="space-y-4 p-4 pt-0">
              {/* Accuracy bar */}
              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-bold">Accuracy</span>
                  <span className="font-mono font-bold">{stats.accuracy}%</span>
                </div>
                <div className="h-4 border-2 border-foreground bg-muted shadow-[2px_2px_0px_0px_#000000]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.accuracy}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full bg-green-500"
                  />
                </div>
              </div>
              {/* Win rate bar */}
              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-bold">Win Rate</span>
                  <span className="font-mono font-bold">{winRate}%</span>
                </div>
                <div className="h-4 border-2 border-foreground bg-muted shadow-[2px_2px_0px_0px_#000000]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${winRate}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full bg-yellow-500"
                  />
                </div>
              </div>
              {/* Correct / Total */}
              <div className="flex justify-between border-t border-border pt-3 text-sm">
                <span className="text-muted-foreground">
                  Total: <span className="font-bold text-foreground">{stats.total_correct}</span> / {stats.total_questions} correct
                </span>
                <span className="text-muted-foreground">
                  Avg score: <span className="font-bold text-foreground">{stats.avg_score_per_game}</span> / game
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Game History */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <h2 className="mb-4 font-heading text-lg font-bold uppercase tracking-wide">
            Game History
          </h2>

          {stats.game_history.length === 0 ? (
            <Card className="border-dashed border-foreground/30 bg-muted/30">
              <CardContent className="p-8 text-center">
                <Gamepad2 className="mx-auto h-8 w-8 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No games played yet
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {stats.game_history.map((game) => (
                <motion.div key={game.game_id} variants={staggerChild}>
                  <Card className="shadow-[3px_3px_0px_0px_#000000]">
                    <CardContent className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-9 w-9 items-center justify-center border-2 border-foreground font-heading text-sm font-black shadow-[1px_1px_0px_0px_#000000] ${
                            game.rank === 1
                              ? "bg-yellow-100 text-yellow-900"
                              : game.rank === 2
                                ? "bg-gray-100 text-gray-900"
                                : game.rank === 3
                                  ? "bg-orange-100 text-orange-900"
                                  : "bg-white text-gray-900"
                          }`}
                        >
                          #{game.rank}
                        </span>
                        <div>
                          <p className="font-heading text-sm font-bold uppercase">
                            {game.lobby_name}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{game.subject}</span>
                            <span>·</span>
                            <span>{game.correct_count}/{game.total_rounds} correct</span>
                            <span>·</span>
                            <span>{new Date(game.played_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {game.rank === 1 && <Trophy className="h-4 w-4 text-yellow-500" />}
                        <span className="font-mono text-lg font-bold">
                          {game.score}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
