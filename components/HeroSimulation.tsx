"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/* ------------------------------ Constants ------------------------------- */

const VIEW_W = 1600;
const VIEW_H = 900;
const PARTICLE_COUNT = 55;
const CYCLE_MS = 14000;

const CYAN = "#5ef2ff";
const BLUE = "#4d8bff";
const AMBER = "#ffb84d";
const RED = "#ff4d6d";
const VIOLET = "#a26bff";

type Phase = "idle" | "anomaly" | "escalation" | "intervention" | "recovery";

const P = {
  idleEnd: 4500,
  anomalyEnd: 6500,
  escalationEnd: 9000,
  interventionEnd: 9700,
  recoveryEnd: 14000,
};

function getPhase(t: number): Phase {
  if (t < P.idleEnd) return "idle";
  if (t < P.anomalyEnd) return "anomaly";
  if (t < P.escalationEnd) return "escalation";
  if (t < P.interventionEnd) return "intervention";
  return "recovery";
}

/* ------------------------------- Helpers -------------------------------- */

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const range = (s: number, e: number, t: number) => clamp01((t - s) / (e - s));

/**
 * Returns 0 at the exact center of the viewBox, rising to 1 at the edge of
 * the "quiet zone" ellipse behind the hero headline.  Values beyond the zone
 * clamp at 1. Use to attenuate opacity of nodes / edges near the text.
 */
function centerFade(x: number, y: number): number {
  const dx = (x - VIEW_W / 2) / (VIEW_W * 0.26);
  const dy = (y - VIEW_H / 2) / (VIEW_H * 0.29);
  return Math.min(1, Math.hypot(dx, dy));
}

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

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/* --------------------------- Graph generation --------------------------- */

type GraphNode = { id: number; x: number; y: number; r: number; ring: number };
type GraphEdge = { id: number; a: number; b: number };

// Rings: [nodeCount, ellipseRadius] — node count increases outward
const RINGS = [
  { count: 1, radius: 0   },  // center hub
  { count: 5, radius: 145 },
  { count: 8, radius: 300 },
  { count: 10, radius: 490 },
] as const;

function generate(): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const rand = seeded(31);
  const nodes: GraphNode[] = [];

  // Center hub
  nodes.push({ id: 0, x: VIEW_W / 2, y: VIEW_H / 2, r: 5.5, ring: 0 });

  // Place nodes ring by ring with slight jitter for organic feel
  for (let ri = 1; ri < RINGS.length; ri++) {
    const { count, radius } = RINGS[ri];
    for (let si = 0; si < count; si++) {
      const baseAngle = (si / count) * Math.PI * 2;
      const angle = baseAngle + (rand() - 0.5) * 0.22;
      const r = radius + (rand() - 0.5) * 32;
      nodes.push({
        id: nodes.length,
        // Ellipse: wider on x to fill 1600×900 viewport
        x: VIEW_W / 2 + Math.cos(angle) * r * 1.56,
        y: VIEW_H / 2 + Math.sin(angle) * r * 0.87,
        r: 2.8 + (RINGS.length - ri) * 0.45 + rand() * 0.9,
        ring: ri,
      });
    }
  }

  // Connect each node to its K nearest neighbours, favouring cross-ring links
  const edges: GraphEdge[] = [];
  let edgeId = 0;
  const K = 4;

  for (let i = 0; i < nodes.length; i++) {
    const sorted = nodes
      .map((n, j) => ({ j, d: Math.hypot(n.x - nodes[i].x, n.y - nodes[i].y) }))
      .filter((x) => x.j !== i)
      .sort((a, b) => a.d - b.d);

    let added = 0;
    for (const { j } of sorted) {
      if (added >= K) break;
      const exists = edges.some(
        (e) => (e.a === i && e.b === j) || (e.a === j && e.b === i)
      );
      if (!exists) {
        edges.push({ id: edgeId++, a: Math.min(i, j), b: Math.max(i, j) });
        added++;
      }
    }
  }

  return { nodes, edges };
}

