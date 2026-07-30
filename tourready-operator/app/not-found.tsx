import Link from "next/link";
import { Octagon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-28 text-center sm:px-6">
      <Octagon className="h-12 w-12 fill-[var(--color-hardstop)]/15 text-[var(--color-hardstop)]" />
      <h1 className="type-display mt-6 text-4xl">Route not found</h1>
      <p className="mt-2 text-[var(--color-muted)]">
        That zone isn&apos;t on the run sheet. Head back to the Training Hub and pick up where you
        left off.
      </p>
      <Link href="/dashboard" className="mt-6">
        <Button>Return to Training Hub</Button>
      </Link>
    </div>
  );
}
