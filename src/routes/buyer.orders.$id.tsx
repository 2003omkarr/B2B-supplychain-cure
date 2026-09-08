import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CheckCircle2, Circle, Download, MapPin, Truck } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/pharma/AppShell";
import {
  ExpiryPill,
  PaymentBadge,
  SectionHeader,
  StatusBadge,
  fmtDateTime,
} from "@/components/pharma/bits";
import { Button } from "@/components/ui/button";
import { inr, inr2, useStore } from "@/lib/pharma/store";
import { ORDER_FLOW } from "@/lib/pharma/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/buyer/orders/$id")({
  head: () => ({
    meta: [
      { title: "Order tracking — PharmaConnect Buyer Portal" },
      {
        name: "description",
        content: "Live order tracking with batch allocation, invoice and delivery checkpoints.",
      },
      { property: "og:title", content: "Order tracking — PharmaConnect" },
      { property: "og:description", content: "Follow your order from FEFO allocation to doorstep delivery." },
    ],
  }),
  component: OrderTracking,
  notFoundComponent: () => (
    <AppShell role="buyer">
      <SectionHeader title="Order not found" subtitle="This order no longer exists in the demo data." />
      <Button asChild>
        <Link to="/buyer/orders">Back to my orders</Link>
      </Button>
    </AppShell>
  ),
});

function OrderTracking() {
  const { id } = Route.useParams();
  const { state } = useStore();
  const order = state.orders.find((o) => o.id === id);
  if (!order) throw notFound();

  const stepIndex = ORDER_FLOW.indexOf(order.status);
  const cancelled = order.status === "CANCELLED";

  return (
    <AppShell role="buyer">
      <SectionHeader
        title={`Order ${order.code}`}
        subtitle={`Placed ${fmtDateTime(order.createdAt)} · ${order.paymentMode} · fill rate ${order.fillRate}%`}
        actions={
          <>
            <StatusBadge status={order.status} />
            <PaymentBadge status={order.paymentStatus} />
            {order.invoiceNo ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.success(`Invoice ${order.invoiceNo} downloaded (demo)`)}
              >
                <Download className="size-4" /> Invoice
              </Button>
            ) : null}
          </>
        }
      />

      {/* Progress rail */}
      <div className="mb-5 rounded-xl border bg-card p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          {ORDER_FLOW.map((s, i) => {
            const done = !cancelled && i <= stepIndex;
            const current = !cancelled && i === stepIndex;
            return (
              <div key={s} className="flex flex-1 items-center gap-3">
                <div
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-full border-2 text-[11px] font-bold",
                    done
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground",
                    current && "ring-4 ring-primary/15",
                  )}
                >
                  {done ? <CheckCircle2 className="size-4" /> : <Circle className="size-3" />}
                </div>
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-xs font-semibold uppercase tracking-wide",
                      done ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {s}
                  </p>
                </div>
                {i < ORDER_FLOW.length - 1 ? (
                  <span
                    className={cn(
                      "hidden h-0.5 flex-1 rounded md:block",
                      i < stepIndex ? "bg-primary" : "bg-border",
                    )}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
        {cancelled ? (
          <p className="mt-4 rounded-lg bg-destructive/8 px-3 py-2 text-sm text-destructive">
            This order was cancelled and the reserved stock has been released.
          </p>
        ) : null}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <section className="overflow-hidden rounded-xl border bg-card">
            <h2 className="border-b px-5 py-3 font-display text-base font-semibold">
              Items & allocated batches
            </h2>
            <div className="divide-y">
              {order.lines.map((l) => (
                <div key={l.productId} className="px-5 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">{l.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {l.packSize} · {l.qty} units × {inr2(l.unitPrice)} · GST {l.gst}%
                        {l.discountPct > 0 ? ` · near-expiry −${l.discountPct}%` : ""}
                      </p>
                    </div>
                    <p className="font-display font-semibold tabular">{inr2(l.unitPrice * l.qty)}</p>
                  </div>
                  {l.allocations.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {l.allocations.map((a) => (
                        <span
                          key={a.batchId}
                          className="inline-flex items-center gap-2 rounded-lg border bg-secondary/60 px-2 py-1 text-[11px]"
                        >
                          <span className="font-semibold">{a.batchNo}</span>
                          <span className="text-muted-foreground tabular">×{a.qty}</span>
                          <ExpiryPill expiry={a.expiry} />
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-xs text-warning-foreground">
                      Awaiting batch allocation from the distributor.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {order.dispatch ? (
            <section className="rounded-xl border bg-card p-5">
              <h2 className="flex items-center gap-2 font-display text-base font-semibold">
                <Truck className="size-4 text-primary" /> Live shipment tracking
              </h2>
              <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-4">
                {[
                  ["Courier", order.dispatch.courier],
                  ["AWB", order.dispatch.awb],
                  ["Vehicle", order.dispatch.vehicle],
                  ["Driver", order.dispatch.driver],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs text-muted-foreground">{k}</dt>
                    <dd className="font-medium text-foreground">{v}</dd>
                  </div>
                ))}
              </dl>
              <ol className="mt-5 space-y-4 border-l pl-5">
                {order.dispatch.checkpoints.map((c) => (
                  <li key={c.label} className="relative">
                    <span
                      className={cn(
                        "absolute -left-[27px] top-1 grid size-4 place-items-center rounded-full border-2",
                        c.done ? "border-primary bg-primary" : "border-border bg-card",
                      )}
                    >
                      {c.done ? <MapPin className="size-2.5 text-primary-foreground" /> : null}
                    </span>
                    <p
                      className={cn(
                        "text-sm font-medium",
                        c.done ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {c.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {c.location} · {fmtDateTime(c.at)}
                    </p>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}
        </div>

        <aside className="space-y-5">
          <section className="rounded-xl border bg-card p-5">
            <h2 className="font-display text-base font-semibold">Payment</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Taxable value</dt>
                <dd className="tabular">{inr2(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">GST</dt>
                <dd className="tabular">{inr2(order.gstAmount)}</dd>
              </div>
              <div className="flex justify-between border-t pt-2 font-display text-lg font-semibold">
                <dt>Total</dt>
                <dd className="tabular">{inr(order.total)}</dd>
              </div>
              <div className="flex justify-between pt-1">
                <dt className="text-muted-foreground">Mode</dt>
                <dd>{order.paymentMode}</dd>
              </div>
              {order.txnRef ? (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Reference</dt>
                  <dd className="tabular">{order.txnRef}</dd>
                </div>
              ) : null}
            </dl>
          </section>

          <section className="rounded-xl border bg-card p-5">
            <h2 className="font-display text-base font-semibold">Order timeline</h2>
            <ol className="mt-3 space-y-3">
              {[...order.timeline].reverse().map((t, i) => (
                <li key={i} className="border-l-2 border-primary/25 pl-3">
                  <p className="text-sm font-medium text-foreground">{t.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {fmtDateTime(t.at)} · {t.by}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}
