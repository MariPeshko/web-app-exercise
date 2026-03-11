"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiGetLobbies, apiCreateLobby, apiJoinLobby, apiUploadDocument } from "@/lib/api";
import { Plus, Search, Users, Trophy, BookOpen, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LobbyCard from "@/components/LobbyCard";
import CreateLobbyModal from "@/components/CreateLobbyModal";
import { Lobby } from "@/lib/types";
import {
  staggerContainer,
  staggerChild,
  springBouncy,
  fadeInUp,
} from "@/lib/animations";

const statCards = [
  { key: "total", icon: BookOpen, label: "Total Lobbies", bg: "bg-primary", fg: "text-primary-foreground", shadow: "shadow-[3px_3px_0px_0px_#FF6B35]" },
  { key: "open", icon: Users, label: "Open Lobbies", bg: "bg-secondary", fg: "text-secondary-foreground", shadow: "shadow-[3px_3px_0px_0px_#00E5A0]" },
  { key: "active", icon: TrendingUp, label: "Active Sessions", bg: "bg-accent", fg: "text-accent-foreground", shadow: "shadow-[3px_3px_0px_0px_#FFE156]" },
  { key: "players", icon: Trophy, label: "Players Online", bg: "bg-pink", fg: "text-white", shadow: "shadow-[3px_3px_0px_0px_#FF3366]" },
];

const filters = ["all", "waiting", "in-progress", "finished"] as const;

// Helper: read the JWT from localStorage
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [lobbies, setLobbies] = useState<Lobby[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<"all" | "waiting" | "in-progress" | "finished">("all");

  // Fetch lobbies from the backend
  const fetchLobbies = useCallback(async () => {
    try {
      const data = await apiGetLobbies();
      setLobbies(data);
    } catch (err) {
      console.error("Failed to fetch lobbies:", err);
    }
  }, []);

  // Load lobbies on mount
  useEffect(() => {
    fetchLobbies();
  }, [fetchLobbies]);

  const filteredLobbies = lobbies.filter((lobby) => {
    const matchesSearch =
      lobby.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lobby.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "all" || lobby.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleCreateLobby = async (data: { name: string; subject: string; maxPlayers: number; document: File | null }) => {
    const token = getToken();
    if (!token) return;
    try {
      const newLobby = await apiCreateLobby(token, {
        name: data.name,
        subject: data.subject,
        max_players: data.maxPlayers,
      });
      // Upload document to AI core if provided
      if (data.document) {
        try {
          await apiUploadDocument(token, newLobby.id, data.document);
        } catch (uploadErr) {
          console.error("Document upload failed:", uploadErr);
          // Still navigate — user can re-upload in the waiting room
        }
      }
      router.push(`/lobby/${newLobby.id}`);
    } catch (err) {
      console.error("Failed to create lobby:", err);
    }
  };

  const handleJoinLobby = async (lobbyId: string) => {
    const token = getToken();
    if (!token) return;
    try {
      await apiJoinLobby(token, lobbyId);
      router.push(`/lobby/${lobbyId}`);
    } catch (err) {
      console.error("Failed to join lobby:", err);
    }
  };

  // Stats
  const waitingCount = lobbies.filter((l) => l.status === "waiting").length;
  const activeCount = lobbies.filter((l) => l.status === "in-progress").length;
  const totalPlayers = lobbies.reduce((sum, l) => sum + l.players.length, 0);
  const statValues: Record<string, number> = {
    total: lobbies.length,
    open: waitingCount,
    active: activeCount,
    players: totalPlayers,
  };

  return (
    <main className="min-h-screen px-6 pt-24 pb-12">
      {/* Grid background */}
      <div className="pointer-events-none fixed inset-0 bg-dots opacity-15" />

      <div className="relative mx-auto max-w-7xl">
        {/* Welcome Header */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <h1 className="font-heading text-3xl font-black uppercase">
            Welcome back, <span className="text-primary">{user?.name}</span>
          </h1>
          <p className="mt-2 text-muted-foreground">Ready to study? Create or join a lobby below.</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {statCards.map((stat) => (
            <motion.div key={stat.key} variants={staggerChild}>
              <motion.div
                whileHover={{ y: -3, x: -2 }}
                whileTap={{ y: 1, x: 1 }}
                transition={springBouncy}
              >
                <Card className="transition-all hover:shadow-[6px_6px_0px_0px_#000000]">
                  <CardContent className="flex items-center gap-3 p-5">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center border-2 border-foreground ${stat.bg} ${stat.shadow}`}>
                      <stat.icon className={`h-5 w-5 ${stat.fg}`} />
                    </div>
                    <div>
                      <motion.p
                        key={statValues[stat.key]}
                        initial={{ scale: 1.3, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={springBouncy}
                        className="font-heading text-2xl font-black"
                      >
                        {statValues[stat.key]}
                      </motion.p>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Actions Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          {/* Search */}
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search lobbies..."
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Filter */}
            <div className="flex gap-0 border-2 border-foreground bg-card shadow-[3px_3px_0px_0px_#000000]">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`relative px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                    filter === f
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  } ${f !== "all" ? "border-l-2 border-foreground" : ""}`}
                >
                  {f === "in-progress" ? "Active" : f}
                </button>
              ))}
            </div>

            {/* Create */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={springBouncy}>
              <Button onClick={() => setShowCreateModal(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Lobby
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Lobby Grid */}
        <AnimatePresence mode="wait">
          {filteredLobbies.length > 0 ? (
            <motion.div
              key="grid"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {filteredLobbies.map((lobby) => (
                <LobbyCard key={lobby.id} lobby={lobby} onJoin={handleJoinLobby} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center border-2 border-dashed border-foreground/30 py-20 text-center"
            >
              <div className="flex h-16 w-16 items-center justify-center border-2 border-foreground bg-muted shadow-[3px_3px_0px_0px_#000000]">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-4 font-heading text-lg font-bold uppercase">No lobbies found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchQuery
                  ? "Try a different search term"
                  : "Be the first to create a study lobby!"}
              </p>
              <Button onClick={() => setShowCreateModal(true)} className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Create Lobby
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Create Modal */}
      <CreateLobbyModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateLobby}
      />
    </main>
  );
}
