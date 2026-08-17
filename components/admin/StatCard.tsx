import { ArrowDown, ArrowUp, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatCardDelta = {
  label: string;
  trend: "up" | "down" | "neutral";
};

export function StatCard({
  label,
  value,
  icon: Icon,
  delta,
  emphasize = false,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  delta?: StatCardDelta;
  /** Larger value type + filled accent icon well, for the lead metric. */
  emphasize?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
            emphasize ? "bg-accent text-accent-foreground" : "bg-accent/10 text-accent"
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p
        className={cn(
          "mt-3 font-sans font-semibold text-foreground",
          emphasize ? "text-3xl" : "text-2xl"
        )}
      >
        {value}
      </p>
      {delta && (
        <p
          className={cn(
            "mt-1.5 flex items-center gap-1 text-xs font-medium",
            delta.trend === "up" && "text-[#006300]",
            delta.trend === "down" && "text-[#d03b3b]",
            delta.trend === "neutral" && "text-muted-foreground"
          )}
        >
          {delta.trend === "up" && <ArrowUp className="h-3 w-3" />}
          {delta.trend === "down" && <ArrowDown className="h-3 w-3" />}
          {delta.label}
        </p>
      )}
    </div>
  );
}
