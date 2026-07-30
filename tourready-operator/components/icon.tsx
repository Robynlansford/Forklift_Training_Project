import {
  Gauge,
  Truck,
  ScanLine,
  Users,
  Wind,
  Moon,
  Anchor,
  ShieldAlert,
  Trophy,
  FileCheck,
  ClipboardCheck,
  Hand,
  Building2,
  Tent,
  Boxes,
  type LucideIcon,
} from "lucide-react";

/**
 * Maps the string `icon` names used in the curriculum data to Lucide
 * components, so modules can be added with data alone (no imports).
 */
const ICONS: Record<string, LucideIcon> = {
  Gauge,
  Truck,
  ScanLine,
  Users,
  Wind,
  Moon,
  Anchor,
  ShieldAlert,
  Trophy,
  FileCheck,
  ClipboardCheck,
  Hand,
  Building2,
  Tent,
  Boxes,
};

export function ModuleIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Cmp = ICONS[name] ?? Gauge;
  return <Cmp className={className} aria-hidden="true" />;
}
