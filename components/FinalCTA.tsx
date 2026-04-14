"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function FinalCTA() {
  return (
    <section id="cta" className="relative py-20 md:py-32 lg:py-44">
      <div className="container-px mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-6 text-center sm:p-10 md:p-16"
        >
          <motion.div
            animate={{
              background: [
                "radial-gradient(ellipse at 30% 0%, rgba(77,139,255,0.25), transparent 60%)",
                "radial-gradient(ellipse at 70% 100%, rgba(162,107,255,0.25), transparent 60%)",
                "radial-gradient(ellipse at 30% 0%, rgba(77,139,255,0.25), transparent 60%)",
              ],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute inset-0"
          />

          <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" />

          <div className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-neon-blue/60 to-transparent" />

          <div className="relative">
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-6xl"
            >
              <span className="text-gradient">Your AI agents,</span>
              <br className="hidden md:block" /> defended by AI.
            </motion.h2>
            <p className="mx-auto mt-6 max-w-xl text-balance text-ink-200 md:text-lg">
              Deploy in one command. AgentPatrol's detection engine starts
              profiling your agents immediately — and blocks threats the moment
              something looks wrong. No data leaves your machine.
            </p>

            <div className="mt-8 flex w-full flex-col items-stretch justify-center gap-3 sm:mt-10 sm:w-auto sm:flex-row sm:items-center">
              <motion.a
                href="#"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-white px-6 py-3.5 text-sm font-medium text-ink-950"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white via-neon-cyan/30 to-white bg-[length:200%_100%] opacity-0 transition-opacity duration-500 group-hover:animate-shimmer group-hover:opacity-100" />
                <span className="relative">Get Started</span>
                <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </motion.a>
              <a
                href="#"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3.5 text-sm text-ink-100 transition hover:border-white/20 hover:bg-white/[0.06]"
              >
                Read the docs
              </a>
            </div>

            <div className="mt-8 inline-flex max-w-full items-center gap-2 overflow-hidden rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 font-mono text-[11px] text-ink-200 sm:mt-10 sm:text-xs">
              <span className="text-neon-cyan">$</span>
              <span className="truncate">curl -sSL agentpatrol.sh | sh</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
