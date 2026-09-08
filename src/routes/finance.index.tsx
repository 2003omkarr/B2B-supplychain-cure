import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/pharma/AppShell";
import { KpiCard, PaymentBadge, SectionHeader, fmtDate } from "@/components/pharma/bits";
import { Button } from "@/components/ui/button";
import { inr, useStore } from "@/lib/pharma/store";

export const Route = createFileRoute("/finance/")({
  head: () => ({
    meta: [
      { title: "Finance Dashboard — PharmaConnect" },
      { name: "description", content: "Settlements, COD exposure and buyer credit health at a glance." },
      { property: "og:title", content: "Finance Dashboard — PharmaConnect" },
      { property: "og:description", content: "Track collected, pending and refunded money across all orders." },
    ],
  }),
  component: FinanceHome,
});

function FinanceHome() {
  const { state } = useStore();
  const live = state.orders.filter((o) => o.status !== "CANCELLED");
  const collected = live
    .filter((o) => o.paymentStatus === "PAID" || o.paymentStatus === "COD_COLLECTED")
    .reduce((s, o) => s + o.total, 0);
  const codDue = live.filter((o) => o.paymentStatus === "COD_PENDING").reduce((s, o) => s + o.total, 0);
  const outstanding = state.buyers.reduce((s, b) => s + b.outstanding, 0);

  return (
    <AppShell role="finance">
      <SectionHeader
        title="Finance dashboard"
        subtitle="Money collected, money due and credit exposure across the book"
        actions={
          <Button asChild variant="outline">
            <Link to="/finance/cod">COD collections</Link>
          </Button>
        }
      />
      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Collected" value={inr(collected)} tone="success" />
        <KpiCard label="COD due" value={inr(codDue)} tone="warning" />
        <KpiCard label="Buyer outstanding" value={inr(outstanding)} />
        <KpiCard label="Orders" value={live.length} />
      </div>

      <div className="rounded-xl border bg-card">
        <p className="border-b px-4 py-3 font-display text-sm font-semibold">Recent payments</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <tbody>
              {live.slice(0, 12).map((o) => (
                <tr key={o.id} className="border-b last:border-0">
                  <td className="px-4 py-2.5 tabular font-medium">{o.code}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {state.buyers.find((b) => b.id === o.buyerId)?.shopName}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{fmtDate(o.createdAt)}</td>
                  <td className="px-4 py-2.5">{o.paymentMode}</td>
                  <td className="px-4 py-2.5">
                    <PaymentBadge status={o.paymentStatus} />
                  </td>
                  <td className="px-4 py-2.5 tabular text-right font-semibold">{inr(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
