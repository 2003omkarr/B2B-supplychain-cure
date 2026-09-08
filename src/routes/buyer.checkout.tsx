import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Banknote, CreditCard, Landmark, Loader2, Smartphone, Wallet } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/pharma/AppShell";
import { EmptyState, SectionHeader } from "@/components/pharma/bits";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { inr, inr2, useStore } from "@/lib/pharma/store";
import type { PaymentMode } from "@/lib/pharma/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/buyer/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — PharmaConnect Buyer Portal" },
      {
        name: "description",
        content: "Pay by UPI, card, net banking, wallet or cash on delivery and confirm your order.",
      },
      { property: "og:title", content: "Checkout — PharmaConnect Buyer Portal" },
      { property: "og:description", content: "Multi-mode payment simulation with instant FEFO allocation." },
    ],
  }),
  component: Checkout,
});

const MODES: { id: PaymentMode; label: string; hint: string; icon: typeof Wallet }[] = [
  { id: "UPI", label: "UPI", hint: "GPay, PhonePe, Paytm", icon: Smartphone },
  { id: "CARD", label: "Credit / Debit card", hint: "Visa, Mastercard, RuPay", icon: CreditCard },
  { id: "NETBANKING", label: "Net banking", hint: "All major banks", icon: Landmark },
  { id: "WALLET", label: "Wallet", hint: "Paytm, Amazon Pay", icon: Wallet },
  { id: "COD", label: "Cash on delivery", hint: "Collected at your counter", icon: Banknote },
];

function Checkout() {
  const { state, catalog, buyer, placeOrder } = useStore();
  const navigate = useNavigate();
  const [mode, setMode] = useState<PaymentMode>("UPI");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const lines = state.cart.map((c) => ({
    ...c,
    entry: catalog.find((e) => e.product.id === c.productId)!,
  }));
  const subtotal = lines.reduce((s, l) => s + l.entry.effectivePrice * l.qty, 0);
  const gst = lines.reduce(
    (s, l) => s + (l.entry.effectivePrice * l.qty * l.entry.product.gst) / 100,
    0,
  );
  const total = subtotal + gst;
  const creditLeft = buyer.creditLimit - buyer.outstanding;

  if (!lines.length) {
    return (
      <AppShell role="buyer">
        <SectionHeader title="Checkout" />
        <EmptyState
          title="Nothing to check out"
          body="Your cart is empty. Add a few products first."
          action={
            <Button asChild>
              <Link to="/buyer">Browse catalog</Link>
            </Button>
          }
        />
      </AppShell>
    );
  }

  const pay = () => {
    setBusy(true);
    // Simulated payment gateway round-trip
    setTimeout(() => {
      const order = placeOrder(mode, notes || undefined);
      setBusy(false);
      toast.success(
        mode === "COD"
          ? `Order ${order.code} confirmed — pay ${inr(order.total)} on delivery`
          : `Payment of ${inr(order.total)} captured · order ${order.code} confirmed`,
      );
      navigate({ to: "/buyer/orders/$id", params: { id: order.id } });
    }, 1100);
  };

  return (
    <AppShell role="buyer">
      <SectionHeader title="Checkout" subtitle="Confirm delivery details and choose how you'd like to pay" />

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <section className="rounded-xl border bg-card p-5">
            <h2 className="font-display text-base font-semibold">Deliver to</h2>
            <div className="mt-3 grid gap-1 text-sm">
              <p className="font-medium text-foreground">{buyer.shopName}</p>
              <p className="text-muted-foreground">
                {buyer.address}, {buyer.city}, {buyer.state} — {buyer.pincode}
              </p>
              <p className="text-muted-foreground">
                GSTIN {buyer.gstin} · DL {buyer.drugLicense}
              </p>
              <p className="text-muted-foreground">{buyer.phone}</p>
            </div>
          </section>

          <section className="rounded-xl border bg-card p-5">
            <h2 className="font-display text-base font-semibold">Payment method</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border p-3 text-left transition-colors",
                    mode === m.id
                      ? "border-primary bg-primary/6 ring-1 ring-primary/30"
                      : "hover:border-primary/40",
                  )}
                >
                  <m.icon
                    className={cn("size-5", mode === m.id ? "text-primary" : "text-muted-foreground")}
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-foreground">{m.label}</span>
                    <span className="block truncate text-xs text-muted-foreground">{m.hint}</span>
                  </span>
                </button>
              ))}
            </div>
            {mode === "COD" ? (
              <p className="mt-3 rounded-lg bg-warning/15 px-3 py-2 text-xs text-warning-foreground">
                COD adds {inr(total)} to your outstanding balance until the finance team reconciles
                the collection. Credit available: {inr(creditLeft)}.
              </p>
            ) : (
              <p className="mt-3 rounded-lg bg-secondary px-3 py-2 text-xs text-secondary-foreground">
                Simulated Razorpay/Cashfree capture — no real money moves in this demo.
              </p>
            )}
          </section>

          <section className="rounded-xl border bg-card p-5">
            <h2 className="font-display text-base font-semibold">Order notes (optional)</h2>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. deliver before 6pm, pack cold-chain items separately"
              className="mt-3"
            />
          </section>
        </div>

        <aside className="h-fit space-y-3 rounded-xl border bg-card p-5 lg:sticky lg:top-24">
          <h2 className="font-display text-base font-semibold">
            {lines.length} item{lines.length === 1 ? "" : "s"}
          </h2>
          <ul className="max-h-64 space-y-2 overflow-y-auto text-sm">
            {lines.map((l) => (
              <li key={l.productId} className="flex justify-between gap-3">
                <span className="min-w-0">
                  <span className="block truncate text-foreground">{l.entry.product.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {l.qty} × {inr2(l.entry.effectivePrice)}
                  </span>
                </span>
                <span className="tabular">{inr2(l.entry.effectivePrice * l.qty)}</span>
              </li>
            ))}
          </ul>
          <dl className="space-y-2 border-t pt-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Taxable value</dt>
              <dd className="tabular">{inr2(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">GST</dt>
              <dd className="tabular">{inr2(gst)}</dd>
            </div>
            <div className="flex justify-between border-t pt-2 font-display text-lg font-semibold">
              <dt>Payable</dt>
              <dd className="tabular">{inr(total)}</dd>
            </div>
          </dl>
          <Button className="w-full" size="lg" onClick={pay} disabled={busy}>
            {busy ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Contacting gateway…
              </>
            ) : mode === "COD" ? (
              `Place COD order · ${inr(total)}`
            ) : (
              `Pay ${inr(total)} via ${mode}`
            )}
          </Button>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            On confirmation the FEFO engine reserves nearest-expiry batches automatically and the
            warehouse queue is notified.
          </p>
        </aside>
      </div>
    </AppShell>
  );
}
