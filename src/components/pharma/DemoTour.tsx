import { useState, useEffect, useCallback, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useStore } from "@/lib/pharma/store";
import { X, ChevronRight, ChevronLeft, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface TourStep {
  path: string;
  role: "buyer" | "admin" | "warehouse" | "dispatch" | "finance" | null;
  title: string;
  description: string;
  icon: string;
  action?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    path: "/",
    role: null,
    title: "Welcome to PharmaConnect",
    description:
      "This is the role selection hub. Each card represents a different stakeholder in the pharma supply chain. Let's follow an order through the entire lifecycle.",
    icon: "🏠",
  },
  {
    path: "/buyer",
    role: "buyer",
    title: "Step 1: Browse the Catalog",
    description:
      "As a retail pharmacy, browse live distributor stock. Search by molecule, filter by category, and see real batch-level pricing with near-expiry discounts automatically applied.",
    icon: "🛒",
    action: "Add a product to your cart to continue",
  },
  {
    path: "/buyer/cart",
    role: "buyer",
    title: "Step 2: Review Your Cart",
    description:
      "Review quantities, see line-level GST breakup, and check stock availability. The system validates against real-time batch inventory before checkout.",
    icon: "📦",
  },
  {
    path: "/buyer/checkout",
    role: "buyer",
    title: "Step 3: Checkout & Pay",
    description:
      "Choose from UPI, Card, Net Banking, Wallet or COD. On submission, the FEFO engine auto-allocates the earliest-expiring batches. Try placing an order!",
    icon: "💳",
  },
  {
    path: "/buyer/orders",
    role: "buyer",
    title: "Step 4: Track Your Order",
    description:
      "Your order appears here with real-time status. Click any order to see the full timeline, batch allocations, and live dispatch tracking.",
    icon: "📋",
  },
  {
    path: "/admin",
    role: "admin",
    title: "Step 5: Admin Dashboard",
    description:
      "Switch to the Distributor Admin and see the operational overview — GMV, fill rates, orders by stage, category revenue mix, and value-at-risk for near-expiry stock.",
    icon: "📊",
  },
  {
    path: "/admin/orders",
    role: "admin",
    title: "Step 6: Order Management",
    description:
      "View all orders with status filters. Click any order to see the FEFO batch allocation breakdown, override allocations manually, or cancel/re-allocate.",
    icon: "📑",
  },
  {
    path: "/warehouse",
    role: "warehouse",
    title: "Step 7: Warehouse Picking",
    description:
      "As warehouse staff, see allocated orders in your pick queue. Open an order to pick items batch-by-batch from their rack locations, then pack and hand over to dispatch.",
    icon: "🏭",
  },
  {
    path: "/dispatch",
    role: "dispatch",
    title: "Step 8: Dispatch & Ship",
    description:
      "Packed orders appear in the dispatch queue. Mark them as dispatched — the system generates AWB tracking, vehicle details, and delivery checkpoints automatically.",
    icon: "🚚",
  },
  {
    path: "/finance",
    role: "finance",
    title: "Step 9: Finance & Reconciliation",
    description:
      "The finance desk reconciles payments, collects COD, monitors buyer credit exposure, and generates collection reports. The full money trail, connected to every order.",
    icon: "💰",
  },
];

const TOUR_KEY = "pharmaconnect.tour";

export function DemoTour() {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [hasSeenTour, setHasSeenTour] = useState(true);
  const navigate = useNavigate();
  const { setRole } = useStore();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = localStorage.getItem(TOUR_KEY);
    if (!seen) setHasSeenTour(false);
  }, []);

  const current = TOUR_STEPS[step];
  const total = TOUR_STEPS.length;

  const goToStep = useCallback(
    (idx: number) => {
      const s = TOUR_STEPS[idx];
      if (!s) return;
      setStep(idx);
      if (s.role) setRole(s.role);
      navigate({ to: s.path });
    },
    [navigate, setRole],
  );

  const start = useCallback(() => {
    setActive(true);
    setStep(0);
    goToStep(0);
    try {
      localStorage.setItem(TOUR_KEY, "true");
    } catch { /* */ }
    setHasSeenTour(true);
  }, [goToStep]);

  const close = useCallback(() => {
    setActive(false);
  }, []);

  const next = useCallback(() => {
    if (step < total - 1) goToStep(step + 1);
    else close();
  }, [step, total, goToStep, close]);

  const prev = useCallback(() => {
    if (step > 0) goToStep(step - 1);
  }, [step, goToStep]);

  // Floating launch button (when not active)
  if (!active) {
    return (
      <>
        {/* Pulse beacon for first-time visitors */}
        {!hasSeenTour && pathname === "/" && (
          <div className="fixed bottom-6 right-6 z-50">
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/40" />
          </div>
        )}
        <button
          onClick={start}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/30 active:scale-95"
          aria-label="Start guided demo tour"
        >
          <Play className="size-4" />
          <span className="hidden sm:inline">Guided Tour</span>
        </button>
      </>
    );
  }

  if (!current) return null;

  // Active tour overlay
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6">
      <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-primary/20 bg-card shadow-2xl shadow-primary/10">
        {/* Progress bar */}
        <div className="h-1 w-full bg-secondary">
          <div
            className="h-full bg-gradient-to-r from-primary to-[oklch(0.68_0.13_160)] transition-all duration-500 ease-out"
            style={{ width: `${((step + 1) / total) * 100}%` }}
          />
        </div>

        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl" role="img">{current.icon}</span>
              <div>
                <p className="font-display text-base font-semibold text-foreground">
                  {current.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  Step {step + 1} of {total}
                </p>
              </div>
            </div>
            <button
              onClick={close}
              className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Close tour"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Body */}
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {current.description}
          </p>

          {current.action && (
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-primary/8 px-2.5 py-1 text-xs font-medium text-primary">
              💡 {current.action}
            </p>
          )}

          {/* Navigation */}
          <div className="mt-4 flex items-center justify-between gap-2">
            <div className="flex gap-1.5">
              {TOUR_STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToStep(i)}
                  className={`size-2 rounded-full transition-all ${
                    i === step
                      ? "scale-125 bg-primary"
                      : i < step
                        ? "bg-primary/40"
                        : "bg-border"
                  }`}
                  aria-label={`Go to step ${i + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {step > 0 && (
                <Button variant="outline" size="sm" onClick={prev}>
                  <ChevronLeft className="size-4" />
                  Back
                </Button>
              )}
              <Button size="sm" onClick={next}>
                {step === total - 1 ? (
                  "Finish Tour"
                ) : (
                  <>
                    Next
                    <ChevronRight className="size-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Small restart button for the landing page */
export function TourRestartButton() {
  const [, setKey] = useState(0);

  const restart = () => {
    try {
      localStorage.removeItem(TOUR_KEY);
    } catch { /* */ }
    setKey((k) => k + 1);
    window.location.reload();
  };

  return (
    <button
      onClick={restart}
      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
    >
      <RotateCcw className="size-3" />
      Restart guided tour
    </button>
  );
}
