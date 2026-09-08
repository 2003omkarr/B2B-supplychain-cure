import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/pharma/AppShell";
import { KpiCard, SectionHeader } from "@/components/pharma/bits";
import { inr, useStore } from "@/lib/pharma/store";
import type { PaymentMode } from "@/lib/pharma/types";

export const Route = createFileRoute("/finance/reports")({
  head: () => ({
    meta: [
      { title: "Finance Reports — PharmaConnect" },
      { name: "description", content: "GST, collections and payment-mode mix reporting for the distribution book." },
      { property: "og:title", content: "Finance Reports — PharmaConnect" },
      { property: "og:description", content: "Revenue, GST liability and payment mix in one view." },
    ],
  }),
  component: FinanceReports,
});

const MODES: PaymentMode[] = ["UPI", "CARD", "NETBANKING", "WALLET", "COD"];

function FinanceReports() {
  const { state } = useStore();
  const live = state.orders.filter((o) => o.status !== "CANCELLED");
  const revenue = live.reduce((s, o) => s + o.total, 0);
  const gst = live.reduce((s, o) => s + o.gstAmount, 0);
  const discount = live.reduce((s, o) => s + o.discount, 0);

  return (
    <AppShell role="finance">
      <SectionHeader title="Finance reports" subtitle="Revenue, GST liability and payment mode mix" />
      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Gross revenue" value={inr(revenue)} />
        <KpiCard label="GST collected" value={inr(gst)} />
        <KpiCard label="Discounts given" value={inr(discount)} tone="warning" />
        <KpiCard label="Orders" value={live.length} />
      </div>

      <div className="rounded-xl border bg-card">
        <p className="border-b px-4 py-3 font-display text-sm font-semibold">Payment mode mix</p>
        <table className="w-full text-sm">
          <tbody>
            {MODES.map((m) => {
              const os = live.filter((o) => o.paymentMode === m);
              const value = os.reduce((s, o) => s + o.total, 0);
              const pct = revenue ? Math.round((value / revenue) * 100) : 0;
              return (
                <tr key={m} className="border-b last:border-0">
                  <td className="px-4 py-2.5 font-medium">{m}</td>
                  <td className="px-4 py-2.5 tabular text-muted-foreground">{os.length} orders</td>
                  <td className="px-4 py-2.5">
                    <div className="h-2 w-full max-w-[220px] overflow-hidden rounded-full bg-secondary">
                      <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                  </td>
                  <td className="px-4 py-2.5 tabular text-right font-semibold">{inr(value)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
