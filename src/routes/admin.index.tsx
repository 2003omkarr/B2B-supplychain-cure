import { createFileRoute, Link } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell } from "@/components/pharma/AppShell";
import { AnimatedKpiCard, SectionHeader, StatusBadge, fmtDate } from "@/components/pharma/bits";
import { OrderFlowPipeline } from "@/components/pharma/OrderFlowPipeline";
import { Button } from "@/components/ui/button";
import { available, daysToExpiry, inr, useStore } from "@/lib/pharma/store";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Distributor Dashboard — PharmaConnect Admin" },
      {
        name: "description",
        content: "Real-time KPIs for orders, fill rate, inventory value, near-expiry risk and collections.",
      },
      { property: "og:title", content: "Distributor Dashboard — PharmaConnect Admin" },
      { property: "og:description", content: "Operational visibility across ordering, fulfilment and finance." },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { state } = useStore();
  const live = state.orders.filter((o) => o.status !== "CANCELLED");
  const open = live.filter((o) => !["DELIVERED"].includes(o.status));
  const gmv = live.reduce((s, o) => s + o.total, 0);
  const avgFill = Math.round(live.reduce((s, o) => s + o.fillRate, 0) / (live.length || 1));
  const stockValue = state.batches.reduce((s, b) => {
    const p = state.products.find((x) => x.id === b.productId);
    return s + (p ? p.ptr * available(b) : 0);
  }, 0);
  const atRisk = state.batches
    .filter((b) => daysToExpiry(b.expiry) > 0 && daysToExpiry(b.expiry) <= 90)
    .reduce((s, b) => {
      const p = state.products.find((x) => x.id === b.productId);
      return s + (p ? p.ptr * available(b) : 0);
    }, 0);

  const byStatus = ["PLACED", "ALLOCATED", "PICKING", "PACKED", "DISPATCHED", "DELIVERED"].map((s) => ({
    status: s,
    count: state.orders.filter((o) => o.status === s).length,
  }));

  const byCategory = Object.entries(
    live.reduce<Record<string, number>>((acc, o) => {
      o.lines.forEach((l) => {
        const p = state.products.find((x) => x.id === l.productId);
        if (!p) return;
        acc[p.category] = (acc[p.category] ?? 0) + l.unitPrice * l.qty;
      });
      return acc;
    }, {}),
  )
    .map(([name, value]) => ({ name, value: Math.round(value) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const COLORS = [
    "oklch(0.5 0.1 195)",
    "oklch(0.68 0.13 160)",
    "oklch(0.78 0.15 78)",
    "oklch(0.62 0.12 250)",
    "oklch(0.6 0.16 20)",
    "oklch(0.55 0.08 300)",
  ];

  return (
    <AppShell role="admin">
      <SectionHeader
        title="Distributor dashboard"
        subtitle="Live operational picture across ordering, fulfilment and inventory"
        actions={
          <Button asChild size="sm">
            <Link to="/admin/orders">Open order desk</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AnimatedKpiCard label="GMV (all orders)" numericValue={gmv} format="currency" hint={`${live.length} orders`} />
        <AnimatedKpiCard label="Open orders" numericValue={open.length} hint="Not yet delivered" tone="warning" />
        <AnimatedKpiCard label="Average fill rate" numericValue={avgFill} format="percent" tone={avgFill > 95 ? "success" : "warning"} />
        <AnimatedKpiCard label="Sellable stock value" numericValue={stockValue} format="currency" hint={`${state.batches.length} batches`} />
      </div>

      {/* Animated order lifecycle pipeline */}
      <OrderFlowPipeline />

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section className="rounded-xl border bg-card p-5">
          <h2 className="font-display text-base font-semibold">Orders by stage</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.014 205)" vertical={false} />
                <XAxis dataKey="status" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: "oklch(0.955 0.01 200)" }} />
                <Bar dataKey="count" fill="oklch(0.5 0.1 195)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-xl border bg-card p-5">
          <h2 className="font-display text-base font-semibold">Revenue mix by category</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byCategory} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {byCategory.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => inr(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            {byCategory.map((c, i) => (
              <span key={c.name} className="inline-flex items-center gap-1.5 text-muted-foreground">
                <span className="size-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                {c.name}
              </span>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_320px]">
        <section className="overflow-hidden rounded-xl border bg-card">
          <h2 className="border-b px-5 py-3 font-display text-base font-semibold">Latest orders</h2>
          <div className="divide-y">
            {state.orders.slice(0, 6).map((o) => (
              <Link
                key={o.id}
                to="/admin/orders/$id"
                params={{ id: o.id }}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-secondary/40"
              >
                <div>
                  <p className="font-medium">{o.code}</p>
                  <p className="text-xs text-muted-foreground">
                    {state.buyers.find((b) => b.id === o.buyerId)?.shopName} · {fmtDate(o.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={o.status} />
                  <span className="font-semibold tabular">{inr(o.total)}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-destructive/25 bg-destructive/4 p-5">
          <h2 className="font-display text-base font-semibold text-destructive">Value at risk</h2>
          <p className="mt-2 font-display text-3xl font-semibold tabular text-destructive">{inr(atRisk)}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Stock expiring within 90 days. Discounts are auto-published to the buyer catalog.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link to="/admin/near-expiry">Open near-expiry report</Link>
          </Button>
        </section>
      </div>
    </AppShell>
  );
}
