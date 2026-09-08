import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Boxes, Layers, Moon, ShieldCheck, Sun, Truck } from "lucide-react";
import { ROLES } from "@/lib/pharma/nav";
import { inr, useStore } from "@/lib/pharma/store";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { NearExpiryCarousel } from "@/components/pharma/NearExpiryCarousel";
import { PromoBannerCarousel } from "@/components/pharma/PromoBannerCarousel";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PharmaConnect — B2B Pharma Ordering & Distribution Demo" },
      {
        name: "description",
        content:
          "Interactive demo of PharmaConnect: buyer catalog, FEFO batch allocation, warehouse picking, dispatch tracking, COD reconciliation and reports.",
      },
      { property: "og:title", content: "PharmaConnect — B2B Pharma Ordering & Distribution Demo" },
      {
        property: "og:description",
        content:
          "Pick a role — Buyer, Distributor Admin, Warehouse, Dispatch or Finance — and follow one order through the full lifecycle.",
      },
    ],
  }),
  component: RolePicker,
});

function RolePicker() {
  const { state, setRole } = useStore();
  const navigate = useNavigate();
  const { theme, toggle: toggleTheme } = useTheme();

  const openOrders = state.orders.filter(
    (o) => !["DELIVERED", "CANCELLED"].includes(o.status),
  ).length;
  const stockValue = state.batches.reduce((s, b) => {
    const p = state.products.find((x) => x.id === b.productId);
    return s + (p ? p.ptr * Math.max(0, b.qty - b.reserved) : 0);
  }, 0);

  const enter = (role: (typeof ROLES)[number]) => {
    setRole(role.id);
    navigate({ to: role.home });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(120%_100%_at_50%_0%,oklch(0.94_0.03_195)_0%,oklch(0.985_0.006_190)_55%)] dark:bg-[radial-gradient(120%_100%_at_50%_0%,oklch(0.2_0.03_220)_0%,oklch(0.16_0.02_220)_55%)]">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 md:py-20">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-primary font-display text-lg font-bold text-primary-foreground">
              P
            </span>
            <div>
              <p className="font-display text-lg font-semibold text-foreground">PharmaConnect</p>
              <p className="text-xs text-muted-foreground">B2B Ordering & Distribution Suite</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="size-9"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
            <span className="rounded-full border border-primary/25 bg-primary/8 px-3 py-1 text-xs font-medium text-primary">
              Interactive product demo · no login required
            </span>
          </div>
        </header>

        <div className="mt-12 max-w-3xl">
          <h1 className="font-display text-4xl font-semibold leading-tight text-foreground md:text-5xl">
            One order. Five roles. The entire distribution lifecycle.
          </h1>
          <p className="mt-4 text-base text-muted-foreground md:text-lg">
            Place an order as a retail pharmacy and watch it flow through automatic FEFO batch
            allocation, warehouse picking and packing, dispatch, live tracking and COD
            reconciliation — all on one shared, persistent set of demo data.
          </p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {[
            { icon: Layers, label: "Live SKUs", value: state.products.length },
            { icon: Boxes, label: "Open orders", value: openOrders },
            { icon: Truck, label: "Sellable stock value", value: inr(stockValue) },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border bg-card/80 p-4 backdrop-blur">
              <s.icon className="size-4 text-primary" />
              <p className="mt-2 font-display text-xl font-semibold tabular">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Hero Promotional Banner Carousel */}
        <PromoBannerCarousel />

        {/* Near-expiry deals carousel — showcases the FEFO engine */}
        <NearExpiryCarousel />

        <h2 className="mt-14 font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Choose a role to enter
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {ROLES.map((r) => (
            <button
              key={r.id}
              onClick={() => enter(r)}
              className="group relative overflow-hidden rounded-2xl border bg-card p-5 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_20px_40px_-24px_oklch(0.24_0.03_220_/_0.45)]"
            >
              <span
                className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", r.accent)}
                aria-hidden
              />
              <p className="font-display text-lg font-semibold text-foreground">{r.label}</p>
              <p className="text-xs font-medium text-primary">{r.persona}</p>
              <p className="mt-3 text-sm text-muted-foreground">{r.blurb}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                Enter workspace
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </button>
          ))}

          <div className="rounded-2xl border border-dashed bg-card/60 p-5">
            <ShieldCheck className="size-5 text-primary" />
            <p className="mt-2 font-display text-base font-semibold text-foreground">
              Role permissions
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              See exactly what each role can view, create, edit or approve across every module.
            </p>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link to="/admin/permissions">Open permissions matrix</Link>
            </Button>
          </div>
        </div>

        <p className="mt-12 text-xs text-muted-foreground">
          Everything you do is stored in this browser only. Use “Reset demo data” inside any
          workspace to return to the seeded state.
        </p>
      </div>
    </div>
  );
}
