"use client";

import { Users, Clock, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lobby } from "@/lib/types";
import { springBouncy } from "@/lib/animations";

interface LobbyCardProps {
  lobby: Lobby;
  onJoin: (lobbyId: string) => void;
}

const statusConfig = {
  waiting: { variant: "default" as const, label: "Waiting", className: "bg-secondary text-secondary-foreground" },
  "in-progress": { variant: "default" as const, label: "In Progress", className: "bg-accent text-accent-foreground" },
  finished: { variant: "secondary" as const, label: "Finished", className: "bg-muted text-muted-foreground border-muted-foreground" },
};

export default function LobbyCard({ lobby, onJoin }: LobbyCardProps) {
  const status = statusConfig[lobby.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, x: -2 }}
      whileTap={{ y: 2, x: 2 }}
      transition={springBouncy}
    >
      <Card className="group h-full transition-all hover:shadow-[6px_6px_0px_0px_#000000]">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-heading text-lg font-bold uppercase tracking-wide">{lobby.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Hosted by <span className="font-bold text-foreground">{lobby.host.name}</span>
              </p>
            </div>
            <Badge className={status.className}>
              {status.label}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 border border-border px-2 py-0.5 font-mono text-xs">
              <Users className="h-3.5 w-3.5" />
              {lobby.players.length}/{lobby.maxPlayers}
            </span>
            <span className="inline-flex items-center gap-1.5 border border-border px-2 py-0.5 font-mono text-xs">
              <Zap className="h-3.5 w-3.5" />
              {lobby.subject}
            </span>
            <span className="inline-flex items-center gap-1.5 border border-border px-2 py-0.5 font-mono text-xs">
              <Clock className="h-3.5 w-3.5" />
              {new Date(lobby.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>

          {lobby.documentName && (
            <p className="mt-3 border-l-2 border-primary pl-2 font-mono text-xs text-muted-foreground">
              {lobby.documentName}
            </p>
          )}
        </CardContent>

        <CardFooter>
          <Button
            onClick={() => onJoin(lobby.id)}
            disabled={lobby.status !== "waiting" || lobby.players.length >= lobby.maxPlayers}
            className="w-full"
            variant={lobby.status === "waiting" ? "default" : "outline"}
          >
            {lobby.status === "waiting"
              ? lobby.players.length >= lobby.maxPlayers
                ? "Lobby Full"
                : "Join Lobby"
              : lobby.status === "in-progress"
                ? "In Progress"
                : "Finished"}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