/* ------------------------------- Particles ------------------------------ */

type Particle = {
  edge: number;
  progress: number;
  speed: number;
  reverse: boolean;
  infected: boolean;
  alpha: number;
  alive: boolean;
};

function spawnParticle(
  edges: GraphEdge[],
  patientEdges: number[],
  wantInfected: boolean
): Particle {
  let edgeId: number;
  if (wantInfected && patientEdges.length > 0) {
    edgeId = patientEdges[Math.floor(Math.random() * patientEdges.length)];
  } else {
    edgeId = Math.floor(Math.random() * edges.length);
  }
  const reverse = Math.random() < 0.5;
  return {
    edge: edgeId,
    progress: reverse ? 1 : 0,
    speed: 0.00025 + Math.random() * 0.00065,
    reverse,
    infected: wantInfected,
    alpha: 0.001,
    alive: true,
  };
}

function particleColor(p: Particle, phase: Phase, cycleT: number): string {
  if (!p.infected) return CYAN;
  if (phase === "anomaly")
    return lerpHex(CYAN, AMBER, range(P.idleEnd, P.anomalyEnd, cycleT));
  if (phase === "escalation")
    return lerpHex(AMBER, RED, range(P.anomalyEnd, P.escalationEnd, cycleT));
  return RED;
}

/* ----------------------------- Patient state ---------------------------- */

function patientColor(cycleT: number, phase: Phase): string {
  if (phase === "idle") return CYAN;
  if (phase === "anomaly")
    return lerpHex(CYAN, AMBER, range(P.idleEnd, P.anomalyEnd, cycleT));
  if (phase === "escalation")
    return lerpHex(AMBER, RED, range(P.anomalyEnd, P.escalationEnd, cycleT));
  if (phase === "intervention") return RED;
  return RED;
}

function patientPulseScale(cycleT: number, phase: Phase, now: number): number {
  let freq = 0.0018;
  if (phase === "anomaly") freq = 0.004;
  if (phase === "escalation") freq = 0.0065;
  if (phase === "intervention") freq = 0.0008;
  if (phase === "recovery") freq = 0.0008;
  const amp = phase === "escalation" ? 0.22 : 0.14;
  return 1 + Math.sin(now * freq) * amp;
}

function patientGlow(cycleT: number, phase: Phase): number {
  if (phase === "idle") return 0.5;
  if (phase === "anomaly")
    return lerp(0.5, 1.0, range(P.idleEnd, P.anomalyEnd, cycleT));
  if (phase === "escalation")
    return lerp(1.0, 1.5, range(P.anomalyEnd, P.escalationEnd, cycleT));
  if (phase === "intervention") return lerp(1.5, 0.6, range(P.escalationEnd, P.interventionEnd, cycleT));
  return lerp(0.6, 0.35, range(P.interventionEnd, P.recoveryEnd, cycleT));
}

function patientFill(cycleT: number, phase: Phase): number {
  if (phase === "recovery")
    return lerp(1, 0.55, range(P.interventionEnd, P.recoveryEnd, cycleT));
  return 1;
}

/* ------------------------------ Tooltip copy ---------------------------- */

const TOOLTIPS: Record<Phase, { title: string; body: string; tone: string } | null> = {
  idle: null,
  anomaly: {
    title: "Anomaly detected",
    body: "Outbound call frequency above baseline.",
    tone: "amber",
  },
  escalation: {
    title: "Risk · HIGH",
    body: "Pattern matches credential-exfiltration.",
    tone: "red",
  },
  intervention: {
    title: "Intervention triggered",
    body: "Severing active streams.",
    tone: "violet",
  },
  recovery: {
    title: "Quarantined",
    body: "Agent isolated · streams resumed.",
    tone: "green",
  },
};

/* -------------------------------- Component ----------------------------- */

