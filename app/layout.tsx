import type { Metadata } from "next";
import "./globals.css";
import { SmoothScroll } from "@/components/SmoothScroll";

export const metadata: Metadata = {
  title: "AgentPatrol — Monitor, Detect, Control AI Agents",
  description:
    "AgentPatrol gives you visibility and control over autonomous AI agents running on your system. Real-time monitoring, anomaly detection, and policy enforcement for CLI agents, local runtimes, and copilots.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-ink-950">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-ink-950 text-ink-100 antialiased">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
