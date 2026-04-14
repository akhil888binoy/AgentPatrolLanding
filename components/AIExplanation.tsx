"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Sparkles,
  ChevronDown,
  FileSearch,
  Globe,
  KeyRound,
  Brain,
  ShieldAlert,
  Zap,
} from "lucide-react";
import { SectionHeading } from "./SectionHeading";

const aiCapabilities = [
  {
    icon: Brain,
    title: "Behavioral fingerprinting",
    body: "Builds a live model of each AI agent's normal behavior prompts issued, tools called, syscalls made, egress destinations. Learns continuously.",
  },
  {
    icon: ShieldAlert,
    title: "Adversarial detection",
    body: "Scores every action against the agent's profile in <10ms. Flags credential theft, prompt injection, data exfiltration, and lateral movement in real time.",
  },
  {
    icon: Zap,
    title: "Autonomous blocking",
    body: "When risk exceeds threshold, the AI acts  severs streams, kills the process, quarantines the agent. No human approval required.",
  },
];

const findings = [
  {
    icon: FileSearch,
    label: "Credential file access",
    detail: "Read ~/.aws/credentials and ~/.ssh/id_ed25519 — outside declared tool scope.",
  },
  {
    icon: Globe,
    label: "Anomalous egress",
    detail: "38 req/s to an unknown host in AS198605 — never seen in baseline.",
  },
  {
    icon: KeyRound,
    label: "Privilege escalation attempt",
    detail: "Used harvested AWS key to call sts:GetCallerIdentity then iam:ListRoles.",
  },
];

export function AIExplanation() {
  const [open, setOpen] = useState(true);

  return (
    <section className="relative py-20 md:py-28 lg:py-40">
      <div className="container-px mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="AI Risk Detection Engine"
          title={
            <>
              AI deployed against AI.{" "}
              <span className="text-ink-300">Autonomously.</span>
            </>
          }
          subtitle="AgentPatrol runs an on device detection model alongside every AI agent on your system. It learns normal, flags deviations the moment they happen, and blocks threats without waiting for a human."
        />

        <div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-3">
          {aiCapabilities.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.7, delay: i * 0.08 }}
                className="relative"
              >
                <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-white/10 to-transparent opacity-60" />
                <div className="relative h-full rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                  <div className="mb-4 grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-gradient-to-br from-neon-violet/20 to-neon-blue/10">
                    <Icon className="h-4 w-4 text-neon-cyan" />
                  </div>
                  <div className="text-sm font-semibold text-white">
                    {c.title}
                  </div>
                  <p className="mt-1.5 text-sm text-ink-200">{c.body}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.8 }}
          className="mx-auto mt-14 max-w-3xl"
        >
          <div className="mb-4 flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.18em] text-ink-300">
            <Sparkles className="h-3 w-3 text-neon-violet" />
            Model output · AgentPatrol-Detect v2</div>
          <div className="relative">
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-neon-blue/40 via-neon-violet/30 to-transparent opacity-60 blur" />
            <div className="relative rounded-2xl border border-white/10 bg-ink-900/80 p-5 backdrop-blur-xl sm:p-6 md:p-8">
              <button
                onClick={() => setOpen((v) => !v)}
                className="flex w-full items-center gap-4 text-left"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-neon-violet/30 to-neon-blue/20 ring-1 ring-white/10">
                  <Sparkles className="h-4 w-4 text-neon-cyan" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-ink-300">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon-red opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-neon-red" />
                    </span>
                    Incident · INC-0142 · 14:02:24 UTC
                  </div>
                  <div className="mt-1 text-base font-semibold sm:text-lg md:text-xl">
                    Rogue AI blocked —{" "}
                    <span className="text-neon-red">claude-worker</span>
                  </div>
                </div>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-ink-300 transition-transform ${
                    open ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="mt-6 border-t border-white/10 pt-6">
                      <p className="text-base leading-relaxed text-ink-100">
                        The agent{" "}
                        <span className="font-semibold text-white">
                          claude-worker
                        </span>{" "}
                        deviated sharply from its behavioral baseline  reading
                        credential files outside its declared scope, then
                        initiating high-frequency egress to an unknown host. The
                        detection model classified this as{" "}
                        <span className="text-neon-violet">
                          credential-exfiltration
                        </span>{" "}
                        and autonomously terminated the agent's network access
                        in 872ms.
                      </p>

                      <div className="mt-6 grid gap-3">
                        {findings.map((f, i) => {
                          const Icon = f.icon;
                          return (
                            <motion.div
                              key={f.label}
                              initial={{ opacity: 0, x: -12 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 + i * 0.08 }}
                              className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4"
                            >
                              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-neon-red/10 text-neon-red">
                                <Icon className="h-4 w-4" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-white">
                                  {f.label}
                                </div>
                                <div className="mt-0.5 text-sm text-ink-200">
                                  {f.detail}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>

                      <div className="mt-6 flex flex-wrap items-center gap-3">
                        <span className="rounded-full border border-neon-red/30 bg-neon-red/10 px-3 py-1 text-xs text-neon-red">
                          Threat · Confirmed
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-ink-200">
                          AI confidence · 0.96
                        </span>
                        <span className="rounded-full border border-neon-green/30 bg-neon-green/10 px-3 py-1 text-xs text-neon-green">
                          Blocked by AI in 872ms
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
