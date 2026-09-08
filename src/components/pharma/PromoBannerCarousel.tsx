import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Zap,
  Snowflake,
  CreditCard,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  Percent,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/pharma/store";

interface BannerSlide {
  id: string;
  badge: {
    text: string;
    icon: typeof Zap;
    color: string;
  };
  title: string;
  subtitle: string;
  highlightText: string;
  bgGradient: string;
  accentGlow: string;
  ctaText: string;
  targetRole?: string;
  targetPath: string;
  features: string[];
  graphicIcon: typeof Zap;
}

export function PromoBannerCarousel() {
  const navigate = useNavigate();
  const { setRole } = useStore();
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const slides: BannerSlide[] = [
    {
      id: "fefo-deals",
      badge: {
        text: "FEFO Engine Active",
        icon: Zap,
        color: "bg-destructive/15 text-destructive border-destructive/30",
      },
      title: "Clear Near-Expiry Stock with Up to 25% Extra Off",
      subtitle:
        "Automated First-Expiry-First-Out batch pricing gives retail pharmacies maximum margin on high-demand molecules.",
      highlightText: "Instant Expiry Discounts",
      bgGradient:
        "from-rose-500/10 via-amber-500/5 to-transparent dark:from-rose-950/40 dark:via-amber-950/20 dark:to-slate-900/50",
      accentGlow: "bg-rose-500/20 dark:bg-rose-500/10",
      ctaText: "Shop Expiry Deals",
      targetRole: "buyer",
      targetPath: "/buyer/offers",
      features: ["Up to 25% PTR Discount", "Batch Expiry Transparency", "Auto FEFO Allocation"],
      graphicIcon: Percent,
    },
    {
      id: "cold-chain",
      badge: {
        text: "Logistics Excellence",
        icon: Snowflake,
        color: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30",
      },
      title: "Cold-Chain Certified Distribution (2°C – 8°C)",
      subtitle:
        "Insulin, vaccines, and biologics monitored end-to-end with real-time temperature telemetry & insulated ice-pack shippers.",
      highlightText: "Zero Breakage Guarantee",
      bgGradient:
        "from-sky-500/10 via-teal-500/5 to-transparent dark:from-sky-950/40 dark:via-teal-950/20 dark:to-slate-900/50",
      accentGlow: "bg-sky-500/20 dark:bg-sky-500/10",
      ctaText: "Explore Cold-Chain SKUs",
      targetRole: "buyer",
      targetPath: "/buyer/",
      features: ["Temp Telemetry Tracked", "Insulated Packaging", "Same-Day Priority Slot"],
      graphicIcon: Snowflake,
    },
    {
      id: "b2b-schemes",
      badge: {
        text: "Flexible Finance",
        icon: CreditCard,
        color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      },
      title: "Wholesale Schemes & 30-Day Credit Lines",
      subtitle:
        "Unlock 10+1 / 10+2 volume bonus schemes and flexible credit limits based on your pharmacy purchase history.",
      highlightText: "Zero-Fee COD Options",
      bgGradient:
        "from-emerald-500/10 via-emerald-500/5 to-transparent dark:from-emerald-950/40 dark:via-emerald-950/20 dark:to-slate-900/50",
      accentGlow: "bg-emerald-500/20 dark:bg-emerald-500/10",
      ctaText: "View Credit Terms",
      targetRole: "finance",
      targetPath: "/finance/credit",
      features: ["14 & 30-Day Credit", "Bulk Volume Rebates", "COD Reconciliation"],
      graphicIcon: CreditCard,
    },
    {
      id: "erp-gst",
      badge: {
        text: "Compliance Ready",
        icon: FileCheck,
        color: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
      },
      title: "Automated GST E-Way Bills & ERP Integration",
      subtitle:
        "Instant HSN-level tax calculation, batch barcode sync, and digital invoice generation across distributor networks.",
      highlightText: "100% Regulatory Compliant",
      bgGradient:
        "from-indigo-500/10 via-purple-500/5 to-transparent dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-slate-900/50",
      accentGlow: "bg-indigo-500/20 dark:bg-indigo-500/10",
      ctaText: "View ERP Integration",
      targetRole: "admin",
      targetPath: "/admin/erp",
      features: ["E-Invoice QR Integration", "Schedule H/H1 Audit Logs", "Instant HSN Breakdown"],
      graphicIcon: FileCheck,
    },
  ];

  const total = slides.length;

  const advance = useCallback(() => {
    setCurrent((c) => (c + 1) % total);
  }, [total]);

  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(advance, 4500);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, advance]);

  const goTo = (idx: number) => {
    setCurrent(((idx % total) + total) % total);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (!isPaused) {
      timerRef.current = setInterval(advance, 4500);
    }
  };

  const handleAction = (slide: BannerSlide) => {
    if (slide.targetRole) {
      setRole(slide.targetRole as any);
    }
    navigate({ to: slide.targetPath as any });
  };

  return (
    <div
      className="relative mt-8 overflow-hidden rounded-3xl border bg-card/90 shadow-lg backdrop-blur"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Decorative top accent gradient bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-primary via-sky-500 to-emerald-500" />

      {/* Main slider track */}
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide) => {
          const BadgeIcon = slide.badge.icon;
          const GraphicIcon = slide.graphicIcon;

          return (
            <div
              key={slide.id}
              className={cn(
                "relative w-full shrink-0 p-6 md:p-8 bg-gradient-to-br transition-colors",
                slide.bgGradient
              )}
            >
              {/* Background ambient glow circle */}
              <div
                className={cn(
                  "pointer-events-none absolute -right-10 -top-10 size-64 rounded-full blur-3xl",
                  slide.accentGlow
                )}
                aria-hidden
              />

              <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                {/* Left content block */}
                <div className="flex-1 max-w-2xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur",
                        slide.badge.color
                      )}
                    >
                      <BadgeIcon className="size-3.5" />
                      {slide.badge.text}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                      <Sparkles className="size-3 text-amber-500" />
                      {slide.highlightText}
                    </span>
                  </div>

                  <h2 className="mt-3 font-display text-2xl font-bold leading-tight text-foreground md:text-3xl">
                    {slide.title}
                  </h2>

                  <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed md:text-base">
                    {slide.subtitle}
                  </p>

                  {/* Feature highlight chips */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {slide.features.map((feat) => (
                      <span
                        key={feat}
                        className="inline-flex items-center rounded-lg bg-background/80 border px-2.5 py-1 text-xs font-medium text-foreground backdrop-blur"
                      >
                        ✓ {feat}
                      </span>
                    ))}
                  </div>

                  {/* CTA button */}
                  <div className="mt-6 flex items-center gap-3">
                    <Button
                      onClick={() => handleAction(slide)}
                      className="group gap-2 font-medium shadow-md transition-all hover:gap-3 hover:shadow-primary/20"
                    >
                      {slide.ctaText}
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </Button>
                  </div>
                </div>

                {/* Right visual illustration card */}
                <div className="hidden md:flex shrink-0 items-center justify-center p-4">
                  <div className="relative grid size-32 place-items-center rounded-2xl border bg-background/60 p-4 shadow-inner backdrop-blur">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-primary/10 to-transparent" />
                    <GraphicIcon className="size-16 text-primary animate-pulse" />
                    <span className="absolute -bottom-2 -right-2 rounded-full border bg-card px-2.5 py-0.5 text-[10px] font-bold text-foreground shadow">
                      PROMO
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom control bar: Prev/Next & Dots */}
      <div className="flex items-center justify-between border-t bg-card/60 px-6 py-3 backdrop-blur">
        {/* Slide progress indicators */}
        <div className="flex items-center gap-2">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => goTo(idx)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                idx === current
                  ? "w-8 bg-primary shadow-sm"
                  : "w-2 bg-border hover:bg-muted-foreground/40"
              )}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Navigation arrows */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => goTo(current - 1)}
            className="grid size-8 place-items-center rounded-xl border bg-background/80 text-muted-foreground transition-all hover:bg-accent hover:text-foreground hover:scale-105"
            aria-label="Previous slide"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            onClick={() => goTo(current + 1)}
            className="grid size-8 place-items-center rounded-xl border bg-background/80 text-muted-foreground transition-all hover:bg-accent hover:text-foreground hover:scale-105"
            aria-label="Next slide"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
