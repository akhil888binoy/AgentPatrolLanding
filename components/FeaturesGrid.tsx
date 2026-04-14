"use client";

import { motion } from "framer-motion";
import {
  Brain,
  ShieldAlert,
  Zap,
  Activity,
  Feather,
  Terminal,
} from "lucide-react";
import { SectionHeading } from "./SectionHeading";

const features = [
  {
    icon: Brain,
    title: "AI Behavioral Modeling",
    body: "Continuously learns each agent's normal fingerprint  prompts, tool calls, syscalls, egress. Deviations trigger scoring the moment they happen.",
  },
  {
    icon: ShieldAlert,
    title: "Adversarial AI Detection",
    body: "Pattern matched against known AI attack vectors: prompt injection, credential exfiltration, jailbreak attempts, and lateral movement between agents.",
  },
  {
    icon: Zap,
    title: "Autonomous Blocking",
    body: "When the AI confirms a threat, it acts  kills streams, quarantines the process, severs connections. No human approval. No delay.",
  },
  {
    icon: Activity,
    title: "Real time Risk Scoring",
    body: "140+ behavioral signals scored per agent, per action. Risk score updated every tick at sub-10ms latency  no cloud round-trip.",
  },
  {
    icon: Feather,
    title: "Zero egress Architecture",
    body: "Every model runs fully on device. No data leaves your machine. Fully air gap compatible. SOC 2 Type II compliant by design.",
  },
  {
    icon: Terminal,
    title: "Universal Agent Coverage",
    body: "Works across every AI runtime: node, python, rust, go, shell agents, MCP servers, copilots, and locally-hosted LLMs.",
  },
];

export function FeaturesGrid() {
  return (
    <section id="features" className="relative py-20 md:py-28 lg:py-40">
      <div className="container-px mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Features"
          title={
            <>
              AI fighting AI.{" "}
              <span className="text-ink-300">At every layer.</span>
            </>
          }
        />

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 md:mt-16 lg:grid-cols-3">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{
                  duration: 0.7,
                  delay: i * 0.05,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="group relative"
              >
                <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-b from-white/15 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="relative h-full rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition-colors duration-300 group-hover:border-white/20 group-hover:bg-white/[0.04]">
                  <div className="mb-5 grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-gradient-to-br from-neon-blue/20 to-neon-violet/10 transition-transform duration-500 group-hover:scale-[1.06]">
                    <Icon className="h-4 w-4 text-neon-cyan" />
                  </div>
                  <div className="text-lg font-semibold">{f.title}</div>
                  <p className="mt-2 text-sm leading-relaxed text-ink-200">
                    {f.body}
                  </p>
                  <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-neon-blue/60 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
