import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

/**
 * Self-hosted latin subsets rather than next/font/google: no build-time
 * network round-trip, no third-party request at runtime.
 */
const display = localFont({
  src: [
    { path: "../../public/fonts/playfair-400_800-normal.woff2", weight: "400 800", style: "normal" },
    { path: "../../public/fonts/playfair-400_800-italic.woff2", weight: "400 800", style: "italic" },
  ],
  variable: "--f-display",
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

const serif = localFont({
  src: [
    { path: "../../public/fonts/newsreader-300_600-normal.woff2", weight: "300 600", style: "normal" },
    { path: "../../public/fonts/newsreader-300_600-italic.woff2", weight: "300 600", style: "italic" },
  ],
  variable: "--f-serif",
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

const mono = localFont({
  src: [
    { path: "../../public/fonts/plexmono-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/plexmono-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/plexmono-600-normal.woff2", weight: "600", style: "normal" },
  ],
  variable: "--f-mono",
  display: "swap",
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
});

export const metadata: Metadata = {
  title: "Explore Bay Area — a field guide to what's on",
  description:
    "An interactive 3D field guide to events across the nine-county Bay Area. Search, filter by category, follow a quest, and read the city by its heat.",
};

export const viewport: Viewport = {
  themeColor: "#EFE8D8",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${serif.variable} ${mono.variable}`}>
      <body className="h-full w-full antialiased">{children}</body>
    </html>
  );
}
