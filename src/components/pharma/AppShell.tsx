import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  Banknote,
  BadgePercent,
  Bell,
  Boxes,
  ChartColumn,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  MapPin,
  Menu,
  Moon,
  Package,
  Pill,
  RefreshCw,
  RotateCcw,
  ScrollText,
  ShieldCheck,
  ShoppingCart,
  Store,
  Sun,
  TriangleAlert,
  Truck,
  X,
} from "lucide-react";
import { NAV, ROLES, roleMeta } from "@/lib/pharma/nav";
import { useStore } from "@/lib/pharma/store";
import type { Role } from "@/lib/pharma/types";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { fmtDateTime } from "./bits";

const ICONS: Record<string, typeof Pill> = {
  Pill,
  BadgePercent,
  ShoppingCart,
  Package,
  Store,
  LayoutDashboard,
  ClipboardList,
  Boxes,
  TriangleAlert,
  ChartColumn,
  RefreshCw,
  ScrollText,
  ShieldCheck,
  Truck,
  MapPin,
  CreditCard,
  Banknote,
};

export function AppShell({ role, children }: { role: Role; children: ReactNode }) {
  const { state, setRole, markNotificationsRead, resetDemo } = useStore();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileNav, setMobileNav] = useState(false);
  const { theme, toggle: toggleTheme } = useTheme();
  const meta = roleMeta(role);

  // Keep the demo honest: entering a role area sets the active role.
  useEffect(() => {
    if (state.role !== role) setRole(role);
  }, [role, state.role, setRole]);

  useEffect(() => {
    setMobileNav(false);
  }, [pathname]);

  const items = NAV[role];
  const cartCount = state.cart.reduce((s, c) => s + c.qty, 0);
  const notes = state.notifications.filter((n) => n.audience.includes(role));
  const unread = notes.filter((n) => !n.read).length;

  const switchRole = (r: Role) => {
    setRole(r);
    navigate({ to: roleMeta(r).home });
  };

  // Compute smart alert badges for nav items
  const lowStockCount = state.products.filter((p) => {
    const batches = state.batches.filter((b) => b.productId === p.id);
    const avail = batches.reduce((s, b) => s + Math.max(0, b.qty - b.reserved), 0);
    return avail > 0 && avail < 20;
  }).length;

  const atRiskValue = state.batches
    .filter((b) => {
      const d = Math.round((+new Date(b.expiry) - Date.now()) / 86400000);
      return d > 0 && d <= 90;
    })
    .reduce((s, b) => {
      const p = state.products.find((x) => x.id === b.productId);
      return s + (p ? p.ptr * Math.max(0, b.qty - b.reserved) : 0);
    }, 0);

  const navAlerts: Record<string, { color: string; count?: number }> = {};
  if (atRiskValue > 50000) {
    navAlerts["/admin/near-expiry"] = { color: "bg-destructive" };
  }
  if (lowStockCount > 0) {
    navAlerts["/admin/inventory"] = { color: "bg-warning", count: lowStockCount };
    navAlerts["/warehouse/inventory"] = { color: "bg-warning", count: lowStockCount };
  }

  const NavList = (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const Icon = ICONS[item.icon] ?? Pill;
        const active = pathname === item.to || (item.to !== meta.home && pathname.startsWith(item.to));
        return (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className={cn("size-4", active ? "text-sidebar-primary" : "opacity-70")} />
            <span className="flex-1">{item.label}</span>
            {item.to === "/buyer/cart" && cartCount > 0 ? (
              <span className="rounded-full bg-sidebar-primary px-1.5 py-0.5 text-[10px] font-bold text-sidebar-primary-foreground tabular">
                {cartCount}
              </span>
            ) : null}
            {navAlerts[item.to] ? (
              <span className={cn(
                "size-2 rounded-full animate-pulse",
                navAlerts[item.to].color,
              )} title={navAlerts[item.to].count ? `${navAlerts[item.to].count} items` : "Attention needed"} />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );

  const Brand = (
    <Link to="/" className="flex items-center gap-2.5 px-1">
      <span className="grid size-9 place-items-center rounded-xl bg-sidebar-primary font-display text-base font-bold text-sidebar-primary-foreground">
        P
      </span>
      <span className="leading-tight">
        <span className="block font-display text-sm font-semibold text-sidebar-foreground">
          PharmaConnect
        </span>
        <span className="block text-[11px] text-sidebar-foreground/60">B2B Distribution Suite</span>
      </span>
    </Link>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-6 border-r border-sidebar-border bg-sidebar p-4 lg:flex">
        {Brand}
        <div className="rounded-xl bg-sidebar-accent/50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/55">
            Signed in as
          </p>
          <p className="mt-0.5 font-display text-sm font-semibold text-sidebar-foreground">
            {meta.label}
          </p>
          <p className="text-[11px] text-sidebar-foreground/60">{meta.persona}</p>
        </div>
        {NavList}
        <div className="mt-auto space-y-2">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-sidebar-foreground/65 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
          >
            <RotateCcw className="size-3.5" /> Switch role
          </Link>
          <button
            onClick={() => {
              if (confirm("Reset all demo data back to the seeded state?")) resetDemo();
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
          >
            <RefreshCw className="size-3.5" /> Reset demo data
          </button>
        </div>
      </aside>

      {/* Mobile nav */}
      <Sheet open={mobileNav} onOpenChange={setMobileNav}>
        <SheetContent side="left" className="w-72 border-sidebar-border bg-sidebar p-4">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="mb-6">{Brand}</div>
          {NavList}
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-card/85 px-4 backdrop-blur md:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileNav(true)}
            aria-label="Open navigation"
          >
            <Menu className="size-5" />
          </Button>

          <div className="hidden min-w-0 flex-1 md:block">
            <p className="truncate font-display text-sm font-semibold text-foreground">{meta.label}</p>
            <p className="truncate text-xs text-muted-foreground">{meta.blurb}</p>
          </div>
          <div className="flex-1 md:hidden" />

          {role === "buyer" ? (
            <Button asChild variant="outline" size="sm" className="relative">
              <Link to="/buyer/cart">
                <ShoppingCart className="size-4" />
                <span className="hidden sm:inline">Cart</span>
                {cartCount > 0 ? (
                  <span className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground tabular">
                    {cartCount}
                  </span>
                ) : null}
              </Link>
            </Button>
          ) : null}

          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>

          <DropdownMenu onOpenChange={(o) => o && unread && markNotificationsRead(role)}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="relative" aria-label="Notifications">
                <Bell className="size-4" />
                {unread > 0 ? (
                  <span className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground tabular">
                    {unread}
                  </span>
                ) : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-y-auto">
                {notes.length === 0 ? (
                  <p className="px-2 py-6 text-center text-xs text-muted-foreground">
                    Nothing here yet.
                  </p>
                ) : (
                  notes.slice(0, 12).map((n) => (
                    <div key={n.id} className="border-b px-2 py-2.5 last:border-0">
                      <p className="text-xs font-semibold text-foreground">{n.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground/70">
                        {fmtDateTime(n.at)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm" className="gap-2">
                <span
                  className={cn("size-2 rounded-full bg-gradient-to-br", meta.accent)}
                  aria-hidden
                />
                <span className="hidden sm:inline">{meta.shortLabel}</span>
                <span className="sm:hidden">Role</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                Switch role — shared demo data is preserved
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {ROLES.map((r) => (
                <DropdownMenuItem
                  key={r.id}
                  onClick={() => switchRole(r.id)}
                  className="flex-col items-start gap-0.5 py-2"
                >
                  <span className="flex w-full items-center gap-2 text-sm font-medium">
                    <span className={cn("size-2 rounded-full bg-gradient-to-br", r.accent)} />
                    {r.label}
                    {r.id === role ? (
                      <span className="ml-auto text-[10px] uppercase tracking-wide text-primary">
                        active
                      </span>
                    ) : null}
                  </span>
                  <span className="pl-4 text-xs text-muted-foreground">{r.persona}</span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate({ to: "/admin/permissions" })}>
                <ShieldCheck className="size-4" /> Permissions matrix
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate({ to: "/" })}>
                <X className="size-4" /> Exit to role picker
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1400px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
