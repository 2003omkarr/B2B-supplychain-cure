import type { AppState, Batch, Buyer, Order, Product } from "./types";

function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PRODUCTS: Omit<Product, "id">[] = [
  {
    name: "Amoxyclav 625",
    brand: "Amoxyclav",
    composition: "Amoxicillin 500mg + Clavulanic Acid 125mg",
    manufacturer: "Cipla Ltd",
    schedule: "H",
    hsn: "30049099",
    gst: 12,
    packSize: "10 Tablets",
    mrp: 212,
    ptr: 168,
    category: "Antibiotics",
    coldChain: false,
  },
  {
    name: "Pantorex 40",
    brand: "Pantorex",
    composition: "Pantoprazole 40mg",
    manufacturer: "Sun Pharma",
    schedule: "H",
    hsn: "30049099",
    gst: 12,
    packSize: "15 Tablets",
    mrp: 148,
    ptr: 112,
    category: "Gastro",
    coldChain: false,
  },
  {
    name: "Glycomet GP2",
    brand: "Glycomet",
    composition: "Metformin 500mg + Glimepiride 2mg",
    manufacturer: "USV Pvt Ltd",
    schedule: "H",
    hsn: "30049099",
    gst: 12,
    packSize: "15 Tablets",
    mrp: 176,
    ptr: 134,
    category: "Diabetes",
    coldChain: false,
  },
  {
    name: "Telmicard 40",
    brand: "Telmicard",
    composition: "Telmisartan 40mg",
    manufacturer: "Micro Labs",
    schedule: "H",
    hsn: "30049099",
    gst: 12,
    packSize: "10 Tablets",
    mrp: 132,
    ptr: 98,
    category: "Cardiac",
    coldChain: false,
  },
  {
    name: "Rosulip 10",
    brand: "Rosulip",
    composition: "Rosuvastatin 10mg",
    manufacturer: "Cipla Ltd",
    schedule: "H",
    hsn: "30049099",
    gst: 12,
    packSize: "10 Tablets",
    mrp: 189,
    ptr: 141,
    category: "Cardiac",
    coldChain: false,
  },
  {
    name: "Montek LC",
    brand: "Montek",
    composition: "Montelukast 10mg + Levocetirizine 5mg",
    manufacturer: "Sun Pharma",
    schedule: "H",
    hsn: "30049099",
    gst: 12,
    packSize: "10 Tablets",
    mrp: 224,
    ptr: 172,
    category: "Respiratory",
    coldChain: false,
  },
  {
    name: "Human Mixtard 30/70",
    brand: "Mixtard",
    composition: "Insulin Human 100IU/ml",
    manufacturer: "Novo Nordisk",
    schedule: "H",
    hsn: "30043910",
    gst: 5,
    packSize: "10ml Vial",
    mrp: 168,
    ptr: 132,
    category: "Insulin",
    coldChain: true,
  },
  {
    name: "Lantus SoloStar",
    brand: "Lantus",
    composition: "Insulin Glargine 100IU/ml",
    manufacturer: "Sanofi India",
    schedule: "H",
    hsn: "30043910",
    gst: 5,
    packSize: "3ml Pen",
    mrp: 892,
    ptr: 724,
    category: "Insulin",
    coldChain: true,
  },
  {
    name: "Azithral 500",
    brand: "Azithral",
    composition: "Azithromycin 500mg",
    manufacturer: "Alembic Pharma",
    schedule: "H",
    hsn: "30049099",
    gst: 12,
    packSize: "5 Tablets",
    mrp: 138,
    ptr: 104,
    category: "Antibiotics",
    coldChain: false,
  },
  {
    name: "Dolo 650",
    brand: "Dolo",
    composition: "Paracetamol 650mg",
    manufacturer: "Micro Labs",
    schedule: "OTC",
    hsn: "30049099",
    gst: 12,
    packSize: "15 Tablets",
    mrp: 34,
    ptr: 24,
    category: "Analgesics",
    coldChain: false,
  },
  {
    name: "Zerodol SP",
    brand: "Zerodol",
    composition: "Aceclofenac + Paracetamol + Serratiopeptidase",
    manufacturer: "Ipca Labs",
    schedule: "H",
    hsn: "30049099",
    gst: 12,
    packSize: "10 Tablets",
    mrp: 128,
    ptr: 94,
    category: "Analgesics",
    coldChain: false,
  },
  {
    name: "Thyronorm 50mcg",
    brand: "Thyronorm",
    composition: "Thyroxine Sodium 50mcg",
    manufacturer: "Abbott India",
    schedule: "H",
    hsn: "30049099",
    gst: 12,
    packSize: "120 Tablets",
    mrp: 196,
    ptr: 152,
    category: "Hormones",
    coldChain: false,
  },
  {
    name: "Augmentin Duo Syrup",
    brand: "Augmentin",
    composition: "Amoxicillin 200mg + Clavulanate 28.5mg / 5ml",
    manufacturer: "GSK Pharma",
    schedule: "H",
    hsn: "30049099",
    gst: 12,
    packSize: "30ml Bottle",
    mrp: 172,
    ptr: 133,
    category: "Pediatric",
    coldChain: false,
  },
  {
    name: "Shelcal 500",
    brand: "Shelcal",
    composition: "Calcium Carbonate 500mg + Vitamin D3",
    manufacturer: "Torrent Pharma",
    schedule: "OTC",
    hsn: "30045090",
    gst: 12,
    packSize: "15 Tablets",
    mrp: 118,
    ptr: 88,
    category: "Supplements",
    coldChain: false,
  },
  {
    name: "Neurobion Forte",
    brand: "Neurobion",
    composition: "Vitamin B-Complex with B12",
    manufacturer: "Procter & Gamble",
    schedule: "OTC",
    hsn: "30045090",
    gst: 12,
    packSize: "30 Tablets",
    mrp: 42,
    ptr: 31,
    category: "Supplements",
    coldChain: false,
  },
  {
    name: "Clavam 375",
    brand: "Clavam",
    composition: "Amoxicillin 250mg + Clavulanic Acid 125mg",
    manufacturer: "Alkem Labs",
    schedule: "H",
    hsn: "30049099",
    gst: 12,
    packSize: "10 Tablets",
    mrp: 158,
    ptr: 119,
    category: "Antibiotics",
    coldChain: false,
  },
  {
    name: "Ecosprin AV 75",
    brand: "Ecosprin",
    composition: "Aspirin 75mg + Atorvastatin 10mg",
    manufacturer: "USV Pvt Ltd",
    schedule: "H",
    hsn: "30049099",
    gst: 12,
    packSize: "10 Capsules",
    mrp: 96,
    ptr: 71,
    category: "Cardiac",
    coldChain: false,
  },
  {
    name: "Duolin Respules",
    brand: "Duolin",
    composition: "Levosalbutamol + Ipratropium",
    manufacturer: "Cipla Ltd",
    schedule: "H",
    hsn: "30049099",
    gst: 12,
    packSize: "5 x 2.5ml",
    mrp: 108,
    ptr: 82,
    category: "Respiratory",
    coldChain: false,
  },
  {
    name: "Rabekind DSR",
    brand: "Rabekind",
    composition: "Rabeprazole 20mg + Domperidone 30mg",
    manufacturer: "Mankind Pharma",
    schedule: "H",
    hsn: "30049099",
    gst: 12,
    packSize: "10 Capsules",
    mrp: 142,
    ptr: 104,
    category: "Gastro",
    coldChain: false,
  },
  {
    name: "Betadine Gargle",
    brand: "Betadine",
    composition: "Povidone Iodine 2% w/v",
    manufacturer: "Win-Medicare",
    schedule: "OTC",
    hsn: "30049099",
    gst: 12,
    packSize: "100ml Bottle",
    mrp: 158,
    ptr: 121,
    category: "Antiseptics",
    coldChain: false,
  },
  {
    name: "Rotavac Vaccine",
    brand: "Rotavac",
    composition: "Rotavirus Vaccine (Live Attenuated)",
    manufacturer: "Bharat Biotech",
    schedule: "H1",
    hsn: "30022012",
    gst: 5,
    packSize: "0.5ml Vial",
    mrp: 1024,
    ptr: 862,
    category: "Vaccines",
    coldChain: true,
  },
  {
    name: "Alprax 0.25",
    brand: "Alprax",
    composition: "Alprazolam 0.25mg",
    manufacturer: "Torrent Pharma",
    schedule: "X",
    hsn: "30049099",
    gst: 12,
    packSize: "15 Tablets",
    mrp: 48,
    ptr: 35,
    category: "Neuro",
    coldChain: false,
  },
  {
    name: "Levipil 500",
    brand: "Levipil",
    composition: "Levetiracetam 500mg",
    manufacturer: "Intas Pharma",
    schedule: "H",
    hsn: "30049099",
    gst: 12,
    packSize: "10 Tablets",
    mrp: 268,
    ptr: 208,
    category: "Neuro",
    coldChain: false,
  },
  {
    name: "Zincovit Tablets",
    brand: "Zincovit",
    composition: "Multivitamin + Multimineral + Zinc",
    manufacturer: "Apex Labs",
    schedule: "OTC",
    hsn: "30045090",
    gst: 12,
    packSize: "15 Tablets",
    mrp: 108,
    ptr: 79,
    category: "Supplements",
    coldChain: false,
  },
];

