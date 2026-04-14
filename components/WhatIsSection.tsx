"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
  type MotionValue,
} from "framer-motion";
import { Radar } from "lucide-react";

/* ------------------------- Geometry & state model ------------------------ */

const VIEW_W = 400;
const VIEW_H = 300;

const NODES = [
  { id: 0, x: 200, y: 150, label: "agent-α" }, // patient zero
  { id: 1, x: 75, y: 70, label: "agent-β" },
  { id: 2, x: 325, y: 70, label: "agent-γ" },
  { id: 3, x: 75, y: 230, label: "agent-δ" },
  { id: 4, x: 325, y: 230, label: "agent-ε" },
];

const EDGES = [
  { a: 0, b: 1, infected: true },
  { a: 0, b: 2, infected: true },
  { a: 0, b: 3, infected: true },
  { a: 0, b: 4, infected: true },
  { a: 1, b: 2, infected: false },
  { a: 3, b: 4, infected: false },
];

const BLUE = "#4d8bff";
const CYAN = "#5ef2ff";
const AMBER = "#ffb84d";
const RED = "#ff4d6d";
const GREEN = "#3cf2a0";
const VIOLET = "#a26bff";

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const range = (s: number, e: number, t: number) => clamp01((t - s) / (e - s));

function lerpHex(a: string, b: string, t: number) {
  const pa = [
    parseInt(a.slice(1, 3), 16),
    parseInt(a.slice(3, 5), 16),
    parseInt(a.slice(5, 7), 16),
  ];
  const pb = [
    parseInt(b.slice(1, 3), 16),
    parseInt(b.slice(3, 5), 16),
    parseInt(b.slice(5, 7), 16),
  ];
  return `rgb(${Math.round(lerp(pa[0], pb[0], t))}, ${Math.round(
    lerp(pa[1], pb[1], t)
  )}, ${Math.round(lerp(pa[2], pb[2], t))})`;
}

function patientColor(t: number) {
  if (t < 0.15) return BLUE;
  if (t < 0.3) return lerpHex(BLUE, AMBER, range(0.15, 0.3, t));
  if (t < 0.5) return AMBER;
  if (t < 0.65) return lerpHex(AMBER, RED, range(0.5, 0.65, t));
  return RED;
}

function patientGlow(t: number) {
  if (t < 0.15) return 0.4;
  if (t < 0.3) return lerp(0.4, 0.8, range(0.15, 0.3, t));
  if (t < 0.5) return 0.8;
  if (t < 0.65) return lerp(0.8, 1.3, range(0.5, 0.65, t));
  if (t < 0.8) return lerp(1.3, 0.6, range(0.65, 0.8, t));
  return 0.5;
}

function patientScale(t: number) {
  if (t < 0.3) return 1;
  if (t < 0.65) return lerp(1, 1.18, range(0.3, 0.65, t));
  if (t < 0.8) return lerp(1.18, 0.92, range(0.65, 0.8, t));
  return 0.92;
}

function patientOpacity(t: number) {
  if (t < 0.8) return 1;
  return lerp(1, 0.55, range(0.8, 1, t));
}

function edgeOpacity(t: number, infected: boolean) {
  const faint = 0.16;
  if (!infected) return faint;
  if (t < 0.3) return faint;
  if (t < 0.5) return lerp(faint, 0.9, range(0.3, 0.5, t));
  if (t < 0.65) return 0.9;
  if (t < 0.8) return lerp(0.9, 0, range(0.65, 0.8, t));
  return 0;
}

function edgeColor(t: number, infected: boolean) {
  if (!infected) return BLUE;
  if (t < 0.5) return lerpHex(BLUE, AMBER, range(0.3, 0.5, t));
  if (t < 0.65) return lerpHex(AMBER, RED, range(0.5, 0.65, t));
  return RED;
}

function neighborGlow(t: number) {
  if (t < 0.3) return 0;
  if (t < 0.5) return range(0.3, 0.5, t) * 0.7;
  if (t < 0.65) return 0.7;
  if (t < 0.8) return lerp(0.7, 0, range(0.65, 0.8, t));
  return 0;
}

