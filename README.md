# AgentPatrol — Landing Page 

Marketing landing page for **AgentPatrol**, an AI-powered risk detection engine that monitors, detects, and autonomously blocks rogue AI agents running on your system.

## Tech Stack

| Tool | Version |
|---|---|
| Next.js (App Router) | 14.2.5 |
| React | 18.3.1 |
| TypeScript | 5.5.4 |
| Tailwind CSS | 3.4.7 |
| Framer Motion | 11.3.19 |
| Lenis (smooth scroll) | 1.1.6 |
| Lucide React | 0.427.0 |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/
  layout.tsx          # Root layout, fonts, Lenis smooth scroll
  page.tsx            # Page composition — section order
  globals.css         # Tailwind base, custom utilities

components/
  Navbar.tsx          # Fixed top nav with mobile hamburger
  Hero.tsx            # Hero section with animated network background
  HeroSimulation.tsx  # Live radial network particle simulation (SVG + RAF)
  WhatIsSection.tsx   # Scroll-driven chain reaction attack simulation
  AttackSimulation.tsx# Live incident replay card (RAF clock-driven)
  Architecture.tsx    # Four-layer stack diagram
  AIExplanation.tsx   # AI risk detection engine — capabilities + incident card
  FeaturesGrid.tsx    # 6-feature grid
  FinalCTA.tsx        # Waitlist call-to-action
  Footer.tsx          # Footer with nav links
  SectionHeading.tsx  # Shared eyebrow + title + subtitle component
  SmoothScroll.tsx    # Lenis wrapper
```

## Sections

1. **Hero** — Headline, subheading, Join Waitlist CTA, live radial agent network background with focus spotlight
2. **Chain Reaction Attack** (`#what`) — Scroll-driven SVG simulation showing AI detecting and isolating a rogue agent across 6 phases
3. **Attack Simulation** (`#attack`) — Live looping incident card: filesystem access, outbound traffic chart, intent scoring, log feed, and verdict
4. **Architecture** (`#architecture`) — Four-layer defense stack (OS telemetry → AI detection → policy engine → dashboard)
5. **AI Risk Detection Engine** — Capabilities breakdown + expandable incident card showing an autonomous block
6. **Features** (`#features`) — Six-card grid covering the full product surface
7. **CTA** (`#cta`) — Waitlist sign-up with install command

## Key Design Decisions

- **All animations are RAF-loop driven**, not CSS-only, so simulations feel live rather than decorative
- **HeroSimulation** uses a seeded PRNG for deterministic node layout with a radial network topology and a `centerFade` mask that attenuates nodes/edges behind the headline text
- **Zero external analytics or tracking** — all telemetry is simulated/fake for demo purposes
- **Dark-first palette** — `ink` scale for backgrounds/text, `neon` scale (blue, cyan, violet, red, amber, green) for accents

## Scripts

```bash
npm run dev      # Start dev server on :3000
npm run build    # Production build
npm run start    # Serve production build
npm run lint     # ESLint
```
