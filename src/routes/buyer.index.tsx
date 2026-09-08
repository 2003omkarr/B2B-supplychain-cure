import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Snowflake, Minus, Plus, PackageCheck } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/pharma/AppShell";
import { ExpiryPill, SectionHeader, EmptyState } from "@/components/pharma/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { inr2, useStore } from "@/lib/pharma/store";

export const Route = createFileRoute("/buyer/")({
  head: () => ({
    meta: [
      { title: "Product Catalog — PharmaConnect Buyer Portal" },
      {
        name: "description",
        content:
          "Search live distributor stock by molecule, brand or manufacturer with batch expiry, GST, pack size and near-expiry discounts.",
      },
      { property: "og:title", content: "Product Catalog — PharmaConnect Buyer Portal" },
      {
        property: "og:description",
        content: "Real-time batch-level stock visibility with FEFO-aware pricing for retail pharmacies.",
      },
    ],
  }),
  component: Catalog,
});

function Catalog() {
  const { catalog, addToCart, state } = useStore();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [sched, setSched] = useState("all");
  const [sort, setSort] = useState("relevance");
  const [onlyStock, setOnlyStock] = useState(false);
  const [qty, setQty] = useState<Record<string, number>>({});

  const categories = useMemo(
    () => Array.from(new Set(state.products.map((p) => p.category))).sort(),
    [state.products],
  );

  const rows = useMemo(() => {
    let list = catalog.filter((e) => {
      const p = e.product;
      const hay = `${p.name} ${p.brand} ${p.composition} ${p.manufacturer} ${p.category}`.toLowerCase();
      if (q && !hay.includes(q.toLowerCase())) return false;
      if (cat !== "all" && p.category !== cat) return false;
      if (sched !== "all" && p.schedule !== sched) return false;
      if (onlyStock && e.stock <= 0) return false;
      return true;
    });
    if (sort === "price") list = [...list].sort((a, b) => a.effectivePrice - b.effectivePrice);
    if (sort === "discount") list = [...list].sort((a, b) => b.discountPct - a.discountPct);
    if (sort === "expiry")
      list = [...list].sort(
        (a, b) => +new Date(a.nearestExpiry ?? 0) - +new Date(b.nearestExpiry ?? 0),
      );
    if (sort === "name") list = [...list].sort((a, b) => a.product.name.localeCompare(b.product.name));
    return list;
  }, [catalog, q, cat, sched, sort, onlyStock]);

  const setQtyFor = (id: string, v: number) => setQty((s) => ({ ...s, [id]: Math.max(1, v) }));

  return (
    <AppShell role="buyer">
      <SectionHeader
        title="Product catalog"
        subtitle={`${rows.length} of ${catalog.length} SKUs · live batch stock from MedSource Distributors`}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link to="/buyer/offers">
              <PackageCheck className="size-4" /> Expiry offers
            </Link>
          </Button>
        }
      />

      <div className="mb-5 grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-[1fr_auto_auto_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search brand, molecule or manufacturer…"
            className="pl-9"
            aria-label="Search catalog"
          />
        </div>
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger className="min-w-[150px]" aria-label="Category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sched} onValueChange={setSched}>
          <SelectTrigger className="min-w-[130px]" aria-label="Schedule">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All schedules</SelectItem>
            <SelectItem value="H">Schedule H</SelectItem>
            <SelectItem value="H1">Schedule H1</SelectItem>
            <SelectItem value="X">Schedule X</SelectItem>
            <SelectItem value="OTC">OTC</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="min-w-[150px]" aria-label="Sort">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Sort: default</SelectItem>
            <SelectItem value="name">Name A–Z</SelectItem>
            <SelectItem value="price">Lowest price</SelectItem>
            <SelectItem value="discount">Best discount</SelectItem>
            <SelectItem value="expiry">Nearest expiry</SelectItem>
          </SelectContent>
        </Select>
        <label className="col-span-full flex items-center gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={onlyStock}
            onChange={(e) => setOnlyStock(e.target.checked)}
            className="size-3.5 accent-[oklch(0.5_0.1_195)]"
          />
          In-stock only
        </label>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No products match those filters"
          body="Try a different molecule, brand or clear the schedule filter."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((e) => {
            const p = e.product;
            const q1 = qty[p.id] ?? 1;
            const out = e.stock <= 0;
            return (
              <article
                key={p.id}
                className="flex flex-col rounded-xl border bg-card p-4 transition-shadow hover:shadow-[0_14px_32px_-22px_oklch(0.24_0.03_220_/_0.5)]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate font-display text-base font-semibold text-foreground">
                      {p.name}
                    </h3>
                    <p className="truncate text-xs text-muted-foreground">{p.composition}</p>
                  </div>
                  {e.discountPct > 0 ? (
                    <span className="shrink-0 rounded-md bg-destructive/10 px-2 py-0.5 text-[11px] font-bold text-destructive">
                      −{e.discountPct}%
                    </span>
                  ) : null}
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
                  <span className="rounded-md bg-secondary px-2 py-0.5 font-medium text-secondary-foreground">
                    {p.packSize}
                  </span>
                  <span className="rounded-md bg-secondary px-2 py-0.5 font-medium text-secondary-foreground">
                    Sch. {p.schedule}
                  </span>
                  <span className="rounded-md bg-secondary px-2 py-0.5 font-medium text-secondary-foreground">
                    GST {p.gst}%
                  </span>
                  {p.coldChain ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-info/12 px-2 py-0.5 font-medium text-info">
                      <Snowflake className="size-3" /> Cold chain
                    </span>
                  ) : null}
                </div>

                <p className="mt-2 text-xs text-muted-foreground">{p.manufacturer} · HSN {p.hsn}</p>

                <div className="mt-3 flex items-end justify-between gap-3">
                  <div>
                    <p className="font-display text-xl font-semibold tabular text-foreground">
                      {inr2(e.effectivePrice)}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {e.discountPct > 0 ? (
                        <span className="mr-1 line-through">{inr2(p.ptr)}</span>
                      ) : null}
                      PTR · MRP {inr2(p.mrp)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={
                        out
                          ? "text-xs font-semibold text-destructive"
                          : e.stock < 40
                            ? "text-xs font-semibold text-warning-foreground"
                            : "text-xs font-semibold text-success"
                      }
                    >
                      {out ? "Out of stock" : `${e.stock} units`}
                    </p>
                    {e.nearestExpiry ? <ExpiryPill expiry={e.nearestExpiry} /> : null}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <div className="flex items-center rounded-lg border">
                    <button
                      className="grid size-9 place-items-center text-muted-foreground hover:text-foreground disabled:opacity-40"
                      onClick={() => setQtyFor(p.id, q1 - 1)}
                      disabled={out}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <input
                      value={q1}
                      onChange={(ev) => setQtyFor(p.id, Number(ev.target.value) || 1)}
                      className="w-12 border-x bg-transparent py-1.5 text-center text-sm tabular outline-none"
                      aria-label={`Quantity for ${p.name}`}
                    />
                    <button
                      className="grid size-9 place-items-center text-muted-foreground hover:text-foreground disabled:opacity-40"
                      onClick={() => setQtyFor(p.id, q1 + 1)}
                      disabled={out}
                      aria-label="Increase quantity"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                  <Button
                    className="flex-1"
                    disabled={out}
                    onClick={() => {
                      if (q1 > e.stock) {
                        toast.error(`Only ${e.stock} units available for ${p.name}`);
                        return;
                      }
                      addToCart(p.id, q1);
                      toast.success(`${q1} × ${p.name} added to cart`);
                    }}
                  >
                    Add to cart
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
