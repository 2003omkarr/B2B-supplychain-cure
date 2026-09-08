import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Minus, Plus, Trash2, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/pharma/AppShell";
import { EmptyState, ExpiryPill, SectionHeader } from "@/components/pharma/bits";
import { Button } from "@/components/ui/button";
import { inr, inr2, useStore } from "@/lib/pharma/store";

export const Route = createFileRoute("/buyer/cart")({
  head: () => ({
    meta: [
      { title: "Cart — PharmaConnect Buyer Portal" },
      {
        name: "description",
        content: "Review your pharmacy order with live stock validation before checkout.",
      },
      { property: "og:title", content: "Cart — PharmaConnect Buyer Portal" },
      { property: "og:description", content: "Live stock validation against distributor batch inventory." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { state, catalog, setCartQty, removeFromCart, clearCart } = useStore();
  const navigate = useNavigate();

  const lines = state.cart.map((c) => {
    const entry = catalog.find((e) => e.product.id === c.productId)!;
    return { ...c, entry, issue: c.qty > entry.stock };
  });

  const subtotal = lines.reduce((s, l) => s + l.entry.effectivePrice * l.qty, 0);
  const listTotal = lines.reduce((s, l) => s + l.entry.product.ptr * l.qty, 0);
  const gst = lines.reduce(
    (s, l) => s + (l.entry.effectivePrice * l.qty * l.entry.product.gst) / 100,
    0,
  );
  const blocked = lines.some((l) => l.issue);

  return (
    <AppShell role="buyer">
      <SectionHeader
        title="Your cart"
        subtitle={`${lines.length} line item${lines.length === 1 ? "" : "s"} · stock validated against live batches`}
        actions={
          lines.length ? (
            <Button variant="ghost" size="sm" onClick={() => clearCart()}>
              Clear cart
            </Button>
          ) : null
        }
      />

      {lines.length === 0 ? (
        <EmptyState
          title="Your cart is empty"
          body="Add products from the catalog and they'll be validated against live batch stock here."
          action={
            <Button asChild>
              <Link to="/buyer">Browse catalog</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
          <div className="space-y-3">
            {lines.map((l) => {
              const p = l.entry.product;
              return (
                <div key={l.productId} className="rounded-xl border bg-card p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-display text-base font-semibold text-foreground">{p.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.packSize} · {p.manufacturer} · GST {p.gst}%
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {l.entry.nearestExpiry ? <ExpiryPill expiry={l.entry.nearestExpiry} /> : null}
                        <span className="text-[11px] text-muted-foreground">
                          {l.entry.stock} units available
                        </span>
                        {l.entry.discountPct > 0 ? (
                          <span className="rounded-md bg-destructive/10 px-1.5 py-0.5 text-[11px] font-semibold text-destructive">
                            near-expiry −{l.entry.discountPct}%
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center rounded-lg border">
                        <button
                          className="grid size-8 place-items-center text-muted-foreground hover:text-foreground"
                          onClick={() => setCartQty(l.productId, l.qty - 1)}
                          aria-label="Decrease"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <input
                          value={l.qty}
                          onChange={(e) => setCartQty(l.productId, Number(e.target.value) || 1)}
                          className="w-12 border-x bg-transparent py-1 text-center text-sm tabular outline-none"
                          aria-label={`Quantity for ${p.name}`}
                        />
                        <button
                          className="grid size-8 place-items-center text-muted-foreground hover:text-foreground"
                          onClick={() => setCartQty(l.productId, l.qty + 1)}
                          aria-label="Increase"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-base font-semibold tabular">
                          {inr2(l.entry.effectivePrice * l.qty)}
                        </p>
                        <p className="text-[11px] text-muted-foreground tabular">
                          {inr2(l.entry.effectivePrice)} each
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(l.productId)}
                        className="text-muted-foreground transition-colors hover:text-destructive"
                        aria-label={`Remove ${p.name}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                  {l.issue ? (
                    <p className="mt-3 flex items-center gap-2 rounded-lg bg-destructive/8 px-3 py-2 text-xs font-medium text-destructive">
                      <TriangleAlert className="size-3.5" />
                      Only {l.entry.stock} units in stock — reduce the quantity to continue.
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>

          <aside className="h-fit rounded-xl border bg-card p-5 lg:sticky lg:top-24">
            <h2 className="font-display text-base font-semibold">Order summary</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">List value</dt>
                <dd className="tabular">{inr2(listTotal)}</dd>
              </div>
              <div className="flex justify-between text-success">
                <dt>Near-expiry savings</dt>
                <dd className="tabular">− {inr2(listTotal - subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Taxable value</dt>
                <dd className="tabular">{inr2(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">GST</dt>
                <dd className="tabular">{inr2(gst)}</dd>
              </div>
              <div className="mt-3 flex justify-between border-t pt-3 font-display text-lg font-semibold">
                <dt>Payable</dt>
                <dd className="tabular">{inr(subtotal + gst)}</dd>
              </div>
            </dl>
            <Button
              className="mt-5 w-full"
              size="lg"
              disabled={blocked}
              onClick={() => {
                if (blocked) {
                  toast.error("Fix stock issues before checkout");
                  return;
                }
                navigate({ to: "/buyer/checkout" });
              }}
            >
              {blocked ? "Resolve stock issues" : "Proceed to checkout"}
            </Button>
            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
              Batches are reserved by the FEFO engine the moment your order is confirmed, so the
              nearest-expiry stock always ships first.
            </p>
          </aside>
        </div>
      )}
    </AppShell>
  );
}
