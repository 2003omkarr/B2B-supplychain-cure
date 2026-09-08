import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { buildSeed } from "./seed";
import type {
  Allocation,
  AppState,
  Batch,
  Order,
  OrderStatus,
  PaymentMode,
  Product,
  Role,
  Settings,
} from "./types";

const KEY = "pharmaconnect.state.v1";

/* ------------------------------ pure helpers ------------------------------ */

export function daysToExpiry(expiry: string, now = Date.now()) {
  return Math.round((+new Date(expiry) - now) / 86400000);
}

export function discountForBatch(b: Batch, s: Settings, now = Date.now()) {
  const d = daysToExpiry(b.expiry, now);
  if (d <= 0) return 0;
  if (d <= s.nearExpiryTier1Days) return s.nearExpiryTier1Pct;
  if (d <= s.nearExpiryTier2Days) return s.nearExpiryTier2Pct;
  return 0;
}

export function available(b: Batch) {
  return Math.max(0, b.qty - b.reserved);
}

export interface CatalogEntry {
  product: Product;
  batches: Batch[];
  stock: number;
  nearestExpiry: string | null;
  discountPct: number;
  effectivePrice: number;
}

export function buildCatalog(state: AppState, now = Date.now()): CatalogEntry[] {
  return state.products.map((product) => {
    const batches = state.batches
      .filter((b) => b.productId === product.id && daysToExpiry(b.expiry, now) > 0)
      .sort((a, b) => +new Date(a.expiry) - +new Date(b.expiry));
    const stock = batches.reduce((s, b) => s + available(b), 0);
    const live = batches.filter((b) => available(b) > 0);
    const first = live[0] ?? batches[0];
    const discountPct = first ? discountForBatch(first, state.settings, now) : 0;
    return {
      product,
      batches,
      stock,
      nearestExpiry: first?.expiry ?? null,
      discountPct,
      effectivePrice: Math.round(product.ptr * (1 - discountPct / 100) * 100) / 100,
    };
  });
}

export function inr(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(n));
}

export function inr2(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n);
}

