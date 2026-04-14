"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Shield, X } from "lucide-react";

const links = [
  { label: "Demo", href: "#attack" },
  { label: "Architecture", href: "#architecture" },
  { label: "Features", href: "#features" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div className="container-px mx-auto max-w-7xl">
        <div className="mt-3 flex items-center justify-between rounded-2xl border border-white/10 bg-ink-900/70 px-3 py-2.5 backdrop-blur-xl sm:mt-4 sm:px-4 sm:py-3 md:px-6">
          <a href="#top" className="flex items-center gap-2">
            <span className="relative grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-neon-blue/30 to-neon-violet/30 ring-1 ring-white/10">
              <Shield className="h-4 w-4 text-neon-cyan" strokeWidth={2.2} />
              <span className="absolute inset-0 rounded-lg ring-1 ring-neon-blue/40" />
            </span>
            <span className="font-semibold tracking-tight">
              Agent<span className="text-neon-blue">Patrol</span>
            </span>
          </a>

          <nav className="hidden items-center gap-8 text-sm text-ink-200 md:flex">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="transition-colors hover:text-white"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-ink-100 transition hover:bg-white/10 md:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        <AnimatePresence>
          {open && (
            <motion.nav
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="mt-2 overflow-hidden rounded-2xl border border-white/10 bg-ink-900/85 p-2 backdrop-blur-xl md:hidden"
            >
              <div className="flex flex-col">
                {links.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm text-ink-100 transition hover:bg-white/5"
                  >
                    {l.label}
                  </a>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
