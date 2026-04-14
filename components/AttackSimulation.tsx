"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight,
  Ban,
  File,
  FileWarning,
  KeyRound,
  Lock,
  Settings,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { SectionHeading } from "./SectionHeading";

/* ------------------------------ Simulation ------------------------------ */

const LOOP_MS = 14000;

type Phase = "monitor" | "alert" | "block";

function phaseAt(t: number): Phase {
  if (t < 3500) return "monitor";
  if (t < 10000) return "alert";
  return "block";
}

type LogLevel = "info" | "warn" | "error" | "ok" | "dim";

const LOGS: Array<{ at: number; level: LogLevel; text: string }> = [
  {
    at: 1000,
    level: "info",
    text: "agent[scraper-worker] spawned child: /bin/sh -c curl",
  },
  { at: 2200, level: "info", text: "agent accessed /etc/passwd" },
  {
    at: 4200,
    level: "warn",
    text: "unusual outbound traffic spike → 185.42.xx.xx:443",
  },
  {
    at: 5100,
    level: "warn",
    text: "executing unknown script from /tmp/.x1f2",
  },
  { at: 6000, level: "warn", text: "signature mismatch: unsigned binary" },
  {
    at: 7100,
    level: "error",
    text: "behavior cluster: data-exfiltration · 0.94",
  },
  {
    at: 8200,
    level: "info",
    text: "policy match: no-outbound-shell (strict)",
  },
  { at: 9400, level: "ok", text: "process terminated · PID 48219" },
  {
    at: 10400,
    level: "ok",
    text: "threat neutralized · incident #A-4812 filed",
  },
  { at: 11300, level: "dim", text: "intercepting syscall: execve()" },
];

const FILES: Array<{ at: number; path: string; icon: typeof File; danger: boolean }> = [
  { at: 900, path: "/etc/passwd", icon: File, danger: false },
  { at: 1800, path: "/var/log/auth.log", icon: File, danger: false },
  { at: 3600, path: "/home/user/.ssh/id_rsa", icon: KeyRound, danger: true },
  { at: 4800, path: "/tmp/.x1f2 (unsigned)", icon: FileWarning, danger: true },
  { at: 5800, path: "/var/bin/curl", icon: File, danger: false },
];

const INTENTS = [
  { at: 4400, text: "read credential material" },
  { at: 6200, text: "establish remote shell" },
  { at: 8000, text: "exfiltrate to c2 server" },
];

function useSimulationClock(enabled: boolean) {
  const [t, setT] = useState(0);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let startedAt = performance.now();
    let lastCycle = 0;
    let raf = 0;

    const tick = () => {
      const now = performance.now();
      const elapsed = now - startedAt;
      const c = Math.floor(elapsed / LOOP_MS);
      const local = elapsed - c * LOOP_MS;
      setT(local);
      if (c !== lastCycle) {
        lastCycle = c;
        setCycle(c);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [enabled]);

  return { t, cycle };
}

/* -------------------------------- Section -------------------------------- */

export function AttackSimulation() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, margin: "-15%" });
  const { t, cycle } = useSimulationClock(inView);
  const phase = phaseAt(t);

  return (
    <section
      id="attack"
      ref={ref}
      className="relative overflow-hidden py-20 md:py-28 lg:py-40"
    >
      <div className="absolute inset-0 bg-radial-fade opacity-40" />
      <div className="absolute inset-0 grid-bg opacity-30" />

      <div className="container-px relative mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Live Simulation · Incident Replay"
          title={
            <>
              A real attack,{" "}
              <span className="text-ink-300">caught and filed in 11ms.</span>
            </>
          }
          subtitle="This panel is live  watch the attack unfold, escalate, and get blocked. The simulation loops continuously while visible."
        />

        <IncidentCard t={t} cycle={cycle} phase={phase} />
      </div>
    </section>
  );
}

/* ----------------------------- Incident Card ----------------------------- */