const BUYERS: Buyer[] = [
  {
    id: "BUY-001",
    shopName: "Shree Medicals",
    owner: "Sarthak Kharwade",
    gstin: "27AABCS1429B1ZP",
    drugLicense: "MH-PN-20B-441209",
    phone: "+91 98220 41120",
    address: "Shop 4, Sai Chambers, FC Road",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411004",
    creditLimit: 250000,
    outstanding: 48200,
  },
  {
    id: "BUY-002",
    shopName: "Aarogya Chemist",
    owner: "Nilesh Patil",
    gstin: "27AACFA8821K1Z4",
    drugLicense: "MH-NS-20B-338710",
    phone: "+91 98191 77340",
    address: "12 Panchvati Road",
    city: "Nashik",
    state: "Maharashtra",
    pincode: "422003",
    creditLimit: 180000,
    outstanding: 92400,
  },
  {
    id: "BUY-003",
    shopName: "LifeLine Pharmacy",
    owner: "Reena Shah",
    gstin: "27AAGCL2210M1ZQ",
    drugLicense: "MH-MU-20B-118822",
    phone: "+91 99300 21188",
    address: "Ground Floor, Hill View, Andheri West",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400058",
    creditLimit: 400000,
    outstanding: 121500,
  },
  {
    id: "BUY-004",
    shopName: "Ganesh Medical Stores",
    owner: "Amit Deshpande",
    gstin: "27AAECG7712L1ZR",
    drugLicense: "MH-NG-20B-990112",
    phone: "+91 90280 66412",
    address: "Near Civil Lines, Sitabuldi",
    city: "Nagpur",
    state: "Maharashtra",
    pincode: "440012",
    creditLimit: 150000,
    outstanding: 21800,
  },
];

