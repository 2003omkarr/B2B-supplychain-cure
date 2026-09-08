import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Printer, ChevronLeft, ShieldCheck } from "lucide-react";
import { inr, inr2, useStore } from "@/lib/pharma/store";
import { fmtDate } from "@/components/pharma/bits";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/orders/$id_/invoice")({
  head: () => ({
    meta: [{ title: "Tax Invoice — PharmaConnect" }],
  }),
  component: InvoicePrintView,
  notFoundComponent: () => <div>Order not found</div>,
});

// A helper to convert numbers to words (simplified for demo)
function numberToWords(num: number): string {
  if (num === 0) return "Zero";
  const a = ["", "One ", "Two ", "Three ", "Four ", "Five ", "Six ", "Seven ", "Eight ", "Nine ", "Ten ", "Eleven ", "Twelve ", "Thirteen ", "Fourteen ", "Fifteen ", "Sixteen ", "Seventeen ", "Eighteen ", "Nineteen "];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  
  if (num < 20) return a[num];
  if (num < 100) return b[Math.floor(num / 10)] + (num % 10 !== 0 ? " " + a[num % 10] : "");
  if (num < 1000) return a[Math.floor(num / 100)] + "Hundred " + (num % 100 !== 0 ? "and " + numberToWords(num % 100) : "");
  if (num < 100000) return numberToWords(Math.floor(num / 1000)) + "Thousand " + (num % 1000 !== 0 ? numberToWords(num % 1000) : "");
  if (num < 10000000) return numberToWords(Math.floor(num / 100000)) + "Lakh " + (num % 100000 !== 0 ? numberToWords(num % 100000) : "");
  return num.toString();
}

