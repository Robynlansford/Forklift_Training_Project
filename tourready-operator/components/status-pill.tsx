import { CheckCircle2, RotateCcw, CircleDashed, PlayCircle } from "lucide-react";
import { Badge } from "./ui/badge";

type Status = "not-started" | "in-progress" | "passed" | "retry";

const META = {
  passed: { variant: "go" as const, icon: CheckCircle2, label: "Passed" },
  retry: { variant: "danger" as const, icon: RotateCcw, label: "Needs Retry" },
  "in-progress": { variant: "caution" as const, icon: PlayCircle, label: "In Progress" },
  "not-started": { variant: "neutral" as const, icon: CircleDashed, label: "Not Started" },
};

export function StatusPill({ status }: { status: Status }) {
  const m = META[status];
  const Icon = m.icon;
  return (
    <Badge variant={m.variant}>
      <Icon className="h-3 w-3" aria-hidden="true" />
      {m.label}
    </Badge>
  );
}
