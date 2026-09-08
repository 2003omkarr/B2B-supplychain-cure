import { useState } from "react";
import { UserPlus, Sparkles, Store, ShieldCheck, Building2 } from "lucide-react";
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

export function AddBuyerModal() {
  const { addBuyer } = useStore();
  const [open, setOpen] = useState(false);

  const [shopName, setShopName] = useState("");
  const [owner, setOwner] = useState("");
  const [phone, setPhone] = useState("");
  const [gstin, setGstin] = useState("");
  const [drugLicense, setDrugLicense] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Pune");
  const [state, setStateName] = useState("Maharashtra");
  const [pincode, setPincode] = useState("411001");
  const [creditLimit, setCreditLimit] = useState("300000");

  const applyPresetMedPlus = () => {
    setShopName("MedPlus Pharmacy Franchise #42");
    setOwner("Dr. Rajesh Kumar");
    setPhone("+91 98765 12340");
    setGstin("27AAAAA0000A1Z5");
    setDrugLicense("MH-PUN-20B-18829");
    setAddress("Shop 4, Seasons Mall Road, Magarpatta");
    setCity("Pune");
    setStateName("Maharashtra");
    setPincode("411028");
    setCreditLimit("500000");
    toast.info("Preset applied: MedPlus Pharmacy Franchise");
  };

  const applyPresetGuardian = () => {
    setShopName("Guardian Healthcare & Medico");
    setOwner("Sunil Sharma");
    setPhone("+91 98112 33445");
    setGstin("07BBBBB1111B1Z2");
    setDrugLicense("DL-NDL-20B-9941");
    setAddress("Plot 14, Main Market, Lajpat Nagar");
    setCity("New Delhi");
    setStateName("Delhi");
    setPincode("110024");
    setCreditLimit("400000");
    toast.info("Preset applied: Guardian Healthcare");
  };

  const applyPresetSunrise = () => {
    setShopName("Sunrise Community Pharmacy");
    setOwner("Anita Patil");
    setPhone("+91 97654 88990");
    setGstin("27CCCCC2222C1Z9");
    setDrugLicense("MH-MUM-20B-4410");
    setAddress("12 Station Road, Dadar West");
    setCity("Mumbai");
    setStateName("Maharashtra");
    setPincode("400028");
    setCreditLimit("250000");
    toast.info("Preset applied: Sunrise Pharmacy");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName.trim() || !owner.trim()) {
      toast.error("Please fill in Pharmacy Shop Name and Owner Name.");
      return;
    }

    addBuyer({
      shopName,
      owner,
      phone: phone || "+91 98000 00000",
      gstin: gstin || "27ABCDE1234F1Z5",
      drugLicense: drugLicense || "MH-PUN-20B-0000",
      address: address || "Main Market",
      city: city || "Pune",
      state: state || "Maharashtra",
      pincode: pincode || "411001",
      creditLimit: Number(creditLimit) || 200000,
    });

    toast.success(`Registered new pharmacy buyer: ${shopName}!`);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1.5 shadow-sm">
          <UserPlus className="size-4" />
          Register New Buyer
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl">
            <Store className="size-5 text-primary" />
            Register Retail Pharmacy Account
          </DialogTitle>
          <DialogDescription>
            Onboard a new B2B retail pharmacy buyer account with verified Drug License & Credit Limit.
          </DialogDescription>
        </DialogHeader>

        {/* Presets bar */}
        <div className="rounded-xl border bg-secondary/40 p-3.5 backdrop-blur">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Sparkles className="size-3.5 text-amber-500" />
            Quick Demo Presets:
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={applyPresetMedPlus}
              className="h-8 gap-1 text-xs hover:border-primary/40 hover:bg-primary/10"
            >
              <Building2 className="size-3 text-primary" />
              MedPlus Franchise
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={applyPresetGuardian}
              className="h-8 gap-1 text-xs hover:border-sky-500/40 hover:bg-sky-500/10"
            >
              <ShieldCheck className="size-3 text-sky-500" />
              Guardian Healthcare
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={applyPresetSunrise}
              className="h-8 gap-1 text-xs hover:border-emerald-500/40 hover:bg-emerald-500/10"
            >
              <Store className="size-3 text-emerald-500" />
              Sunrise Medico
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="buyer-shop">Pharmacy Shop Name *</Label>
              <Input
                id="buyer-shop"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="e.g. MedPlus Pharmacy #42"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="buyer-owner">Owner / Pharmacist Name *</Label>
              <Input
                id="buyer-owner"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                placeholder="e.g. Dr. Rajesh Kumar"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="buyer-phone">Phone Number</Label>
              <Input
                id="buyer-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="buyer-credit">Approved Credit Limit (₹) *</Label>
              <Input
                id="buyer-credit"
                type="number"
                value={creditLimit}
                onChange={(e) => setCreditLimit(e.target.value)}
                placeholder="300000"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="buyer-gstin">GSTIN (15-digit)</Label>
              <Input
                id="buyer-gstin"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                placeholder="27AAAAA0000A1Z5"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="buyer-dl">Drug License No (Form 20B/21B)</Label>
              <Input
                id="buyer-dl"
                value={drugLicense}
                onChange={(e) => setDrugLicense(e.target.value)}
                placeholder="MH-PUN-20B-18829"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="buyer-address">Address</Label>
            <Input
              id="buyer-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Shop No 4, Main Market"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="buyer-city">City</Label>
              <Input
                id="buyer-city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Pune"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="buyer-state">State</Label>
              <Input
                id="buyer-state"
                value={state}
                onChange={(e) => setStateName(e.target.value)}
                placeholder="Maharashtra"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="buyer-pin">Pincode</Label>
              <Input
                id="buyer-pin"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="411001"
              />
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
              <UserPlus className="size-4" />
              Onboard Buyer Account
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
