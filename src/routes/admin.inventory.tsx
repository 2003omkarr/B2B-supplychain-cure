import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/pharma/AppShell";
import { AddMedicineModal } from "@/components/pharma/AddMedicineModal";
import { ExpiryPill, KpiCard, SectionHeader } from "@/components/pharma/bits";
import { Input } from "@/components/ui/input";
import { available, inr, useStore } from "@/lib/pharma/store";

export const Route = createFileRoute("/admin/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory Batches — PharmaConnect Admin" },
      { name: "description", content: "Batch-level stock, reservations and valuation across warehouses." },
      { property: "og:title", content: "Inventory Batches — PharmaConnect Admin" },
      { property: "og:description", content: "Live batch inventory with reservations and stock value." },
    ],
  }),
  component: AdminInventory,
});

function AdminInventory() {
  const { state } = useStore();
  const [q, setQ] = useState("");

  const rows = state.batches
    .map((b) => ({ b, p: state.products.find((x) => x.id === b.productId)! }))
    .filter(({ b, p }) =>
      q ? `${p.name} ${p.brand} ${b.batchNo} ${b.rack}`.toLowerCase().includes(q.toLowerCase()) : true,
    )
    .sort((x, y) => +new Date(x.b.expiry) - +new Date(y.b.expiry));

  const totalUnits = state.batches.reduce((s, b) => s + b.qty, 0);
  const reserved = state.batches.reduce((s, b) => s + b.reserved, 0);
  const value = state.batches.reduce(
    (s, b) => s + b.qty * (state.products.find((p) => p.id === b.productId)?.ptr ?? 0),
    0,
  );

  return (
    <AppShell role="admin">
      <SectionHeader
        title="Inventory batches"
        subtitle="Every batch, its reservations and stock value"
        actions={<AddMedicineModal />}
      />
      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Batches" value={state.batches.length} />
        <KpiCard label="Units on hand" value={totalUnits.toLocaleString("en-IN")} />
        <KpiCard label="Reserved" value={reserved.toLocaleString("en-IN")} tone="warning" />
        <KpiCard label="Stock value (PTR)" value={inr(value)} />
      </div>

      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search product, brand, batch or rack…"
        className="mb-4 max-w-sm"
        aria-label="Search inventory"
      />

      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="bg-secondary/60 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              {["Product", "Batch", "Warehouse", "Rack", "On hand", "Reserved", "Available", "Value", "Expiry"].map(
                (h) => (
                  <th key={h} className="px-4 py-2.5 text-left font-semibold">
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ b, p }) => (
              <tr key={b.id} className="border-t">
                <td className="px-4 py-2.5">
                  <p className="font-medium text-foreground">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.packSize}</p>
                </td>
                <td className="px-4 py-2.5 tabular">{b.batchNo}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{b.warehouse}</td>
                <td className="px-4 py-2.5 tabular">{b.rack}</td>
                <td className="px-4 py-2.5 tabular">{b.qty}</td>
                <td className="px-4 py-2.5 tabular text-warning-foreground">{b.reserved}</td>
                <td className="px-4 py-2.5 tabular font-semibold">{available(b)}</td>
                <td className="px-4 py-2.5 tabular">{inr(b.qty * p.ptr)}</td>
                <td className="px-4 py-2.5">
                  <ExpiryPill expiry={b.expiry} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
