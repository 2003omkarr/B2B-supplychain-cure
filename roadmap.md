# PharmaConnect demo roadmap

## Priority 1 — end-to-end lifecycle (shared state)
- [x] Seed data: products, batches, buyers, historical orders
- [x] Shared store with localStorage persistence
- [x] FEFO allocation engine + stock reservation
- [x] Buyer: catalog browse/search/filter, stock validation, cart
- [x] Buyer: checkout with simulated payment (UPI/Card/NB/Wallet/COD) → order created
- [x] Admin: order list + detail showing FEFO allocation
- [x] Warehouse: pick items → complete picking → pack → ready for dispatch → dispatch
- [x] Buyer: My Orders + live tracking reflects Dispatched/Delivered

## Priority 2 — modules
- [x] Role entry screen (Buyer / Admin / Warehouse / Dispatch / Finance), no real auth
- [x] Always-accessible role switcher preserving shared persistent state
- [x] Dispatch role view: ready-to-dispatch queue, mark dispatched
- [x] Admin KPI dashboard + charts
- [x] Inventory batches view, near-expiry report with value-at-risk
- [x] Near-expiry discount engine syncing to buyer catalog
- [x] ERP sync simulation
- [x] Finance: payment reconciliation, COD collection, reports
- [x] Sales reports, notifications centre, audit log
- [ ] SEO head metadata per route, responsive polish
- [x] Permissions Matrix page: role x capability grid (View/Create/Edit/Approve/None) + role summaries, linked from admin nav and role switcher