function InvoicePrintView() {
  const { id } = Route.useParams();
  const { state } = useStore();
  const navigate = useNavigate();
  const order = state.orders.find((o) => o.id === id);
  if (!order) throw notFound();

  const buyer = state.buyers.find((b) => b.id === order.buyerId);
  const invoiceNo = order.invoiceNo || `INV-${order.code.split("-")[1]}`;

  useEffect(() => {
    // Automatically trigger print dialog shortly after load
    const timer = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-muted/30 print:bg-white">
      {/* Non-printable controls */}
      <div className="sticky top-0 z-50 flex items-center justify-between border-b bg-background/80 px-6 py-3 backdrop-blur print:hidden">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: `/admin/orders/${id}` })}>
          <ChevronLeft className="mr-1 size-4" /> Back to Order
        </Button>
        <div className="flex items-center gap-3">
          <Button size="sm" onClick={() => window.print()}>
            <Printer className="mr-2 size-4" /> Print / Save PDF
          </Button>
        </div>
      </div>

      {/* Printable A4 Container */}
      <div className="mx-auto max-w-[210mm] bg-white p-[15mm] text-black shadow-lg print:m-0 print:max-w-none print:shadow-none sm:my-8 sm:p-[20mm]">
        {/* Header */}
        <div className="flex items-start justify-between border-b-2 border-black pb-6">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-primary">PharmaConnect</h1>
            <p className="mt-1 text-sm font-semibold">Distributors Pvt. Ltd.</p>
            <div className="mt-2 text-xs leading-tight text-gray-600">
              <p>123 Logistics Park, Phase 1</p>
              <p>Andheri East, Mumbai, MH 400069</p>
              <p className="mt-1"><span className="font-semibold text-gray-800">GSTIN:</span> 27AADCP1234F1Z5</p>
              <p><span className="font-semibold text-gray-800">DL No:</span> MH-MZ5-123456</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold uppercase tracking-widest text-gray-800">Tax Invoice</h2>
            <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
              <span className="text-gray-500">Invoice No:</span>
              <span className="font-semibold">{invoiceNo}</span>
              <span className="text-gray-500">Date:</span>
              <span className="font-semibold">{fmtDate(order.createdAt)}</span>
              <span className="text-gray-500">Order Ref:</span>
              <span className="font-semibold">{order.code}</span>
              <span className="text-gray-500">Payment:</span>
              <span className="font-semibold uppercase">{order.paymentStatus}</span>
            </div>
          </div>
        </div>

        {/* Billed To */}
        <div className="mt-6 border border-gray-300 p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Billed To (Buyer)</h3>
          <p className="mt-2 text-base font-bold">{buyer?.shopName}</p>
          <p className="mt-1 text-sm text-gray-600">{buyer?.address}</p>
          <p className="text-sm text-gray-600">{buyer?.city}, {buyer?.state} - {buyer?.pincode}</p>
          <div className="mt-2 flex gap-6 text-sm">
            <p><span className="font-semibold">GSTIN:</span> {buyer?.gstin || "URD"}</p>
            <p><span className="font-semibold">DL No:</span> {buyer?.dlNo || "Applied"}</p>
          </div>
        </div>

        {/* Line Items */}
        <div className="mt-6">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-y-2 border-black bg-gray-50/50 text-gray-700">
                <th className="py-2 pr-2">#</th>
                <th className="py-2 pr-2">Product Description</th>
                <th className="py-2 pr-2">HSN</th>
                <th className="py-2 pr-2">Batch</th>
                <th className="py-2 pr-2">Expiry</th>
                <th className="py-2 pr-2 text-right">Qty</th>
                <th className="py-2 pr-2 text-right">Rate</th>
                <th className="py-2 pr-2 text-right">Taxable</th>
                <th className="py-2 pr-2 text-right">CGST</th>
                <th className="py-2 pr-2 text-right">SGST</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {order.lines.map((line, i) => {
                const product = state.products.find((p) => p.id === line.productId);
                const hsn = product?.hsnCode || "3004";
                const gstRate = product?.gst || 12;
                const cgstRate = gstRate / 2;
                const sgstRate = gstRate / 2;
                
                // Group by batches if multiple allocations exist
                const allocations = line.allocations.length > 0 
                  ? line.allocations 
                  : [{ batchNo: "PENDING", expiry: "-", qty: line.qty }];

                return allocations.map((alloc, j) => {
                  const qty = alloc.qty;
                  const rate = line.unitPrice;
                  const taxable = qty * rate;
                  const cgstAmt = taxable * (cgstRate / 100);
                  const sgstAmt = taxable * (sgstRate / 100);
                  const lineTotal = taxable + cgstAmt + sgstAmt;

                  return (
                    <tr key={`${line.productId}-${alloc.batchNo}`} className="align-top">
                      <td className="py-3 pr-2 text-gray-500">{j === 0 ? i + 1 : ""}</td>
                      <td className="py-3 pr-2 font-medium">
                        {j === 0 ? line.name : ""}
                        {j === 0 && <div className="text-[10px] text-gray-500 font-normal mt-0.5">{product?.packSize} · {product?.manufacturer}</div>}
                      </td>
                      <td className="py-3 pr-2 text-gray-600">{j === 0 ? hsn : ""}</td>
                      <td className="py-3 pr-2 font-semibold text-gray-800">{alloc.batchNo}</td>
                      <td className="py-3 pr-2 text-gray-600">{alloc.expiry.slice(0, 7)}</td>
                      <td className="py-3 pr-2 text-right font-semibold">{qty}</td>
                      <td className="py-3 pr-2 text-right">{inr2(rate)}</td>
                      <td className="py-3 pr-2 text-right">{inr2(taxable)}</td>
                      <td className="py-3 pr-2 text-right">
                        <div>{inr2(cgstAmt)}</div>
                        <div className="text-[9px] text-gray-500">@{cgstRate}%</div>
                      </td>
                      <td className="py-3 pr-2 text-right">
                        <div>{inr2(sgstAmt)}</div>
                        <div className="text-[9px] text-gray-500">@{sgstRate}%</div>
                      </td>
                      <td className="py-3 text-right font-semibold">{inr2(lineTotal)}</td>
                    </tr>
                  );
                });
              })}
            </tbody>
          </table>
        </div>

        {/* Totals & Summary */}
        <div className="mt-8 flex gap-8">
          <div className="flex-1 space-y-4">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h4 className="text-xs font-semibold text-gray-700">Total in Words</h4>
              <p className="mt-1 text-sm font-medium italic text-gray-800">
                Rupees {numberToWords(Math.round(order.total))} Only
              </p>
            </div>
            
            <div className="text-[10px] text-gray-500">
              <p className="font-semibold text-gray-700">Terms & Conditions:</p>
              <ul className="mt-1 list-inside list-disc space-y-0.5">
                <li>Goods once sold will not be taken back.</li>
                <li>Interest @ 18% p.a. will be charged if payment is delayed.</li>
                <li>Subject to Mumbai jurisdiction.</li>
              </ul>
            </div>
          </div>
          
          <div className="w-72 rounded-xl border-2 border-black p-4 shadow-sm">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">Total Taxable Value</dt>
                <dd className="font-semibold tabular-nums">{inr2(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Total CGST</dt>
                <dd className="tabular-nums">{inr2(order.gstAmount / 2)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Total SGST</dt>
                <dd className="tabular-nums">{inr2(order.gstAmount / 2)}</dd>
              </div>
              <div className="my-2 border-t border-dashed border-gray-300" />
              <div className="flex justify-between text-lg font-bold">
                <dt>Grand Total</dt>
                <dd className="tabular-nums text-primary">{inr(order.total)}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Signatures */}
        <div className="mt-16 flex justify-between text-sm">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-48 items-end justify-center border-b border-gray-400 pb-1">
              {/* Receiver signature line */}
            </div>
            <p className="mt-2 text-gray-600">Receiver's Signature / Seal</p>
          </div>
          
          <div className="text-center">
            <div className="mx-auto flex h-12 w-48 items-end justify-center border-b border-gray-400 pb-1">
              <div className="flex items-center gap-1 font-display font-semibold text-primary/40 opacity-50">
                <ShieldCheck className="size-4" /> System Generated
              </div>
            </div>
            <p className="mt-2 font-semibold">For PharmaConnect</p>
            <p className="text-xs text-gray-500">Authorized Signatory</p>
          </div>
        </div>
      </div>
    </div>
  );
}
