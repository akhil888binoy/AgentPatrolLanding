"use client";

import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Scale,
  Radar,
  Cpu,
} from "lucide-react";
import { SectionHeading } from "./SectionHeading";

const layers = [
  {
    name: "Dashboard & Audit Trail",
    tag: "Layer 04",
    desc: "Live agent map, risk timelines, AI generated incident reports, policy editor, and one-click rollback  all in a single console.",
    icon: LayoutDashboard,
    accent: "from-neon-blue/30 to-neon-cyan/10",
  },
  {
    name: "Autonomous Policy Engine",
    tag: "Layer 03",
    desc: "Declarative rules evaluated in microseconds. Allow, throttle, block, or quarantine any agent behavior  enforced before the action completes.",
    icon: Scale,
    accent: "from-neon-violet/30 to-neon-blue/10",
  },
  {
    name: "AI Risk Detection Engine",
    tag: "Layer 02",
    desc: "On-device models score 140+ behavioral signals per agent. Detects credential theft, prompt injection, data exfiltration, and lateral movement  then triggers autonomous blocking in <10ms. No cloud, no egress.",
    icon: Radar,
    accent: "from-neon-red/30 to-neon-amber/10",
  },
  {
    name: "OS-level Telemetry",
    tag: "Layer 01",
    desc: "eBPF / kauth / ptrace hooks capture syscalls, file access, network connections, and child processes at the kernel level  zero-latency, zero-egress.",
    icon: Cpu,
    accent: "from-white/15 to-white/5",
  },
];

export function Architecture() {
  return (
    <section id="architecture" className="relative py-20 md:py-28 lg:py-40">
      <div className="absolute inset-0 bg-radial-fade opacity-50" />

      <div className="container-px relative mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Architecture"
          title={
            <>
              Four layers of{" "}
              <span className="text-ink-300">AI defense.</span>
            </>
          }
          subtitle="AgentPatrol installs as a single local daemon  kernel level telemetry feeds an on-device AI that detects and blocks rogue agents before they cause harm."
        />

        <div className="relative mx-auto mt-20 max-w-4xl [perspective:1400px]">
          <div className="relative space-y-5 [transform-style:preserve-3d]">
            {layers.map((l, i) => {
              const Icon = l.icon;
              return (
                <motion.div
                  key={l.name}
                  initial={{ opacity: 0, y: 60, rotateX: -12 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                  viewport={{ once: true, margin: "-15%" }}
                  transition={{
                    duration: 0.9,
                    delay: i * 0.12,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  style={{
                    transform: `translateZ(${(layers.length - i) * 2}px)`,
                  }}
                  className="group relative"
                >
                  <div
                    className={`absolute -inset-px rounded-2xl bg-gradient-to-r ${l.accent} opacity-60 blur`}
                  />
                  <div className="relative flex items-start gap-4 rounded-2xl border border-white/10 bg-ink-900/70 p-4 backdrop-blur-xl sm:items-center sm:gap-5 sm:p-5 md:p-6">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.04] sm:h-12 sm:w-12">
                      <Icon className="h-4 w-4 text-neon-cyan sm:h-5 sm:w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-ink-300">
                          {l.tag}
                        </span>
                        <span className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                      </div>
                      <div className="mt-1 text-base font-semibold sm:mt-1.5 sm:text-lg md:text-xl">
                        {l.name}
                      </div>
                      <p className="mt-1 max-w-xl text-xs text-ink-200 sm:text-sm">
                        {l.desc}
                      </p>
                    </div>
                    <div className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] uppercase tracking-widest text-ink-300 md:flex">
                      <span className="h-1 w-1 rounded-full bg-neon-green" />
                      healthy
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