function IncidentCard({
  t,
  cycle,
  phase,
}: {
  t: number;
  cycle: number;
  phase: Phase;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-15%" }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto mt-12 max-w-6xl md:mt-16"
    >
      <div className="absolute -inset-px rounded-3xl bg-gradient-to-b from-white/15 via-white/5 to-transparent" />

      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-ink-900/85 shadow-[0_60px_140px_-30px_rgba(77,139,255,0.35)] backdrop-blur-xl">
        <CardHeader t={t} cycle={cycle} phase={phase} />

        <div className="grid grid-cols-1 gap-px bg-white/5 lg:grid-cols-2">
          <div className="bg-ink-900/95 p-5 sm:p-6 lg:p-8">
            <ColumnHeader
              title="Agent activity"
              subtitle="scraper-worker · local runtime"
            />
            <div className="mt-5 space-y-4">
              <FilesystemPanel t={t} />
              <OutboundPanel t={t} phase={phase} />
              <IntentPanel t={t} />
            </div>
          </div>

          <div className="bg-ink-900/95 p-5 sm:p-6 lg:p-8">
            <ColumnHeader
              title="System response"
              subtitle="agentpatrol · runtime guard"
            />
            <div className="mt-5 space-y-4">
              <VerdictPanel t={t} phase={phase} />
              <LogFeedPanel t={t} phase={phase} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ----------------------------- Card chrome ------------------------------ */

function CardHeader({
  t,
  cycle,
  phase,
}: {
  t: number;
  cycle: number;
  phase: Phase;
}) {
  const pill =
    phase === "monitor"
      ? {
          label: "Monitor",
          cls: "border-neon-green/40 bg-neon-green/10 text-neon-green",
          dot: "bg-neon-green",
        }
      : phase === "alert"
      ? {
          label: "Alert",
          cls: "border-neon-amber/40 bg-neon-amber/10 text-neon-amber",
          dot: "bg-neon-amber",
        }
      : {
          label: "Block",
          cls: "border-neon-red/40 bg-neon-red/10 text-neon-red",
          dot: "bg-neon-red",
        };

  const seconds = (t / 1000).toFixed(2).padStart(5, "0");

  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/5 bg-ink-800/40 px-5 py-4 sm:px-6">
      <div className="flex items-center gap-3">
        <span className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 bg-white/[0.04]">
          <Settings className="h-3.5 w-3.5 text-neon-cyan" />
        </span>
        <span className="font-mono text-xs text-ink-200 sm:text-sm">
          incident-<span className="text-white">#A-4812</span>
        </span>
        <span className="hidden items-center gap-2 rounded-md border border-white/10 bg-white/[0.02] px-2 py-0.5 font-mono text-[10px] text-ink-300 sm:inline-flex">
          <span className="h-1 w-1 rounded-full bg-neon-cyan" />
          t+{seconds}s · cycle {cycle + 1}
        </span>
      </div>
      <div
        className={`flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${pill.cls}`}
      >
        <span className="relative flex h-1.5 w-1.5">
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full ${pill.dot} opacity-75`}
          />
          <span
            className={`relative inline-flex h-1.5 w-1.5 rounded-full ${pill.dot}`}
          />
        </span>
        {pill.label}
      </div>
    </div>
  );
}

function ColumnHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="text-sm font-semibold text-white">{title}</div>
        <div className="mt-1 font-mono text-[11px] text-ink-300">
          {subtitle}
        </div>
      </div>
      <button className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-ink-300 transition hover:text-white">
        <Settings className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/* -------------------------------- Panels -------------------------------- */

function PanelShell({
  label,
  badge,
  badgeTone = "neutral",
  children,
}: {
  label: string;
  badge?: string;
  badgeTone?: "neutral" | "red" | "amber" | "green";
  children: React.ReactNode;
}) {
  const toneCls =
    badgeTone === "red"
      ? "border-neon-red/30 bg-neon-red/10 text-neon-red"
      : badgeTone === "amber"
      ? "border-neon-amber/30 bg-neon-amber/10 text-neon-amber"
      : badgeTone === "green"
      ? "border-neon-green/30 bg-neon-green/10 text-neon-green"
      : "border-white/10 bg-white/[0.03] text-ink-300";

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-300">
          {label}
        </span>
        {badge && (
          <span
            className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] ${toneCls}`}
          >
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

/* ------------------------------ Filesystem ------------------------------ */

function FilesystemPanel({ t }: { t: number }) {
  return (
    <PanelShell label="Filesystem" badge="read">
      <ul className="space-y-1.5 font-mono text-[12px]">
        {FILES.map((f) => {
          const visible = t >= f.at;
          const Icon = f.icon;
          return (
            <li
              key={f.path}
              className="flex items-center gap-2 transition-all duration-500"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateX(0)" : "translateX(-8px)",
              }}
            >
              <Icon
                className={`h-3.5 w-3.5 shrink-0 ${
                  f.danger ? "text-neon-red" : "text-ink-300"
                }`}
              />
              <span className={f.danger ? "text-neon-red" : "text-ink-100"}>
                {f.path}
              </span>
              {visible && t - f.at < 500 && (
                <span className="ml-auto font-mono text-[9px] text-ink-400">
                  new
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </PanelShell>
  );
}

/* ------------------------------- Outbound ------------------------------- */

const BAR_COUNT = 36;
const BAR_PERIOD_MS = 110;

function barValue(k: number) {
  let s = ((k * 9973 + 17) * 9301 + 49297) % 233280;
  const rand = s / 233280;
  let s2 = ((k * 2017 + 43) * 9301 + 49297) % 233280;
  const rand2 = s2 / 233280;
  const base = 0.18 + rand * 0.18;
  const escalation = Math.max(0, (k - 30) / 40);
  const spike = escalation * (0.35 + rand2 * 0.55);
  return Math.min(1, base + spike);
}

function OutboundPanel({ t, phase }: { t: number; phase: Phase }) {
  const offset = Math.floor(t / BAR_PERIOD_MS);
  const bars = useMemo(
    () =>
      Array.from({ length: BAR_COUNT }, (_, j) => ({
        k: offset + j,
        v: barValue(offset + j),
      })),
    [offset]
  );

  const showAnomaly = phase !== "monitor";
  const rate = showAnomaly
    ? 100 + Math.floor(barValue(offset + 20) * 4200)
    : 0;

  return (
    <PanelShell
      label="Outbound connections"
      badge={showAnomaly ? "anomaly" : "normal"}
      badgeTone={showAnomaly ? "red" : "green"}
    >
      <div className="flex h-[72px] items-end gap-[3px]">
        {bars.map((b, i) => {
          const isHot = b.v > 0.5;
          return (
            <div
              key={i}
              className={`flex-1 rounded-sm transition-[height] duration-[120ms] ease-linear ${
                isHot
                  ? "bg-gradient-to-t from-neon-red/30 via-neon-red to-neon-amber"
                  : "bg-gradient-to-t from-neon-blue/30 via-neon-blue/80 to-neon-cyan"
              }`}
              style={{ height: `${Math.round(b.v * 100)}%` }}
            />
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-between font-mono text-[11px]">
        <span className="text-ink-200">185.42.xx.xx:443</span>
        <span
          className={
            showAnomaly ? "text-neon-red" : "text-ink-300"
          }
        >
          {showAnomaly ? `+${rate.toLocaleString()}/s` : "idle"}
        </span>
      </div>
    </PanelShell>
  );
}

/* -------------------------------- Intent -------------------------------- */

function IntentPanel({ t }: { t: number }) {
  const score = Math.max(
    0,
    Math.min(0.93, ((t - 3500) / 5500) * 0.93)
  );
  const scoreLabel = score.toFixed(2);

  return (
    <PanelShell
      label="Agent intent"
      badge={scoreLabel}
      badgeTone={score > 0.6 ? "red" : score > 0.3 ? "amber" : "neutral"}
    >
      <ul className="space-y-1.5 font-mono text-[12px]">
        {INTENTS.map((it) => {
          const visible = t >= it.at;
          return (
            <li
              key={it.text}
              className="flex items-center gap-2 transition-all duration-500"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateX(0)" : "translateX(-6px)",
              }}
            >
              <span className="text-neon-red">›</span>
              <span className="text-ink-100">{it.text}</span>
            </li>
          );
        })}
      </ul>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-neon-amber via-neon-red to-neon-violet transition-[width] duration-[120ms] ease-linear"
          style={{ width: `${Math.round(score * 100)}%` }}
        />
      </div>
    </PanelShell>
  );
}

/* -------------------------------- Verdict ------------------------------- */

function VerdictPanel({ t, phase }: { t: number; phase: Phase }) {
  const reveal = t >= 10000;

  if (!reveal) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.03]">
            <ShieldCheck
              className={`h-4 w-4 ${
                phase === "monitor" ? "text-neon-green" : "text-neon-amber"
              }`}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-300">
              Verdict
            </div>
            <div className="mt-1 text-sm text-ink-200">
              {phase === "monitor"
                ? "Monitoring agent behavior…"
                : "Correlating signals · evaluating policy…"}
            </div>
          </div>
          <div className="font-mono text-[10px] text-ink-400">
            pending
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-neon-red/30 bg-gradient-to-br from-neon-red/10 via-transparent to-neon-violet/10 p-4">
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-neon-red/10 blur-3xl" />

      <div className="relative flex items-start gap-4">
        <motion.div
          initial={{ scale: 0.6, rotate: -6 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 18 }}
          key={`verdict-${Math.floor(t / LOOP_MS)}`}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-neon-red/30 bg-neon-red/10"
        >
          <Lock className="h-4 w-4 text-neon-red" />
        </motion.div>
        <div className="min-w-0 flex-1">
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-neon-red">
            Verdict
          </div>
          <div className="mt-1 text-base font-semibold text-white sm:text-lg">
            Threat blocked successfully
          </div>
          <div className="mt-1 text-[12px] text-ink-200">
            Process terminated · outbound connection severed · incident filed.
          </div>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-neon-green/30 bg-neon-green/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-neon-green">
            <ShieldAlert className="h-3 w-3" />
            Neutralized in 11.4ms
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------- Log feed ------------------------------- */

const LEVEL_DOT: Record<LogLevel, string> = {
  info: "text-neon-amber",
  warn: "text-neon-amber",
  error: "text-neon-red",
  ok: "text-neon-green",
  dim: "text-ink-400",
};

const LEVEL_TEXT: Record<LogLevel, string> = {
  info: "text-ink-100",
  warn: "text-neon-amber",
  error: "text-neon-red",
  ok: "text-neon-green",
  dim: "text-ink-400",
};

function LogFeedPanel({ t, phase }: { t: number; phase: Phase }) {
  const blockFlash = phase === "block" && t < 11000;

  return (
    <PanelShell
      label="Live log feed"
      badge="streaming"
      badgeTone={phase === "block" ? "green" : "neutral"}
    >
      <div className="relative min-h-[226px]">
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div
            className="relative grid h-16 w-16 place-items-center rounded-full border border-neon-green/30 bg-ink-900/70 backdrop-blur transition-all duration-500"
            style={{
              opacity: phase === "block" ? 1 : 0.25,
              transform: `scale(${phase === "block" ? 1 : 0.88})`,
            }}
          >
            <span className="absolute inset-0 rounded-full bg-neon-green/10 blur-xl" />
            <Lock
              className={`relative h-6 w-6 ${
                blockFlash ? "text-neon-green" : "text-ink-300"
              }`}
            />
          </div>
        </div>

        <ul className="relative space-y-1 font-mono text-[11.5px]">
          {LOGS.map((l, i) => {
            const visible = t >= l.at;
            const just = visible && t - l.at < 400;
            return (
              <li
                key={i}
                className="flex items-start gap-2 transition-all duration-300"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateX(0)" : "translateX(-8px)",
                }}
              >
                <span className="shrink-0 text-ink-400">
                  [{formatLogTime(l.at)}]
                </span>
                <span className={`shrink-0 ${LEVEL_DOT[l.level]}`}>●</span>
                <span
                  className={`truncate ${LEVEL_TEXT[l.level]} ${
                    just ? "drop-shadow-[0_0_6px_currentColor]" : ""
                  }`}
                >
                  {l.text}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </PanelShell>
  );
}

function formatLogTime(ms: number) {
  const s = Math.floor(ms / 1000);
  const hundredths = Math.floor((ms % 1000) / 10);
  return `${String(s).padStart(2, "0")}.${String(hundredths).padStart(2, "0")}`;
}

/* --------------------------------- Outro -------------------------------- */

export function AttackSimulationOutro() {
  return (
    <section className="relative pb-16 md:pb-20">
      <div className="container-px mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-neon-blue/10 via-white/[0.03] to-neon-violet/10 p-6 text-center sm:p-8"
        >
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-25" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-neon-blue/30 bg-neon-blue/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-neon-blue">
              <Ban className="h-3 w-3" />
              Neutralized · 11.4ms
            </div>
            <h3 className="mt-5 text-balance text-2xl font-semibold sm:text-3xl md:text-4xl">
              AgentPatrol stops threats{" "}
              <span className="text-ink-300">before they escalate.</span>
            </h3>
            <div className="mt-6 flex items-center justify-center">
              <a
                href="#cta"
                className="group inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-medium text-ink-950 transition hover:scale-[1.02] hover:shadow-[0_10px_40px_-10px_rgba(255,255,255,0.6)]"
              >
                Start Monitoring
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