function packetVisibility(t: number) {
  if (t < 0.3) return 0;
  if (t < 0.4) return range(0.3, 0.4, t);
  if (t < 0.65) return 1;
  if (t < 0.72) return lerp(1, 0, range(0.65, 0.72, t));
  return 0;
}

function shockwave(t: number) {
  if (t < 0.65 || t >= 0.85) return null;
  const p = range(0.65, 0.85, t);
  return { r: 18 + p * 110, opacity: 1 - p };
}

function quarantineRing(t: number) {
  if (t < 0.78) return 0;
  return range(0.78, 0.95, t);
}

function dimOverlay(t: number) {
  if (t < 0.65 || t >= 0.85) return 0;
  const p = range(0.65, 0.85, t);
  return Math.sin(p * Math.PI) * 0.3;
}

type LabelTone = "amber" | "red" | "blue" | "green";
type LabelState = { text: string; tone: LabelTone };

function currentLabel(t: number): LabelState | null {
  if (t < 0.16) return null;
  if (t < 0.32) return { text: "Behavioral anomaly · risk score rising", tone: "amber" };
  if (t < 0.5) return null;
  if (t < 0.65)
    return { text: "Lateral movement · AI threat confirmed", tone: "red" };
  if (t < 0.82) return { text: "AI intervention triggered", tone: "blue" };
  return { text: "Blocked by AI · agent quarantined", tone: "green" };
}

const PHASES: Array<{
  start: number;
  key: string;
  label: string;
  status: string;
  color: string;
}> = [
  {
    start: 0,
    key: "normal",
    label: "Baseline",
    status: "All agents within normal profile.",
    color: BLUE,
  },
  {
    start: 0.15,
    key: "suspicious",
    label: "Anomaly detected",
    status: "agent-α risk score climbing.",
    color: AMBER,
  },
  {
    start: 0.3,
    key: "lateral",
    label: "Lateral movement",
    status: "agent-α probing peer agents.",
    color: AMBER,
  },
  {
    start: 0.5,
    key: "threat",
    label: "Threat confirmed",
    status: "Risk HIGH · AI intervention queued.",
    color: RED,
  },
  {
    start: 0.65,
    key: "intervention",
    label: "AI blocking",
    status: "Detection engine severing streams.",
    color: VIOLET,
  },
  {
    start: 0.82,
    key: "isolated",
    label: "Quarantined",
    status: "Rogue agent isolated by AI.",
    color: GREEN,
  },
];

function currentPhase(t: number) {
  let p = PHASES[0];
  for (const x of PHASES) if (t >= x.start) p = x;
  return p;
}

/* -------------------------------- Section -------------------------------- */

