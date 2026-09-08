import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/pharma/AppShell";
import { KpiCard, SectionHeader } from "@/components/pharma/bits";
import { inr, useStore } from "@/lib/pharma/store";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({
    meta: [
      { title: "Reports — PharmaConnect Admin" },
      { name: "description", content: "Sales, fulfilment and product performance reporting for the distribution business." },
      { property: "og:title", content: "Reports — PharmaConnect Admin" },
      { property: "og:description", content: "Revenue, fill rate and top-selling molecule reporting." },
    ],
  }),
  component: Reports,
});

function Reports() {
  const { state } = useStore();
  const live = state.orders.filter((o) => o.status !== "CANCELLED");
  const revenue = live.reduce((s, o) => s + o.total, 0);
  const avgFill = live.length ? Math.round(live.reduce((s, o) => s + o.fillRate, 0) / live.length) : 0;
  const delivered = live.filter((o) => o.status === "DELIVERED").length;

  const bySku = new Map<string, { name: string; qty: number; value: number }>();
  live.forEach((o) =>
    o.lines.forEach((l) => {
      const row = bySku.get(l.productId) ?? { name: l.name, qty: 0, value: 0 };
      row.qty += l.qty;
      row.value += l.qty * l.unitPrice;
      bySku.set(l.productId, row);
    }),
  );
  const top = [...bySku.values()].sort((a, b) => b.value - a.value).slice(0, 10);

  const byBuyer = state.buyers
    .map((b) => {
      const os = live.filter((o) => o.buyerId === b.id);
      return { name: b.shopName, orders: os.length, value: os.reduce((s, o) => s + o.total, 0) };
    })
    .sort((a, b) => b.value - a.value);

  return (
    <AppShell role="admin">
      <SectionHeader title="Reports" subtitle="Sales and fulfilment performance across the demo dataset" />
      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Orders" value={live.length} />
        <KpiCard label="Revenue" value={inr(revenue)} />
        <KpiCard label="Average fill rate" value={`${avgFill}%`} tone={avgFill >= 95 ? "success" : "warning"} />
        <KpiCard label="Delivered" value={delivered} tone="success" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border bg-card">
          <p className="border-b px-4 py-3 font-display text-sm font-semibold">Top products by value</p>
          <table className="w-full text-sm">
            <tbody>
              {top.map((r) => (
                <tr key={r.name} className="border-b last:border-0">
                  <td className="px-4 py-2.5">{r.name}</td>
                  <td className="px-4 py-2.5 tabular text-right text-muted-foreground">{r.qty} u</td>
                  <td className="px-4 py-2.5 tabular text-right font-medium">{inr(r.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border bg-card">
          <p className="border-b px-4 py-3 font-display text-sm font-semibold">Revenue by buyer</p>
          <table className="w-full text-sm">
            <tbody>
              {byBuyer.map((r) => (
                <tr key={r.name} className="border-b last:border-0">
                  <td className="px-4 py-2.5">{r.name}</td>
                  <td className="px-4 py-2.5 tabular text-right text-muted-foreground">{r.orders} orders</td>
                  <td className="px-4 py-2.5 tabular text-right font-medium">{inr(r.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
