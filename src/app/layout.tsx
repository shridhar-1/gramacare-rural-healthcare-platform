import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { AppShell } from "@/components/AppShell";
import { PwaRegister } from "@/components/PwaRegister";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "GramaCare — Understand Your Health. Find the Right Care. Reach It Faster.",
    template: "%s · GramaCare",
  },
  description:
    "GramaCare helps rural communities find nearby healthcare, medicines, blood and emergency support, and explains medical reports in simple language. Information only — not a diagnosis.",
  applicationName: "GramaCare",
  manifest: "/manifest.webmanifest",
  keywords: [
    "rural healthcare",
    "find hospital near me",
    "medicine availability",
    "blood bank",
    "medical report explained simply",
    "Kannada health information",
  ],
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#14806e",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AppShell>{children}</AppShell>
        <PwaRegister />
      </body>
    </html>
  );
}
