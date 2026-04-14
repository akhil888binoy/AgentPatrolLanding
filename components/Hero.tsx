"use client";

import { motion } from "framer-motion";
import { HeroSimulation } from "./HeroSimulation";
import { WaitlistForm } from "./WaitlistForm";

export function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] w-full items-center justify-center overflow-hidden pt-24 sm:pt-28"
    >
      <div className="absolute inset-0 grid-bg opacity-[0.55]" />
      <div className="absolute inset-0 bg-radial-fade" />
      <div className="pointer-events-none absolute inset-0">
        <HeroSimulation />
      </div>

      {/* Radial focus spotlight — dims the network behind the headline without
          touching the outer areas, keeping full animation detail at the edges */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(ellipse 62% 52% at 50% 44%, rgba(3,5,15,0.72) 0%, rgba(3,5,15,0.44) 32%, rgba(3,5,15,0.18) 56%, transparent 74%)",
        }}
      />

      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-ink-950" />

      <div className="container-px relative z-[2] mx-auto w-full max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-ink-200 backdrop-blur"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon-green opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-neon-green" />
          </span>
          AI Detection Engine · Active
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-balance text-center text-[40px] font-semibold leading-[1.04] tracking-tight sm:text-5xl md:text-7xl lg:text-[84px]"
        >
          <span className="text-gradient">When AI goes Rogue</span>
          <br />
          <span className="text-white">AI shuts it Down.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.35 }}
          className="mx-auto mt-5 max-w-2xl text-balance px-2 text-center text-sm text-ink-200 sm:mt-6 sm:text-base md:text-lg"
        >
          AgentPatrol's on device AI continuously monitors every autonomous agent
          on your system  detecting credential theft, prompt injection, and
          lateral movement then blocks the threat before damage occurs.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5 }}
          className="relative mt-8 flex w-full items-center justify-center px-4 sm:mt-10 sm:px-0"
        >
          <WaitlistForm />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.9 }}
          className="mx-auto mt-12 max-w-4xl sm:mt-16"
        >
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-[10px] uppercase tracking-widest text-ink-300 sm:gap-x-10 sm:gap-y-4 sm:text-xs">
            <span>On device AI</span>
            <span className="h-1 w-1 rounded-full bg-ink-400" />
            <span>Real-time blocking</span>
            <span className="h-1 w-1 rounded-full bg-ink-400" />
            <span>Zero data egress</span>
            <span className="h-1 w-1 rounded-full bg-ink-400" />
            <span>SOC 2 · Type II</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