export function HeroSimulation() {
  const { nodes, edges } = useMemo(generate, []);
  const particlesRef = useRef<Particle[]>([]);
  const cycleTimeRef = useRef(0);
  const cycleRef = useRef(0);
  const startRef = useRef(0);
  const lastFrameRef = useRef(0);
  const patientEdgesRef = useRef<number[]>([]);

  const [, setTick] = useState(0);
  const [patient, setPatient] = useState(0);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  // Recompute patient edges whenever patient changes
  useEffect(() => {
    patientEdgesRef.current = edges
      .filter((e) => e.a === patient || e.b === patient)
      .map((e) => e.id);
  }, [edges, patient]);

  // Particle init + RAF loop
  useEffect(() => {
    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () =>
      spawnParticle(edges, [], false)
    );
    startRef.current = performance.now();
    lastFrameRef.current = performance.now();
    let raf = 0;
    let currentPatient = patient;

    const loop = (now: number) => {
      const dt = Math.min(50, now - lastFrameRef.current);
      lastFrameRef.current = now;

      const elapsed = now - startRef.current;
      const newCycle = Math.floor(elapsed / CYCLE_MS);
      const localT = elapsed - newCycle * CYCLE_MS;
      cycleTimeRef.current = localT;

      if (newCycle !== cycleRef.current) {
        cycleRef.current = newCycle;
        let next = Math.floor(Math.random() * nodes.length);
        if (next === currentPatient) next = (next + 1) % nodes.length;
        currentPatient = next;
        setPatient(next);
      }

      const phase = getPhase(localT);
      const speedMul =
        phase === "escalation" ? 1.7 : phase === "anomaly" ? 1.25 : 1;

      const arr = particlesRef.current;
      for (let i = 0; i < arr.length; i++) {
        const p = arr[i];
        if (!p.alive) continue;

        if (phase === "intervention" && p.infected) {
          p.alpha *= 0.82;
          if (p.alpha < 0.02) p.alive = false;
          continue;
        }

        const delta = p.speed * speedMul * dt;
        p.progress += p.reverse ? -delta : delta;

        if (p.progress > 1 || p.progress < 0) {
          p.alive = false;
        } else {
          const d = Math.abs(p.progress - 0.5) * 2;
          p.alpha = Math.max(0, 1 - d * d * 0.5);
        }
      }

      let infectedRate = 0;
      if (phase === "anomaly") infectedRate = 0.35;
      else if (phase === "escalation") infectedRate = 0.55;

      for (let i = 0; i < arr.length; i++) {
        if (arr[i].alive) continue;
        const wantInfected = Math.random() < infectedRate;
        arr[i] = spawnParticle(edges, patientEdgesRef.current, wantInfected);
      }

      setTick((x) => (x + 1) & 0xffff);
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edges]);

  // Mouse parallax (passive, document-level)
  useEffect(() => {
    function onMove(e: MouseEvent) {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      setPointer({ x, y });
    }
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const cycleT = cycleTimeRef.current;
  const phase = getPhase(cycleT);
  const now = typeof performance !== "undefined" ? performance.now() : 0;
  const patientNode = nodes[patient] ?? nodes[0];

  const pColor = patientColor(cycleT, phase);
  const pPulse = patientPulseScale(cycleT, phase, now);
  const pGlow = patientGlow(cycleT, phase);
  const pFill = patientFill(cycleT, phase);

  // Shockwave during intervention
  const shockProgress =
    phase === "intervention"
      ? range(P.escalationEnd, P.interventionEnd, cycleT)
      : 0;
  const shock =
    shockProgress > 0
      ? { r: 30 + shockProgress * 230, opacity: 1 - shockProgress }
      : null;

  // Quarantine ring during recovery
  const ringFade =
    phase === "recovery"
      ? Math.sin(range(P.interventionEnd, P.recoveryEnd, cycleT) * Math.PI) *
        0.95
      : 0;

  const tip = TOOLTIPS[phase];
  const parallaxX = pointer.x * 18;
  const parallaxY = pointer.y * 18;

  return (
    <div className="absolute inset-0 overflow-hidden">
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full mask-radial"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="hero-node" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={CYAN} stopOpacity="0.95" />
            <stop offset="100%" stopColor={BLUE} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="hero-patient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={pColor} stopOpacity="0.95" />
            <stop offset="100%" stopColor={pColor} stopOpacity="0" />
          </radialGradient>
        </defs>

        <g
          style={{
            transform: `translate(${parallaxX}px, ${parallaxY}px)`,
            transition: "transform 200ms ease-out",
          }}
        >
          {/* Edges */}
          {edges.map((e) => {
            const a = nodes[e.a];
            const b = nodes[e.b];
            const isPatientEdge = e.a === patient || e.b === patient;
            const crossRing = a.ring !== b.ring;

            // Fade edges near viewport center so they don't compete with text
            const fade = centerFade((a.x + b.x) / 2, (a.y + b.y) / 2);
            let opacity = lerp(0.06, crossRing ? 0.52 : 0.32, fade);
            if (isPatientEdge && phase === "escalation") opacity = lerp(0.1, 0.88, fade);
            if (isPatientEdge && phase === "intervention") opacity *= 1 - shockProgress;
            if (isPatientEdge && phase === "recovery") opacity = lerp(0.04, 0.22, fade);

            return (
              <line
                key={e.id}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={crossRing ? BLUE : VIOLET}
                strokeWidth={crossRing ? 1.1 : 0.75}
                opacity={opacity}
              />
            );
          })}

          {/* Particles */}
          {particlesRef.current.map((p, i) => {
            if (!p.alive || p.alpha < 0.05) return null;
            const e = edges[p.edge];
            if (!e) return null;
            const a = nodes[e.a];
            const b = nodes[e.b];
            const x = a.x + (b.x - a.x) * p.progress;
            const y = a.y + (b.y - a.y) * p.progress;
            const c = particleColor(p, phase, cycleT);
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={p.infected ? 2.6 : 2}
                fill={c}
                opacity={p.alpha * (p.infected ? 1 : 0.85)}
              />
            );
          })}

          {/* Neighbour nodes */}
          {nodes.map((n) => {
            if (n.id === patient) return null;
            const isHub = n.ring === 0;
            // Attenuate nodes that sit behind the hero text
            const fade = centerFade(n.x, n.y);
            const glowOp = lerp(isHub ? 0.12 : 0.06, isHub ? 0.75 : 0.5, fade);
            const fillOp = lerp(isHub ? 0.35 : 0.2, isHub ? 0.9 : 0.95, fade);
            const ringOp = lerp(0.08, isHub ? 0.75 : 0.5, fade);
            return (
              <g key={n.id}>
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={isHub ? 38 : 22}
                  fill="url(#hero-node)"
                  opacity={glowOp}
                />
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={n.r}
                  fill={isHub ? CYAN : "#cfe1ff"}
                  opacity={fillOp}
                />
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={n.r}
                  fill="none"
                  stroke={isHub ? CYAN : BLUE}
                  strokeWidth={isHub ? 1.3 : 0.8}
                  opacity={ringOp}
                >
                  <animate
                    attributeName="r"
                    values={`${n.r};${isHub ? n.r + 9 : n.r + 5};${n.r}`}
                    dur={isHub ? "2.6s" : "3.8s"}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.6;0;0.6"
                    dur={isHub ? "2.6s" : "3.8s"}
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            );
          })}

          {/* Shockwave */}
          {shock && (
            <>
              <circle
                cx={patientNode.x}
                cy={patientNode.y}
                r={shock.r}
                fill="none"
                stroke={VIOLET}
                strokeWidth={3}
                opacity={shock.opacity}
              />
              <circle
                cx={patientNode.x}
                cy={patientNode.y}
                r={shock.r * 0.6}
                fill="none"
                stroke={CYAN}
                strokeWidth={1.5}
                opacity={shock.opacity * 0.7}
              />
            </>
          )}

          {/* Quarantine ring */}
          {ringFade > 0 && (
            <circle
              cx={patientNode.x}
              cy={patientNode.y}
              r={36}
              fill="none"
              stroke={RED}
              strokeWidth={1.4}
              strokeDasharray="6 4"
              opacity={ringFade}
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from={`0 ${patientNode.x} ${patientNode.y}`}
                to={`360 ${patientNode.x} ${patientNode.y}`}
                dur="9s"
                repeatCount="indefinite"
              />
            </circle>
          )}

          {/* Patient zero */}
          <g>
            <circle
              cx={patientNode.x}
              cy={patientNode.y}
              r={26 + pGlow * 18}
              fill="url(#hero-patient)"
              opacity={(0.55 + pGlow * 0.3) * pFill}
            />
            <circle
              cx={patientNode.x}
              cy={patientNode.y}
              r={(patientNode.r + 0.5) * pPulse}
              fill={pColor}
              opacity={pFill}
            />
            <circle
              cx={patientNode.x}
              cy={patientNode.y}
              r={(patientNode.r + 2.5) * pPulse}
              fill="none"
              stroke={pColor}
              strokeWidth={1}
              opacity={0.7 * pFill}
            />
          </g>
        </g>
      </svg>

      {/* AI reasoning tooltip — fixed in bottom-left, rotates copy by phase */}
      <div className="pointer-events-none absolute bottom-6 left-6 hidden md:block">
        <AnimatePresence mode="wait">
          {tip && (
            <motion.div
              key={tip.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.35 }}
              className={`max-w-[260px] rounded-xl border bg-ink-900/85 px-3.5 py-2.5 text-[11px] backdrop-blur-md ${tooltipBorder(
                tip.tone
              )}`}
            >
              <div className="flex items-center gap-2">
                <span className="relative flex h-1.5 w-1.5">
                  <span
                    className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${tooltipDot(
                      tip.tone
                    )}`}
                  />
                  <span
                    className={`relative inline-flex h-1.5 w-1.5 rounded-full ${tooltipDot(
                      tip.tone
                    )}`}
                  />
                </span>
                <span
                  className={`font-mono uppercase tracking-[0.18em] ${tooltipText(
                    tip.tone
                  )}`}
                >
                  {tip.title}
                </span>
              </div>
              <div className="mt-1 text-ink-200">{tip.body}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ----------------------------- Tooltip styles --------------------------- */

function tooltipBorder(tone: string) {
  switch (tone) {
    case "amber":
      return "border-neon-amber/40 shadow-[0_20px_60px_-20px_rgba(255,184,77,0.4)]";
    case "red":
      return "border-neon-red/40 shadow-[0_20px_60px_-20px_rgba(255,77,109,0.4)]";
    case "violet":
      return "border-neon-violet/40 shadow-[0_20px_60px_-20px_rgba(162,107,255,0.4)]";
    case "green":
      return "border-neon-green/40 shadow-[0_20px_60px_-20px_rgba(60,242,160,0.4)]";
    default:
      return "border-white/10";
  }
}

function tooltipDot(tone: string) {
  switch (tone) {
    case "amber":
      return "bg-neon-amber";
    case "red":
      return "bg-neon-red";
    case "violet":
      return "bg-neon-violet";
    case "green":
      return "bg-neon-green";
    default:
      return "bg-white/40";
  }
}

function tooltipText(tone: string) {
  switch (tone) {
    case "amber":
      return "text-neon-amber";
    case "red":
      return "text-neon-red";
    case "violet":
      return "text-neon-violet";
    case "green":
      return "text-neon-green";
    default:
      return "text-white";
  }
}
