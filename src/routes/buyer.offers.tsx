import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/pharma/AppShell";
import { EmptyState, ExpiryPill, SectionHeader } from "@/components/pharma/bits";
import { Button } from "@/components/ui/button";
import { inr2, useStore } from "@/lib/pharma/store";

export const Route = createFileRoute("/buyer/offers")({
  head: () => ({
    meta: [
      { title: "Near-Expiry Offers — PharmaConnect Buyer Portal" },
      {
        name: "description",
        content: "Discounted near-expiry pharmaceutical batches published live by the distributor.",
      },
      { property: "og:title", content: "Near-Expiry Offers — PharmaConnect" },
      { property: "og:description", content: "Save on short-dated stock with automatic tiered discounts." },
    ],
  }),
  component: Offers,
});

function Offers() {
  const { catalog, addToCart, state } = useStore();
  const offers = catalog.filter((e) => e.discountPct > 0 && e.stock > 0);

  return (
    <AppShell role="buyer">
      <SectionHeader
        title="Near-expiry offers"
        subtitle={`Automatic discounts: ${state.settings.nearExpiryTier1Pct}% under ${state.settings.nearExpiryTier1Days} days, ${state.settings.nearExpiryTier2Pct}% under ${state.settings.nearExpiryTier2Days} days`}
      />
      {offers.length === 0 ? (
        <EmptyState title="No offers right now" body="All batches are comfortably within date." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {offers.map((e) => (
            <div key={e.product.id} className="rounded-xl border bg-card p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-display text-base font-semibold">{e.product.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{e.product.composition}</p>
                </div>
                <span className="rounded-md bg-destructive/10 px-2 py-0.5 text-xs font-bold text-destructive">
                  −{e.discountPct}%
                </span>
              </div>
              <div className="mt-3 flex items-end justify-between">
                <div>
                  <p className="font-display text-xl font-semibold tabular">{inr2(e.effectivePrice)}</p>
                  <p className="text-xs text-muted-foreground line-through tabular">{inr2(e.product.ptr)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{e.stock} units</p>
                  {e.nearestExpiry ? <ExpiryPill expiry={e.nearestExpiry} /> : null}
                </div>
              </div>
              <Button
                className="mt-4 w-full"
                onClick={() => {
                  addToCart(e.product.id, 10);
                  toast.success(`10 × ${e.product.name} added at ${e.discountPct}% off`);
                }}
              >
                Add 10 units
              </Button>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
