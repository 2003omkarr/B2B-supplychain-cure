import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/pharma/AppShell";
import { EmptyState, SectionHeader, fmtDateTime } from "@/components/pharma/bits";
import { Button } from "@/components/ui/button";
import { inr, useStore } from "@/lib/pharma/store";

export const Route = createFileRoute("/dispatch/in-transit")({
  head: () => ({
    meta: [
      { title: "In Transit — PharmaConnect Dispatch" },
      { name: "description", content: "Shipments on the road with AWB, vehicle, driver and delivery confirmation." },
      { property: "og:title", content: "In Transit — PharmaConnect Dispatch" },
      { property: "og:description", content: "Confirm deliveries and close out shipments." },
    ],
  }),
  component: InTransit,
});

function InTransit() {
  const { state, advanceOrder } = useStore();
  const rows = state.orders.filter((o) => o.status === "DISPATCHED");

  return (
    <AppShell role="dispatch">
      <SectionHeader title="In transit" subtitle="Confirm delivery once the driver reports handover" />
      {rows.length === 0 ? (
        <EmptyState title="No active shipments" body="Dispatch a packed order to see it here." />
      ) : (
        <div className="space-y-3">
          {rows.map((o) => {
            const b = state.buyers.find((x) => x.id === o.buyerId);
            return (
              <div key={o.id} className="rounded-xl border bg-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-base font-semibold">{o.code}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {b?.shopName}, {b?.city} · AWB {o.dispatch?.awb} · {o.dispatch?.vehicle} ·{" "}
                      {o.dispatch?.driver}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      ETA {o.dispatch ? fmtDateTime(o.dispatch.eta) : "—"} ·{" "}
                      {o.paymentMode === "COD" ? `Collect ${inr(o.total)}` : "Prepaid"}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      advanceOrder(o.id, "DELIVERED", "Delivery Partner");
                      toast.success(`${o.code} marked delivered`);
                    }}
                  >
                    <CheckCircle2 className="size-4" /> Confirm delivery
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
