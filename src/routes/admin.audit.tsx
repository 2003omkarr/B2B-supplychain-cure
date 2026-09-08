import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/pharma/AppShell";
import { SectionHeader, fmtDateTime } from "@/components/pharma/bits";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/pharma/store";

export const Route = createFileRoute("/admin/audit")({
  head: () => ({
    meta: [
      { title: "Audit Log — PharmaConnect Admin" },
      { name: "description", content: "Immutable trail of every order, allocation, discount and sync action." },
      { property: "og:title", content: "Audit Log — PharmaConnect Admin" },
      { property: "og:description", content: "Full traceability of who did what and when." },
    ],
  }),
  component: Audit,
});

function Audit() {
  const { state } = useStore();
  const [q, setQ] = useState("");
  const rows = state.audit.filter((a) =>
    q ? `${a.actor} ${a.action} ${a.entity} ${a.detail}`.toLowerCase().includes(q.toLowerCase()) : true,
  );

  return (
    <AppShell role="admin">
      <SectionHeader title="Audit log" subtitle={`${rows.length} recorded actions, newest first`} />
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search actor, action or order…"
        className="mb-4 max-w-sm"
        aria-label="Search audit log"
      />
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="bg-secondary/60 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              {["When", "Actor", "Role", "Action", "Entity", "Detail"].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id} className="border-t">
                <td className="whitespace-nowrap px-4 py-2.5 text-xs text-muted-foreground">{fmtDateTime(a.at)}</td>
                <td className="px-4 py-2.5 font-medium">{a.actor}</td>
                <td className="px-4 py-2.5 text-xs uppercase tracking-wide text-muted-foreground">{a.role}</td>
                <td className="px-4 py-2.5">
                  <span className="rounded-md border bg-secondary/60 px-2 py-0.5 text-[11px] font-semibold">
                    {a.action}
                  </span>
                </td>
                <td className="px-4 py-2.5 tabular">{a.entity}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{a.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