function id(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

/* --------------------------------- context -------------------------------- */

interface Ctx {
  state: AppState;
  set: (fn: (draft: AppState) => void) => void;
  role: Role | null;
  setRole: (r: Role | null) => void;
  buyer: AppState["buyers"][number];
  catalog: CatalogEntry[];
  addToCart: (productId: string, qty: number) => void;
  setCartQty: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  placeOrder: (mode: PaymentMode, notes?: string) => Order;
  advanceOrder: (orderId: string, to: OrderStatus, by: string) => void;
  togglePicked: (orderId: string, productId: string) => void;
  reallocate: (orderId: string) => void;
  manualAllocate: (orderId: string, productId: string, allocations: Allocation[]) => void;
  cancelOrder: (orderId: string) => void;
  collectCod: (orderId: string) => void;
  runErpSync: () => { added: number; updated: number };
  addProductWithBatch: (
    product: Omit<Product, "id">,
    batch: Omit<Batch, "id" | "productId" | "reserved">
  ) => void;
  addBuyer: (buyerData: Omit<import("./types").Buyer, "id" | "outstanding">) => void;
  selectBuyer: (buyerId: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  markNotificationsRead: (role: Role) => void;
  resetDemo: () => void;
  ready: boolean;
}

const StoreContext = createContext<Ctx | null>(null);

function load(): AppState {
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AppState;
        if (parsed.version === 1) return parsed;
      }
    } catch {
      /* fall through to fresh seed */
    }
  }
  return buildSeed();
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState | null>(null);

  useEffect(() => {
    setState(load());
  }, []);

  useEffect(() => {
    if (!state) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* quota — demo continues in memory */
    }
  }, [state]);

  const set = useCallback((fn: (draft: AppState) => void) => {
    setState((prev) => {
      if (!prev) return prev;
      const draft = structuredClone(prev) as AppState;
      fn(draft);
      return draft;
    });
  }, []);

  const value = useMemo<Ctx | null>(() => {
    if (!state) return null;

    const buyer = state.buyers.find((b) => b.id === state.buyerId) ?? state.buyers[0]!;
    const catalog = buildCatalog(state);

    const log = (
      d: AppState,
      role: Role | "system",
      actor: string,
      action: string,
      entity: string,
      detail: string,
    ) => {
      d.audit.unshift({
        id: id("AUD"),
        at: new Date().toISOString(),
        actor,
        role,
        action,
        entity,
        detail,
      });
      d.audit = d.audit.slice(0, 300);
    };

    const notify = (
      d: AppState,
      title: string,
      body: string,
      audience: Role[],
      orderId?: string,
    ) => {
      d.notifications.unshift({
        id: id("NTF"),
        title,
        body,
        at: new Date().toISOString(),
        audience,
        read: false,
        ...(orderId ? { orderId } : {}),
      });
      d.notifications = d.notifications.slice(0, 120);
    };

    // FEFO: earliest expiry first, skipping expired batches.
    const fefo = (d: AppState, productId: string, qty: number): Allocation[] => {
      const now = Date.now();
      const pool = d.batches
        .filter((b) => b.productId === productId && daysToExpiry(b.expiry, now) > 0 && available(b) > 0)
        .sort((a, b) => +new Date(a.expiry) - +new Date(b.expiry));
      const out: Allocation[] = [];
      let remaining = qty;
      for (const b of pool) {
        if (remaining <= 0) break;
        const take = Math.min(remaining, available(b));
        b.reserved += take;
        out.push({ batchId: b.id, batchNo: b.batchNo, expiry: b.expiry, qty: take });
        remaining -= take;
      }
      return out;
    };

    const release = (d: AppState, order: Order) => {
      order.lines.forEach((l) =>
        l.allocations.forEach((a) => {
          const b = d.batches.find((x) => x.id === a.batchId);
          if (b) b.reserved = Math.max(0, b.reserved - a.qty);
        }),
      );
    };

    const consume = (d: AppState, order: Order) => {
      order.lines.forEach((l) =>
        l.allocations.forEach((a) => {
          const b = d.batches.find((x) => x.id === a.batchId);
          if (b) {
            b.reserved = Math.max(0, b.reserved - a.qty);
            b.qty = Math.max(0, b.qty - a.qty);
          }
        }),
      );
    };

    const ctx: Ctx = {
      state,
      set,
      ready: true,
      role: state.role,
      buyer,
      catalog,
      setRole: (r) =>
        set((d) => {
          d.role = r;
        }),

      addToCart: (productId, qty) =>
        set((d) => {
          const line = d.cart.find((c) => c.productId === productId);
          if (line) line.qty += qty;
          else d.cart.push({ productId, qty });
        }),
      setCartQty: (productId, qty) =>
        set((d) => {
          const line = d.cart.find((c) => c.productId === productId);
          if (line) line.qty = Math.max(1, qty);
        }),
      removeFromCart: (productId) =>
        set((d) => {
          d.cart = d.cart.filter((c) => c.productId !== productId);
        }),
      clearCart: () =>
        set((d) => {
          d.cart = [];
        }),

      placeOrder: (mode, notes) => {
        const now = new Date();
        const cat = buildCatalog(state);
        const lines = state.cart.map((c) => {
          const entry = cat.find((e) => e.product.id === c.productId)!;
          return {
            productId: c.productId,
            name: entry.product.name,
            packSize: entry.product.packSize,
            qty: c.qty,
            unitPrice: entry.effectivePrice,
            discountPct: entry.discountPct,
            gst: entry.product.gst,
            allocations: [] as Allocation[],
            picked: false,
          };
        });
        const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.qty, 0);
        const discount = lines.reduce(
          (s, l) => s + ((l.unitPrice / (1 - l.discountPct / 100)) * l.qty - l.unitPrice * l.qty),
          0,
        );
        const gstAmount = lines.reduce((s, l) => s + (l.unitPrice * l.qty * l.gst) / 100, 0);
        const seq = 2000 + state.orders.length + 1;
        const order: Order = {
          id: `ORD-${seq}`,
          code: `PC-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}-${seq}`,
          buyerId: state.buyerId,
          lines,
          status: "PLACED",
          createdAt: now.toISOString(),
          paymentMode: mode,
          paymentStatus: mode === "COD" ? "COD_PENDING" : "PAID",
          txnRef: mode === "COD" ? undefined : `TXN${Math.floor(Math.random() * 9e9 + 1e9)}`,
          subtotal,
          discount,
          gstAmount,
          total: Math.round(subtotal + gstAmount),
          fillRate: 0,
          notes,
          timeline: [
            {
              status: "PLACED",
              label: "Order placed by buyer",
              at: now.toISOString(),
              by: buyer.shopName,
            },
          ],
        };

        set((d) => {
          const o = structuredClone(order);
          if (mode !== "COD") {
            o.timeline.push({
              status: "PAYMENT",
              label: `Payment captured via ${mode} · ${o.txnRef}`,
              at: new Date().toISOString(),
              by: "Payment Gateway",
            });
          }
          // FEFO allocation runs immediately when auto mode is on
          if (d.settings.fefoAuto) {
            let requested = 0;
            let allocated = 0;
            o.lines.forEach((l) => {
              l.allocations = fefo(d, l.productId, l.qty);
              requested += l.qty;
              allocated += l.allocations.reduce((s, a) => s + a.qty, 0);
            });
            o.fillRate = requested ? Math.round((allocated / requested) * 100) : 100;
            o.status = "ALLOCATED";
            o.timeline.push({
              status: "ALLOCATED",
              label: `FEFO allocation completed · fill rate ${o.fillRate}%`,
              at: new Date().toISOString(),
              by: "FEFO Engine",
            });
          }
          d.orders.unshift(o);
          d.cart = [];
          if (mode === "COD") d.buyers.find((b) => b.id === o.buyerId)!.outstanding += o.total;
          notify(
            d,
            `New order ${o.code}`,
            `${buyer.shopName} placed an order worth ${inr(o.total)} (${mode}).`,
            ["admin", "warehouse", "finance"],
            o.id,
          );
          notify(d, `Order ${o.code} confirmed`, `We received your order. Fill rate ${o.fillRate}%.`, ["buyer"], o.id);
          log(d, "buyer", buyer.shopName, "ORDER_CREATE", o.code, `Order placed, ${mode}, ${inr(o.total)}`);
          if (d.settings.fefoAuto)
            log(d, "system", "FEFO Engine", "FEFO_ALLOCATE", o.code, `Auto allocation, fill rate ${o.fillRate}%`);
        });
        return order;
      },

      reallocate: (orderId) =>
        set((d) => {
          const o = d.orders.find((x) => x.id === orderId);
          if (!o) return;
          release(d, o);
          let requested = 0;
          let allocated = 0;
          o.lines.forEach((l) => {
            l.allocations = fefo(d, l.productId, l.qty);
            requested += l.qty;
            allocated += l.allocations.reduce((s, a) => s + a.qty, 0);
          });
          o.fillRate = requested ? Math.round((allocated / requested) * 100) : 100;
          if (o.status === "PLACED") o.status = "ALLOCATED";
          o.timeline.push({
            status: "ALLOCATED",
            label: `FEFO re-allocation · fill rate ${o.fillRate}%`,
            at: new Date().toISOString(),
            by: "FEFO Engine",
          });
          log(d, "admin", "Distributor Admin", "FEFO_REALLOCATE", o.code, `Fill rate ${o.fillRate}%`);
        }),

      manualAllocate: (orderId, productId, allocations) =>
        set((d) => {
          const o = d.orders.find((x) => x.id === orderId);
          const line = o?.lines.find((l) => l.productId === productId);
          if (!o || !line) return;
          line.allocations.forEach((a) => {
            const b = d.batches.find((x) => x.id === a.batchId);
            if (b) b.reserved = Math.max(0, b.reserved - a.qty);
          });
          line.allocations = allocations.map((a) => {
            const b = d.batches.find((x) => x.id === a.batchId);
            if (b) b.reserved += a.qty;
            return { ...a, manual: true };
          });
          const requested = o.lines.reduce((s, l) => s + l.qty, 0);
          const allocated = o.lines.reduce(
            (s, l) => s + l.allocations.reduce((x, a) => x + a.qty, 0),
            0,
          );
          o.fillRate = requested ? Math.round((allocated / requested) * 100) : 100;
          o.timeline.push({
            status: "NOTE",
            label: `Manual batch override on ${line.name}`,
            at: new Date().toISOString(),
            by: "Distributor Admin",
          });
          log(d, "admin", "Distributor Admin", "FEFO_OVERRIDE", o.code, `Manual batches for ${line.name}`);
        }),

      togglePicked: (orderId, productId) =>
        set((d) => {
          const line = d.orders.find((o) => o.id === orderId)?.lines.find((l) => l.productId === productId);
          if (line) line.picked = !line.picked;
        }),

      advanceOrder: (orderId, to, by) =>
        set((d) => {
          const o = d.orders.find((x) => x.id === orderId);
          if (!o) return;
          o.status = to;
          const labels: Record<string, string> = {
            ALLOCATED: "FEFO allocation completed",
            PICKING: "Picking started in warehouse",
            PACKED: "Order packed & invoice generated",
            DISPATCHED: "Dispatched from warehouse",
            DELIVERED: "Delivered to buyer",
          };
          o.timeline.push({
            status: to,
            label: labels[to] ?? to,
            at: new Date().toISOString(),
            by,
          });

          if (to === "PACKED" && !o.invoiceNo) {
            o.invoiceNo = `INV/26-27/${3000 + d.orders.length}`;
            o.lines.forEach((l) => (l.picked = true));
          }
          if (to === "DISPATCHED") {
            const b = d.buyers.find((x) => x.id === o.buyerId)!;
            const eta = new Date(Date.now() + 2 * 86400000).toISOString();
            o.dispatch = {
              courier: "BlueDart Surface",
              awb: `AWB${Math.floor(Math.random() * 9e8 + 1e8)}`,
              vehicle: `MH12 KX ${1000 + Math.floor(Math.random() * 8999)}`,
              driver: "Ramesh Yadav",
              eta,
              checkpoints: [
                {
                  label: "Picked up from warehouse",
                  location: "Pune Central Hub",
                  at: new Date().toISOString(),
                  done: true,
                },
                { label: "In transit", location: "Chakan Sorting Center", at: eta, done: false },
                { label: "Out for delivery", location: b.city, at: eta, done: false },
                { label: "Delivered", location: b.shopName, at: eta, done: false },
              ],
            };
            consume(d, o);
          }
          if (to === "DELIVERED") {
            o.dispatch?.checkpoints.forEach((c) => (c.done = true));
            if (o.paymentMode === "COD") o.paymentStatus = "COD_PENDING";
          }
          notify(d, `Order ${o.code} · ${to}`, labels[to] ?? to, ["buyer", "admin", "finance"], o.id);
          log(d, "warehouse", by, `STATUS_${to}`, o.code, labels[to] ?? to);
        }),

      cancelOrder: (orderId) =>
        set((d) => {
          const o = d.orders.find((x) => x.id === orderId);
          if (!o) return;
          release(d, o);
          o.status = "CANCELLED";
          o.paymentStatus = o.paymentMode === "COD" ? "PENDING" : "REFUNDED";
          o.timeline.push({
            status: "CANCELLED",
            label: "Order cancelled, stock released back to inventory",
            at: new Date().toISOString(),
            by: "Distributor Admin",
          });
          notify(d, `Order ${o.code} cancelled`, "Reserved stock has been released.", ["buyer", "admin", "finance"], o.id);
          log(d, "admin", "Distributor Admin", "ORDER_CANCEL", o.code, "Cancelled and unreserved");
        }),

      collectCod: (orderId) =>
        set((d) => {
          const o = d.orders.find((x) => x.id === orderId);
          if (!o) return;
          o.paymentStatus = "COD_COLLECTED";
          o.timeline.push({
            status: "PAYMENT",
            label: `COD cash of ${inr(o.total)} collected and reconciled`,
            at: new Date().toISOString(),
            by: "Finance Desk",
          });
          d.codCollections.unshift({
            orderId: o.id,
            amount: o.total,
            at: new Date().toISOString(),
            by: "Finance Desk",
          });
          const b = d.buyers.find((x) => x.id === o.buyerId);
          if (b) b.outstanding = Math.max(0, b.outstanding - o.total);
          log(d, "finance", "Finance Desk", "COD_RECONCILE", o.code, `Collected ${inr(o.total)}`);
        }),

      runErpSync: () => {
        let added = 0;
        let updated = 0;
        set((d) => {
          d.batches.forEach((b) => {
            if (Math.random() < 0.35) {
              b.qty = Math.max(b.reserved, b.qty + Math.floor(Math.random() * 120) - 30);
              updated++;
            }
          });
          const fresh = d.products.slice(0, 3 + Math.floor(Math.random() * 3));
          fresh.forEach((p, i) => {
            const expiry = new Date(Date.now() + (400 + Math.floor(Math.random() * 500)) * 86400000);
            d.batches.push({
              id: id("BAT"),
              productId: p.id,
              batchNo: `ERP${expiry.getFullYear() % 100}${String(expiry.getMonth() + 1).padStart(2, "0")}${i}`,
              mfgDate: new Date(Date.now() - 60 * 86400000).toISOString(),
              expiry: expiry.toISOString(),
              qty: 100 + Math.floor(Math.random() * 300),
              reserved: 0,
              warehouse: "WH-Pune-Central",
              rack: `R${1 + Math.floor(Math.random() * 12)}-A1`,
            });
            added++;
          });
          d.settings.erpLastSync = new Date().toISOString();
          notify(
            d,
            "ERP inventory sync completed",
            `${added} new batches inbound, ${updated} quantities reconciled from Marg ERP.`,
            ["admin", "warehouse"],
          );
          log(d, "system", "ERP Middleware", "ERP_SYNC", "inventory", `${added} added, ${updated} updated`);
        });
        return { added, updated };
      },

      addProductWithBatch: (productData, batchData) =>
        set((d) => {
          const newProdId = id("PRD");
          const newProd: Product = { id: newProdId, ...productData };
          const newBatch: Batch = {
            id: id("BAT"),
            productId: newProdId,
            reserved: 0,
            ...batchData,
          };
          d.products.unshift(newProd);
          d.batches.unshift(newBatch);
          notify(
            d,
            `New Medicine Added: ${newProd.name}`,
            `Added ${newProd.name} (${newProd.packSize}) with batch ${newBatch.batchNo} (${newBatch.qty} units).`,
            ["admin", "buyer", "warehouse"],
          );
          log(d, "admin", "Distributor Admin", "PRODUCT_ADD", newProd.name, `Batch ${newBatch.batchNo}, ${newBatch.qty} units`);
        }),

      addBuyer: (buyerData) =>
        set((d) => {
          const newBuyer: import("./types").Buyer = {
            id: id("BUY"),
            outstanding: 0,
            ...buyerData,
          };
          d.buyers.unshift(newBuyer);
          notify(
            d,
            `New Pharmacy Account: ${newBuyer.shopName}`,
            `Registered ${newBuyer.shopName} (${newBuyer.city}) with GSTIN ${newBuyer.gstin} and ₹${newBuyer.creditLimit.toLocaleString("en-IN")} credit line.`,
            ["admin", "finance"],
          );
          log(d, "admin", "Distributor Admin", "BUYER_ADD", newBuyer.shopName, `Credit limit ₹${newBuyer.creditLimit}`);
        }),

      selectBuyer: (buyerId) =>
        set((d) => {
          d.buyerId = buyerId;
        }),

      updateSettings: (patch) =>
        set((d) => {
          d.settings = { ...d.settings, ...patch };
          log(
            d,
            "admin",
            "Distributor Admin",
            "SETTINGS_UPDATE",
            "discount-engine",
            JSON.stringify(patch),
          );
          notify(d, "Discount engine updated", "Near-expiry offers re-published to buyer catalog.", ["admin", "buyer"]);
        }),

      markNotificationsRead: (role) =>
        set((d) => {
          d.notifications.forEach((n) => {
            if (n.audience.includes(role)) n.read = true;
          });
        }),

      resetDemo: () => {
        try {
          window.localStorage.removeItem(KEY);
        } catch {
          /* ignore */
        }
        setState(buildSeed());
      },
    };
    return ctx;
  }, [state, set]);

  if (!value) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-muted-foreground">
          <span className="size-3 animate-ping rounded-full bg-primary" />
          Loading PharmaConnect demo data…
        </div>
      </div>
    );
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
