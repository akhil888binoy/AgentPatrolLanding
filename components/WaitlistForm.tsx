"use client";

import { useState, FormEvent } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "duplicate">("idle");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const trimmed = email.trim();
    if (!trimmed || !EMAIL_RE.test(trimmed)) {
      setStatus("error");
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });

      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else if (res.status === 409) {
        setStatus("duplicate");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-neon-green/30 bg-neon-green/[0.06] px-5 py-3 text-sm font-medium text-neon-green backdrop-blur">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon-green opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-neon-green" />
        </span>
        You&apos;re on the list 🚀
      </div>
    );
  }

  return (
    <div className="relative w-full px-4 sm:px-0">
      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center"
      >
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status !== "idle") setStatus("idle");
          }}
          placeholder="you@company.com"
          disabled={status === "loading"}
          className="
            w-full rounded-xl border border-white/10 bg-ink-900/80 px-4 py-3
            text-sm text-ink-100 placeholder:text-ink-400
            backdrop-blur outline-none transition
            focus:border-neon-blue/60 focus:ring-2 focus:ring-neon-blue/20
            disabled:opacity-50
            sm:w-72
          "
          autoComplete="email"
          inputMode="email"
        />

        <button
          type="submit"
          disabled={status === "loading"}
          className="
            group inline-flex w-full items-center justify-center gap-2
            rounded-xl bg-white px-5 py-3
            text-sm font-medium text-ink-950 transition
            hover:scale-[1.02] hover:shadow-[0_10px_40px_-10px_rgba(255,255,255,0.6)]
            disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100
            sm:w-auto
          "
        >
          {status === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Join Waitlist
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>

      {(status === "error" || status === "duplicate") && (
        <p className="mt-2 text-center text-xs text-neon-red">
          {status === "duplicate"
            ? "You're already on the list."
            : "Something went wrong — try again."}
        </p>
      )}
    </div>
  );
}
