"use client";

import { FileText, Users, Zap, Brain, Trophy, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  staggerContainer,
  staggerChild,
  fadeInUp,
  springBouncy,
  hoverWiggle,
} from "@/lib/animations";

const features = [
  {
    icon: FileText,
    title: "Document-Powered Questions",
    description:
      "Upload any PDF, notes, or study material. Our RAG pipeline extracts knowledge and generates highly relevant questions.",
    color: "bg-primary",
    fg: "text-primary-foreground",
    shadow: "shadow-[4px_4px_0px_0px_#FF6B35]",
  },
  {
    icon: Users,
    title: "Multiplayer Study Sessions",
    description:
      "Create or join lobbies and compete with classmates in real-time quiz battles. Learning is better together.",
    color: "bg-secondary",
    fg: "text-secondary-foreground",
    shadow: "shadow-[4px_4px_0px_0px_#00E5A0]",
  },
  {
    icon: Zap,
    title: "AI-Generated Quizzes",
    description:
      "Our AI creates challenging, targeted questions from your study materials — no more making flashcards by hand.",
    color: "bg-accent",
    fg: "text-accent-foreground",
    shadow: "shadow-[4px_4px_0px_0px_#FFE156]",
  },
  {
    icon: Brain,
    title: "Adaptive Difficulty",
    description:
      "Questions adapt to your knowledge level. The more you play, the smarter the questions get.",
    color: "bg-pink",
    fg: "text-white",
    shadow: "shadow-[4px_4px_0px_0px_#FF3366]",
  },
  {
    icon: Trophy,
    title: "Leaderboards & Streaks",
    description:
      "Track your progress, climb the leaderboard, and maintain study streaks to stay motivated.",
    color: "bg-blue",
    fg: "text-black",
    shadow: "shadow-[4px_4px_0px_0px_#4ECDC4]",
  },
  {
    icon: Shield,
    title: "Private & Secure",
    description:
      "Your documents and study data stay private. Create invite-only lobbies for your study group.",
    color: "bg-primary",
    fg: "text-primary-foreground",
    shadow: "shadow-[4px_4px_0px_0px_#FF6B35]",
  },
];

export default function Features() {
  return (
    <section id="features" className="relative px-6 py-24">
      {/* Crosshatch background accent */}
      <div className="pointer-events-none absolute inset-0 bg-crosshatch opacity-10" />

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mb-16 text-center"
        >
          <h2 className="font-heading text-4xl font-black uppercase tracking-tight sm:text-5xl">
            Everything You Need to{" "}
            <span className="relative inline-block text-secondary">
              Ace Your Studies
              <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-secondary" />
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            StudAI combines AI-powered question generation with real-time
            multiplayer gameplay to make studying effective and fun.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature, i) => (
            <motion.div key={feature.title} variants={staggerChild}>
              <motion.div
                whileHover={{ y: -6, x: -2 }}
                whileTap={{ y: 2, x: 2 }}
                transition={springBouncy}
              >
                <Card className={`group h-full transition-all hover:shadow-[6px_6px_0px_0px_#000000]`}>
                  <CardHeader className="pb-3">
                    <motion.div
                      whileHover={hoverWiggle}
                      className={`flex h-14 w-14 items-center justify-center border-2 border-foreground ${feature.color} ${feature.shadow}`}
                    >
                      <feature.icon className={`h-7 w-7 ${feature.fg}`} />
                    </motion.div>
                    <h3 className="mt-4 font-heading text-lg font-bold uppercase tracking-wide">
                      {feature.title}
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
