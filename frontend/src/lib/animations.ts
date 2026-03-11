/**
 * StudAI Animation Library — Bouncy, playful Framer Motion presets
 *
 * Design rule: motion is BOUNCY, never linear.
 * Spring physics with slight overshoot. Fast entrances.
 */

import type { Transition, Variants } from "framer-motion";

// ─── Spring Presets ───
export const springBouncy: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 17,
};

export const springSnappy: Transition = {
  type: "spring",
  stiffness: 500,
  damping: 30,
};

export const springGentle: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 20,
};

// ─── Hover Presets (for whileHover) ───
export const hoverLift = {
  y: -4,
  transition: springBouncy,
};

export const hoverPush = {
  y: 2,
  x: 2,
  transition: springSnappy,
};

export const hoverScale = {
  scale: 1.05,
  transition: springBouncy,
};

export const hoverWiggle = {
  rotate: [0, -3, 3, -3, 0],
  transition: { duration: 0.4 },
};

// ─── Tap Presets (for whileTap) ───
export const tapSquish = {
  scale: 0.95,
  transition: springSnappy,
};

export const tapPush = {
  y: 3,
  x: 3,
  boxShadow: "1px 1px 0px 0px #000000",
  transition: springSnappy,
};

// ─── Page / Section Entry Variants ───
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springBouncy,
  },
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: springBouncy,
  },
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: springBouncy,
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springBouncy,
  },
};

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 15,
    },
  },
};

// ─── Stagger Containers ───
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const staggerSlow: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

// ─── Stagger Children ───
export const staggerChild: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springBouncy,
  },
};

export const staggerChildLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: springBouncy,
  },
};

// ─── Continuous / Loop Animations ───
export const floatY = {
  y: [0, -8, 0],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut" as const,
  },
};

export const pulse = {
  scale: [1, 1.05, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut" as const,
  },
};

export const wiggleLoop = {
  rotate: [0, -2, 2, -2, 0],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut" as const,
  },
};
