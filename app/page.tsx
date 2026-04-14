import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { WhatIsSection } from "@/components/WhatIsSection";
import {
  AttackSimulation,
  AttackSimulationOutro,
} from "@/components/AttackSimulation";
import { Architecture } from "@/components/Architecture";
import { AIExplanation } from "@/components/AIExplanation";
import { FeaturesGrid } from "@/components/FeaturesGrid";
import { FinalCTA } from "@/components/FinalCTA";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <main className="relative min-h-screen w-full overflow-x-clip bg-ink-950 text-ink-100">
      <Navbar />
      <Hero />
      <WhatIsSection />
      <AttackSimulation />
      {/* <AttackSimulationOutro /> */}
      <Architecture />
      <AIExplanation />
      <FeaturesGrid />
      <Footer />
    </main>
  );
}
