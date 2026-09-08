import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/pharma/AppShell";
import { EmptyState, PaymentBadge, SectionHeader, StatusBadge, fmtDate } from "@/components/pharma/bits";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { inr, useStore } from "@/lib/pharma/store";

export const Route = createFileRoute("/admin/orders/")({
  head: () => ({
    meta: [
      { title: "Order Desk — PharmaConnect Admin" },
      { name: "description", content: "All buyer orders with status, fill rate, payment mode and fulfilment stage." },
      { property: "og:title", content: "Order Desk — PharmaConnect Admin" },
      { property: "og:description", content: "Search, filter and drill into every distributor order." },
    ],
  }),
  component: AdminOrders,
});

function AdminOrders() {
  const { state } = useStore();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const rows = state.orders
    .filter((o) => (status === "all" ? true : o.status === status))
    .filter((o) => {
      if (!q) return true;
      const b = state.buyers.find((x) => x.id === o.buyerId);
      return `${o.code} ${b?.shopName} ${b?.city}`.toLowerCase().includes(q.toLowerCase());
    });

  return (
    <AppShell role="admin">
      <SectionHeader title="Order desk" subtitle={`${rows.length} of ${state.orders.length} orders`} />
      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search order or buyer…"
          className="max-w-xs"
          aria-label="Search orders"
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-44" aria-label="Status filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {["all", "PLACED", "ALLOCATED", "PICKING", "PACKED", "DISPATCHED", "DELIVERED", "CANCELLED"].map((s) => (
              <SelectItem key={s} value={s}>
                {s === "all" ? "All statuses" : s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No matching orders" body="Adjust the search or status filter." />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-secondary/60 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                {["Order", "Buyer", "Date", "Lines", "Fill", "Payment", "Status", "Value"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((o) => {
                const b = state.buyers.find((x) => x.id === o.buyerId);
                return (
                  <tr key={o.id} className="hover:bg-secondary/30">
                    <td className="px-4 py-2.5">
                      <Link to="/admin/orders/$id" params={{ id: o.id }} className="font-medium text-primary hover:underline">
                        {o.code}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5">
                      {b?.shopName}
                      <span className="block text-xs text-muted-foreground">{b?.city}</span>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{fmtDate(o.createdAt)}</td>
                    <td className="px-4 py-2.5 tabular">{o.lines.length}</td>
                    <td className="px-4 py-2.5 tabular">{o.fillRate}%</td>
                    <td className="px-4 py-2.5">
                      <span className="mr-2 text-xs text-muted-foreground">{o.paymentMode}</span>
                      <PaymentBadge status={o.paymentStatus} />
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-4 py-2.5 font-semibold tabular">{inr(o.total)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
