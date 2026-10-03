import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ScrollIntro } from "@/components/scroll-intro";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "The Load-Out — Film · TourReady Operator",
  description:
    "The original scroll-scrubbed footage film of one concert load-out night, 23:10 to 02:00.",
};

/**
 * The original footage cut of THE LOAD-OUT, kept intact. The home page now
 * opens on the code-drawn version (no 9 MB load gate); this page keeps the
 * footage one click away from the film's last beat. Its words are the same
 * words — both read lib/load-out.ts.
 */
export default function FilmPage() {
  return (
    <div className="bg-[var(--color-bg)]">
      <ScrollIntro />
      {/* The film's skip button lands here (#hero). */}
      <section id="hero" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/dashboard">
            <Button size="lg" className="shadow-[var(--shadow-glow-accent)]">
              Enter the Training Hub <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/simulator">
            <Button size="lg" variant="secondary">
              Open Safety Engine
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
