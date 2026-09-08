import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/pharma/AppShell";
import { KpiCard, SectionHeader } from "@/components/pharma/bits";
import { inr, useStore } from "@/lib/pharma/store";

export const Route = createFileRoute("/buyer/account")({
  head: () => ({
    meta: [
      { title: "Pharmacy Account — PharmaConnect Buyer Portal" },
      {
        name: "description",
        content: "Licence details, credit limit, outstanding balance and purchase summary for your pharmacy.",
      },
      { property: "og:title", content: "Pharmacy Account — PharmaConnect" },
      { property: "og:description", content: "Your licence, credit and purchase history at a glance." },
    ],
  }),
  component: Account,
});

function Account() {
  const { state, buyer } = useStore();
  const mine = state.orders.filter((o) => o.buyerId === buyer.id && o.status !== "CANCELLED");
  const spent = mine.reduce((s, o) => s + o.total, 0);

  return (
    <AppShell role="buyer">
      <SectionHeader title="Pharmacy account" subtitle={`${buyer.shopName} · ${buyer.city}`} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Credit limit" value={inr(buyer.creditLimit)} />
        <KpiCard
          label="Outstanding"
          value={inr(buyer.outstanding)}
          tone={buyer.outstanding > buyer.creditLimit * 0.7 ? "warning" : "default"}
        />
        <KpiCard label="Credit available" value={inr(Math.max(0, buyer.creditLimit - buyer.outstanding))} />
        <KpiCard label="Lifetime purchases" value={inr(spent)} hint={`${mine.length} orders`} />
      </div>

      <section className="mt-5 rounded-xl border bg-card p-5">
        <h2 className="font-display text-base font-semibold">Licence & registration</h2>
        <dl className="mt-3 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["Proprietor", buyer.owner],
            ["GSTIN", buyer.gstin],
            ["Drug licence", buyer.drugLicense],
            ["Phone", buyer.phone],
            ["Address", `${buyer.address}, ${buyer.city} ${buyer.pincode}`],
            ["State", buyer.state],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs text-muted-foreground">{k}</dt>
              <dd className="font-medium text-foreground">{v}</dd>
            </div>
          ))}
        </dl>
      </section>
    </AppShell>
  );
}