const WAREHOUSES = ["WH-Pune-Central", "WH-Pune-Central", "WH-Bhiwandi"];

function pick<T>(arr: readonly T[], r: number): T {
  return arr[Math.floor(r * arr.length)] as T;
}

function iso(d: Date) {
  return d.toISOString();
}
function addDays(base: Date, n: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}

export function buildSeed(): AppState {
  const rnd = mulberry32(20260907);
  const now = new Date();

  const products: Product[] = PRODUCTS.map((p, i) => ({
    ...p,
    id: `SKU-${String(i + 1).padStart(4, "0")}`,
  }));

  const batches: Batch[] = [];
  products.forEach((p, pi) => {
    const count = 2 + Math.floor(rnd() * 2);
    for (let b = 0; b < count; b++) {
      // spread expiries: some near-expiry, most healthy
      const bucket = rnd();
      const daysToExpiry =
        bucket < 0.14
          ? 25 + Math.floor(rnd() * 60)
          : bucket < 0.34
            ? 95 + Math.floor(rnd() * 85)
            : 220 + Math.floor(rnd() * 620);
      const expiry = addDays(now, daysToExpiry);
      const mfg = addDays(expiry, -730);
      batches.push({
        id: `BAT-${String(pi + 1).padStart(3, "0")}-${b + 1}`,
        productId: p.id,
        batchNo: `${p.brand.slice(0, 3).toUpperCase()}${expiry.getFullYear() % 100}${String(
          expiry.getMonth() + 1,
        ).padStart(2, "0")}${b + 1}`,
        mfgDate: iso(mfg),
        expiry: iso(expiry),
        qty: 40 + Math.floor(rnd() * 460),
        reserved: 0,
        warehouse: pick(WAREHOUSES, rnd()),
        rack: `R${1 + Math.floor(rnd() * 12)}-${String.fromCharCode(65 + Math.floor(rnd() * 6))}${
          1 + Math.floor(rnd() * 9)
        }`,
      });
    }
  });

  // Historical orders across statuses so dashboards/reports look alive
  const orders: Order[] = [];
  const statuses: Order["status"][] = [
    "DELIVERED",
    "DELIVERED",
    "DELIVERED",
    "DISPATCHED",
    "PACKED",
    "PICKING",
    "ALLOCATED",
    "PLACED",
    "DELIVERED",
    "DELIVERED",
    "DISPATCHED",
    "CANCELLED",
  ];
  const modes: Order["paymentMode"][] = ["UPI", "COD", "CARD", "NETBANKING", "WALLET", "COD", "UPI"];

  statuses.forEach((status, i) => {
    const buyer = pick(BUYERS, rnd());
    const createdAt = addDays(now, -(1 + Math.floor(rnd() * 26)));
    const lineCount = 2 + Math.floor(rnd() * 4);
    const used = new Set<string>();
    const lines = [];
    for (let l = 0; l < lineCount; l++) {
      const p = pick(products, rnd());
      if (used.has(p.id)) continue;
      used.add(p.id);
      const qty = 5 + Math.floor(rnd() * 40);
      const pb = batches
        .filter((b) => b.productId === p.id)
        .sort((a, b) => +new Date(a.expiry) - +new Date(b.expiry));
      const allocations = [];
      let remaining = qty;
      for (const b of pb) {
        if (remaining <= 0) break;
        const take = Math.min(remaining, b.qty);
        if (take <= 0) continue;
        allocations.push({ batchId: b.id, batchNo: b.batchNo, expiry: b.expiry, qty: take });
        remaining -= take;
      }
      lines.push({
        productId: p.id,
        name: p.name,
        packSize: p.packSize,
        qty,
        unitPrice: p.ptr,
        discountPct: 0,
        gst: p.gst,
        allocations,
        picked: status !== "PLACED" && status !== "ALLOCATED",
      });
    }
    if (!lines.length) return;

    const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.qty, 0);
    const gstAmount = lines.reduce((s, l) => s + (l.unitPrice * l.qty * l.gst) / 100, 0);
    const mode = pick(modes, rnd());
    const code = `PC-${createdAt.getFullYear()}${String(createdAt.getMonth() + 1).padStart(2, "0")}-${String(
      1041 + i,
    )}`;

    const timeline = [
      { status: "PLACED" as const, label: "Order placed by buyer", at: iso(createdAt), by: buyer.shopName },
    ];
    const flowIdx = ["PLACED", "ALLOCATED", "PICKING", "PACKED", "DISPATCHED", "DELIVERED"].indexOf(
      status,
    );
    const actors = ["", "FEFO Engine", "Warehouse Staff", "Warehouse Staff", "Dispatch Desk", "Delivery Partner"];
    const labels = [
      "",
      "FEFO allocation completed",
      "Picking started",
      "Order packed & invoice generated",
      "Dispatched from warehouse",
      "Delivered to buyer",
    ];
    for (let s = 1; s <= flowIdx; s++) {
      timeline.push({
        status: ["PLACED", "ALLOCATED", "PICKING", "PACKED", "DISPATCHED", "DELIVERED"][s] as never,
        label: labels[s] as string,
        at: iso(addDays(createdAt, s * 0.4)),
        by: actors[s] as string,
      });
    }

    const dispatched = ["DISPATCHED", "DELIVERED"].includes(status);
    orders.push({
      id: `ORD-${1041 + i}`,
      code,
      buyerId: buyer.id,
      lines,
      status,
      createdAt: iso(createdAt),
      paymentMode: mode,
      paymentStatus:
        status === "CANCELLED"
          ? "REFUNDED"
          : mode === "COD"
            ? status === "DELIVERED"
              ? rnd() > 0.4
                ? "COD_COLLECTED"
                : "COD_PENDING"
              : "COD_PENDING"
            : "PAID",
      txnRef: mode === "COD" ? undefined : `TXN${Math.floor(rnd() * 9e9 + 1e9)}`,
      invoiceNo: flowIdx >= 3 ? `INV/26-27/${2200 + i}` : undefined,
      subtotal,
      discount: 0,
      gstAmount,
      total: Math.round(subtotal + gstAmount),
      timeline,
      fillRate: 100,
      dispatch: dispatched
        ? {
            courier: "BlueDart Surface",
            awb: `AWB${Math.floor(rnd() * 9e8 + 1e8)}`,
            vehicle: `MH12 ${String.fromCharCode(65 + Math.floor(rnd() * 26))}${String.fromCharCode(
              65 + Math.floor(rnd() * 26),
            )} ${1000 + Math.floor(rnd() * 8999)}`,
            driver: pick(["Ramesh Yadav", "Sanjay More", "Imran Shaikh"], rnd()),
            eta: iso(addDays(createdAt, 3)),
            checkpoints: [
              { label: "Picked up from warehouse", location: "Pune Central Hub", at: iso(addDays(createdAt, 2)), done: true },
              { label: "In transit", location: "Chakan Sorting Center", at: iso(addDays(createdAt, 2.3)), done: true },
              { label: "Out for delivery", location: buyer.city, at: iso(addDays(createdAt, 2.8)), done: status === "DELIVERED" },
              { label: "Delivered", location: buyer.shopName, at: iso(addDays(createdAt, 3)), done: status === "DELIVERED" },
            ],
          }
        : undefined,
    });
  });

  // reserve stock for open orders
  orders
    .filter((o) => !["DELIVERED", "CANCELLED"].includes(o.status))
    .forEach((o) =>
      o.lines.forEach((l) =>
        l.allocations.forEach((a) => {
          const b = batches.find((x) => x.id === a.batchId);
          if (b) b.reserved += a.qty;
        }),
      ),
    );

  const codCollections = orders
    .filter((o) => o.paymentStatus === "COD_COLLECTED")
    .map((o) => ({ orderId: o.id, amount: o.total, at: o.createdAt, by: "Finance Desk" }));

  return {
    version: 1,
    role: null,
    buyerId: "BUY-001",
    products,
    batches,
    buyers: BUYERS,
    orders: orders.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    cart: [],
    notifications: [
      {
        id: "NTF-1",
        title: "ERP inventory sync completed",
        body: "1,284 batch records reconciled from Marg ERP.",
        at: iso(addDays(now, -1)),
        audience: ["admin", "warehouse"],
        read: false,
      },
      {
        id: "NTF-2",
        title: "Near-expiry alert",
        body: "9 batches are expiring within 90 days. Discount offers auto-published to catalog.",
        at: iso(addDays(now, -1)),
        audience: ["admin", "finance", "buyer"],
        read: false,
      },
    ],
    audit: [
      {
        id: "AUD-1",
        at: iso(addDays(now, -1)),
        actor: "system",
        role: "system",
        action: "ERP_SYNC",
        entity: "inventory",
        detail: "Scheduled ERP inventory sync completed successfully.",
      },
    ],
    settings: {
      nearExpiryTier1Days: 90,
      nearExpiryTier1Pct: 18,
      nearExpiryTier2Days: 180,
      nearExpiryTier2Pct: 8,
      fefoAuto: true,
      erpLastSync: iso(addDays(now, -1)),
    },
    codCollections,
  };
}
