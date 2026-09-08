import { useMemo, useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Zap, Clock, ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { buildCatalog, daysToExpiry, inr2, useStore } from "@/lib/pharma/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function NearExpiryCarousel() {
  const { state, setRole } = useStore();
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Get products with near-expiry discounts, sorted by highest discount first
  const deals = useMemo(() => {
    const catalog = buildCatalog(state);
    return catalog
      .filter((e) => e.discountPct > 0 && e.stock > 0 && e.nearestExpiry)
      .sort((a, b) => b.discountPct - a.discountPct)
      .slice(0, 8);
  }, [state]);

  const total = deals.length;

  // Auto-rotate every 4 seconds
  const advance = useCallback(() => {
    setCurrent((c) => (c + 1) % total);
  }, [total]);

  useEffect(() => {
    if (total <= 1 || isPaused) return;
    timerRef.current = setInterval(advance, 4000);
    return () => clearInterval(timerRef.current);
  }, [total, isPaused, advance]);

  const goTo = (idx: number) => {
    setCurrent(((idx % total) + total) % total);
    // Reset timer on manual navigation
    if (timerRef.current) clearInterval(timerRef.current);
    if (!isPaused && total > 1) {
      timerRef.current = setInterval(advance, 4000);
    }
  };

  const enterBuyer = () => {
    setRole("buyer");
    navigate({ to: "/buyer/offers" });
  };

  if (deals.length === 0) return null;

  return (
    <section
      className="mt-10"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Section header */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-destructive/10 dark:bg-destructive/20">
            <Zap className="size-4 text-destructive" />
          </span>
          <div>
            <h2 className="font-display text-base font-semibold text-foreground">
              Expiring Soon — Extra Discounts
            </h2>
            <p className="text-xs text-muted-foreground">
              FEFO-powered near-expiry deals · {deals.length} products
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => goTo(current - 1)}
            className="grid size-8 place-items-center rounded-lg border bg-card text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Previous deal"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            onClick={() => goTo(current + 1)}
            className="grid size-8 place-items-center rounded-lg border bg-card text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Next deal"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {/* Carousel track */}
      <div className="overflow-hidden rounded-2xl border bg-card/80 backdrop-blur">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {deals.map((deal) => {
            const days = deal.nearestExpiry ? daysToExpiry(deal.nearestExpiry) : 999;
            const urgency =
              days <= 30 ? "critical" : days <= 90 ? "warning" : "safe";

            return (
              <div
                key={deal.product.id}
                className="w-full shrink-0 p-5 md:p-6"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-8">
                  {/* Left: Product info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 rounded-md bg-destructive/10 px-2 py-0.5 text-xs font-bold text-destructive dark:bg-destructive/20">
                        <Zap className="size-3" />
                        −{deal.discountPct}% OFF
                      </span>
                      <ExpiryCountdown days={days} urgency={urgency} />
                    </div>

                    <h3 className="mt-2 font-display text-lg font-semibold text-foreground md:text-xl">
                      {deal.product.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {deal.product.composition}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
                      <span className="rounded-md bg-secondary px-2 py-0.5 font-medium text-secondary-foreground">
                        {deal.product.packSize}
                      </span>
                      <span className="rounded-md bg-secondary px-2 py-0.5 font-medium text-secondary-foreground">
                        {deal.product.manufacturer}
                      </span>
                      <span className="rounded-md bg-secondary px-2 py-0.5 font-medium text-secondary-foreground">
                        Sch. {deal.product.schedule}
                      </span>
                      <span className="rounded-md bg-secondary px-2 py-0.5 font-medium text-secondary-foreground">
                        {deal.stock} units left
                      </span>
                    </div>
                  </div>

                  {/* Right: Pricing + CTA */}
                  <div className="flex items-end justify-between gap-6 md:flex-col md:items-end md:justify-center">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground line-through">
                        MRP {inr2(deal.product.mrp)}
                      </p>
                      <p className="font-display text-2xl font-bold tabular text-foreground md:text-3xl">
                        {inr2(deal.effectivePrice)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PTR · GST {deal.product.gst}%
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={enterBuyer}
                      className="gap-1.5 whitespace-nowrap"
                    >
                      <ShoppingCart className="size-3.5" />
                      Order Now
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dot indicators */}
        {total > 1 && (
          <div className="flex justify-center gap-1.5 pb-4">
            {deals.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === current
                    ? "w-6 bg-primary"
                    : "w-1.5 bg-border hover:bg-muted-foreground/40",
                )}
                aria-label={`Go to deal ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/** Color-coded countdown badge */
function ExpiryCountdown({
  days,
  urgency,
}: {
  days: number;
  urgency: "critical" | "warning" | "safe";
}) {
  const style = {
    critical:
      "bg-destructive/12 text-destructive border-destructive/25 dark:bg-destructive/20",
    warning:
      "bg-[oklch(0.78_0.15_78)]/15 text-[oklch(0.45_0.12_60)] border-[oklch(0.78_0.15_78)]/30 dark:text-[oklch(0.78_0.15_78)]",
    safe:
      "bg-success/12 text-success border-success/25 dark:bg-success/20",
  }[urgency];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold tabular",
        style,
      )}
    >
      <Clock className="size-3" />
      {days <= 0
        ? "Expired"
        : days === 1
          ? "1 day left"
          : `${days} days left`}
    </span>
  );
}
