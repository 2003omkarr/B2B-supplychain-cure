import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/pharma/AppShell";
import { EmptyState, ExpiryPill, KpiCard, SectionHeader } from "@/components/pharma/bits";
import { available, daysToExpiry, discountForBatch, inr, useStore } from "@/lib/pharma/store";

export const Route = createFileRoute("/admin/near-expiry")({
  head: () => ({
    meta: [
      { title: "Near-Expiry Report — PharmaConnect Admin" },
      { name: "description", content: "Value at risk from near-expiry batches with active discount tiers." },
      { property: "og:title", content: "Near-Expiry Report — PharmaConnect Admin" },
      { property: "og:description", content: "Spot expiring stock early and liquidate it with auto discounts." },
    ],
  }),
  component: NearExpiry,
});

function NearExpiry() {
  const { state } = useStore();
  const rows = state.batches
    .map((b) => ({ b, p: state.products.find((x) => x.id === b.productId)!, d: daysToExpiry(b.expiry) }))
    .filter((r) => r.d <= state.settings.nearExpiryTier2Days && available(r.b) > 0)
    .sort((a, b) => a.d - b.d);

  const expired = rows.filter((r) => r.d <= 0);
  const atRisk = rows.reduce((s, r) => s + available(r.b) * r.p.ptr, 0);

  return (
    <AppShell role="admin">
      <SectionHeader
        title="Near-expiry & value at risk"
        subtitle={`Batches expiring within ${state.settings.nearExpiryTier2Days} days`}
      />
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <KpiCard label="Near-expiry batches" value={rows.length} tone="warning" />
        <KpiCard label="Value at risk" value={inr(atRisk)} tone="danger" />
        <KpiCard label="Already expired" value={expired.length} tone="danger" />
      </div>

      {rows.length === 0 ? (
        <EmptyState title="Nothing expiring soon" body="No live batch falls inside the near-expiry window." />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-secondary/60 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                {["Product", "Batch", "Rack", "Available", "Days left", "Auto discount", "Value at risk", "Expiry"].map(
                  (h) => (
                    <th key={h} className="px-4 py-2.5 text-left font-semibold">
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map(({ b, p, d }) => (
                <tr key={b.id} className="border-t">
                  <td className="px-4 py-2.5 font-medium">{p.name}</td>
                  <td className="px-4 py-2.5 tabular">{b.batchNo}</td>
                  <td className="px-4 py-2.5 tabular text-muted-foreground">{b.rack}</td>
                  <td className="px-4 py-2.5 tabular">{available(b)}</td>
                  <td className="px-4 py-2.5 tabular">{d}</td>
                  <td className="px-4 py-2.5 font-semibold text-primary">
                    {discountForBatch(b, state.settings)}%
                  </td>
                  <td className="px-4 py-2.5 tabular">{inr(available(b) * p.ptr)}</td>
                  <td className="px-4 py-2.5">
                    <ExpiryPill expiry={b.expiry} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
