"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  MotionValue,
} from "framer-motion";
import { SectionHeading } from "./SectionHeading";
import { Check, ShieldAlert, ShieldCheck, Siren } from "lucide-react";

const phases = [
  {
    name: "Normal",
    desc: "Agent operating within baseline. Tool calls, file reads, and egress all inside policy.",
    color: "#3cf2a0",
    icon: ShieldCheck,
  },
  {
    name: "Unusual",
    desc: "Sudden spike in outbound requests. Accessing credentials it has never touched.",
    color: "#ffb84d",
    icon: ShieldAlert,
  },
  {
    name: "Flagged",
    desc: "Anomaly score crosses 0.9. AgentPatrol tags it as a probable exfiltration attempt.",
    color: "#ff4d6d",
    icon: Siren,
  },
  {
    name: "Blocked",
    desc: "Policy engine kills the process, revokes tokens, and opens an incident.",
    color: "#4d8bff",
    icon: Check,
  },
];

export function ThreatSimulation() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  return (
    <section ref={ref} className="relative py-20 md:py-28 lg:py-40">
      <div className="container-px mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Threat Simulation"
          title={
            <>
              Watch an agent go rogue.{" "}
              <span className="text-ink-300">Then watch it get stopped.</span>
            </>
          }
          subtitle="A replay of a real incident, caught and blocked in under 900 milliseconds."
        />

        <div className="relative mt-12 grid grid-cols-1 gap-6 md:mt-20 md:grid-cols-[1.1fr_1fr] md:gap-12">
          <Timeline progress={scrollYProgress} />
          <PhaseCards progress={scrollYProgress} />
        </div>
      </div>
    </section>
  );
}

function Timeline({ progress }: { progress: MotionValue<number> }) {
  const fill = useTransform(progress, [0.25, 0.85], ["0%", "100%"]);

  const hue = useTransform(
    progress,
    [0.3, 0.5, 0.65, 0.85],
    ["#3cf2a0", "#ffb84d", "#ff4d6d", "#4d8bff"]
  );

  const shadowColor = useTransform(
    progress,
    [0.3, 0.5, 0.65, 0.85],
    [
      "0 0 60px rgba(60,242,160,0.35)",
      "0 0 70px rgba(255,184,77,0.4)",
      "0 0 80px rgba(255,77,109,0.5)",
      "0 0 80px rgba(77,139,255,0.5)",
    ]
  );

  return (
    <div className="relative h-[380px] overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-5 md:h-[460px] md:p-8">
      <div className="absolute inset-0 grid-bg opacity-40" />

      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-ink-300">
          <span>claude-worker · PID 4821</span>
          <span>t = 0.0s — 1.1s</span>
        </div>

        <div className="relative mx-auto flex w-full items-center justify-center">
          <motion.div
            style={{
              backgroundColor: hue,
              boxShadow: shadowColor,
            }}
            className="relative grid h-28 w-28 place-items-center rounded-full md:h-40 md:w-40"
          >
            <motion.span
              style={{ backgroundColor: hue }}
              className="absolute inset-0 rounded-full opacity-30 blur-2xl"
            />
            <span className="relative h-16 w-16 rounded-full border border-white/20 bg-ink-950/60 backdrop-blur md:h-24 md:w-24" />
            <motion.span
              className="absolute inset-[-10px] rounded-full border border-white/10"
              style={{ borderColor: hue }}
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        </div>

        <div className="relative">
          <div className="h-[3px] w-full rounded-full bg-white/10" />
          <motion.div
            style={{ width: fill, backgroundColor: hue }}
            className="absolute left-0 top-0 h-[3px] rounded-full"
          />
          <div className="mt-3 flex justify-between text-[11px] uppercase tracking-widest text-ink-300">
            {phases.map((p) => (
              <span key={p.name}>{p.name}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PhaseCards({ progress }: { progress: MotionValue<number> }) {
  return (
    <div className="relative flex flex-col gap-4">
      <PhaseCard progress={progress} index={0} />
      <PhaseCard progress={progress} index={1} />
      <PhaseCard progress={progress} index={2} />
      <PhaseCard progress={progress} index={3} />
    </div>
  );
}

function PhaseCard({
  progress,
  index,
}: {
  progress: MotionValue<number>;
  index: number;
}) {
  const p = phases[index];
  const start = 0.3 + index * 0.14;
  const Icon = p.icon;

  const opacity = useTransform(progress, [start - 0.04, start + 0.02], [0.25, 1]);
  const x = useTransform(progress, [start - 0.04, start + 0.02], [20, 0]);
  const glow = useTransform(
    progress,
    [start - 0.02, start + 0.02, start + 0.12],
    ["rgba(255,255,255,0.06)", p.color, "rgba(255,255,255,0.1)"]
  );

  return (
    <motion.div
      style={{ opacity, x, borderColor: glow }}
      className="relative rounded-xl border bg-white/[0.03] p-5 backdrop-blur"
    >
      <div className="flex items-start gap-4">
        <div
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
          style={{ backgroundColor: `${p.color}22`, color: p.color }}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-ink-300">
            Phase {String(index + 1).padStart(2, "0")}
          </div>
          <div className="mt-1 text-lg font-semibold" style={{ color: p.color }}>
            {p.name}
          </div>
          <p className="mt-1 text-sm text-ink-200">{p.desc}</p>
        </div>
      </div>
    </motion.div>
  );
}
