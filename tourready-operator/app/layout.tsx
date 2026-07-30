import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AiTutor } from "@/components/ai-tutor";
import { Toaster } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: "TourReady Operator — Concert & Festival Lift Certification",
  description:
    "The AI-powered certification platform for Concert & Festival Telehandler and Forklift operators. Master the 2:00 AM load-out and build unbreakable Stop-Work Authority.",
  applicationName: "TourReady Operator",
  authors: [{ name: "TourReady Operator" }],
  keywords: [
    "telehandler",
    "forklift",
    "concert production",
    "festival",
    "safety certification",
    "OSHA",
    "rigging",
    "stop-work authority",
  ],
};

export const viewport: Viewport = {
  themeColor: "#0B1120",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://rsms.me/" />
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">
        <div className="grain" aria-hidden />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-[var(--color-accent)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-black"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        <AiTutor />
        <Toaster />
      </body>
    </html>
  );
}
