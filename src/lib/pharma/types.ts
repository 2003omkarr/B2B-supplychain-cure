export type Role = "buyer" | "admin" | "warehouse" | "dispatch" | "finance";

export type OrderStatus =
  | "PLACED"
  | "ALLOCATED"
  | "PICKING"
  | "PACKED"
  | "DISPATCHED"
  | "DELIVERED"
  | "CANCELLED";

export const ORDER_FLOW: OrderStatus[] = [
  "PLACED",
  "ALLOCATED",
  "PICKING",
  "PACKED",
  "DISPATCHED",
  "DELIVERED",
];

export type PaymentMode = "UPI" | "CARD" | "NETBANKING" | "WALLET" | "COD";
export type PaymentStatus = "PAID" | "PENDING" | "COD_PENDING" | "COD_COLLECTED" | "REFUNDED";

export interface Product {
  id: string;
  name: string;
  brand: string;
  composition: string;
  manufacturer: string;
  schedule: "H" | "H1" | "OTC" | "X";
  hsn: string;
  gst: number;
  packSize: string;
  mrp: number;
  ptr: number;
  category: string;
  coldChain: boolean;
}

export interface Batch {
  id: string;
  productId: string;
  batchNo: string;
  mfgDate: string;
  expiry: string;
  qty: number;
  reserved: number;
  warehouse: string;
  rack: string;
}

export interface Buyer {
  id: string;
  shopName: string;
  owner: string;
  gstin: string;
  drugLicense: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  creditLimit: number;
  outstanding: number;
}

export interface Allocation {
  batchId: string;
  batchNo: string;
  expiry: string;
  qty: number;
  manual?: boolean | undefined;
}

export interface OrderLine {
  productId: string;
  name: string;
  packSize: string;
  qty: number;
  unitPrice: number;
  discountPct: number;
  gst: number;
  allocations: Allocation[];
  picked?: boolean | undefined;
}

export interface TimelineEvent {
  status: OrderStatus | "PAYMENT" | "NOTE";
  label: string;
  at: string;
  by: string;
}

export interface Checkpoint {
  label: string;
  location: string;
  at: string;
  done: boolean;
}

export interface Order {
  id: string;
  code: string;
  buyerId: string;
  lines: OrderLine[];
  status: OrderStatus;
  createdAt: string;
  paymentMode: PaymentMode;
  paymentStatus: PaymentStatus;
  txnRef?: string | undefined;
  invoiceNo?: string | undefined;
  subtotal: number;
  discount: number;
  gstAmount: number;
  total: number;
  timeline: TimelineEvent[];
  dispatch?: {
    courier: string;
    awb: string;
    vehicle: string;
    driver: string;
    eta: string;
    checkpoints: Checkpoint[];
  } | undefined;
  fillRate: number;
  notes?: string | undefined;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  at: string;
  audience: Role[];
  read: boolean;
  orderId?: string;
}

export interface AuditLog {
  id: string;
  at: string;
  actor: string;
  role: Role | "system";
  action: string;
  entity: string;
  detail: string;
}

export interface CartItem {
  productId: string;
  qty: number;
}

export interface Settings {
  nearExpiryTier1Days: number;
  nearExpiryTier1Pct: number;
  nearExpiryTier2Days: number;
  nearExpiryTier2Pct: number;
  fefoAuto: boolean;
  erpLastSync: string | null;
}

export interface AppState {
  version: number;
  role: Role | null;
  buyerId: string;
  products: Product[];
  batches: Batch[];
  buyers: Buyer[];
  orders: Order[];
  cart: CartItem[];
  notifications: AppNotification[];
  audit: AuditLog[];
  settings: Settings;
  codCollections: { orderId: string; amount: number; at: string; by: string }[];
}
