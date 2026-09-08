import { createFileRoute } from "@tanstack/react-router";
import { AddBuyerModal } from "@/components/pharma/AddBuyerModal";
import { KpiCard, SectionHeader } from "@/components/pharma/bits";
import { inr, useStore } from "@/lib/pharma/store";

export const Route = createFileRoute("/admin/buyers")({
  head: () => ({
    meta: [
      { title: "Buyers — PharmaConnect Admin" },
      { name: "description", content: "Retail pharmacy accounts, credit limits, outstanding balances and order history." },
      { property: "og:title", content: "Buyers — PharmaConnect Admin" },
      { property: "og:description", content: "Manage pharmacy accounts and their credit exposure." },
    ],
  }),
  component: Buyers,
});

function Buyers() {
  const { state } = useStore();
  const outstanding = state.buyers.reduce((s, b) => s + b.outstanding, 0);
  const limit = state.buyers.reduce((s, b) => s + b.creditLimit, 0);

  return (
    <AppShell role="admin">
      <SectionHeader
        title="Buyers"
        subtitle="Retail pharmacy accounts and their credit position"
        actions={<AddBuyerModal />}
      />
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <KpiCard label="Accounts" value={state.buyers.length} />
        <KpiCard label="Credit extended" value={inr(limit)} />
        <KpiCard label="Outstanding" value={inr(outstanding)} tone="warning" />
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-secondary/60 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              {["Pharmacy", "Owner", "City", "GSTIN", "Drug licence", "Orders", "Credit limit", "Outstanding"].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {state.buyers.map((b) => {
              const orders = state.orders.filter((o) => o.buyerId === b.id);
              const util = b.creditLimit ? Math.round((b.outstanding / b.creditLimit) * 100) : 0;
              return (
                <tr key={b.id} className="border-t">
                  <td className="px-4 py-2.5 font-medium">{b.shopName}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{b.owner}</td>
                  <td className="px-4 py-2.5">{b.city}</td>
                  <td className="px-4 py-2.5 tabular text-xs">{b.gstin}</td>
                  <td className="px-4 py-2.5 tabular text-xs">{b.drugLicense}</td>
                  <td className="px-4 py-2.5 tabular">{orders.length}</td>
                  <td className="px-4 py-2.5 tabular">{inr(b.creditLimit)}</td>
                  <td className="px-4 py-2.5 tabular">
                    <span className={util > 70 ? "font-semibold text-destructive" : "font-medium"}>
                      {inr(b.outstanding)}
                    </span>
                    <span className="ml-1 text-xs text-muted-foreground">({util}%)</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
