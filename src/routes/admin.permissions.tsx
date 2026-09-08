import { createFileRoute } from "@tanstack/react-router";
import { Fragment } from "react";
import { AppShell } from "@/components/pharma/AppShell";
import { SectionHeader } from "@/components/pharma/bits";
import { ROLES } from "@/lib/pharma/nav";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/pharma/types";

export const Route = createFileRoute("/admin/permissions")({
  head: () => ({
    meta: [
      { title: "Permissions Matrix — PharmaConnect" },
      {
        name: "description",
        content:
          "Role-by-capability permissions matrix for buyers, distributor admins, warehouse, dispatch and finance teams.",
      },
      { property: "og:title", content: "Permissions Matrix — PharmaConnect" },
      {
        property: "og:description",
        content: "Who can view, create, edit or approve every module in the distribution workflow.",
      },
    ],
  }),
  component: PermissionsPage,
});

type Level = "view" | "create" | "edit" | "approve" | "none";

const LEVEL_META: Record<Level, { label: string; short: string; cls: string }> = {
  view: { label: "View", short: "V", cls: "bg-info/12 text-info border-info/25" },
  create: { label: "Create", short: "C", cls: "bg-primary/12 text-primary border-primary/25" },
  edit: { label: "Edit", short: "E", cls: "bg-warning/20 text-warning-foreground border-warning/40" },
  approve: { label: "Approve", short: "A", cls: "bg-success/14 text-success border-success/30" },
  none: { label: "No access", short: "—", cls: "bg-muted text-muted-foreground border-border" },
};

interface Capability {
  module: string;
  ability: string;
  perms: Record<Role, Level>;
}

const M = (
  module: string,
  ability: string,
  buyer: Level,
  admin: Level,
  warehouse: Level,
  dispatch: Level,
  finance: Level,
): Capability => ({ module, ability, perms: { buyer, admin, warehouse, dispatch, finance } });

const CAPABILITIES: Capability[] = [
  M("Catalog", "Browse products & live batch stock", "view", "edit", "view", "none", "view"),
  M("Catalog", "See PTR / net landed prices", "view", "edit", "none", "none", "view"),
  M("Ordering", "Build cart & place orders", "create", "create", "none", "none", "none"),
  M("Ordering", "Track own orders & invoices", "view", "view", "none", "none", "view"),
  M("Order administration", "All customer orders & fill rates", "none", "edit", "view", "view", "view"),
  M("Order administration", "Cancel order & release stock", "none", "approve", "none", "none", "none"),
  M("FEFO engine", "View allocated batches", "view", "view", "view", "view", "none"),
  M("FEFO engine", "Re-run allocation", "none", "approve", "none", "none", "none"),
  M("FEFO engine", "Manual batch override", "none", "approve", "none", "none", "none"),
  M("Inventory", "Batch quantities & rack locations", "none", "edit", "view", "view", "none"),
  M("Inventory", "Near-expiry & value-at-risk report", "none", "edit", "view", "none", "view"),
  M("Discounts", "Configure near-expiry discount tiers", "none", "approve", "none", "none", "none"),
  M("Discounts", "Buy discounted near-expiry stock", "create", "view", "none", "none", "none"),
  M("Warehouse", "Pick list & item picking", "none", "view", "edit", "view", "none"),
  M("Warehouse", "Pack order & generate invoice", "none", "view", "approve", "view", "none"),
  M("Dispatch", "Ready-to-dispatch queue", "none", "view", "view", "edit", "none"),
  M("Dispatch", "Mark dispatched & assign vehicle", "none", "view", "none", "approve", "none"),
  M("Dispatch", "Update in-transit checkpoints", "view", "view", "none", "edit", "none"),
  M("Payments", "Online payment at checkout", "create", "none", "none", "none", "view"),
  M("Payments", "Gateway settlement reconciliation", "none", "view", "none", "none", "approve"),
  M("Payments", "COD collection & write-off", "none", "view", "none", "view", "approve"),
  M("Payments", "Buyer credit limits & exposure", "view", "edit", "none", "none", "approve"),
  M("Reports", "Sales, fulfilment & expiry reports", "none", "view", "view", "view", "view"),
  M("Integrations", "Run ERP inventory sync", "none", "approve", "none", "none", "none"),
  M("Governance", "Audit log of every action", "none", "view", "none", "none", "view"),
  M("Governance", "Notifications centre", "view", "view", "view", "view", "view"),
];

const SUMMARY: Record<Role, string> = {
  buyer: "Self-service only: own catalog, cart, orders, payments and tracking. No visibility of other buyers or inventory internals.",
  admin: "Full operational control: orders, FEFO overrides, inventory, discounts, ERP sync, reports and audit.",
  warehouse: "Floor execution: pick lists, batch locations, packing and invoice generation. Read-only on commercials.",
  dispatch: "Outbound only: ready cartons, vehicle assignment, dispatch confirmation and in-transit checkpoints.",
  finance: "Money trail: settlements, COD collections, credit exposure, financial reports and audit visibility.",
};

function Cell({ level }: { level: Level }) {
  const m = LEVEL_META[level];
  return (
    <span
      className={cn(
        "inline-flex min-w-[62px] items-center justify-center rounded-md border px-2 py-1 text-[11px] font-semibold",
        m.cls,
      )}
      title={m.label}
    >
      <span className="hidden sm:inline">{m.label}</span>
      <span className="sm:hidden">{m.short}</span>
    </span>
  );
}

function PermissionsPage() {
  const modules = Array.from(new Set(CAPABILITIES.map((c) => c.module)));

  return (
    <AppShell role="admin">
      <SectionHeader
        title="Permissions matrix"
        subtitle="Exactly what each role can view, create, edit or approve across the platform."
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {(Object.keys(LEVEL_META) as Level[]).map((l) => (
          <Cell key={l} level={l} />
        ))}
      </div>

      <div className="mb-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {ROLES.map((r) => (
          <div key={r.id} className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-2">
              <span className={cn("size-2.5 rounded-full bg-gradient-to-br", r.accent)} />
              <p className="font-display text-sm font-semibold">{r.label}</p>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{SUMMARY[r.id]}</p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-secondary/60 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Capability</th>
              {ROLES.map((r) => (
                <th key={r.id} className="px-4 py-3 text-left font-semibold">
                  {r.shortLabel}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {modules.map((mod) => (
              <Fragment key={mod}>
                <tr className="bg-muted/40">
                  <td
                    colSpan={ROLES.length + 1}
                    className="px-4 py-2 font-display text-xs font-semibold uppercase tracking-wide text-foreground"
                  >
                    {mod}
                  </td>
                </tr>
                {CAPABILITIES.filter((c) => c.module === mod).map((c) => (
                  <tr key={`${mod}-${c.ability}`} className="border-t">
                    <td className="px-4 py-2.5 text-foreground">{c.ability}</td>
                    {ROLES.map((r) => (
                      <td key={r.id} className="px-4 py-2.5">
                        <Cell level={c.perms[r.id]} />
                      </td>
                    ))}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
