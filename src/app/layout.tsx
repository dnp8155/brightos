import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BrightLoop AI | Autonomous Client Acquisition & Outreach Platform",
  description:
    "Enterprise SaaS platform for worldwide lead discovery, website audits, AI email synthesis, and sales pipeline conversion by BrightLoop Technology.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/brand/logo.png",
    apple: "/brand/logo.png"
  },
  openGraph: {
    title: "BrightLoop AI — Intelligent Client Acquisition SaaS",
    description:
      "Autonomous lead generation, website intelligence, and consultative sales outreach.",
    url: "https://ai.brightlooptechnology.in",
    siteName: "BrightLoop AI",
    images: [
      {
        url: "/brand/brightloop-logo.png",
        width: 1200,
        height: 520,
        alt: "BrightLoop Technology Official Logo"
      }
    ],
    locale: "en_US",
    type: "website"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body className="antialiased bg-[#f8fafc] text-slate-900 min-h-screen selection:bg-sky-100 selection:text-sky-900">
        {children}
      </body>
    </html>
  );
}
