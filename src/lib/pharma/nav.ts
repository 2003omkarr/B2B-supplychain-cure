import type { Role } from "./types";

export interface RoleMeta {
  id: Role;
  label: string;
  shortLabel: string;
  persona: string;
  blurb: string;
  home: string;
  accent: string;
}

export const ROLES: RoleMeta[] = [
  {
    id: "buyer",
    label: "Retail Buyer",
    shortLabel: "Buyer",
    persona: "Shree Medicals, Pune",
    blurb: "Browse live batch stock, build a cart, pay and track every delivery.",
    home: "/buyer",
    accent: "from-[oklch(0.5_0.1_195)] to-[oklch(0.66_0.13_170)]",
  },
  {
    id: "admin",
    label: "Distributor Admin",
    shortLabel: "Admin",
    persona: "MedSource Distributors",
    blurb: "Orders, FEFO control, inventory, discounts, ERP sync and reports.",
    home: "/admin",
    accent: "from-[oklch(0.42_0.08_250)] to-[oklch(0.6_0.12_250)]",
  },
  {
    id: "warehouse",
    label: "Warehouse Staff",
    shortLabel: "Warehouse",
    persona: "WH-Pune-Central",
    blurb: "Pick against batch locations, pack cartons and raise invoices.",
    home: "/warehouse",
    accent: "from-[oklch(0.55_0.13_78)] to-[oklch(0.72_0.15_78)]",
  },
  {
    id: "dispatch",
    label: "Dispatch Desk",
    shortLabel: "Dispatch",
    persona: "Outbound Logistics",
    blurb: "Load ready cartons, assign vehicles and mark orders dispatched.",
    home: "/dispatch",
    accent: "from-[oklch(0.48_0.14_20)] to-[oklch(0.66_0.16_30)]",
  },
  {
    id: "finance",
    label: "Finance",
    shortLabel: "Finance",
    persona: "Accounts & Collections",
    blurb: "Reconcile gateway settlements, collect COD and watch credit exposure.",
    home: "/finance",
    accent: "from-[oklch(0.45_0.1_155)] to-[oklch(0.65_0.13_155)]",
  },
];

export function roleMeta(role: Role): RoleMeta {
  return ROLES.find((r) => r.id === role) ?? (ROLES[0] as RoleMeta);
}

export interface NavItem {
  to: string;
  label: string;
  icon: string;
}

export const NAV: Record<Role, NavItem[]> = {
  buyer: [
    { to: "/buyer", label: "Catalog", icon: "Pill" },
    { to: "/buyer/offers", label: "Expiry Offers", icon: "BadgePercent" },
    { to: "/buyer/cart", label: "Cart", icon: "ShoppingCart" },
    { to: "/buyer/orders", label: "My Orders", icon: "Package" },
    { to: "/buyer/account", label: "Account", icon: "Store" },
  ],
  admin: [
    { to: "/admin", label: "Dashboard", icon: "LayoutDashboard" },
    { to: "/admin/orders", label: "Orders", icon: "ClipboardList" },
    { to: "/admin/inventory", label: "Inventory Batches", icon: "Boxes" },
    { to: "/admin/near-expiry", label: "Near-Expiry", icon: "TriangleAlert" },
    { to: "/admin/discounts", label: "Discount Engine", icon: "BadgePercent" },
    { to: "/admin/buyers", label: "Buyers", icon: "Store" },
    { to: "/admin/reports", label: "Reports", icon: "ChartColumn" },
    { to: "/admin/erp", label: "ERP Sync", icon: "RefreshCw" },
    { to: "/admin/permissions", label: "Permissions", icon: "ShieldCheck" },
    { to: "/admin/audit", label: "Audit Log", icon: "ScrollText" },
  ],
  warehouse: [
    { to: "/warehouse", label: "Fulfilment Queue", icon: "ClipboardList" },
    { to: "/warehouse/inventory", label: "Batch Locations", icon: "Boxes" },
  ],
  dispatch: [
    { to: "/dispatch", label: "Dispatch Desk", icon: "Truck" },
    { to: "/dispatch/in-transit", label: "In Transit", icon: "MapPin" },
  ],
  finance: [
    { to: "/finance", label: "Finance Dashboard", icon: "LayoutDashboard" },
    { to: "/finance/payments", label: "Payments", icon: "CreditCard" },
    { to: "/finance/cod", label: "COD Collections", icon: "Banknote" },
    { to: "/finance/credit", label: "Buyer Credit", icon: "Store" },
    { to: "/finance/reports", label: "Reports", icon: "ChartColumn" },
  ],
};