export function WhatIsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  return (
    <section
      id="what"
      ref={ref}
      className="relative h-[260vh] md:h-[320vh]"
    >
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        <div className="container-px mx-auto w-full max-w-7xl">
          <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12 lg:gap-16">
            <ChainReactionGraph scrollYProgress={scrollYProgress} />
            <ControlCopy scrollYProgress={scrollYProgress} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------- Chain reaction SVG -------------------------- */

function ChainReactionGraph({
  scrollYProgress,
}: {
  scrollYProgress: MotionValue<number>;
}) {
  const [t, setT] = useState(0);
  const [, setTick] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (v) => setT(v));

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      setTick((x) => (x + 1) & 0xffff);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const now = typeof performance !== "undefined" ? performance.now() : 0;

  const pColor = patientColor(t);
  const pGlow = patientGlow(t);
  const pScale = patientScale(t);
  const pOpacity = patientOpacity(t);
  const nGlow = neighborGlow(t);
  const pktVis = packetVisibility(t);
  const shock = shockwave(t);
  const ring = quarantineRing(t);
  const dim = dimOverlay(t);
  const label = currentLabel(t);

  // Subtle parallax for grid + small jitter for suspicious phase
  const gridShiftY = (t - 0.5) * 8;
  const jitter =
    t > 0.16 && t < 0.5 ? Math.sin(now * 0.022) * 0.7 : 0;

  return (
    <div className="relative h-[300px] overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-3 sm:h-[380px] md:h-[460px] md:p-6">
      <div
        className="absolute inset-0 grid-bg opacity-30"
        style={{ transform: `translateY(${gridShiftY}px)` }}
      />

      <div
        className="pointer-events-none absolute inset-0 bg-ink-950 transition-opacity duration-200"
        style={{ opacity: dim }}
      />

      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="relative h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <radialGradient id="cr-blue" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={CYAN} stopOpacity="0.95" />
            <stop offset="100%" stopColor={BLUE} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="cr-patient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={pColor} stopOpacity="0.95" />
            <stop offset="100%" stopColor={pColor} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Edges */}
        {EDGES.map((e, i) => {
          const a = NODES[e.a];
          const b = NODES[e.b];
          return (
            <line
              key={i}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={edgeColor(t, e.infected)}
              strokeWidth={e.infected ? 1.5 : 1}
              strokeLinecap="round"
              opacity={edgeOpacity(t, e.infected)}
            />
          );
        })}

        {/* Data packets along infected edges */}
        {pktVis > 0 &&
          EDGES.map((e, i) => {
            if (!e.infected) return null;
            const a = NODES[e.a];
            const b = NODES[e.b];
            return (
              <g key={`pkt-${i}`}>
                {[0, 0.33, 0.66].map((offset, j) => {
                  const phase = (now * 0.0006 + offset + i * 0.07) % 1;
                  const x = lerp(a.x, b.x, phase);
                  const y = lerp(a.y, b.y, phase);
                  const fade = Math.sin(phase * Math.PI);
                  return (
                    <circle
                      key={j}
                      cx={x}
                      cy={y}
                      r={2.2}
                      fill={CYAN}
                      opacity={pktVis * fade * 0.95}
                    />
                  );
                })}
              </g>
            );
          })}

        {/* Neighbor nodes */}
        {NODES.slice(1).map((n) => (
          <g key={n.id}>
            <circle
              cx={n.x}
              cy={n.y}
              r={18 + nGlow * 5}
              fill="url(#cr-blue)"
              opacity={0.55 + nGlow * 0.4}
            />
            <circle cx={n.x} cy={n.y} r={5} fill={CYAN} opacity={0.95} />
            <circle
              cx={n.x}
              cy={n.y}
              r={5}
              fill="none"
              stroke={CYAN}
              strokeWidth={1}
              opacity={0.6}
            >
              <animate
                attributeName="r"
                values="5;9;5"
                dur="3s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.7;0;0.7"
                dur="3s"
                repeatCount="indefinite"
              />
            </circle>
            <text
              x={n.x}
              y={n.y + 22}
              textAnchor="middle"
              fill="rgba(228,228,236,0.45)"
              fontSize="9"
              fontFamily="JetBrains Mono, ui-monospace, monospace"
            >
              {n.label}
            </text>
          </g>
        ))}

        {/* Shockwave from intervention moment */}
        {shock && (
          <circle
            cx={NODES[0].x}
            cy={NODES[0].y}
            r={shock.r}
            fill="none"
            stroke={VIOLET}
            strokeWidth={2}
            opacity={shock.opacity}
          />
        )}
        {shock && (
          <circle
            cx={NODES[0].x}
            cy={NODES[0].y}
            r={shock.r * 0.6}
            fill="none"
            stroke={CYAN}
            strokeWidth={1.2}
            opacity={shock.opacity * 0.7}
          />
        )}

        {/* Quarantine ring (final isolation) */}
        {ring > 0 && (
          <g>
            <circle
              cx={NODES[0].x}
              cy={NODES[0].y}
              r={28}
              fill="none"
              stroke={RED}
              strokeWidth={1.2}
              strokeDasharray="4 3"
              opacity={ring * 0.95}
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from={`0 ${NODES[0].x} ${NODES[0].y}`}
                to={`360 ${NODES[0].x} ${NODES[0].y}`}
                dur="8s"
                repeatCount="indefinite"
              />
            </circle>
          </g>
        )}

        {/* Patient zero */}
        <g transform={`translate(${jitter} 0)`}>
          <circle
            cx={NODES[0].x}
            cy={NODES[0].y}
            r={20 + pGlow * 14}
            fill="url(#cr-patient)"
            opacity={(0.6 + pGlow * 0.3) * pOpacity}
          />
          <circle
            cx={NODES[0].x}
            cy={NODES[0].y}
            r={7 * pScale}
            fill={pColor}
            opacity={pOpacity}
          />
          <circle
            cx={NODES[0].x}
            cy={NODES[0].y}
            r={7 * pScale + 2}
            fill="none"
            stroke={pColor}
            strokeWidth={1}
            opacity={0.7 * pOpacity}
          />
          <text
            x={NODES[0].x}
            y={NODES[0].y + 24}
            textAnchor="middle"
            fill="rgba(228,228,236,0.7)"
            fontSize="9"
            fontFamily="JetBrains Mono, ui-monospace, monospace"
          >
            agent-α
          </text>
        </g>
      </svg>

      {/* Floating overlay label */}
      <AnimatePresence mode="wait">
        {label && (
          <motion.div
            key={label.text}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3 }}
            className={`absolute left-1/2 top-4 inline-flex -translate-x-1/2 items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium backdrop-blur ${labelTone(
              label.tone
            )}`}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span
                className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${labelDot(
                  label.tone
                )}`}
              />
              <span
                className={`relative inline-flex h-1.5 w-1.5 rounded-full ${labelDot(
                  label.tone
                )}`}
              />
            </span>
            {label.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function labelTone(tone: LabelTone) {
  switch (tone) {
    case "amber":
      return "border-neon-amber/40 bg-neon-amber/10 text-neon-amber";
    case "red":
      return "border-neon-red/40 bg-neon-red/10 text-neon-red";
    case "blue":
      return "border-neon-blue/40 bg-neon-blue/10 text-neon-blue";
    case "green":
      return "border-neon-green/40 bg-neon-green/10 text-neon-green";
  }
}

function labelDot(tone: LabelTone) {
  switch (tone) {
    case "amber":
      return "bg-neon-amber";
    case "red":
      return "bg-neon-red";
    case "blue":
      return "bg-neon-blue";
    case "green":
      return "bg-neon-green";
  }
}

/* ------------------------------ Right copy ------------------------------ */

function ControlCopy({
  scrollYProgress,
}: {
  scrollYProgress: MotionValue<number>;
}) {
  const [t, setT] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => setT(v));
  const phase = currentPhase(t);

  return (
    <div className="relative">
      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-ink-200 backdrop-blur">
        <Radar className="h-3.5 w-3.5 text-neon-cyan" />
         AI Detection
      </div>

      <h2 className="mt-4 text-balance text-3xl font-semibold leading-[1.05] tracking-tight md:mt-5 md:text-5xl lg:text-6xl">
        AI catching AI.{" "}
        <span className="text-ink-300">In real time.</span>
      </h2>

      <p className="mt-4 max-w-lg text-sm text-ink-200 md:mt-5 md:text-base lg:text-lg">
        AgentPatrol's detection engine tracks every agent's behavioral
        fingerprint. The moment one deviates credential access, unexpected
        egress, lateral reach  the AI isolates it autonomously.
      </p>

      <div className="mt-6 flex w-fit items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 backdrop-blur">
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{
            backgroundColor: phase.color,
            boxShadow: `0 0 14px ${phase.color}`,
          }}
        />
        <div className="leading-tight">
          <div
            className="text-xs font-semibold"
            style={{ color: phase.color }}
          >
            {phase.label}
          </div>
          <div className="font-mono text-[11px] text-ink-300">
            {phase.status}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {t < 0.06 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-6 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-ink-400"
          >
            <span className="h-px w-8 bg-white/20" />
            scroll to play
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
