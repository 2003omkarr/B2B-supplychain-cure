import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/pharma/AppShell";
import { SectionHeader } from "@/components/pharma/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { buildCatalog, useStore } from "@/lib/pharma/store";

export const Route = createFileRoute("/admin/discounts")({
  head: () => ({
    meta: [
      { title: "Discount Engine — PharmaConnect Admin" },
      { name: "description", content: "Configure near-expiry discount tiers that publish straight to the buyer catalog." },
      { property: "og:title", content: "Discount Engine — PharmaConnect Admin" },
      { property: "og:description", content: "Tier-based automatic markdowns on expiring pharmaceutical stock." },
    ],
  }),
  component: Discounts,
});

function Discounts() {
  const { state, updateSettings } = useStore();
  const s = state.settings;
  const [t1d, setT1d] = useState(String(s.nearExpiryTier1Days));
  const [t1p, setT1p] = useState(String(s.nearExpiryTier1Pct));
  const [t2d, setT2d] = useState(String(s.nearExpiryTier2Days));
  const [t2p, setT2p] = useState(String(s.nearExpiryTier2Pct));

  const discounted = buildCatalog(state).filter((c) => c.discountPct > 0);

  const save = () => {
    updateSettings({
      nearExpiryTier1Days: Number(t1d) || 0,
      nearExpiryTier1Pct: Number(t1p) || 0,
      nearExpiryTier2Days: Number(t2d) || 0,
      nearExpiryTier2Pct: Number(t2p) || 0,
    });
    toast.success("Discount tiers published to the buyer catalog");
  };

  return (
    <AppShell role="admin">
      <SectionHeader
        title="Discount engine"
        subtitle="Tiered markdowns applied automatically to near-expiry batches"
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-xl border bg-card p-5">
          <p className="font-display text-sm font-semibold">Near-expiry tiers</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="t1d">Tier 1 — within days</Label>
              <Input id="t1d" value={t1d} onChange={(e) => setT1d(e.target.value)} inputMode="numeric" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t1p">Tier 1 discount %</Label>
              <Input id="t1p" value={t1p} onChange={(e) => setT1p(e.target.value)} inputMode="numeric" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t2d">Tier 2 — within days</Label>
              <Input id="t2d" value={t2d} onChange={(e) => setT2d(e.target.value)} inputMode="numeric" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t2p">Tier 2 discount %</Label>
              <Input id="t2p" value={t2p} onChange={(e) => setT2p(e.target.value)} inputMode="numeric" />
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between rounded-lg border bg-secondary/40 p-3">
            <div>
              <p className="text-sm font-medium">Automatic FEFO allocation</p>
              <p className="text-xs text-muted-foreground">
                Reserve earliest-expiry batches the moment an order is placed.
              </p>
            </div>
            <Switch
              checked={s.fefoAuto}
              onCheckedChange={(v) => updateSettings({ fefoAuto: v })}
              aria-label="Automatic FEFO allocation"
            />
          </div>

          <Button className="mt-5" onClick={save}>
            Publish to catalog
          </Button>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <p className="font-display text-sm font-semibold">Live discounted SKUs</p>
          <p className="mt-1 text-xs text-muted-foreground">{discounted.length} products currently show an offer.</p>
          <ul className="mt-3 space-y-2">
            {discounted.slice(0, 12).map((c) => (
              <li key={c.product.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate">{c.product.name}</span>
                <span className="shrink-0 rounded-md border border-primary/25 bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  -{c.discountPct}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AppShell>
  );
}
