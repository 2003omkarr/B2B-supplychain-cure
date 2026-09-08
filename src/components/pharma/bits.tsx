import { cn } from "@/lib/utils";
import { daysToExpiry, inr } from "@/lib/pharma/store";
import type { OrderStatus, PaymentStatus } from "@/lib/pharma/types";
import { useRef, useState, useEffect, type ReactNode } from "react";
import { useAnimatedNumber } from "@/hooks/use-animated-number";

function useInView() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e?.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

const STATUS_STYLE: Record<string, string> = {
  PLACED: "bg-info/12 text-info border-info/25",
  ALLOCATED: "bg-primary/12 text-primary border-primary/25",
  PICKING: "bg-warning/20 text-warning-foreground border-warning/40",
  PACKED: "bg-accent text-accent-foreground border-primary/20",
  DISPATCHED: "bg-[oklch(0.62_0.16_30)]/12 text-[oklch(0.5_0.16_30)] border-[oklch(0.62_0.16_30)]/25",
  DELIVERED: "bg-success/14 text-success border-success/30",
  CANCELLED: "bg-destructive/10 text-destructive border-destructive/25",
};

export function StatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        STATUS_STYLE[status] ?? "bg-muted text-muted-foreground border-border",
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

const PAY_LABEL: Record<PaymentStatus, string> = {
  PAID: "Paid",
  PENDING: "Pending",
  COD_PENDING: "COD due",
  COD_COLLECTED: "COD collected",
  REFUNDED: "Refunded",
};

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  const tone =
    status === "PAID" || status === "COD_COLLECTED"
      ? "bg-success/14 text-success border-success/30"
      : status === "REFUNDED"
        ? "bg-muted text-muted-foreground border-border"
        : "bg-warning/20 text-warning-foreground border-warning/40";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold",
        tone,
      )}
    >
      {PAY_LABEL[status]}
    </span>
  );
}

export function ExpiryPill({ expiry, className }: { expiry: string; className?: string }) {
  const d = daysToExpiry(expiry);
  const tone =
    d <= 0
      ? "bg-destructive/12 text-destructive border-destructive/25"
      : d <= 90
        ? "bg-destructive/10 text-destructive border-destructive/20"
        : d <= 180
          ? "bg-warning/20 text-warning-foreground border-warning/40"
          : "bg-success/12 text-success border-success/25";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium tabular",
        tone,
        className,
      )}
    >
      {new Date(expiry).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
      <span className="opacity-70">· {d}d</span>
    </span>
  );
}

export function KpiCard({
  label,
  value,
  hint,
  icon,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  const ring = {
    default: "border-border",
    success: "border-success/30",
    warning: "border-warning/40",
    danger: "border-destructive/30",
  }[tone];
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-4 shadow-[0_1px_2px_oklch(0.24_0.03_220_/_0.06)] transition-shadow hover:shadow-[0_8px_24px_-12px_oklch(0.24_0.03_220_/_0.25)]",
        ring,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        {icon ? <span className="text-muted-foreground">{icon}</span> : null}
      </div>
      <p className="mt-2 font-display text-2xl font-semibold tabular text-foreground">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

/** KPI card with animated number count-up, triggered when visible in viewport. */
export function AnimatedKpiCard({
  label,
  numericValue,
  format = "number",
  hint,
  icon,
  tone = "default",
}: {
  label: string;
  numericValue: number;
  format?: "number" | "currency" | "percent";
  hint?: ReactNode;
  icon?: ReactNode;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  const { ref, visible } = useInView();
  const animated = useAnimatedNumber(visible ? numericValue : 0, 1000);

  const formatted =
    format === "currency"
      ? inr(animated)
      : format === "percent"
        ? `${animated}%`
        : animated.toLocaleString("en-IN");

  return (
    <div ref={ref}>
      <KpiCard label={label} value={formatted} hint={hint} icon={icon} tone={tone} />
    </div>
  );
}

export function SectionHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed bg-card/60 p-10 text-center">
      <p className="font-display text-base font-semibold text-foreground">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{body}</p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
