import { useState } from "react";
import { Plus, Sparkles, Zap, Snowflake, Pill, PackagePlus } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/pharma/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AddMedicineModal() {
  const { addProductWithBatch } = useStore();
  const [open, setOpen] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [composition, setComposition] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [category, setCategory] = useState("Antibiotics & Anti-Infectives");
  const [schedule, setSchedule] = useState<"H" | "H1" | "OTC" | "X">("H1");
  const [hsn, setHsn] = useState("3004");
  const [gst, setGst] = useState("12");
  const [packSize, setPackSize] = useState("1x10 Tablets");
  const [mrp, setMrp] = useState("180");
  const [ptr, setPtr] = useState("120");
  const [coldChain, setColdChain] = useState(false);

  // Batch fields
  const [batchNo, setBatchNo] = useState("");
  const [expiry, setExpiry] = useState("");
  const [qty, setQty] = useState("500");
  const [rack, setRack] = useState("R04-B2");

  // Helper to generate a default expiry (e.g. 18 months from now)
  const defaultExpiry = (months = 18) => {
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    return d.toISOString().split("T")[0] ?? "";
  };

  // Preset 1: Near Expiry Deal
  const applyPresetNearExpiry = () => {
    const nearExpiryDate = new Date();
    nearExpiryDate.setDate(nearExpiryDate.getDate() + 20); // 20 days left

    setName("Azithromycin 500mg Expiring Deal");
    setBrand("Aziwok 500");
    setComposition("Azithromycin IP 500mg");
    setManufacturer("Cipla Ltd");
    setCategory("Antibiotics & Anti-Infectives");
    setSchedule("H");
    setHsn("3004");
    setGst("12");
    setPackSize("1x5 Tablets");
    setMrp("140");
    setPtr("95");
    setColdChain(false);
    setBatchNo(`EXP-${Math.floor(1000 + Math.random() * 9000)}`);
    setExpiry(nearExpiryDate.toISOString().split("T")[0] ?? "");
    setQty("250");
    setRack("R01-A1");
    toast.info("Preset applied: Near-Expiry Flash Sale item");
  };

  // Preset 2: Cold Chain Biologic
  const applyPresetColdChain = () => {
    setName("Lantus Solostar Insulin 100IU");
    setBrand("Lantus");
    setComposition("Insulin Glargine 100 IU/ml");
    setManufacturer("Sanofi India");
    setCategory("Diabetes & Hormones");
    setSchedule("H");
    setHsn("3004");
    setGst("5");
    setPackSize("1 Pen x 3ml");
    setMrp("680");
    setPtr("490");
    setColdChain(true);
    setBatchNo(`CC-${Math.floor(1000 + Math.random() * 9000)}`);
    setExpiry(defaultExpiry(24));
    setQty("150");
    setRack("COLD-R02");
    toast.info("Preset applied: Cold-Chain Vaccine/Insulin");
  };

  // Preset 3: Schedule H1 Prescription Drug
  const applyPresetAntibiotic = () => {
    setName("Augmentin 625 Duo");
    setBrand("Augmentin");
    setComposition("Amoxycillin 500mg + Clavulanic Acid 125mg");
    setManufacturer("GSK Pharmaceuticals");
    setCategory("Antibiotics & Anti-Infectives");
    setSchedule("H1");
    setHsn("3004");
    setGst("12");
    setPackSize("1x10 Tablets");
    setMrp("220");
    setPtr("155");
    setColdChain(false);
    setBatchNo(`AUG-${Math.floor(1000 + Math.random() * 9000)}`);
    setExpiry(defaultExpiry(18));
    setQty("600");
    setRack("R08-C4");
    toast.info("Preset applied: Schedule H1 Antibiotic");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !batchNo.trim()) {
      toast.error("Please fill in Medicine Name and Batch Number.");
      return;
    }

    const mfgDate = new Date();
    mfgDate.setMonth(mfgDate.getMonth() - 2);

    addProductWithBatch(
      {
        name,
        brand: brand || name,
        composition: composition || name,
        manufacturer: manufacturer || "Generic Pharma",
        schedule,
        hsn: hsn || "3004",
        gst: Number(gst) || 12,
        packSize: packSize || "10 Units",
        mrp: Number(mrp) || 100,
        ptr: Number(ptr) || 70,
        category: category || "General Healthcare",
        coldChain,
      },
      {
        batchNo: batchNo || `BAT-${Math.floor(1000 + Math.random() * 9000)}`,
        mfgDate: mfgDate.toISOString(),
        expiry: expiry ? new Date(expiry).toISOString() : new Date(defaultExpiry(18)).toISOString(),
        qty: Number(qty) || 100,
        warehouse: "WH-Pune-Central",
        rack: rack || "R01-A1",
      }
    );

    toast.success(`Successfully added ${name} to inventory & buyer catalog!`);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1.5 shadow-sm">
          <Plus className="size-4" />
          Add Medicine & Batch
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl">
            <PackagePlus className="size-5 text-primary" />
            Add New Medicine SKU & Initial Stock Batch
          </DialogTitle>
          <DialogDescription>
            Register a new pharmaceutical SKU and allocate its initial batch to warehouse inventory.
          </DialogDescription>
        </DialogHeader>

        {/* 1-Click Demo Presets */}
        <div className="rounded-xl border bg-secondary/40 p-3.5 backdrop-blur">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Sparkles className="size-3.5 text-amber-500" />
            Demo Presets — 1-Click Quick Fill:
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={applyPresetNearExpiry}
              className="h-8 gap-1 text-xs hover:border-destructive/40 hover:bg-destructive/10"
            >
              <Zap className="size-3 text-destructive" />
              Near-Expiry Deal (20 Days Left)
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={applyPresetColdChain}
              className="h-8 gap-1 text-xs hover:border-sky-500/40 hover:bg-sky-500/10"
            >
              <Snowflake className="size-3 text-sky-500" />
              Cold-Chain Vaccine (2-8°C)
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={applyPresetAntibiotic}
              className="h-8 gap-1 text-xs hover:border-primary/40 hover:bg-primary/10"
            >
              <Pill className="size-3 text-primary" />
              Sch H1 Antibiotic
            </Button>
          </div>
        </div>

        {/* Form fields */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="med-name">Medicine / Brand Name *</Label>
              <Input
                id="med-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Augmentin 625 Duo"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="med-composition">Molecule / Composition</Label>
              <Input
                id="med-composition"
                value={composition}
                onChange={(e) => setComposition(e.target.value)}
                placeholder="e.g. Amoxycillin + Clavulanic Acid"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="med-mfg">Manufacturer</Label>
              <Input
                id="med-mfg"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                placeholder="e.g. GSK Pharmaceuticals"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="med-category">Category</Label>
              <Input
                id="med-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Antibiotics"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="med-schedule">Drug Schedule</Label>
              <Select
                value={schedule}
                onValueChange={(v) => setSchedule(v as any)}
              >
                <SelectTrigger id="med-schedule">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OTC">OTC (Over The Counter)</SelectItem>
                  <SelectItem value="H">Schedule H</SelectItem>
                  <SelectItem value="H1">Schedule H1</SelectItem>
                  <SelectItem value="X">Schedule X</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="med-pack">Pack Size</Label>
              <Input
                id="med-pack"
                value={packSize}
                onChange={(e) => setPackSize(e.target.value)}
                placeholder="10 Tablets"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="med-hsn">HSN Code</Label>
              <Input
                id="med-hsn"
                value={hsn}
                onChange={(e) => setHsn(e.target.value)}
                placeholder="3004"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="med-gst">GST Rate (%)</Label>
              <Input
                id="med-gst"
                type="number"
                value={gst}
                onChange={(e) => setGst(e.target.value)}
                placeholder="12"
              />
            </div>
            <div className="space-y-1.5 flex flex-col justify-end">
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer py-2">
                <input
                  type="checkbox"
                  checked={coldChain}
                  onChange={(e) => setColdChain(e.target.checked)}
                  className="size-4 accent-primary"
                />
                ❄️ Cold Chain (2-8°C)
              </label>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="med-ptr">PTR - Price to Retailer (₹) *</Label>
              <Input
                id="med-ptr"
                type="number"
                value={ptr}
                onChange={(e) => setPtr(e.target.value)}
                placeholder="120"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="med-mrp">MRP - Max Retail Price (₹) *</Label>
              <Input
                id="med-mrp"
                type="number"
                value={mrp}
                onChange={(e) => setMrp(e.target.value)}
                placeholder="180"
                required
              />
            </div>
          </div>

          {/* Initial Batch Stock Section */}
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <p className="font-display text-sm font-semibold text-foreground flex items-center gap-1.5">
              <PackagePlus className="size-4 text-primary" />
              Initial Warehouse Batch Allocation
            </p>

            <div className="grid gap-3 sm:grid-cols-4">
              <div className="space-y-1.5">
                <Label htmlFor="batch-no">Batch No *</Label>
                <Input
                  id="batch-no"
                  value={batchNo}
                  onChange={(e) => setBatchNo(e.target.value)}
                  placeholder="AUG-9081"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="batch-expiry">Expiry Date *</Label>
                <Input
                  id="batch-expiry"
                  type="date"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="batch-qty">Units In Stock *</Label>
                <Input
                  id="batch-qty"
                  type="number"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  placeholder="500"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="batch-rack">Rack Location</Label>
                <Input
                  id="batch-rack"
                  value={rack}
                  onChange={(e) => setRack(e.target.value)}
                  placeholder="R04-B2"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="gap-1.5">
              <Plus className="size-4" />
              Save Medicine & Batch
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
