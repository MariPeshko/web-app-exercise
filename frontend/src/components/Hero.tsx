"use client";

import Link from "next/link";
import { Sparkles, Zap, Users, Brain } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  staggerContainer,
  staggerChild,
  springBouncy,
  floatY,
  popIn,
  hoverWiggle,
} from "@/lib/animations";

export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-20">
      {/* Grid dot background */}
      <div className="pointer-events-none absolute inset-0 bg-dots opacity-30" />

      {/* Floating stickers */}
      <motion.div
        animate={floatY}
        className="pointer-events-none absolute left-[10%] top-[20%] flex h-16 w-16 items-center justify-center border-2 border-foreground bg-primary shadow-[3px_3px_0px_0px_#000000] rotate-12"
      >
        <Zap className="h-8 w-8 text-primary-foreground" />
      </motion.div>
      <motion.div
        animate={{ ...floatY, transition: { ...floatY.transition, delay: 1 } }}
        className="pointer-events-none absolute right-[12%] top-[25%] flex h-14 w-14 items-center justify-center border-2 border-foreground bg-secondary shadow-[3px_3px_0px_0px_#000000] -rotate-6"
      >
        <Users className="h-7 w-7 text-secondary-foreground" />
      </motion.div>
      <motion.div
        animate={{ ...floatY, transition: { ...floatY.transition, delay: 2 } }}
        className="pointer-events-none absolute left-[15%] bottom-[25%] flex h-12 w-12 items-center justify-center border-2 border-foreground bg-accent shadow-[3px_3px_0px_0px_#000000] rotate-6"
      >
        <Brain className="h-6 w-6 text-accent-foreground" />
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto max-w-4xl text-center"
      >
        {/* Badge */}
        <motion.div variants={staggerChild}>
          <Badge
            variant="outline"
            className="mb-6 inline-flex items-center gap-2 border-2 border-foreground bg-card px-4 py-2 text-sm shadow-[2px_2px_0px_0px_#000000]"
          >
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="font-mono text-xs uppercase tracking-widest">AI-Powered Study Platform</span>
          </Badge>
        </motion.div>

        {/* Heading */}
        <motion.h1
          variants={staggerChild}
          className="font-heading text-5xl font-black uppercase leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl"
        >
          Study Smarter,{" "}
          <motion.span
            className="relative inline-block text-primary"
            whileHover={hoverWiggle}
          >
            Together
            <span className="absolute -bottom-2 left-0 h-[4px] w-full bg-primary" />
          </motion.span>
        </motion.h1>

        <motion.p
          variants={staggerChild}
          className="mx-auto mt-8 max-w-2xl text-lg text-muted-foreground sm:text-xl"
        >
          Upload your documents, let AI generate study questions, and challenge
          your friends in real-time multiplayer quiz sessions.{" "}
          <span className="font-bold text-foreground">Learning has never been this fun.</span>
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={staggerChild}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={springBouncy}>
            <Button size="lg" className="text-lg px-10 py-6 h-auto" asChild>
              <Link href="/signup">
                Get Started Free
              </Link>
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={springBouncy}>
            <Button variant="outline" size="lg" className="text-lg px-10 py-6 h-auto" asChild>
              <Link href="/#how-it-works">
                See How It Works
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Stats - Neo-brut sticker style */}
        <motion.div
          variants={staggerChild}
          className="mt-16 flex flex-wrap items-center justify-center gap-6"
        >
          {[
            { value: "AI", label: "Powered by RAG", bg: "bg-primary", fg: "text-primary-foreground" },
            { value: "Live", label: "Multiplayer", bg: "bg-secondary", fg: "text-secondary-foreground" },
            { value: "Any", label: "Subject", bg: "bg-accent", fg: "text-accent-foreground" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={popIn}
              whileHover={{ rotate: i % 2 === 0 ? 3 : -3, scale: 1.05 }}
              transition={springBouncy}
              className={`flex flex-col items-center border-2 border-foreground ${stat.bg} px-8 py-4 shadow-[4px_4px_0px_0px_#000000]`}
            >
              <p className={`font-heading text-3xl font-black uppercase ${stat.fg}`}>
                {stat.value}
              </p>
              <p className={`mt-1 text-xs font-bold uppercase tracking-widest ${stat.fg} opacity-80`}>
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
