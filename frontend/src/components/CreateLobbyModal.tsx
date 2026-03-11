"use client";

import { useState, FormEvent } from "react";
import { Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateLobbyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { name: string; subject: string; maxPlayers: number; document: File | null }) => void;
}

export default function CreateLobbyModal({ isOpen, onClose, onCreate }: CreateLobbyModalProps) {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [maxPlayers, setMaxPlayers] = useState("4");
  const [document, setDocument] = useState<File | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name || !subject) return;
    onCreate({ name, subject, maxPlayers: Number(maxPlayers), document });
    setName("");
    setSubject("");
    setMaxPlayers("4");
    setDocument(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg bg-background">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl font-black uppercase">Create a Study Lobby</DialogTitle>
          <DialogDescription>
            Set up a multiplayer study session for you and your friends.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* Lobby Name */}
          <div className="space-y-2">
            <Label htmlFor="lobby-name" className="font-bold uppercase tracking-wider text-xs">Lobby Name</Label>
            <Input
              id="lobby-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Biology Exam Prep"
              required
            />
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject" className="font-bold uppercase tracking-wider text-xs">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Biology, Math, History"
              required
            />
          </div>

          {/* Max Players */}
          <div className="space-y-2">
            <Label className="font-bold uppercase tracking-wider text-xs">Max Players</Label>
            <Select value={maxPlayers} onValueChange={setMaxPlayers}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2, 3, 4, 5, 6, 8, 10].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} Players
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Document Upload */}
          <div className="space-y-2">
            <Label className="font-bold uppercase tracking-wider text-xs">Study Document (optional)</Label>
            <label className="flex cursor-pointer items-center justify-center gap-2 border-2 border-dashed border-foreground/30 py-8 text-sm text-muted-foreground transition-all hover:border-primary hover:text-foreground hover:shadow-[3px_3px_0px_0px_#000000]">
              <Upload className="h-5 w-5" />
              <span className="font-mono text-xs uppercase tracking-wider">
                {document ? document.name : "Click to upload PDF, DOCX, or TXT"}
              </span>
              <input
                type="file"
                accept=".pdf,.docx,.txt,.md"
                className="hidden"
                onChange={(e) => setDocument(e.target.files?.[0] || null)}
              />
            </label>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create Lobby</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
