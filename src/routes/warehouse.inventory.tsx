import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/pharma/AppShell";
import { ExpiryPill, SectionHeader } from "@/components/pharma/bits";
import { Input } from "@/components/ui/input";
import { available, useStore } from "@/lib/pharma/store";

export const Route = createFileRoute("/warehouse/inventory")({
  head: () => ({
    meta: [
      { title: "Batch Locations — PharmaConnect Warehouse" },
      { name: "description", content: "Rack-level batch locations, on-hand quantities and reservations." },
      { property: "og:title", content: "Batch Locations — PharmaConnect Warehouse" },
      { property: "og:description", content: "Find any batch on the floor by rack and warehouse." },
    ],
  }),
  component: WhInventory,
});

function WhInventory() {
  const { state } = useStore();
  const [q, setQ] = useState("");
  const rows = state.batches
    .map((b) => ({ b, p: state.products.find((x) => x.id === b.productId)! }))
    .filter(({ b, p }) =>
      q ? `${p.name} ${b.batchNo} ${b.rack} ${b.warehouse}`.toLowerCase().includes(q.toLowerCase()) : true,
    )
    .sort((x, y) => +new Date(x.b.expiry) - +new Date(y.b.expiry));

  return (
    <AppShell role="warehouse">
      <SectionHeader title="Batch locations" subtitle={`${rows.length} batches across all racks, nearest expiry first`} />
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search product, batch number or rack…"
        className="mb-4 max-w-sm"
        aria-label="Search batches"
      />
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-secondary/60 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              {["Product", "Batch", "Warehouse", "Rack", "On hand", "Reserved", "Available", "Expiry"].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map(({ b, p }) => (
              <tr key={b.id} className="hover:bg-secondary/30">
                <td className="px-4 py-2.5 font-medium">{p.name}</td>
                <td className="px-4 py-2.5 tabular">{b.batchNo}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{b.warehouse}</td>
                <td className="px-4 py-2.5 font-semibold">{b.rack}</td>
                <td className="px-4 py-2.5 tabular">{b.qty}</td>
                <td className="px-4 py-2.5 tabular text-warning-foreground">{b.reserved}</td>
                <td className="px-4 py-2.5 tabular font-semibold">{available(b)}</td>
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
