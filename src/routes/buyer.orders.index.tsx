import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/pharma/AppShell";
import {
  EmptyState,
  PaymentBadge,
  SectionHeader,
  StatusBadge,
  fmtDate,
} from "@/components/pharma/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { inr, useStore } from "@/lib/pharma/store";

export const Route = createFileRoute("/buyer/orders/")({
  head: () => ({
    meta: [
      { title: "My Orders — PharmaConnect Buyer Portal" },
      {
        name: "description",
        content: "Track every pharmacy order from allocation to delivery, download invoices and re-order.",
      },
      { property: "og:title", content: "My Orders — PharmaConnect Buyer Portal" },
      { property: "og:description", content: "Live order status, invoices and one-tap re-ordering." },
    ],
  }),
  component: MyOrders,
});

function MyOrders() {
  const { state, addToCart } = useStore();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

  const orders = state.orders
    .filter((o) => o.buyerId === state.buyerId)
    .filter((o) => (status === "all" ? true : o.status === status))
    .filter((o) =>
      q ? o.code.toLowerCase().includes(q.toLowerCase()) || o.lines.some((l) => l.name.toLowerCase().includes(q.toLowerCase())) : true,
    );

  return (
    <AppShell role="buyer">
      <SectionHeader
        title="My orders"
        subtitle={`${orders.length} order${orders.length === 1 ? "" : "s"} for ${state.buyers.find((b) => b.id === state.buyerId)?.shopName}`}
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search order number or product…"
          className="max-w-xs"
          aria-label="Search orders"
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-44" aria-label="Filter status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {["all", "PLACED", "ALLOCATED", "PICKING", "PACKED", "DISPATCHED", "DELIVERED", "CANCELLED"].map(
              (s) => (
                <SelectItem key={s} value={s}>
                  {s === "all" ? "All statuses" : s}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          body="Place your first order from the catalog and it will appear here with live tracking."
          action={
            <Button asChild>
              <Link to="/buyer">Browse catalog</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="rounded-xl border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display text-base font-semibold text-foreground">{o.code}</p>
                    <StatusBadge status={o.status} />
                    <PaymentBadge status={o.paymentStatus} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Placed {fmtDate(o.createdAt)} · {o.lines.length} items · fill rate {o.fillRate}%
                    {o.invoiceNo ? ` · ${o.invoiceNo}` : ""}
                  </p>
                  <p className="mt-2 line-clamp-1 text-sm text-muted-foreground">
                    {o.lines.map((l) => `${l.name} ×${l.qty}`).join(" · ")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-display text-lg font-semibold tabular">{inr(o.total)}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      o.lines.forEach((l) => addToCart(l.productId, l.qty));
                      toast.success(`${o.lines.length} items from ${o.code} added to cart`);
                    }}
                  >
                    <RotateCcw className="size-4" /> Re-order
                  </Button>
                  <Button asChild size="sm">
                    <Link to="/buyer/orders/$id" params={{ id: o.id }}>
                      Track <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
