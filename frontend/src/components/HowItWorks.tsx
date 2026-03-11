"use client";

import { Upload, Cpu, Gamepad2, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";
import {
  staggerContainer,
  staggerChildLeft,
  fadeInUp,
  springBouncy,
  hoverWiggle,
} from "@/lib/animations";

const steps = [
  {
    step: 1,
    icon: Upload,
    title: "Upload Your Documents",
    description:
      "Drop in your PDFs, lecture notes, textbooks, or any study material you want to master.",
    accent: "bg-primary",
    fg: "text-primary-foreground",
    borderColor: "border-primary",
  },
  {
    step: 2,
    icon: Cpu,
    title: "AI Generates Questions",
    description:
      "Our RAG pipeline processes your documents and creates targeted study questions with multiple difficulty levels.",
    accent: "bg-secondary",
    fg: "text-secondary-foreground",
    borderColor: "border-secondary",
  },
  {
    step: 3,
    icon: Gamepad2,
    title: "Create or Join a Lobby",
    description:
      "Invite friends or join a public lobby. Compete head-to-head in live multiplayer quiz sessions.",
    accent: "bg-accent",
    fg: "text-accent-foreground",
    borderColor: "border-accent",
  },
  {
    step: 4,
    icon: GraduationCap,
    title: "Learn & Improve",
    description:
      "Review answers, track your progress, and watch your knowledge grow as you play more rounds.",
    accent: "bg-pink",
    fg: "text-white",
    borderColor: "border-pink",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative px-6 py-24">
      <div className="relative mx-auto max-w-5xl">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mb-16 text-center"
        >
          <h2 className="font-heading text-4xl font-black uppercase tracking-tight sm:text-5xl">
            How <span className="text-primary">StudAI</span> Works
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            From upload to mastery in four simple steps.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid gap-6 md:grid-cols-2"
        >
          {steps.map((item) => (
            <motion.div key={item.step} variants={staggerChildLeft}>
              <motion.div
                whileHover={{ y: -4, x: -2 }}
                whileTap={{ y: 2, x: 2 }}
                transition={springBouncy}
                className={`group flex gap-5 border-2 border-foreground bg-card p-6 shadow-[4px_4px_0px_0px_#000000] transition-all hover:shadow-[6px_6px_0px_0px_#000000]`}
              >
                <motion.div
                  whileHover={hoverWiggle}
                  className={`flex h-14 w-14 shrink-0 items-center justify-center border-2 border-foreground ${item.accent} shadow-[2px_2px_0px_0px_#000000]`}
                >
                  <item.icon className={`h-7 w-7 ${item.fg}`} />
                </motion.div>
                <div>
                  <span className={`inline-block border-2 ${item.borderColor} bg-background px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest ${item.borderColor.replace("border-", "text-")}`}>
                    Step {item.step}
                  </span>
                  <h3 className="mt-2 font-heading text-lg font-bold uppercase tracking-wide">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
