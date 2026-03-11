"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { scaleIn, springBouncy, fadeInUp } from "@/lib/animations";

export default function CTA() {
  return (
    <section className="px-6 py-24">
      <motion.div
        variants={scaleIn}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="mx-auto max-w-4xl border-3 border-foreground bg-card p-12 shadow-[8px_8px_0px_0px_#FF6B35] sm:p-16 text-center"
      >
        {/* Decorative badge */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-6 inline-flex items-center gap-2 border-2 border-foreground bg-accent px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-widest text-accent-foreground shadow-[2px_2px_0px_0px_#000000]"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Free to start
        </motion.div>

        <motion.h2
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="font-heading text-3xl font-black uppercase tracking-tight sm:text-5xl"
        >
          Ready to Study{" "}
          <span className="text-primary">Smarter?</span>
        </motion.h2>
        <motion.p
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground"
        >
          Join StudAI and transform the way you learn. Challenge friends,
          master your material, and have fun doing it.
        </motion.p>
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={springBouncy}>
            <Button size="lg" className="text-lg px-10 py-6 h-auto" asChild>
              <Link href="/signup">
                Create Free Account <ArrowRight className="ml-1 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={springBouncy}>
            <Button variant="outline" size="lg" className="text-lg px-10 py-6 h-auto" asChild>
              <Link href="/login">I Already Have an Account</Link>
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
