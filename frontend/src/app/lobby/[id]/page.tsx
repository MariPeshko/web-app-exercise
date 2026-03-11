"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { apiGetLobby, apiLeaveLobby, apiUploadDocument, apiStartGame } from "@/lib/api";
import { Lobby } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Crown,
  ArrowLeft,
  Loader2,
  Zap,
  FileText,
  Copy,
  Check,
  Play,
  Upload,
} from "lucide-react";
import {
  fadeInUp,
  staggerContainer,
  staggerChild,
  springBouncy,
} from "@/lib/animations";

// Poll for lobby updates every 3 seconds
const POLL_INTERVAL = 3000;

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export default function LobbyWaitingRoom() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const lobbyId = params.id as string;

  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const isHost = lobby && user ? lobby.host.email === user.email : false;

  // Fetch the lobby data
  const fetchLobby = useCallback(async () => {
    try {
      const data = await apiGetLobby(lobbyId);
      setLobby(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load lobby");
    } finally {
      setLoading(false);
    }
  }, [lobbyId]);

  // Initial load + polling
  useEffect(() => {
    fetchLobby();
    const interval = setInterval(fetchLobby, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchLobby]);

  // Auto-redirect when game starts
  useEffect(() => {
    if (lobby && lobby.status === "in-progress") {
      router.push(`/game/${lobbyId}`);
    }
  }, [lobby, lobbyId, router]);

  // Leave the lobby
  const handleLeave = async () => {
    const token = getToken();
    if (!token) return;
    setLeaving(true);
    try {
      await apiLeaveLobby(token, lobbyId);
      router.push("/dashboard");
    } catch (err) {
      console.error("Failed to leave lobby:", err);
      setLeaving(false);
    }
  };

  // Upload document
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const token = getToken();
    if (!token) return;
    setUploading(true);
    setUploadError(null);
    try {
      await apiUploadDocument(token, lobbyId, file);
      await fetchLobby();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // Start game
  const handleStartGame = async () => {
    const token = getToken();
    if (!token || !lobby?.documentName || (lobby.players.length < 2)) return;
    setStarting(true);
    try {
      await apiStartGame(token, lobbyId);
      router.push(`/game/${lobbyId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start game");
      setStarting(false);
    }
  };

  // Copy lobby link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ─── Loading state ────────────────────────────────────────────────────────
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

  // ─── Error state ──────────────────────────────────────────────────────────
  if (error || !lobby) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6">
        <div className="flex h-16 w-16 items-center justify-center border-2 border-foreground bg-destructive shadow-[3px_3px_0px_0px_#000000]">
          <Zap className="h-8 w-8 text-destructive-foreground" />
        </div>
        <h1 className="font-heading text-2xl font-black uppercase">
          Lobby not found
        </h1>
        <p className="text-muted-foreground">{error || "This lobby may have been deleted."}</p>
        <Button onClick={() => router.push("/dashboard")} className="mt-2 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </main>
    );
  }

  const playerSlots = Array.from({ length: lobby.maxPlayers }, (_, i) => {
    return lobby.players[i] ?? null;
  });

  // ─── Main render ──────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen px-6 pt-24 pb-12">
      {/* Grid background */}
      <div className="pointer-events-none fixed inset-0 bg-dots opacity-15" />

      <div className="relative mx-auto max-w-3xl">
        {/* Back button */}
        <motion.div variants={fadeInUp} initial="hidden" animate="visible">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </motion.div>

        {/* Lobby Header Card */}
        <motion.div variants={fadeInUp} initial="hidden" animate="visible">
          <Card className="mb-6 shadow-[4px_4px_0px_0px_#000000]">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h1 className="font-heading text-2xl font-black uppercase tracking-wide">
                    {lobby.name}
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Hosted by{" "}
                    <span className="font-bold text-foreground">
                      {lobby.host.name}
                    </span>
                  </p>
                </div>
                <Badge
                  className={
                    lobby.status === "waiting"
                      ? "bg-secondary text-secondary-foreground"
                      : lobby.status === "in-progress"
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground"
                  }
                >
                  {lobby.status === "waiting"
                    ? "Waiting for players"
                    : lobby.status === "in-progress"
                      ? "In Progress"
                      : "Finished"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 border border-border px-2 py-0.5 font-mono text-xs">
                  <Zap className="h-3.5 w-3.5" />
                  {lobby.subject}
                </span>
                <span className="inline-flex items-center gap-1.5 border border-border px-2 py-0.5 font-mono text-xs">
                  <Users className="h-3.5 w-3.5" />
                  {lobby.players.length}/{lobby.maxPlayers} players
                </span>
                {lobby.documentName && (
                  <span className="inline-flex items-center gap-1.5 border border-border px-2 py-0.5 font-mono text-xs">
                    <FileText className="h-3.5 w-3.5" />
                    {lobby.documentName}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="mt-4 flex flex-wrap gap-3">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={springBouncy}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyLink}
                    className="gap-2"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    {copied ? "Copied!" : "Copy Link"}
                  </Button>
                </motion.div>

                {isHost && lobby.status === "waiting" && (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={springBouncy}
                  >
                    <Button
                      size="sm"
                      className="gap-2"
                      disabled={lobby.players.length < 2 || !lobby.documentName || starting}
                      onClick={handleStartGame}
                    >
                      {starting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                      {starting ? "Starting..." : "Start Game"}
                    </Button>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Document Upload (host only) */}
        {isHost && lobby.status === "waiting" && (
          <motion.div variants={fadeInUp} initial="hidden" animate="visible">
            <Card className="mb-6 shadow-[4px_4px_0px_0px_#000000]">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Upload className="h-5 w-5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    {lobby.documentName ? (
                      <p className="text-sm font-bold">
                        {lobby.documentName}{" "}
                        <span className="font-normal text-muted-foreground">uploaded</span>
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Upload a PDF to generate questions from
                      </p>
                    )}
                    {uploadError && (
                      <p className="text-xs text-destructive mt-1">{uploadError}</p>
                    )}
                  </div>
                  <label>
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={handleUpload}
                      disabled={uploading}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2 cursor-pointer"
                      asChild
                    >
                      <span>
                        {uploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                        {uploading ? "Uploading..." : lobby.documentName ? "Replace" : "Upload PDF"}
                      </span>
                    </Button>
                  </label>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Player Slots */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <h2 className="mb-4 font-heading text-lg font-bold uppercase tracking-wide">
            Players
          </h2>

          <div className="grid gap-3 sm:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {playerSlots.map((player, index) => (
                <motion.div
                  key={player ? player.id : `empty-${index}`}
                  variants={staggerChild}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={springBouncy}
                >
                  <Card
                    className={`transition-all ${
                      player
                        ? "shadow-[3px_3px_0px_0px_#000000]"
                        : "border-dashed border-foreground/30 bg-muted/30"
                    }`}
                  >
                    <CardContent className="flex items-center gap-3 p-4">
                      {player ? (
                        <>
                          {/* Avatar circle */}
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-foreground bg-primary font-heading text-sm font-black text-primary-foreground shadow-[2px_2px_0px_0px_#000000]">
                            {player.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/profile/${player.id}`}
                              className="block truncate font-heading text-sm font-bold uppercase underline decoration-dotted underline-offset-2 hover:text-primary transition-colors"
                            >
                              {player.name}
                            </Link>
                            <p className="truncate text-xs text-muted-foreground">
                              {player.email}
                            </p>
                          </div>
                          {player.email === lobby.host.email && (
                            <Crown className="h-5 w-5 shrink-0 text-yellow-500" />
                          )}
                        </>
                      ) : (
                        <>
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-dashed border-foreground/30">
                            <Users className="h-4 w-4 text-muted-foreground/50" />
                          </div>
                          <p className="text-sm text-muted-foreground/50">
                            Waiting for player...
                          </p>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Leave button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex justify-center"
        >
          <Button
            variant="destructive"
            onClick={handleLeave}
            disabled={leaving}
            className="gap-2"
          >
            {leaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowLeft className="h-4 w-4" />
            )}
            {isHost ? "Delete Lobby" : "Leave Lobby"}
          </Button>
        </motion.div>
      </div>
    </main>
  );
}
