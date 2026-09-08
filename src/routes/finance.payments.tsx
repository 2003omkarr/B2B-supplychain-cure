import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/pharma/AppShell";
import { PaymentBadge, SectionHeader, fmtDateTime } from "@/components/pharma/bits";
import { Input } from "@/components/ui/input";
import { inr, useStore } from "@/lib/pharma/store";

export const Route = createFileRoute("/finance/payments")({
  head: () => ({
    meta: [
      { title: "Payments — PharmaConnect Finance" },
      { name: "description", content: "Gateway settlements and payment status for every order." },
      { property: "og:title", content: "Payments — PharmaConnect Finance" },
      { property: "og:description", content: "Reconcile UPI, card, net banking and wallet settlements." },
    ],
  }),
  component: Payments,
});

function Payments() {
  const { state } = useStore();
  const [q, setQ] = useState("");
  const rows = state.orders.filter((o) => {
    const buyer = state.buyers.find((b) => b.id === o.buyerId)?.shopName ?? "";
    return q ? `${o.code} ${buyer} ${o.txnRef ?? ""} ${o.paymentMode}`.toLowerCase().includes(q.toLowerCase()) : true;
  });

  return (
    <AppShell role="finance">
      <SectionHeader title="Payments" subtitle="Every transaction with its gateway reference and settlement state" />
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search order, buyer or transaction ref…"
        className="mb-4 max-w-sm"
        aria-label="Search payments"
      />
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="bg-secondary/60 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              {["Order", "Buyer", "Placed", "Mode", "Txn ref", "Status", "Amount"].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id} className="border-t">
                <td className="px-4 py-2.5 tabular font-medium">{o.code}</td>
                <td className="px-4 py-2.5">{state.buyers.find((b) => b.id === o.buyerId)?.shopName}</td>
                <td className="px-4 py-2.5 text-xs text-muted-foreground">{fmtDateTime(o.createdAt)}</td>
                <td className="px-4 py-2.5">{o.paymentMode}</td>
                <td className="px-4 py-2.5 tabular text-xs text-muted-foreground">{o.txnRef ?? "—"}</td>
                <td className="px-4 py-2.5">
                  <PaymentBadge status={o.paymentStatus} />
                </td>
                <td className="px-4 py-2.5 tabular text-right font-semibold">{inr(o.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
