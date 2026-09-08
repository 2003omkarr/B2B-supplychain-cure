import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  ClipboardList,
  Layers,
  PackageCheck,
  ScanBarcode,
  Truck,
  CircleCheckBig,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/pharma/store";
import type { OrderStatus } from "@/lib/pharma/types";

interface PipelineStage {
  status: OrderStatus;
  label: string;
  icon: typeof ClipboardList;
  color: string;         // Active node bg
  glow: string;          // Pulse glow ring
  textColor: string;     // Count text
}

const STAGES: PipelineStage[] = [
  {
    status: "PLACED",
    label: "Placed",
    icon: ClipboardList,
    color: "bg-info",
    glow: "ring-info/30",
    textColor: "text-info",
  },
  {
    status: "ALLOCATED",
    label: "Allocated",
    icon: Layers,
    color: "bg-primary",
    glow: "ring-primary/30",
    textColor: "text-primary",
  },
  {
    status: "PICKING",
    label: "Picking",
    icon: ScanBarcode,
    color: "bg-warning",
    glow: "ring-warning/30",
    textColor: "text-warning-foreground dark:text-warning",
  },
  {
    status: "PACKED",
    label: "Packed",
    icon: PackageCheck,
    color: "bg-accent",
    glow: "ring-accent/40",
    textColor: "text-accent-foreground",
  },
  {
    status: "DISPATCHED",
    label: "Dispatched",
    icon: Truck,
    color: "bg-[oklch(0.62_0.16_30)]",
    glow: "ring-[oklch(0.62_0.16_30)]/30",
    textColor: "text-[oklch(0.5_0.16_30)] dark:text-[oklch(0.7_0.16_30)]",
  },
  {
    status: "DELIVERED",
    label: "Delivered",
    icon: CircleCheckBig,
    color: "bg-success",
    glow: "ring-success/30",
    textColor: "text-success",
  },
];

export function OrderFlowPipeline() {
  const { state } = useStore();

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const s of STAGES) {
      map[s.status] = state.orders.filter((o) => o.status === s.status).length;
    }
    return map;
  }, [state.orders]);

  const totalActive = STAGES.reduce((s, st) => s + (counts[st.status] ?? 0), 0);

  return (
    <section className="mt-5 rounded-xl border bg-card p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-semibold text-foreground">
            Order lifecycle
          </h2>
          <p className="text-xs text-muted-foreground">
            {totalActive} orders across {STAGES.filter((s) => counts[s.status]! > 0).length} active stages
          </p>
        </div>
      </div>

      {/* Pipeline visualization */}
      <div className="relative flex items-center justify-between gap-0">
        {STAGES.map((stage, i) => {
          const count = counts[stage.status] ?? 0;
          const hasOrders = count > 0;
          const Icon = stage.icon;

          return (
            <div key={stage.status} className="relative flex flex-1 items-center">
              {/* Connector line (before node, skip first) */}
              {i > 0 && (
                <div className="absolute right-1/2 left-0 top-1/2 -z-10 h-[2px] -translate-y-1/2">
                  <div
                    className={cn(
                      "h-full w-full transition-colors duration-700",
                      hasOrders || (counts[STAGES[i - 1]!.status] ?? 0) > 0
                        ? "bg-gradient-to-r from-primary/40 to-primary/20"
                        : "bg-border",
                    )}
                  />
                  {/* Animated pulse on the connector when both sides have orders */}
                  {hasOrders && (counts[STAGES[i - 1]!.status] ?? 0) > 0 && (
                    <div className="absolute inset-0 overflow-hidden">
                      <div className="h-full w-8 animate-[shimmer_2s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                    </div>
                  )}
                </div>
              )}

              {/* Node */}
              <Link
                to="/admin/orders"
                search={{ status: stage.status } as any}
                className="group relative mx-auto flex flex-col items-center gap-2"
              >
                {/* Glow ring for active nodes */}
                <div
                  className={cn(
                    "relative grid size-12 place-items-center rounded-2xl border-2 transition-all duration-500 md:size-14",
                    hasOrders
                      ? cn(
                          stage.color,
                          "border-transparent text-white shadow-lg ring-4",
                          stage.glow,
                          "hover:scale-110",
                        )
                      : "border-border bg-secondary text-muted-foreground hover:border-muted-foreground/30 hover:scale-105",
                  )}
                >
                  <Icon className="size-5 md:size-6" />

                  {/* Pulse animation on active nodes */}
                  {hasOrders && (
                    <span
                      className={cn(
                        "absolute inset-0 rounded-2xl animate-ping opacity-20",
                        stage.color,
                      )}
                      style={{ animationDuration: "3s" }}
                    />
                  )}

                  {/* Count badge */}
                  {hasOrders && (
                    <span className="absolute -right-1.5 -top-1.5 grid size-6 place-items-center rounded-full bg-card text-foreground text-[11px] font-bold shadow-sm ring-1 ring-border tabular">
                      {count}
                    </span>
                  )}
                </div>

                {/* Label */}
                <div className="text-center">
                  <p
                    className={cn(
                      "text-[11px] font-semibold transition-colors md:text-xs",
                      hasOrders ? stage.textColor : "text-muted-foreground",
                    )}
                  >
                    {stage.label}
                  </p>
                  {hasOrders && (
                    <p className="text-[10px] text-muted-foreground">
                      {count} order{count !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
