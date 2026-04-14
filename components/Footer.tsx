"use client";

import { Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative border-t border-white/5 py-14">
      <div className="container-px mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 md:flex-row md:items-center md:gap-10">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-neon-blue/30 to-neon-violet/30 ring-1 ring-white/10">
            <Shield className="h-4 w-4 text-neon-cyan" />
          </span>
          <div>
            <div className="font-semibold tracking-tight">
              Agent<span className="text-neon-blue">Patrol</span>
            </div>
            <div className="text-xs text-ink-300">
              © {new Date().getFullYear()} AgentPatrol, Inc. All rights reserved.
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm text-ink-200 sm:gap-x-14 sm:grid-cols-4">
          <a href="#attack" className="transition hover:text-white">
            Demo
          </a>
          <a href="#features" className="transition hover:text-white">
            Features
          </a>
          <a href="#architecture" className="transition hover:text-white">
            Architecture
          </a>
        </div>
      </div>
    </footer>
  );
}
