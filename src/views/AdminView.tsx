"use client";

import { useState, useMemo, useEffect } from "react";
import { useStore, formatINR, type StoreSettings, type AdminRoleUser } from "@/store/useStore";
import { products as allProducts, calculateComboStock } from "@/data/products";
import { categories } from "@/data/categories";
import { coupons as defaultCoupons } from "@/data/coupons";
import type { CategorySlug, Product, ProductBadge, ComboComponent, Order, OrderStatus, Coupon, Review } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Ticket,
  Star,
  BarChart3,
  Settings,
  Search,
  Plus,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  ShoppingBag,
  AlertTriangle,
  ArrowUpRight,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  Bell,
  LogOut,
  Check,
  ExternalLink,
  MessageSquare,
  AlertCircle,
  Download,
  UserPlus,
  Clock,
  CreditCard,
  MapPin,
  Filter,
  CheckCircle2,
  Printer,
  FileText,
  PackageCheck,
  ShieldCheck,
  Copy,
  Layers,
  Sparkles,
  Gem,
  Minus,
  RefreshCw,
  SlidersHorizontal,
  ArrowRight,
  ShieldAlert,
  Film,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ReelManagement from "@/components/admin/reels/ReelManagement";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type AdminSection = "dashboard" | "products" | "orders" | "customers" | "coupons" | "reviews" | "reels" | "reports" | "settings";

const navItems: { id: AdminSection; label: string; icon: React.ElementType; group: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, group: "Overview" },
  { id: "products", label: "Products", icon: Package, group: "Catalog" },
  { id: "orders", label: "Orders", icon: ShoppingCart, group: "Sales" },
  { id: "customers", label: "Customers", icon: Users, group: "Sales" },
  { id: "coupons", label: "Coupons", icon: Ticket, group: "Marketing" },
  { id: "reviews", label: "Reviews", icon: Star, group: "Marketing" },
  { id: "reels", label: "Instagram Reels", icon: Film, group: "Marketing" },
  { id: "reports", label: "Reports", icon: BarChart3, group: "Insights" },
  { id: "settings", label: "Settings", icon: Settings, group: "System" },
];

const salesData = [
  { month: "Apr", sales: 184000, orders: 142 },
  { month: "May", sales: 220000, orders: 168 },
  { month: "Jun", sales: 198000, orders: 151 },
  { month: "Jul", sales: 265000, orders: 198 },
  { month: "Aug", sales: 312000, orders: 234 },
  { month: "Sep", sales: 289000, orders: 221 },
  { month: "Oct", sales: 358000, orders: 287 },
];

const categoryData = [
  { name: "Earrings", value: 35, color: "#c9a96a" },
  { name: "Necklaces", value: 25, color: "#8b7355" },
  { name: "Rings", value: 15, color: "#d8a9a0" },
  { name: "Bracelets", value: 12, color: "#a89070" },
  { name: "Bangles", value: 8, color: "#bfa98d" },
  { name: "Other", value: 5, color: "#d4c4a8" },
];

const statusBadge: Record<OrderStatus, string> = {
  placed: "bg-blue-50 text-blue-700 border-blue-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  packed: "bg-indigo-50 text-indigo-700 border-indigo-200",
  shipped: "bg-amber-50 text-amber-700 border-amber-200",
  out_for_delivery: "bg-amber-50 text-amber-700 border-amber-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  returned: "bg-zinc-100 text-zinc-700 border-zinc-200",
};

export function AdminView() {
  const navigate = useStore((s) => s.navigate);
  const orders = useStore((s) => s.orders);
  const notifications = useStore((s) => s.notifications);
  const markAllNotificationsRead = useStore((s) => s.markAllNotificationsRead);
  const [section, setSection] = useState<AdminSection>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Topbar and global modals
  const [globalSearch, setGlobalSearch] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [ordersTab, setOrdersTab] = useState<"all" | "today" | "pending" | "shipped" | "delivered" | "cancelled">("all");

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-accent/20">
      <div className="flex">
        {/* Sidebar Backdrop on Mobile & Tablet */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-xs lg:hidden transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        {/* Responsive Sidebar Drawer */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-[70] h-full w-72 max-w-[85vw] border-r border-border bg-card shadow-2xl transition-transform duration-300 ease-in-out lg:static lg:z-auto lg:h-[calc(100vh-4rem)] lg:sticky lg:top-16 lg:w-64 lg:shadow-none lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent/60 p-1 shrink-0">
                  <picture>
                    <source srcSet="/vrundora-emblem.webp" type="image/webp" />
                    <img src="/vrundora-emblem.png" alt="वृन्दोरा" className="h-7 w-7 object-contain" />
                  </picture>
                </div>
                <div>
                  <p className="text-sm font-semibold">Admin Panel</p>
                  <p className="text-xs text-muted-foreground">VRUNDORA (वृन्दोरा)</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1.5 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                aria-label="Close sidebar"
              >
                ✕
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto scroll-area-custom p-3">
              {["Overview", "Catalog", "Sales", "Marketing", "Insights", "System"].map((group) => (
                <div key={group} className="mb-4">
                  <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{group}</p>
                  {navItems.filter((n) => n.group === group).map((n) => (
                    <button
                      key={n.id}
                      onClick={() => { setSection(n.id); setSidebarOpen(false); }}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition",
                        section === n.id ? "bg-charcoal text-ivory" : "text-foreground/70 hover:bg-accent hover:text-foreground"
                      )}
                    >
                      <n.icon className="h-4 w-4" />
                      {n.label}
                    </button>
                  ))}
                </div>
              ))}
            </nav>
            <div className="border-t border-border p-3 space-y-1">
              <button onClick={() => navigate("home")} className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground/70 hover:bg-accent transition">
                <ChevronLeft className="h-4 w-4" /> Back to store
              </button>
              <button onClick={() => navigate("home")} className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition">
                <LogOut className="h-4 w-4" /> Exit admin
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-3 sm:p-5 lg:p-6 overflow-x-hidden">
          {/* Topbar */}
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <Button
                variant="outline"
                size="icon"
                className="lg:hidden shrink-0 h-9 w-9"
                onClick={() => setSidebarOpen(true)}
                title="Open menu"
              >
                <LayoutDashboard className="h-4 w-4" />
              </Button>
              <div className="min-w-0">
                <h1 className="font-serif text-lg sm:text-2xl font-bold capitalize truncate">{section}</h1>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Admin Workspace · VRUNDORA Store</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <div className="flex items-center gap-1.5 sm:gap-2 rounded-md border border-border bg-card px-2 sm:px-3 py-1.5 shadow-xs">
                <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                <input
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  placeholder="Quick search…"
                  className="w-20 sm:w-36 md:w-44 bg-transparent text-xs sm:text-sm outline-none placeholder:text-muted-foreground"
                />
                {globalSearch && (
                  <button onClick={() => setGlobalSearch("")} className="text-xs text-muted-foreground hover:text-foreground">
                    ✕
                  </button>
                )}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setNotificationsOpen(true)}
                className="relative h-9 w-9 shrink-0"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadNotifications > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-champagne text-[10px] font-bold text-charcoal px-1">
                    {unreadNotifications}
                  </span>
                )}
              </Button>
              <button
                onClick={() => setProfileOpen(true)}
                title="Admin profile"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-charcoal text-sm font-medium text-ivory hover:ring-2 hover:ring-champagne transition"
              >
                AD
              </button>
            </div>
          </div>

          {/* Mobile & Tablet Horizontal Section Pills */}
          <div className="lg:hidden -mx-3 sm:-mx-5 px-3 sm:px-5 mt-3 border-b border-border bg-card/60 backdrop-blur-xs py-2 flex items-center gap-1.5 overflow-x-auto scroll-area-custom">
            {navItems.map((n) => (
              <button
                key={n.id}
                onClick={() => setSection(n.id)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition",
                  section === n.id
                    ? "bg-charcoal text-ivory shadow-xs"
                    : "bg-accent/40 text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <n.icon className="h-3.5 w-3.5" />
                {n.label}
              </button>
            ))}
          </div>

          <div className="mt-6">
            {section === "dashboard" && (
              <DashboardSection
                orders={orders}
                onSelectSection={setSection}
                onSelectOrder={setSelectedOrder}
                onFilterOrdersTab={(tab) => {
                  setOrdersTab(tab);
                  setSection("orders");
                }}
              />
            )}
            {section === "products" && <ProductsSection />}
            {section === "orders" && (
              <OrdersSection
                orders={orders}
                selectedOrder={selectedOrder}
                onSelectOrder={setSelectedOrder}
                initialTab={ordersTab}
              />
            )}
            {section === "customers" && <CustomersSection orders={orders} />}
            {section === "coupons" && <CouponsSection />}
            {section === "reviews" && <ReviewsSection />}
            {section === "reels" && <ReelManagement />}
            {section === "reports" && <ReportsSection orders={orders} />}
            {section === "settings" && <SettingsSection />}
          </div>
        </main>
      </div>

      {/* Notifications Modal */}
      <Dialog open={notificationsOpen} onOpenChange={setNotificationsOpen}>
        <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="font-serif text-lg">Notifications</DialogTitle>
              {unreadNotifications > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllNotificationsRead} className="text-xs text-champagne">
                  Mark all as read
                </Button>
              )}
            </div>
            <DialogDescription>Latest operational alerts and store updates</DialogDescription>
          </DialogHeader>
          <div className="max-h-80 overflow-y-auto space-y-2 py-2">
            {notifications.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No notifications at this time.</p>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className={cn("rounded-lg border p-3 text-xs transition", n.read ? "bg-card border-border" : "bg-champagne/10 border-champagne/40")}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-charcoal">{n.title}</span>
                    <span className="text-[10px] text-muted-foreground">{new Date(n.date).toLocaleDateString()}</span>
                  </div>
                  <p className="mt-1 text-foreground/80">{n.body}</p>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Admin Profile Modal */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">Admin Profile</DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-3 py-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-charcoal text-base font-semibold text-ivory">
              AD
            </div>
            <div>
              <p className="font-medium text-sm">VRUNDORA Admin</p>
              <p className="text-xs text-muted-foreground">admin@vrundora.com</p>
              <Badge variant="outline" className="mt-1 border-champagne bg-champagne/10 text-charcoal text-[10px]">
                Super Admin
              </Badge>
            </div>
          </div>
          <Separator />
          <div className="space-y-1.5 py-2">
            <Button
              variant="outline"
              className="w-full justify-start text-xs"
              onClick={() => { setProfileOpen(false); navigate("home"); }}
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Return to Customer Storefront
            </Button>
            <Button
              variant="destructive"
              className="w-full justify-start text-xs"
              onClick={() => { setProfileOpen(false); navigate("home"); }}
            >
              <LogOut className="mr-2 h-4 w-4" /> Exit Admin Session
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DashboardSection({
  orders,
  onSelectSection,
  onSelectOrder,
  onFilterOrdersTab,
}: {
  orders: ReturnType<typeof useStore.getState>["orders"];
  onSelectSection: (s: AdminSection) => void;
  onSelectOrder: (o: Order) => void;
  onFilterOrdersTab?: (tab: "all" | "today" | "pending" | "shipped" | "delivered" | "cancelled") => void;
}) {
  const products = useStore((s) => s.products || allProducts);
  const totalSales = orders.reduce((s, o) => s + o.total, 0) + 358000;
  const totalOrders = orders.length + 287;
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 8);
  const outStock = products.filter((p) => p.stock <= 0);

  const isOrderToday = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const isSameDay = d.toDateString() === now.toDateString();
    const isWithin24Hours = now.getTime() - d.getTime() <= 24 * 60 * 60 * 1000;
    return isSameDay || isWithin24Hours;
  };

  const list = orders.length > 0 ? orders : sampleOrders;
  const todayOrders = list.filter((o) => isOrderToday(o.placedAt));
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const todayAwaitingDispatch = todayOrders.filter((o) =>
    ["placed", "confirmed", "processing"].includes(o.status)
  );
  const todayDispatched = todayOrders.filter((o) =>
    ["packed", "shipped", "delivered"].includes(o.status)
  );

  const kpis = [
    { label: "Total Revenue", value: formatINR(totalSales), change: "+12.4%", up: true, icon: IndianRupee, color: "text-emerald-600" },
    { label: "Orders", value: totalOrders.toString(), change: "+8.2%", up: true, icon: ShoppingBag, color: "text-blue-600" },
    { label: "Avg. Order Value", value: formatINR(Math.round(totalSales / totalOrders)), change: "+3.1%", up: true, icon: TrendingUp, color: "text-champagne" },
    { label: "Products", value: products.length.toString(), change: `${lowStock.length} low`, up: false, icon: Package, color: "text-amber-600" },
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Today's Order Corner */}
      <div className="rounded-xl border border-champagne/50 bg-gradient-to-br from-champagne/15 via-card to-card p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-border/70">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-charcoal text-ivory shadow-xs">
              <Clock className="h-5 w-5 text-champagne" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg font-semibold text-charcoal">Today&apos;s Order Corner</h2>
                <span className="flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" /> Live Today
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short", year: "numeric" })} · Vault Dispatch SLA (Courier cutoff: 4:00 PM)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              onClick={() => {
                if (onFilterOrdersTab) onFilterOrdersTab("today");
                else onSelectSection("orders");
              }}
              className="h-8 text-xs bg-charcoal text-ivory hover:bg-charcoal/90 gap-1.5 shadow-xs"
            >
              <ShoppingBag className="h-3.5 w-3.5 text-champagne" /> View Today&apos;s Queue ({todayOrders.length})
            </Button>
            {todayAwaitingDispatch.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  onSelectOrder(todayAwaitingDispatch[0]);
                  if (onFilterOrdersTab) onFilterOrdersTab("today");
                  else onSelectSection("orders");
                }}
                className="h-8 text-xs border-charcoal/30 bg-card hover:border-champagne gap-1.5"
                title="Open and print label for newest order today"
              >
                <Printer className="h-3.5 w-3.5 text-champagne" /> Print Today&apos;s Labels ({todayAwaitingDispatch.length})
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div
            onClick={() => {
              if (onFilterOrdersTab) onFilterOrdersTab("today");
              else onSelectSection("orders");
            }}
            className="rounded-lg border border-border/80 bg-card/80 p-3 hover:border-champagne cursor-pointer transition"
          >
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Today&apos;s Orders</p>
            <p className="text-2xl font-serif font-bold text-charcoal mt-1">{todayOrders.length}</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">● Received within 24h</p>
          </div>

          <div className="rounded-lg border border-border/80 bg-card/80 p-3">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Today&apos;s Sales</p>
            <p className="text-2xl font-serif font-bold text-emerald-700 mt-1">{formatINR(todayRevenue)}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Prepaid & COD booked</p>
          </div>

          <div
            onClick={() => {
              if (onFilterOrdersTab) onFilterOrdersTab("pending");
              else onSelectSection("orders");
            }}
            className="rounded-lg border border-border/80 bg-card/80 p-3 hover:border-amber-400 cursor-pointer transition"
          >
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Awaiting Dispatch</p>
            <p className="text-2xl font-serif font-bold text-amber-600 mt-1">{todayAwaitingDispatch.length}</p>
            <p className="text-[11px] text-amber-700 font-medium mt-0.5">Needs Label & Packaging</p>
          </div>

          <div
            onClick={() => {
              if (onFilterOrdersTab) onFilterOrdersTab("shipped");
              else onSelectSection("orders");
            }}
            className="rounded-lg border border-border/80 bg-card/80 p-3 hover:border-blue-400 cursor-pointer transition"
          >
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Dispatched Today</p>
            <p className="text-2xl font-serif font-bold text-blue-600 mt-1">{todayDispatched.length}</p>
            <p className="text-[11px] text-blue-700 font-medium mt-0.5">In Transit / Courier Handover</p>
          </div>
        </div>
      </div>
      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className={cn("flex h-9 w-9 items-center justify-center rounded-full bg-accent", k.color)}>
                <k.icon className="h-4 w-4" />
              </span>
              <span className={cn("inline-flex items-center gap-0.5 text-xs font-medium", k.up ? "text-emerald-600" : "text-amber-600")}>
                {k.up ? <TrendingUp className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                {k.change}
              </span>
            </div>
            <p className="mt-3 font-serif text-2xl">{k.value}</p>
            <p className="text-xs text-muted-foreground">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg">Sales overview</h2>
            <span className="text-xs text-muted-foreground">Last 7 months</span>
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ left: -10, right: 10, top: 5 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c9a96a" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#c9a96a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e1d8" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#888" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#888" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #e5e1d8", fontSize: 12 }}
                  formatter={(v: number) => formatINR(v)}
                />
                <Area type="monotone" dataKey="sales" stroke="#c9a96a" strokeWidth={2} fill="url(#salesGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
          <h2 className="font-serif text-lg">By category</h2>
          <div className="mt-2 h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2}>
                  {categoryData.map((c, i) => <Cell key={i} fill={c.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e1d8", fontSize: 12 }} formatter={(v: number) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1.5 text-xs">
            {categoryData.map((c) => (
              <div key={c.name} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
                <span className="text-muted-foreground">{c.name}</span>
                <span className="ml-auto font-medium">{c.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent orders + Low stock */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg">Recent orders</h2>
            <Button
              variant="link"
              onClick={() => onSelectSection("orders")}
              className="px-0 text-xs text-charcoal hover:underline"
            >
              View all orders →
            </Button>
          </div>
          {/* Mobile recent orders cards */}
          <div className="mt-3 md:hidden space-y-2.5">
            {(orders.length > 0 ? orders.slice(0, 5) : sampleOrders).map((o, i) => (
              <div
                key={i}
                onClick={() => {
                  onSelectOrder(o);
                  onSelectSection("orders");
                }}
                className="rounded-lg border border-border/70 bg-card p-3 shadow-2xs hover:border-champagne transition cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-xs text-charcoal">{o.number}</span>
                  <span className={cn("rounded-full border px-2 py-0.5 text-[10px] capitalize font-medium", statusBadge[o.status])}>
                    {o.status.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="truncate text-foreground/90 font-medium">{o.address.name}</span>
                  <span className="font-semibold text-charcoal">{formatINR(o.total)}</span>
                </div>
                <div className="mt-2.5 pt-2 border-t border-border/40 flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(o.placedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        onSelectOrder(o);
                        onSelectSection("orders");
                      }}
                      className="h-7 px-2 text-[11px] gap-1 border-charcoal/20 hover:border-champagne"
                    >
                      <Printer className="h-3 w-3 text-champagne" /> Print
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        onSelectOrder(o);
                        onSelectSection("orders");
                      }}
                      className="h-7 px-2 text-[11px]"
                    >
                      View →
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop & Tablet Table */}
          <div className="mt-4 hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="pb-2 font-medium">Order</th>
                  <th className="pb-2 font-medium">Customer</th>
                  <th className="pb-2 font-medium">Total</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(orders.length > 0 ? orders.slice(0, 5) : sampleOrders).map((o, i) => (
                  <tr
                    key={i}
                    onClick={() => {
                      onSelectOrder(o);
                      onSelectSection("orders");
                    }}
                    className="border-b border-border/50 last:border-0 hover:bg-accent/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 font-medium text-charcoal">{o.number}</td>
                    <td className="py-3 text-muted-foreground">{o.address.name}</td>
                    <td className="py-3 font-medium">{formatINR(o.total)}</td>
                    <td className="py-3">
                      <span className={cn("rounded-full border px-2 py-0.5 text-xs capitalize", statusBadge[o.status])}>
                        {o.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          onSelectOrder(o);
                          onSelectSection("orders");
                        }}
                        className="h-7 px-2.5 text-xs gap-1 border-charcoal/20 hover:border-champagne"
                        title="Print Shipping Label"
                      >
                        <Printer className="h-3 w-3 text-champagne" /> Print
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" /> Stock alerts
            </h2>
            <button
              onClick={() => onSelectSection("products")}
              className="text-xs text-muted-foreground hover:underline"
            >
              Catalog →
            </button>
          </div>
          <div className="mt-3 space-y-2">
            {outStock.concat(lowStock).slice(0, 5).map((p) => (
              <div
                key={p.id}
                onClick={() => onSelectSection("products")}
                className="flex items-center gap-3 rounded-lg border border-border p-2 cursor-pointer hover:bg-accent/30 transition-colors"
              >
                <img src={p.images[0]} alt={p.name} className="h-9 w-9 rounded object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.stock <= 0 ? "Out of stock" : `${p.stock} left`}</p>
                </div>
                <span className={cn("h-2 w-2 rounded-full", p.stock <= 0 ? "bg-red-500" : "bg-amber-500")} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const presetJewelleryImages = [
  { label: "Earrings", url: "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?auto=format&fit=crop&w=900&q=80" },
  { label: "Necklace", url: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=900&q=80" },
  { label: "Ring", url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=80" },
  { label: "Bracelet", url: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=900&q=80" },
  { label: "Bangle", url: "https://images.unsplash.com/photo-1508009745836-4a14be7d4f3f?auto=format&fit=crop&w=900&q=80" },
  { label: "Sets", url: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=900&q=80" },
];

function ProductsSection() {
  const navigate = useStore((s) => s.navigate);
  const products = useStore((s) => s.products || allProducts);
  const addProduct = useStore((s) => s.addProduct);
  const updateProduct = useStore((s) => s.updateProduct);
  const deleteProduct = useStore((s) => s.deleteProduct);

  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "single" | "combo">("all");

  // Modal dialog states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [productTypeTab, setProductTypeTab] = useState<"single" | "combo">("single");
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editComboProduct, setEditComboProduct] = useState<Product | null>(null);
  const [deleteProductTarget, setDeleteProductTarget] = useState<Product | null>(null);

  // Searchable Product Selector Modal for Combo
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [selectorTarget, setSelectorTarget] = useState<"add" | "edit">("add");
  const [selectorSearch, setSelectorSearch] = useState("");
  const [selectorCat, setSelectorCat] = useState("all");

  // Single Product Form State (preserved intact)
  const initialNewProduct = {
    name: "",
    category: "earrings" as CategorySlug,
    subcategory: "drop",
    collection: "celeste",
    price: 1499,
    mrp: 1999,
    stock: 25,
    material: "18k Gold Plated Brass",
    description: "Handcrafted with premium finish and hypoallergenic materials.",
    image: presetJewelleryImages[0].url,
    bestseller: false,
    newArrival: true,
  };
  const [newForm, setNewForm] = useState(initialNewProduct);

  // Edit Single Product Form State
  const [editForm, setEditForm] = useState({
    name: "",
    category: "earrings" as CategorySlug,
    price: 0,
    mrp: 0,
    stock: 0,
    material: "",
    description: "",
    image: "",
    bestseller: false,
    newArrival: false,
  });

  // Combo SKU Generator
  const generateComboSku = () => `SHR-CMB-${Math.floor(100 + Math.random() * 900)}`;

  // Combo Form State
  const initialComboForm = {
    name: "",
    sku: generateComboSku(),
    category: "sets" as CategorySlug,
    collection: "celeste",
    price: 0,
    mrp: 0,
    material: "18k Gold Plated Brass, Baroque Pearl & Cubic Zirconia",
    description: "Curated festive jewellery combo set with complementary handcrafted pieces.",
    image: presetJewelleryImages[5].url,
    additionalImages: "",
    components: [] as { productId: string; quantity: number }[],
    newArrival: true,
    bestseller: false,
    featured: true,
    status: "active" as "active" | "draft",
  };
  const [comboForm, setComboForm] = useState(initialComboForm);
  const [comboFormError, setComboFormError] = useState<string | null>(null);

  // Edit Combo Form State
  const [editComboForm, setEditComboForm] = useState(initialComboForm);
  const [editComboError, setEditComboError] = useState<string | null>(null);

  // Calculations for Add Combo Form
  const comboComponentDetails = useMemo(() => {
    return comboForm.components.map((c) => {
      const p = products.find((item) => item.id === c.productId);
      return {
        ...c,
        product: p,
      };
    });
  }, [comboForm.components, products]);

  const individualTotal = useMemo(() => {
    return comboComponentDetails.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
  }, [comboComponentDetails]);

  const combinedMrp = useMemo(() => {
    return comboComponentDetails.reduce(
      (sum, item) => sum + (item.product?.mrp || item.product?.price || 0) * item.quantity,
      0
    );
  }, [comboComponentDetails]);

  const availableComboStock = useMemo(() => {
    if (comboForm.components.length === 0) return 0;
    return calculateComboStock(
      comboForm.components.map((c) => ({ componentProductId: c.productId, quantity: c.quantity })),
      products
    );
  }, [comboForm.components, products]);

  const comboSavings = Math.max(0, individualTotal - Number(comboForm.price || 0));
  const comboDiscountPct =
    individualTotal > 0 && Number(comboForm.price) < individualTotal
      ? Math.round(((individualTotal - Number(comboForm.price)) / individualTotal) * 100)
      : 0;

  // Calculations for Edit Combo Form
  const editComboComponentDetails = useMemo(() => {
    return editComboForm.components.map((c) => {
      const p = products.find((item) => item.id === c.productId);
      return {
        ...c,
        product: p,
      };
    });
  }, [editComboForm.components, products]);

  const editIndividualTotal = useMemo(() => {
    return editComboComponentDetails.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
  }, [editComboComponentDetails]);

  const editCombinedMrp = useMemo(() => {
    return editComboComponentDetails.reduce(
      (sum, item) => sum + (item.product?.mrp || item.product?.price || 0) * item.quantity,
      0
    );
  }, [editComboComponentDetails]);

  const editAvailableComboStock = useMemo(() => {
    if (editComboForm.components.length === 0) return 0;
    return calculateComboStock(
      editComboForm.components.map((c) => ({ componentProductId: c.productId, quantity: c.quantity })),
      products
    );
  }, [editComboForm.components, products]);

  const editComboSavings = Math.max(0, editIndividualTotal - Number(editComboForm.price || 0));
  const editComboDiscountPct =
    editIndividualTotal > 0 && Number(editComboForm.price) < editIndividualTotal
      ? Math.round(((editIndividualTotal - Number(editComboForm.price)) / editIndividualTotal) * 100)
      : 0;

  // Candidate products for selector modal
  const candidateProducts = useMemo(() => {
    const currentComboId = selectorTarget === "edit" ? editComboProduct?.id : null;
    return products.filter((p) => {
      if (currentComboId && p.id === currentComboId) return false;
      if (selectorCat !== "all" && p.category !== selectorCat) return false;
      if (selectorSearch.trim()) {
        const q = selectorSearch.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesSku = p.sku.toLowerCase().includes(q);
        return matchesName || matchesSku;
      }
      return true;
    });
  }, [products, selectorTarget, editComboProduct, selectorCat, selectorSearch]);

  const handleAddComponentToCombo = (target: "add" | "edit", productToAdd: Product) => {
    const isTargetAdd = target === "add";
    const setter = isTargetAdd ? setComboForm : setEditComboForm;

    setter((prev) => {
      const existingIdx = prev.components.findIndex((c) => c.productId === productToAdd.id);
      let updatedComponents;
      if (existingIdx !== -1) {
        updatedComponents = prev.components.map((c, i) =>
          i === existingIdx ? { ...c, quantity: c.quantity + 1 } : c
        );
      } else {
        updatedComponents = [...prev.components, { productId: productToAdd.id, quantity: 1 }];
      }

      const newTotal = updatedComponents.reduce((sum, c) => {
        const item = products.find((p) => p.id === c.productId);
        return sum + (item?.price || 0) * c.quantity;
      }, 0);

      const newMrp = updatedComponents.reduce((sum, c) => {
        const item = products.find((p) => p.id === c.productId);
        return sum + (item?.mrp || item?.price || 0) * c.quantity;
      }, 0);

      const newPrice = isTargetAdd && (prev.price === 0 || prev.price === prev.mrp)
        ? Math.round(newTotal * 0.8)
        : prev.price;

      return {
        ...prev,
        components: updatedComponents,
        price: newPrice,
        mrp: newMrp,
      };
    });
  };

  const handleUpdateComponentQty = (target: "add" | "edit", productId: string, delta: number) => {
    const setter = target === "add" ? setComboForm : setEditComboForm;
    setter((prev) => {
      const updated = prev.components
        .map((c) => {
          if (c.productId === productId) {
            const nextQty = c.quantity + delta;
            return nextQty > 0 ? { ...c, quantity: nextQty } : null;
          }
          return c;
        })
        .filter(Boolean) as { productId: string; quantity: number }[];

      const newMrp = updated.reduce((sum, c) => {
        const item = products.find((p) => p.id === c.productId);
        return sum + (item?.mrp || item?.price || 0) * c.quantity;
      }, 0);

      return {
        ...prev,
        components: updated,
        mrp: newMrp,
      };
    });
  };

  const handleRemoveComponent = (target: "add" | "edit", productId: string) => {
    const setter = target === "add" ? setComboForm : setEditComboForm;
    setter((prev) => {
      const updated = prev.components.filter((c) => c.productId !== productId);
      const newMrp = updated.reduce((sum, c) => {
        const item = products.find((p) => p.id === c.productId);
        return sum + (item?.mrp || item?.price || 0) * c.quantity;
      }, 0);
      return {
        ...prev,
        components: updated,
        mrp: newMrp,
      };
    });
  };

  const handleOpenEdit = (p: Product) => {
    if (p.productType === "combo") {
      setEditComboProduct(p);
      setEditComboForm({
        name: p.name,
        sku: p.sku,
        category: p.category,
        collection: p.collection || "celeste",
        price: p.price,
        mrp: p.mrp,
        material: p.material || "18k Gold Plated Brass",
        description: p.description || "",
        image: p.images[0] || presetJewelleryImages[5].url,
        additionalImages: p.images.slice(1).join(", "),
        components: p.comboComponents?.map((c) => ({ productId: c.componentProductId, quantity: c.quantity })) || [],
        newArrival: !!p.newArrival,
        bestseller: !!p.bestseller,
        featured: !!p.featured,
        status: p.status || "active",
      });
      setEditComboError(null);
    } else {
      setEditProduct(p);
      setEditForm({
        name: p.name,
        category: p.category,
        price: p.price,
        mrp: p.mrp,
        stock: p.stock,
        material: p.material || "18k Gold Plated Brass",
        description: p.description || "",
        image: p.images[0] || presetJewelleryImages[0].url,
        bestseller: !!p.bestseller,
        newArrival: !!p.newArrival,
      });
    }
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.name.trim()) return;

    const slug = newForm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const sku = `SHR-${newForm.category.toUpperCase().slice(0, 4)}-${randomSuffix}`;

    const created: Product = {
      id: `p-${Date.now()}`,
      sku,
      name: newForm.name.trim(),
      slug: slug || `product-${randomSuffix}`,
      category: newForm.category,
      subcategory: newForm.subcategory,
      collection: newForm.collection,
      price: Number(newForm.price) || 999,
      mrp: Number(newForm.mrp) || Number(newForm.price) || 1299,
      images: [newForm.image || presetJewelleryImages[0].url],
      colors: [{ id: "gold", name: "Gold-tone", color: "#c9a96a", stock: Number(newForm.stock) || 10 }],
      sizes: ["Free Size"],
      material: newForm.material,
      weight: "12g",
      dimensions: "Standard",
      care: "Avoid contact with water, perfumes, and harsh chemicals. Store in airtight pouch.",
      description: newForm.description,
      rating: 5.0,
      reviewCount: 0,
      reviews: [],
      tags: [newForm.category, "handcrafted", "new"],
      badges: newForm.newArrival ? ["new"] : [],
      stock: Number(newForm.stock) || 0,
      bestseller: newForm.bestseller,
      newArrival: newForm.newArrival,
      featured: true,
      productType: "single",
      status: "active",
    };

    addProduct(created);
    setNewForm(initialNewProduct);
    setIsAddOpen(false);
  };

  const handleCreateCombo = (e: React.FormEvent) => {
    e.preventDefault();
    setComboFormError(null);

    if (!comboForm.name.trim()) {
      setComboFormError("Please enter a Combo / Bundle Name.");
      return;
    }
    if (!comboForm.sku.trim()) {
      setComboFormError("Please provide a Bundle SKU.");
      return;
    }
    if (comboForm.components.length === 0) {
      setComboFormError("Please add at least one product to this combo.");
      return;
    }
    if (Number(comboForm.price) <= 0) {
      setComboFormError("Combo Selling Price must be greater than 0.");
      return;
    }

    const slug = comboForm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const images = [comboForm.image || presetJewelleryImages[5].url];
    if (comboForm.additionalImages) {
      comboForm.additionalImages
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((u) => {
          if (!images.includes(u)) images.push(u);
        });
    }

    const created: Product = {
      id: `cmb-${Date.now()}`,
      sku: comboForm.sku.trim(),
      name: comboForm.name.trim(),
      slug: slug || `combo-${Math.floor(100 + Math.random() * 900)}`,
      productType: "combo",
      category: comboForm.category,
      subcategory: "combo-deals",
      collection: comboForm.collection,
      price: Number(comboForm.price),
      mrp: Number(comboForm.mrp) || individualTotal || Number(comboForm.price),
      images,
      colors: [{ id: "combo-default", name: "Standard Set", color: "#c9a96a", stock: availableComboStock }],
      sizes: ["Free Size"],
      material: comboForm.material,
      weight: "Coordinated Set",
      dimensions: "Multiple pieces",
      care: "Avoid contact with water and perfume. Store each component in the included soft pouch.",
      description: comboForm.description,
      rating: 5.0,
      reviewCount: 0,
      reviews: [],
      tags: [comboForm.category, "combo", "bundle", comboForm.collection],
      badges: [
        "combo",
        ...(comboForm.newArrival ? ["new" as ProductBadge] : []),
        ...(comboForm.bestseller ? ["bestseller" as ProductBadge] : []),
      ],
      stock: availableComboStock,
      bestseller: comboForm.bestseller,
      newArrival: comboForm.newArrival,
      featured: comboForm.featured,
      status: comboForm.status,
      comboComponents: comboForm.components.map((c) => ({ componentProductId: c.productId, quantity: c.quantity })),
    };

    addProduct(created);
    setComboForm({
      ...initialComboForm,
      sku: generateComboSku(),
    });
    setIsAddOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProduct || !editForm.name.trim()) return;

    updateProduct(editProduct.id, {
      name: editForm.name.trim(),
      category: editForm.category,
      price: Number(editForm.price),
      mrp: Number(editForm.mrp),
      stock: Number(editForm.stock),
      material: editForm.material,
      description: editForm.description,
      images: [editForm.image, ...editProduct.images.slice(1)],
      bestseller: editForm.bestseller,
      newArrival: editForm.newArrival,
    });

    setEditProduct(null);
  };

  const handleSaveEditCombo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editComboProduct) return;
    setEditComboError(null);

    if (!editComboForm.name.trim()) {
      setEditComboError("Please enter a Combo Name.");
      return;
    }
    if (!editComboForm.sku.trim()) {
      setEditComboError("Please enter a Bundle SKU.");
      return;
    }
    if (editComboForm.components.length === 0) {
      setEditComboError("Please include at least one product in this combo.");
      return;
    }
    if (Number(editComboForm.price) <= 0) {
      setEditComboError("Combo Selling Price must be greater than 0.");
      return;
    }

    const images = [editComboForm.image || presetJewelleryImages[5].url];
    if (editComboForm.additionalImages) {
      editComboForm.additionalImages
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((u) => {
          if (!images.includes(u)) images.push(u);
        });
    }

    updateProduct(editComboProduct.id, {
      name: editComboForm.name.trim(),
      sku: editComboForm.sku.trim(),
      category: editComboForm.category,
      collection: editComboForm.collection,
      price: Number(editComboForm.price),
      mrp: Number(editComboForm.mrp) || editIndividualTotal || Number(editComboForm.price),
      material: editComboForm.material,
      description: editComboForm.description,
      images,
      bestseller: editComboForm.bestseller,
      newArrival: editComboForm.newArrival,
      featured: editComboForm.featured,
      status: editComboForm.status,
      productType: "combo",
      comboComponents: editComboForm.components.map((c) => ({
        componentProductId: c.productId,
        quantity: c.quantity,
      })),
      stock: editAvailableComboStock,
    });

    setEditComboProduct(null);
  };

  const handleDeleteConfirm = () => {
    if (!deleteProductTarget) return;
    deleteProduct(deleteProductTarget.id);
    setDeleteProductTarget(null);
  };

  const filtered = products.filter((p) => {
    const matchesCat = cat === "all" || p.category === cat;
    const matchesType =
      typeFilter === "all" ||
      (typeFilter === "combo" ? p.productType === "combo" : p.productType !== "combo");
    const q = search.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q);
    return matchesCat && matchesType && matchesSearch;
  });

  return (
    <div className="animate-fade-up">
      {/* Search, Category, and Type Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 flex-1 sm:flex-initial">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by name or SKU…"
              className="w-full sm:w-48 bg-transparent text-sm outline-none"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-xs text-muted-foreground hover:text-foreground">
                ✕
              </button>
            )}
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as "all" | "single" | "combo")}
            className="h-10 rounded-md border border-border bg-card px-3 text-sm outline-none flex-1 sm:flex-initial"
          >
            <option value="all">All Types ({products.length})</option>
            <option value="single">Single Products ({products.filter((p) => p.productType !== "combo").length})</option>
            <option value="combo">Combos & Bundles ({products.filter((p) => p.productType === "combo").length})</option>
          </select>
          <select
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            className="h-10 rounded-md border border-border bg-card px-3 text-sm outline-none flex-1 sm:flex-initial"
          >
            <option value="all">All categories ({products.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name} ({products.filter((p) => p.category === c.slug).length})
              </option>
            ))}
          </select>
        </div>
        <Button
          onClick={() => {
            setProductTypeTab("single");
            setComboFormError(null);
            setIsAddOpen(true);
          }}
          className="w-full sm:w-auto bg-charcoal text-ivory hover:bg-charcoal/90 transition shadow-sm"
        >
          <Plus className="mr-1.5 h-4 w-4" /> Add product
        </Button>
      </div>

      {/* Mobile product cards */}
      <div className="mt-4 md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground text-sm">
            No products found matching your filter criteria.
          </div>
        ) : (
          filtered.map((p) => {
            const isCombo = p.productType === "combo";
            const effectiveStock = isCombo ? calculateComboStock(p.comboComponents, products) : p.stock;

            return (
              <div
                key={p.id}
                className="rounded-xl border border-border/80 bg-card p-3.5 shadow-2xs space-y-3 transition hover:border-champagne"
              >
                <div className="flex gap-3 items-start">
                  <div className="relative shrink-0">
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="h-16 w-16 rounded-lg object-cover border border-border shrink-0"
                    />
                    {isCombo && (
                      <span className="absolute -bottom-1 -right-1 rounded bg-amber-800 text-amber-50 text-[9px] font-bold px-1 py-0.2 shadow-sm uppercase">
                        Combo
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground capitalize">
                          {p.category}
                        </span>
                        {isCombo && (
                          <Badge className="bg-amber-800 text-amber-50 border-amber-600/40 text-[9px] px-1 py-0 font-bold uppercase">
                            Combo
                          </Badge>
                        )}
                      </div>
                      {effectiveStock <= 0 ? (
                        <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700 text-[10px] py-0">Out of stock</Badge>
                      ) : effectiveStock <= 8 ? (
                        <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 text-[10px] py-0">Low stock ({effectiveStock})</Badge>
                      ) : (
                        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 text-[10px] py-0">Active ({effectiveStock})</Badge>
                      )}
                    </div>
                    <p className="font-medium text-sm text-foreground truncate mt-0.5">{p.name}</p>
                    <p className="text-[11px] text-muted-foreground">{p.sku}</p>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="font-semibold text-sm text-charcoal">{formatINR(p.price)}</span>
                      {p.mrp > p.price && (
                        <span className="text-xs text-muted-foreground line-through">
                          {formatINR(p.mrp)}
                        </span>
                      )}
                      <span className="ml-auto text-xs text-muted-foreground">{p.rating.toFixed(1)} ★</span>
                    </div>
                  </div>
                </div>

                {/* Action buttons on mobile */}
                <div className="pt-2 border-t border-border/50 flex items-center justify-between gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setViewProduct(p)}
                    className="flex-1 h-8 text-xs gap-1"
                  >
                    <Eye className="h-3.5 w-3.5" /> View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenEdit(p)}
                    className="flex-1 h-8 text-xs gap-1"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeleteProductTarget(p)}
                    className="h-8 px-2.5 text-xs text-red-600 hover:bg-red-50"
                    title="Delete product"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop & Tablet Table */}
      <div className="mt-4 hidden md:block overflow-x-auto rounded-xl border border-border bg-card shadow-xs">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-accent/30 text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Rating</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                  No products found. Click &quot;Add product&quot; above to create one.
                </td>
              </tr>
            ) : (
              filtered.map((p) => {
                const isCombo = p.productType === "combo";
                const effectiveStock = isCombo ? calculateComboStock(p.comboComponents, products) : p.stock;

                return (
                  <tr key={p.id} className="border-b border-border/50 last:border-0 hover:bg-accent/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <img src={p.images[0]} alt={p.name} className="h-10 w-10 rounded-md object-cover border border-border/60" />
                          {isCombo && (
                            <span className="absolute -bottom-1 -right-1 rounded bg-amber-800 text-amber-50 text-[8px] font-bold px-1 py-0 uppercase">
                              Cmb
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 max-w-[200px] sm:max-w-xs">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="truncate font-medium">{p.name}</p>
                            {isCombo && (
                              <Badge className="bg-amber-800 text-amber-50 hover:bg-amber-800/90 border-amber-600/40 text-[9px] px-1.5 py-0 font-bold tracking-wider inline-flex items-center gap-0.5">
                                <Layers className="h-2.5 w-2.5" /> COMBO
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{p.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {isCombo ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200/80 px-2 py-0.5 text-xs font-semibold text-amber-800">
                          <Layers className="h-3 w-3" /> Combo
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Single</span>
                      )}
                    </td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">{p.category}</td>
                    <td className="px-4 py-3">
                      <span className="font-medium">{formatINR(p.price)}</span>
                      {p.mrp > p.price && (
                        <span className="ml-1 text-xs text-muted-foreground line-through">
                          {formatINR(p.mrp)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "font-medium",
                          effectiveStock <= 0 ? "text-red-600" : effectiveStock <= 8 ? "text-amber-600" : "text-emerald-600"
                        )}
                      >
                        {effectiveStock}
                      </span>
                      {isCombo && (
                        <span className="block text-[10px] text-muted-foreground whitespace-nowrap">
                          from components
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">{p.rating.toFixed(1)} ★</td>
                    <td className="px-4 py-3">
                      {effectiveStock <= 0 ? (
                        <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">Out of stock</Badge>
                      ) : effectiveStock <= 8 ? (
                        <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">Low stock</Badge>
                      ) : (
                        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">Active</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <button
                          title="View product details"
                          onClick={() => setViewProduct(p)}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          title="Edit product"
                          onClick={() => handleOpenEdit(p)}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          title="Delete product"
                          onClick={() => setDeleteProductTarget(p)}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add Product / Combo Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              {productTypeTab === "combo" ? "Add New Combo / Bundle" : "Add New Product"}
            </DialogTitle>
            <DialogDescription>
              {productTypeTab === "combo"
                ? "Bundle multiple jewellery pieces together at a special combo price."
                : "Create a new handcrafted piece for the VRUNDORA jewellery collection."}
            </DialogDescription>
          </DialogHeader>

          {/* Requirement 1: Product Type selection segmented buttons */}
          <div className="space-y-1.5 pt-1 pb-2 border-b border-border">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Product Type *
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-accent/40 border border-border">
              <button
                type="button"
                onClick={() => setProductTypeTab("single")}
                className={cn(
                  "flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-all",
                  productTypeTab === "single"
                    ? "bg-card text-foreground shadow-xs border border-border font-semibold text-charcoal"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Gem className="h-3.5 w-3.5 text-champagne" />
                <span>Single Product</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setProductTypeTab("combo");
                  if (!comboForm.sku) setComboForm((prev) => ({ ...prev, sku: generateComboSku() }));
                }}
                className={cn(
                  "flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-all",
                  productTypeTab === "combo"
                    ? "bg-card text-foreground shadow-xs border border-champagne/50 font-semibold text-charcoal"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Layers className="h-3.5 w-3.5 text-amber-700" />
                <span>Combo / Bundle</span>
              </button>
            </div>
          </div>

          {/* SINGLE PRODUCT FORM - Preserved exactly */}
          {productTypeTab === "single" && (
            <form onSubmit={handleCreateProduct} className="space-y-4 py-2">
              <div>
                <label className="text-xs font-medium text-foreground/80">Product Name *</label>
                <Input
                  required
                  placeholder="e.g. Royal Kundan Choker Necklace"
                  value={newForm.name}
                  onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-foreground/80">Category *</label>
                  <select
                    value={newForm.category}
                    onChange={(e) => setNewForm({ ...newForm, category: e.target.value as CategorySlug })}
                    className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground/80">Collection</label>
                  <select
                    value={newForm.collection}
                    onChange={(e) => setNewForm({ ...newForm, collection: e.target.value })}
                    className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none"
                  >
                    <option value="celeste">Celeste (Everyday Elegance)</option>
                    <option value="noir">Noir (Bridal & Statement)</option>
                    <option value="lumiere">Lumière (Modern Crystal)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-foreground/80">Selling Price (₹) *</label>
                  <Input
                    required
                    type="number"
                    min="1"
                    value={newForm.price}
                    onChange={(e) => setNewForm({ ...newForm, price: Number(e.target.value) })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground/80">MRP (₹)</label>
                  <Input
                    type="number"
                    min="1"
                    value={newForm.mrp}
                    onChange={(e) => setNewForm({ ...newForm, mrp: Number(e.target.value) })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground/80">Stock Quantity *</label>
                  <Input
                    required
                    type="number"
                    min="0"
                    value={newForm.stock}
                    onChange={(e) => setNewForm({ ...newForm, stock: Number(e.target.value) })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground/80">Material & Finish</label>
                <Input
                  placeholder="e.g. 18k Gold Plated Brass, Semi-precious Stones"
                  value={newForm.material}
                  onChange={(e) => setNewForm({ ...newForm, material: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground/80">Image URL</label>
                <Input
                  placeholder="https://..."
                  value={newForm.image}
                  onChange={(e) => setNewForm({ ...newForm, image: e.target.value })}
                  className="mt-1"
                />
                <p className="mt-1.5 text-[11px] text-muted-foreground">Or choose from curated preset imagery:</p>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {presetJewelleryImages.map((img) => (
                    <button
                      key={img.label}
                      type="button"
                      onClick={() => setNewForm({ ...newForm, image: img.url })}
                      className={cn(
                        "flex items-center gap-1.5 rounded-md border p-1 text-xs transition",
                        newForm.image === img.url ? "border-champagne bg-champagne/10 font-medium" : "border-border hover:bg-accent"
                      )}
                    >
                      <img src={img.url} alt={img.label} className="h-6 w-6 rounded object-cover" />
                      <span>{img.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground/80">Description</label>
                <Textarea
                  rows={2}
                  placeholder="Provide details about craftsmanship, design inspiration..."
                  value={newForm.description}
                  onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div className="flex items-center gap-6 pt-1 text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newForm.newArrival}
                    onChange={(e) => setNewForm({ ...newForm, newArrival: e.target.checked })}
                    className="h-4 w-4 rounded accent-charcoal"
                  />
                  <span>Tag as New Arrival</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newForm.bestseller}
                    onChange={(e) => setNewForm({ ...newForm, bestseller: e.target.checked })}
                    className="h-4 w-4 rounded accent-charcoal"
                  />
                  <span>Tag as Bestseller</span>
                </label>
              </div>

              <DialogFooter className="mt-4 pt-2 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-charcoal text-ivory hover:bg-charcoal/90">
                  <Plus className="mr-1.5 h-4 w-4" /> Create Product
                </Button>
              </DialogFooter>
            </form>
          )}

          {/* COMBO / BUNDLE FORM */}
          {productTypeTab === "combo" && (
            <form onSubmit={handleCreateCombo} className="space-y-4 py-2">
              {comboFormError && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                  <span>{comboFormError}</span>
                </div>
              )}

              {/* Combo Name and SKU */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-foreground/80">Combo / Bundle Name *</label>
                  <Input
                    required
                    placeholder="e.g. Necklace & Earrings Festive Combo"
                    value={comboForm.name}
                    onChange={(e) => setComboForm({ ...comboForm, name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-foreground/80">Bundle SKU *</label>
                    <button
                      type="button"
                      onClick={() => setComboForm((prev) => ({ ...prev, sku: generateComboSku() }))}
                      className="text-[10px] text-muted-foreground hover:text-charcoal flex items-center gap-0.5"
                    >
                      <RefreshCw className="h-2.5 w-2.5" /> Auto
                    </button>
                  </div>
                  <Input
                    required
                    placeholder="SHR-CMB-001"
                    value={comboForm.sku}
                    onChange={(e) => setComboForm({ ...comboForm, sku: e.target.value })}
                    className="mt-1 font-mono uppercase text-xs"
                  />
                </div>
              </div>

              {/* Category and Collection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-foreground/80">Category *</label>
                  <select
                    value={comboForm.category}
                    onChange={(e) => setComboForm({ ...comboForm, category: e.target.value as CategorySlug })}
                    className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground/80">Collection</label>
                  <select
                    value={comboForm.collection}
                    onChange={(e) => setComboForm({ ...comboForm, collection: e.target.value })}
                    className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none"
                  >
                    <option value="celeste">Celeste (Everyday Elegance)</option>
                    <option value="noir">Noir (Bridal & Statement)</option>
                    <option value="lumiere">Lumière (Modern Crystal)</option>
                    <option value="essentials">Essentials (Daily Staples)</option>
                  </select>
                </div>
              </div>

              {/* SECTION: Products Included in this Combo */}
              <div className="rounded-xl border border-champagne/40 bg-accent/20 p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-champagne" /> Products included in this combo *
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Select catalogue products to include in this bundle deal
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectorTarget("add");
                      setSelectorSearch("");
                      setSelectorCat("all");
                      setIsSelectorOpen(true);
                    }}
                    className="h-8 text-xs bg-card border-champagne text-charcoal hover:bg-champagne/20 gap-1 shadow-2xs"
                  >
                    <Plus className="h-3.5 w-3.5 text-champagne" /> Add Product
                  </Button>
                </div>

                {/* Selected Products List */}
                {comboComponentDetails.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border bg-card/60 p-6 text-center">
                    <Package className="mx-auto h-8 w-8 text-muted-foreground/60 mb-1.5" />
                    <p className="text-xs text-foreground/80 font-medium">No products added to this combo yet</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Click &quot;+ Add Product&quot; to pick items from your catalogue
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {comboComponentDetails.map((item) => (
                      <div
                        key={item.productId}
                        className="flex items-center gap-3 rounded-lg border border-border bg-card p-2.5 shadow-2xs"
                      >
                        <img
                          src={item.product?.images[0] || presetJewelleryImages[0].url}
                          alt={item.product?.name || "Product"}
                          className="h-12 w-12 rounded-md object-cover border border-border shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-foreground truncate">
                            {item.product?.name || "Catalogue Product"}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                            <span className="font-mono">{item.product?.sku}</span>
                            <span>·</span>
                            <span className="font-semibold text-charcoal">{formatINR(item.product?.price || 0)}</span>
                            <span>·</span>
                            <span className={cn(
                              "font-medium",
                              (item.product?.stock || 0) <= 0 ? "text-red-600" : "text-emerald-600"
                            )}>
                              Stock: {item.product?.stock || 0}
                            </span>
                          </div>
                        </div>

                        {/* Quantity Counter */}
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[11px] text-muted-foreground mr-1">Qty:</span>
                          <div className="inline-flex items-center rounded-md border border-border bg-background">
                            <button
                              type="button"
                              onClick={() => handleUpdateComponentQty("add", item.productId, -1)}
                              className="h-6 w-6 flex items-center justify-center text-muted-foreground hover:text-foreground"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-6 text-center text-xs font-medium">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateComponentQty("add", item.productId, 1)}
                              className="h-6 w-6 flex items-center justify-center text-muted-foreground hover:text-foreground"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveComponent("add", item.productId)}
                            className="p-1 rounded text-muted-foreground hover:bg-red-50 hover:text-red-600 ml-1 transition"
                            title="Remove from combo"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Live Available Stock Badge */}
                {comboForm.components.length > 0 && (
                  <div className={cn(
                    "rounded-lg p-2.5 text-xs flex items-center justify-between border",
                    availableComboStock > 0 ? "bg-emerald-50/80 border-emerald-200 text-emerald-800" : "bg-red-50/80 border-red-200 text-red-700"
                  )}>
                    <div className="flex items-center gap-1.5">
                      <PackageCheck className="h-4 w-4 shrink-0" />
                      <span>
                        <strong>Calculated Combo Stock: {availableComboStock} units</strong>
                        <span className="text-[11px] opacity-80 block sm:inline sm:ml-1">
                          (Derived from component inventory. Stock is deducted from components on purchase.)
                        </span>
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION: Automatic Pricing and Calculations */}
              <div className="rounded-xl border border-border bg-card p-3.5 space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal">
                  Pricing & Discount Logic
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-foreground/80">Combo Selling Price (₹) *</label>
                    <Input
                      required
                      type="number"
                      min="1"
                      placeholder="e.g. 2499"
                      value={comboForm.price || ""}
                      onChange={(e) => setComboForm({ ...comboForm, price: Number(e.target.value) })}
                      className="mt-1 font-semibold text-charcoal"
                    />
                    <p className="mt-1 text-[11px] text-muted-foreground">Admin-defined special price for the combo.</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground/80">Total MRP / Combined MRP (₹)</label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="Auto-calculated from components"
                      value={comboForm.mrp || combinedMrp || ""}
                      onChange={(e) => setComboForm({ ...comboForm, mrp: Number(e.target.value) })}
                      className="mt-1"
                    />
                    <p className="mt-1 text-[11px] text-muted-foreground">Combined MRP of components.</p>
                  </div>
                </div>

                {/* Real-time Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs pt-1">
                  <div className="rounded-lg bg-accent/40 p-2 border border-border/70">
                    <span className="text-[10px] text-muted-foreground uppercase block">Individual Total</span>
                    <span className="text-sm font-semibold text-foreground mt-0.5 block">{formatINR(individualTotal)}</span>
                  </div>
                  <div className="rounded-lg bg-champagne/15 p-2 border border-champagne/40">
                    <span className="text-[10px] text-charcoal uppercase block font-semibold">Combo Price</span>
                    <span className="text-sm font-bold text-charcoal mt-0.5 block">{formatINR(Number(comboForm.price || 0))}</span>
                  </div>
                  <div className="rounded-lg bg-emerald-50 p-2 border border-emerald-200">
                    <span className="text-[10px] text-emerald-800 uppercase block font-semibold">You Save</span>
                    <span className="text-sm font-bold text-emerald-700 mt-0.5 block">{formatINR(comboSavings)}</span>
                  </div>
                  <div className="rounded-lg bg-emerald-50 p-2 border border-emerald-200">
                    <span className="text-[10px] text-emerald-800 uppercase block font-semibold">Discount</span>
                    <span className="text-sm font-bold text-emerald-700 mt-0.5 block">{comboDiscountPct}% off</span>
                  </div>
                </div>
              </div>

              {/* Material & Finish */}
              <div>
                <label className="text-xs font-medium text-foreground/80">Material & Finish</label>
                <Input
                  placeholder="e.g. 18k Gold Plated Brass, Baroque Pearl & Cubic Zirconia"
                  value={comboForm.material}
                  onChange={(e) => setComboForm({ ...comboForm, material: e.target.value })}
                  className="mt-1"
                />
              </div>

              {/* Main Bundle Image */}
              <div>
                <label className="text-xs font-medium text-foreground/80">Main Bundle Image URL</label>
                <Input
                  placeholder="https://..."
                  value={comboForm.image}
                  onChange={(e) => setComboForm({ ...comboForm, image: e.target.value })}
                  className="mt-1"
                />
                <p className="mt-1.5 text-[11px] text-muted-foreground">Or choose from curated preset imagery:</p>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {presetJewelleryImages.map((img) => (
                    <button
                      key={img.label}
                      type="button"
                      onClick={() => setComboForm({ ...comboForm, image: img.url })}
                      className={cn(
                        "flex items-center gap-1.5 rounded-md border p-1 text-xs transition",
                        comboForm.image === img.url ? "border-champagne bg-champagne/10 font-medium" : "border-border hover:bg-accent"
                      )}
                    >
                      <img src={img.url} alt={img.label} className="h-6 w-6 rounded object-cover" />
                      <span>{img.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional Images */}
              <div>
                <label className="text-xs font-medium text-foreground/80">Additional Images (comma separated URLs)</label>
                <Input
                  placeholder="https://image2.jpg, https://image3.jpg"
                  value={comboForm.additionalImages}
                  onChange={(e) => setComboForm({ ...comboForm, additionalImages: e.target.value })}
                  className="mt-1 text-xs"
                />
              </div>

              {/* Bundle Description */}
              <div>
                <label className="text-xs font-medium text-foreground/80">Bundle Description</label>
                <Textarea
                  rows={2}
                  placeholder="Describe the styling synergy, occasion compatibility, and bundle savings..."
                  value={comboForm.description}
                  onChange={(e) => setComboForm({ ...comboForm, description: e.target.value })}
                  className="mt-1"
                />
              </div>

              {/* Tags and Status */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-1 text-sm border-t border-border/60">
                <div className="flex items-center gap-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={comboForm.newArrival}
                      onChange={(e) => setComboForm({ ...comboForm, newArrival: e.target.checked })}
                      className="h-4 w-4 rounded accent-charcoal"
                    />
                    <span>New Arrival</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={comboForm.bestseller}
                      onChange={(e) => setComboForm({ ...comboForm, bestseller: e.target.checked })}
                      className="h-4 w-4 rounded accent-charcoal"
                    />
                    <span>Bestseller</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={comboForm.featured}
                      onChange={(e) => setComboForm({ ...comboForm, featured: e.target.checked })}
                      className="h-4 w-4 rounded accent-charcoal"
                    />
                    <span>Featured</span>
                  </label>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="font-medium text-muted-foreground">Status:</span>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="combo-status"
                      value="active"
                      checked={comboForm.status === "active"}
                      onChange={() => setComboForm({ ...comboForm, status: "active" })}
                      className="accent-charcoal"
                    />
                    <span>Active</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="combo-status"
                      value="draft"
                      checked={comboForm.status === "draft"}
                      onChange={() => setComboForm({ ...comboForm, status: "draft" })}
                      className="accent-charcoal"
                    />
                    <span>Draft</span>
                  </label>
                </div>
              </div>

              <DialogFooter className="mt-4 pt-2 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-charcoal text-ivory hover:bg-charcoal/90 gap-1.5">
                  <Plus className="h-4 w-4" /> Create Combo Product
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Searchable Product Selector Modal for Combo Components */}
      <Dialog open={isSelectorOpen} onOpenChange={setIsSelectorOpen}>
        <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-champagne" /> Add Products to Combo
            </DialogTitle>
            <DialogDescription>
              Search and select existing products from your store catalogue to include in this bundle.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {/* Search and Category Filter */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 flex-1 shadow-2xs">
                <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <input
                  value={selectorSearch}
                  onChange={(e) => setSelectorSearch(e.target.value)}
                  placeholder="Search by product name or SKU…"
                  className="w-full bg-transparent text-xs outline-none"
                />
                {selectorSearch && (
                  <button onClick={() => setSelectorSearch("")} className="text-xs text-muted-foreground">
                    ✕
                  </button>
                )}
              </div>
              <select
                value={selectorCat}
                onChange={(e) => setSelectorCat(e.target.value)}
                className="h-8 rounded-md border border-border bg-card px-2.5 text-xs outline-none"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Candidate Products List */}
            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {candidateProducts.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No matching catalogue products found.
                </div>
              ) : (
                candidateProducts.map((p) => {
                  const targetList = selectorTarget === "add" ? comboForm.components : editComboForm.components;
                  const alreadySelected = targetList.find((c) => c.productId === p.id);

                  return (
                    <div
                      key={p.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border/80 bg-card p-2.5 hover:border-champagne transition shadow-2xs"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="h-11 w-11 rounded-md object-cover border border-border shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-foreground truncate">{p.name}</p>
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                            <span className="font-mono">{p.sku}</span>
                            <span>·</span>
                            <span className="font-semibold text-charcoal">{formatINR(p.price)}</span>
                            <span>·</span>
                            <span className={cn(
                              "font-medium",
                              p.stock <= 0 ? "text-red-600" : "text-emerald-600"
                            )}>
                              Stock: {p.stock}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleAddComponentToCombo(selectorTarget, p)}
                        variant={alreadySelected ? "secondary" : "outline"}
                        className={cn(
                          "h-8 text-xs shrink-0 gap-1",
                          alreadySelected && "border-champagne bg-champagne/15 text-charcoal font-semibold"
                        )}
                      >
                        {alreadySelected ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-700" />
                            <span>Added ({alreadySelected.quantity}) +1</span>
                          </>
                        ) : (
                          <>
                            <Plus className="h-3.5 w-3.5" />
                            <span>Add</span>
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <DialogFooter className="mt-2 pt-2 border-t border-border">
            <Button type="button" onClick={() => setIsSelectorOpen(false)} className="bg-charcoal text-ivory">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Product Modal (Handles both Single and Combo Products) */}
      {viewProduct && (
        <Dialog open={!!viewProduct} onOpenChange={(open) => !open && setViewProduct(null)}>
          <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="font-serif text-lg">Product Details</DialogTitle>
                {viewProduct.productType === "combo" && (
                  <Badge className="bg-amber-800 text-amber-50 text-[10px] font-bold uppercase tracking-wider">
                    Combo Bundle
                  </Badge>
                )}
              </div>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="flex flex-col sm:flex-row gap-3.5 sm:gap-4 items-center sm:items-start text-center sm:text-left">
                <img
                  src={viewProduct.images[0]}
                  alt={viewProduct.name}
                  className="h-28 w-28 rounded-lg object-cover border border-border shadow-xs shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <Badge variant="outline" className="capitalize text-xs font-normal">
                    {viewProduct.category}
                  </Badge>
                  <h3 className="font-serif text-base font-medium mt-1 leading-snug">{viewProduct.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">SKU: {viewProduct.sku}</p>
                  <div className="mt-2 flex items-baseline justify-center sm:justify-start gap-2">
                    <span className="font-semibold text-lg">{formatINR(viewProduct.price)}</span>
                    {viewProduct.mrp > viewProduct.price && (
                      <span className="text-xs text-muted-foreground line-through">
                        {formatINR(viewProduct.mrp)}
                      </span>
                    )}
                    {viewProduct.mrp > viewProduct.price && (
                      <span className="text-xs text-emerald-700 font-medium">
                        ({Math.round(((viewProduct.mrp - viewProduct.price) / viewProduct.mrp) * 100)}% off)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Combo Contents breakdown if combo */}
              {viewProduct.productType === "combo" && viewProduct.comboComponents && viewProduct.comboComponents.length > 0 && (
                <div className="rounded-lg border border-champagne/40 bg-champagne/10 p-3 space-y-2">
                  <p className="font-semibold text-charcoal text-xs flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-champagne" /> Included Components ({viewProduct.comboComponents.length} items):
                  </p>
                  <div className="space-y-1.5">
                    {viewProduct.comboComponents.map((c, i) => {
                      const compP = products.find((item) => item.id === c.componentProductId);
                      return (
                        <div key={i} className="flex items-center gap-2.5 rounded bg-background/80 p-2 text-xs border border-border/50">
                          <img
                            src={compP?.images[0] || viewProduct.images[0]}
                            alt={compP?.name}
                            className="h-9 w-9 rounded object-cover border border-border shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">{compP?.name || "Component Item"}</p>
                            <p className="text-[11px] text-muted-foreground">
                              SKU: {compP?.sku} · Single: {formatINR(compP?.price || 0)} · Live Stock: {compP?.stock ?? 0}
                            </p>
                          </div>
                          <span className="rounded bg-accent px-2 py-0.5 font-semibold text-xs shrink-0">
                            Qty: {c.quantity}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Inventory Status:</span>
                  <p className="font-medium mt-0.5">
                    {viewProduct.productType === "combo"
                      ? `${calculateComboStock(viewProduct.comboComponents, products)} units available (calculated from components)`
                      : viewProduct.stock > 0
                      ? `${viewProduct.stock} units in stock`
                      : "Out of stock"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Customer Rating:</span>
                  <p className="font-medium mt-0.5">{viewProduct.rating} ★ ({viewProduct.reviews.length} reviews)</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Material:</span>
                  <p className="font-medium mt-0.5">{viewProduct.material || "18k Gold Plated"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Collection:</span>
                  <p className="font-medium mt-0.5 capitalize">{viewProduct.collection || "Celeste"}</p>
                </div>
              </div>

              {viewProduct.description && (
                <div className="rounded-md bg-accent/40 p-3 text-xs text-foreground/80">
                  <p className="font-medium mb-1 text-foreground">Description:</p>
                  <p>{viewProduct.description}</p>
                </div>
              )}
            </div>

            <DialogFooter className="flex-row gap-2 justify-between sm:justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setViewProduct(null);
                  navigate("product", { id: viewProduct.id });
                }}
                className="gap-1.5"
              >
                <ExternalLink className="h-3.5 w-3.5" /> View on Store
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setViewProduct(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Single Product Modal */}
      {editProduct && (
        <Dialog open={!!editProduct} onOpenChange={(open) => !open && setEditProduct(null)}>
          <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">Edit Product</DialogTitle>
              <DialogDescription>Update product details and stock status for {editProduct.name}.</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveEdit} className="space-y-4 py-2">
              <div>
                <label className="text-xs font-medium text-foreground/80">Product Name *</label>
                <Input
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-foreground/80">Selling Price (₹)</label>
                  <Input
                    required
                    type="number"
                    min="1"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground/80">MRP (₹)</label>
                  <Input
                    type="number"
                    min="1"
                    value={editForm.mrp}
                    onChange={(e) => setEditForm({ ...editForm, mrp: Number(e.target.value) })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground/80">Stock</label>
                  <Input
                    required
                    type="number"
                    min="0"
                    value={editForm.stock}
                    onChange={(e) => setEditForm({ ...editForm, stock: Number(e.target.value) })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-foreground/80">Category</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value as CategorySlug })}
                    className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground/80">Material</label>
                  <Input
                    value={editForm.material}
                    onChange={(e) => setEditForm({ ...editForm, material: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground/80">Image URL</label>
                <Input
                  value={editForm.image}
                  onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground/80">Description</label>
                <Textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div className="flex items-center gap-6 pt-1 text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.newArrival}
                    onChange={(e) => setEditForm({ ...editForm, newArrival: e.target.checked })}
                    className="h-4 w-4 rounded accent-charcoal"
                  />
                  <span>New Arrival</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.bestseller}
                    onChange={(e) => setEditForm({ ...editForm, bestseller: e.target.checked })}
                    className="h-4 w-4 rounded accent-charcoal"
                  />
                  <span>Bestseller</span>
                </label>
              </div>

              <DialogFooter className="mt-4 pt-2 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setEditProduct(null)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-charcoal text-ivory hover:bg-charcoal/90">
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Combo / Bundle Modal (Requirement 7) */}
      {editComboProduct && (
        <Dialog open={!!editComboProduct} onOpenChange={(open) => !open && setEditComboProduct(null)}>
          <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="font-serif text-xl flex items-center gap-2">
                    <Layers className="h-5 w-5 text-amber-700" /> Edit Combo / Bundle
                  </DialogTitle>
                  <DialogDescription>
                    Configure component products, pricing, and bundle details for {editComboProduct.name}.
                  </DialogDescription>
                </div>
                <Badge className="bg-amber-800 text-amber-50 uppercase text-[10px]">
                  Combo
                </Badge>
              </div>
            </DialogHeader>

            <form onSubmit={handleSaveEditCombo} className="space-y-4 py-2">
              {editComboError && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                  <span>{editComboError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-foreground/80">Combo Name *</label>
                  <Input
                    required
                    value={editComboForm.name}
                    onChange={(e) => setEditComboForm({ ...editComboForm, name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground/80">Bundle SKU *</label>
                  <Input
                    required
                    value={editComboForm.sku}
                    onChange={(e) => setEditComboForm({ ...editComboForm, sku: e.target.value })}
                    className="mt-1 font-mono uppercase text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-foreground/80">Category</label>
                  <select
                    value={editComboForm.category}
                    onChange={(e) => setEditComboForm({ ...editComboForm, category: e.target.value as CategorySlug })}
                    className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground/80">Collection</label>
                  <select
                    value={editComboForm.collection}
                    onChange={(e) => setEditComboForm({ ...editComboForm, collection: e.target.value })}
                    className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none"
                  >
                    <option value="celeste">Celeste (Everyday Elegance)</option>
                    <option value="noir">Noir (Bridal & Statement)</option>
                    <option value="lumiere">Lumière (Modern Crystal)</option>
                    <option value="essentials">Essentials (Daily Staples)</option>
                  </select>
                </div>
              </div>

              {/* Components included in Edit Mode */}
              <div className="rounded-xl border border-champagne/40 bg-accent/20 p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-champagne" /> Products included in this combo *
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Add, remove, or modify quantities of bundled products
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectorTarget("edit");
                      setSelectorSearch("");
                      setSelectorCat("all");
                      setIsSelectorOpen(true);
                    }}
                    className="h-8 text-xs bg-card border-champagne text-charcoal hover:bg-champagne/20 gap-1 shadow-2xs"
                  >
                    <Plus className="h-3.5 w-3.5 text-champagne" /> Add Product
                  </Button>
                </div>

                {editComboComponentDetails.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border bg-card/60 p-6 text-center">
                    <p className="text-xs text-foreground/80 font-medium">No products in this combo</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Click &quot;+ Add Product&quot; to pick items from your catalogue
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {editComboComponentDetails.map((item) => (
                      <div
                        key={item.productId}
                        className="flex items-center gap-3 rounded-lg border border-border bg-card p-2.5 shadow-2xs"
                      >
                        <img
                          src={item.product?.images[0] || presetJewelleryImages[0].url}
                          alt={item.product?.name || "Product"}
                          className="h-12 w-12 rounded-md object-cover border border-border shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-foreground truncate">
                            {item.product?.name || "Catalogue Product"}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                            <span className="font-mono">{item.product?.sku}</span>
                            <span>·</span>
                            <span className="font-semibold text-charcoal">{formatINR(item.product?.price || 0)}</span>
                            <span>·</span>
                            <span className={cn(
                              "font-medium",
                              (item.product?.stock || 0) <= 0 ? "text-red-600" : "text-emerald-600"
                            )}>
                              Stock: {item.product?.stock || 0}
                            </span>
                          </div>
                        </div>

                        {/* Quantity Counter */}
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[11px] text-muted-foreground mr-1">Qty:</span>
                          <div className="inline-flex items-center rounded-md border border-border bg-background">
                            <button
                              type="button"
                              onClick={() => handleUpdateComponentQty("edit", item.productId, -1)}
                              className="h-6 w-6 flex items-center justify-center text-muted-foreground hover:text-foreground"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-6 text-center text-xs font-medium">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateComponentQty("edit", item.productId, 1)}
                              className="h-6 w-6 flex items-center justify-center text-muted-foreground hover:text-foreground"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveComponent("edit", item.productId)}
                            className="p-1 rounded text-muted-foreground hover:bg-red-50 hover:text-red-600 ml-1 transition"
                            title="Remove from combo"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Available Stock Warning */}
                {editComboForm.components.length > 0 && (
                  <div className={cn(
                    "rounded-lg p-2.5 text-xs flex items-center justify-between border",
                    editAvailableComboStock > 0 ? "bg-emerald-50/80 border-emerald-200 text-emerald-800" : "bg-red-50/80 border-red-200 text-red-700"
                  )}>
                    <div className="flex items-center gap-1.5">
                      <PackageCheck className="h-4 w-4 shrink-0" />
                      <span>
                        <strong>Calculated Combo Stock: {editAvailableComboStock} units</strong>
                        <span className="text-[11px] opacity-80 block sm:inline sm:ml-1">
                          (Derived from component inventory)
                        </span>
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Pricing in Edit Mode */}
              <div className="rounded-xl border border-border bg-card p-3.5 space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal">
                  Pricing & Discount Logic
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-foreground/80">Combo Selling Price (₹) *</label>
                    <Input
                      required
                      type="number"
                      min="1"
                      value={editComboForm.price}
                      onChange={(e) => setEditComboForm({ ...editComboForm, price: Number(e.target.value) })}
                      className="mt-1 font-semibold text-charcoal"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground/80">Total MRP (₹)</label>
                    <Input
                      type="number"
                      min="1"
                      value={editComboForm.mrp}
                      onChange={(e) => setEditComboForm({ ...editComboForm, mrp: Number(e.target.value) })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs pt-1">
                  <div className="rounded-lg bg-accent/40 p-2 border border-border/70">
                    <span className="text-[10px] text-muted-foreground uppercase block">Individual Total</span>
                    <span className="text-sm font-semibold text-foreground mt-0.5 block">{formatINR(editIndividualTotal)}</span>
                  </div>
                  <div className="rounded-lg bg-champagne/15 p-2 border border-champagne/40">
                    <span className="text-[10px] text-charcoal uppercase block font-semibold">Combo Price</span>
                    <span className="text-sm font-bold text-charcoal mt-0.5 block">{formatINR(Number(editComboForm.price || 0))}</span>
                  </div>
                  <div className="rounded-lg bg-emerald-50 p-2 border border-emerald-200">
                    <span className="text-[10px] text-emerald-800 uppercase block font-semibold">You Save</span>
                    <span className="text-sm font-bold text-emerald-700 mt-0.5 block">{formatINR(editComboSavings)}</span>
                  </div>
                  <div className="rounded-lg bg-emerald-50 p-2 border border-emerald-200">
                    <span className="text-[10px] text-emerald-800 uppercase block font-semibold">Discount</span>
                    <span className="text-sm font-bold text-emerald-700 mt-0.5 block">{editComboDiscountPct}% off</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground/80">Material & Finish</label>
                <Input
                  value={editComboForm.material}
                  onChange={(e) => setEditComboForm({ ...editComboForm, material: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground/80">Main Image URL</label>
                <Input
                  value={editComboForm.image}
                  onChange={(e) => setEditComboForm({ ...editComboForm, image: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground/80">Description</label>
                <Textarea
                  rows={3}
                  value={editComboForm.description}
                  onChange={(e) => setEditComboForm({ ...editComboForm, description: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-1 text-sm border-t border-border/60">
                <div className="flex items-center gap-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={editComboForm.newArrival}
                      onChange={(e) => setEditComboForm({ ...editComboForm, newArrival: e.target.checked })}
                      className="h-4 w-4 rounded accent-charcoal"
                    />
                    <span>New Arrival</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={editComboForm.bestseller}
                      onChange={(e) => setEditComboForm({ ...editComboForm, bestseller: e.target.checked })}
                      className="h-4 w-4 rounded accent-charcoal"
                    />
                    <span>Bestseller</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={editComboForm.featured}
                      onChange={(e) => setEditComboForm({ ...editComboForm, featured: e.target.checked })}
                      className="h-4 w-4 rounded accent-charcoal"
                    />
                    <span>Featured</span>
                  </label>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="font-medium text-muted-foreground">Status:</span>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="edit-combo-status"
                      value="active"
                      checked={editComboForm.status === "active"}
                      onChange={() => setEditComboForm({ ...editComboForm, status: "active" })}
                      className="accent-charcoal"
                    />
                    <span>Active</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="edit-combo-status"
                      value="draft"
                      checked={editComboForm.status === "draft"}
                      onChange={() => setEditComboForm({ ...editComboForm, status: "draft" })}
                      className="accent-charcoal"
                    />
                    <span>Draft</span>
                  </label>
                </div>
              </div>

              <DialogFooter className="mt-4 pt-2 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setEditComboProduct(null)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-charcoal text-ivory hover:bg-charcoal/90">
                  Save Combo Changes
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteProductTarget && (
        <Dialog open={!!deleteProductTarget} onOpenChange={(open) => !open && setDeleteProductTarget(null)}>
          <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600 font-serif text-lg">
                <AlertCircle className="h-5 w-5" /> Delete Product
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to remove &quot;{deleteProductTarget.name}&quot;? This product will be deleted from your store catalog.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="gap-2 sm:gap-0 mt-3">
              <Button variant="outline" onClick={() => setDeleteProductTarget(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>
                Delete Product
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function BarcodeSvg({ value, height = 44 }: { value: string; height?: number }) {
  const bars = useMemo(() => {
    const base = [2, 1, 3, 1, 1, 2, 4, 1, 2, 3, 1, 2, 1, 4, 2, 1, 3, 2, 1, 1, 3, 2, 4, 1, 2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1, 2];
    const hash = value.split("").reduce((acc, c, idx) => acc + c.charCodeAt(0) * (idx + 1), 0);
    return base.map((w, idx) => ((w + (hash % (idx + 3))) % 4) + 1);
  }, [value]);

  let currentX = 8;
  return (
    <div className="flex flex-col items-center">
      <svg width="220" height={height} viewBox="0 0 220 44" className="w-full max-w-[240px]">
        {bars.map((w, idx) => {
          const x = currentX;
          currentX += w + 2;
          return <rect key={idx} x={x} y="0" width={w} height={height} fill="#000000" />;
        })}
      </svg>
      <span className="font-mono text-[11px] font-bold tracking-widest text-black mt-0.5 uppercase">
        {value}
      </span>
    </div>
  );
}

function QrCodeSvg({ value }: { value: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-18 w-18 border-2 border-black p-1 bg-white grid grid-cols-7 gap-0.5" title={value}>
        <div className="col-span-2 row-span-2 border-2 border-black bg-black flex items-center justify-center p-0.5">
          <div className="w-full h-full bg-white flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-black" />
          </div>
        </div>
        <div className="col-span-3 row-span-1 bg-black/80" />
        <div className="col-span-2 row-span-2 border-2 border-black bg-black flex items-center justify-center p-0.5">
          <div className="w-full h-full bg-white flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-black" />
          </div>
        </div>
        <div className="col-span-1 bg-black" />
        <div className="col-span-1 bg-white" />
        <div className="col-span-1 bg-black" />
        <div className="col-span-7 h-0.5 bg-black my-0.5" />
        <div className="col-span-2 row-span-2 border-2 border-black bg-black flex items-center justify-center p-0.5">
          <div className="w-full h-full bg-white flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-black" />
          </div>
        </div>
        <div className="col-span-1 bg-black" />
        <div className="col-span-2 bg-black" />
        <div className="col-span-2 bg-black" />
        <div className="col-span-3 bg-black" />
        <div className="col-span-2 bg-white" />
      </div>
      <span className="text-[9px] font-mono mt-0.5 font-bold text-black tracking-tighter">SCAN TRACK</span>
    </div>
  );
}

function ShippingLabelModal({
  order,
  onClose,
  onStatusChange,
}: {
  order: Order;
  onClose: () => void;
  onStatusChange?: (id: string, newStatus: OrderStatus) => void;
}) {
  const storeSettings = useStore((s) => s.storeSettings);
  const pushToast = useStore((s) => s.pushToast);
  const updateOrderStatus = useStore((s) => s.updateOrderStatus);

  const [labelFormat, setLabelFormat] = useState<"thermal" | "a4">("thermal");
  const [carrier, setCarrier] = useState<string>(order.courier || "Sequel 24K Secure Logistics");
  const [autoPack, setAutoPack] = useState<boolean>(["placed", "confirmed", "processing"].includes(order.status));
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const trackingAwb = order.trackingNumber || `SEQ-${order.address.city.slice(0, 3).toUpperCase()}-${order.number.replace(/\D/g, "").slice(-6)}`;
  const estimatedWeight = Math.max(0.2, order.items.reduce((s, i) => s + i.qty * 0.12, 0.1)).toFixed(2);
  const routingCode = `${order.address.city.slice(0, 3).toUpperCase()}/HUB-${order.address.pincode.slice(0, 3)}`;

  const handlePrint = () => {
    if (autoPack && ["placed", "confirmed", "processing"].includes(order.status)) {
      updateOrderStatus(order.id, "packed");
      onStatusChange?.(order.id, "packed");
    }

    pushToast({
      title: "Label Sent to Printer",
      description: `Printing dispatch label for order ${order.number}`,
      variant: "success",
    });

    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleCopyTracking = () => {
    navigator.clipboard.writeText(trackingAwb);
    setIsCopied(true);
    pushToast({ title: "Tracking AWB Copied", description: trackingAwb });
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-3xl max-h-[92vh] overflow-y-auto p-3.5 sm:p-6">
        {/* Print stylesheet to isolate the label */}
        <style>{`
          @media print {
            body * {
              visibility: hidden !important;
            }
            #printable-shipping-label,
            #printable-shipping-label * {
              visibility: visible !important;
            }
            #printable-shipping-label {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              padding: 8mm !important;
              background: #ffffff !important;
              color: #000000 !important;
              box-shadow: none !important;
              border: none !important;
              z-index: 99999999 !important;
            }
            @page {
              size: auto;
              margin: 5mm;
            }
          }
        `}</style>

        <DialogHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <DialogTitle className="font-serif text-xl flex items-center gap-2">
                <Printer className="h-5 w-5 text-champagne" /> Shipping Label & Packing Slip
              </DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                Generate official carrier dispatch documentation for Order {order.number}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-1.5 bg-accent/30 p-1 rounded-lg border border-border">
              <button
                type="button"
                onClick={() => setLabelFormat("thermal")}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-md transition",
                  labelFormat === "thermal" ? "bg-charcoal text-ivory shadow-xs" : "text-muted-foreground hover:text-foreground"
                )}
              >
                4″ × 6″ Thermal Label
              </button>
              <button
                type="button"
                onClick={() => setLabelFormat("a4")}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-md transition",
                  labelFormat === "a4" ? "bg-charcoal text-ivory shadow-xs" : "text-muted-foreground hover:text-foreground"
                )}
              >
                A4 Dispatch Sheet
              </button>
            </div>
          </div>
        </DialogHeader>

        {/* Options Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-accent/20 border border-border rounded-lg p-3 text-xs">
          <div>
            <label className="font-medium text-muted-foreground block mb-1">Carrier Partner</label>
            <select
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              className="w-full h-8 rounded-md border border-border bg-card px-2 text-xs font-medium outline-none"
            >
              <option value="Sequel 24K Secure Logistics">Sequel 24K Logistics (Valuables Armored)</option>
              <option value="BlueDart Apex Priority">BlueDart Apex (Priority Air Cargo)</option>
              <option value="Delhivery Secure Express">Delhivery Secure (Air Express)</option>
              <option value="DTDC Gold Express">DTDC Gold (Secure Jewellery)</option>
            </select>
          </div>

          <div>
            <label className="font-medium text-muted-foreground block mb-1">Package Weight & Box</label>
            <div className="flex items-center h-8 px-2.5 rounded-md border border-border bg-card text-foreground font-mono">
              <span>{estimatedWeight} KG · Luxury Sealed Box</span>
            </div>
          </div>

          <div>
            <label className="font-medium text-muted-foreground block mb-1">Fulfillment Automation</label>
            <label className="flex items-center gap-2 h-8 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoPack}
                onChange={(e) => setAutoPack(e.target.checked)}
                className="h-4 w-4 rounded accent-charcoal"
              />
              <span className="text-foreground/90 font-medium">Mark order as Packed</span>
            </label>
          </div>
        </div>

        {/* Printable Area Container */}
        <div className="rounded-xl border border-border bg-neutral-100 p-4 sm:p-6 overflow-x-auto flex justify-center">
          <div
            id="printable-shipping-label"
            className={cn(
              "bg-white text-black font-sans shadow-lg",
              labelFormat === "thermal"
                ? "w-full max-w-[420px] border-2 border-black p-4 text-[11px] leading-tight"
                : "w-full max-w-[650px] border border-neutral-300 p-6 text-xs leading-normal"
            )}
          >
            {labelFormat === "thermal" ? (
              /* ================= 4" x 6" THERMAL SHIPPING LABEL ================= */
              <div className="space-y-3">
                {/* Header: Carrier & Routing */}
                <div className="flex items-start justify-between border-b-2 border-black pb-2.5">
                  <div>
                    <div className="flex items-center gap-1.5 font-black text-sm tracking-wide">
                      <ShieldCheck className="h-4 w-4 text-black inline" />
                      {carrier.toUpperCase()}
                    </div>
                    <p className="text-[10px] font-semibold tracking-wider text-neutral-700">
                      SECURE PRECIOUS CARGO · PRIORITY AIR EXPRESS
                    </p>
                  </div>
                  <div className="border border-black px-2 py-0.5 text-right bg-neutral-50">
                    <p className="text-[9px] font-bold text-neutral-600 uppercase">Routing Hub</p>
                    <p className="font-mono text-xs font-black">{routingCode}</p>
                  </div>
                </div>

                {/* Primary Barcode */}
                <div className="py-1 border-b border-black text-center">
                  <BarcodeSvg value={trackingAwb} height={46} />
                </div>

                {/* Destination / Ship To */}
                <div className="border-b-2 border-black pb-2.5 pt-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-black text-white px-1.5 py-0.5">
                      SHIP TO (CONSIGNEE)
                    </span>
                    <span className="text-[10px] font-bold text-neutral-700">DESTINATION</span>
                  </div>
                  <div className="mt-1.5 pl-0.5">
                    <p className="font-extrabold text-base tracking-tight text-black">{order.address.name}</p>
                    <p className="font-medium text-neutral-800">{order.address.line1}</p>
                    {order.address.line2 && <p className="font-medium text-neutral-800">{order.address.line2}</p>}
                    <p className="font-bold text-black">{order.address.city}, {order.address.state}</p>
                    
                    <div className="mt-2 flex items-center justify-between border border-black bg-neutral-50 px-2 py-1">
                      <span className="font-bold text-[10px] uppercase">DELIVERY PINCODE:</span>
                      <span className="font-mono text-lg font-black tracking-widest text-black">
                        {order.address.pincode}
                      </span>
                    </div>
                    <p className="mt-1 font-semibold text-black">Phone: +91 {order.address.phone}</p>
                  </div>
                </div>

                {/* Sender / Return Address */}
                <div className="border-b border-black pb-2 text-[10px]">
                  <span className="font-bold text-neutral-700 uppercase">RETURN TO (SENDER):</span>
                  <p className="font-bold text-black">
                    {storeSettings?.storeName || "VRUNDORA Fine Jewellery"} · Central Vault
                  </p>
                  <p className="text-neutral-700">
                    {storeSettings?.address || "Peninsula Business Park, Lower Parel, Mumbai, MH - 400013"}
                  </p>
                  <p className="text-neutral-700">
                    GSTIN: 27AADCS1234F1Z8 | Contact: {storeSettings?.supportPhone || "+91 98765 43210"}
                  </p>
                </div>

                {/* Payment & Collection Banner */}
                <div className={cn(
                  "p-2 text-center border-2 border-black",
                  order.paymentMethod === "cod" ? "bg-black text-white" : "bg-neutral-100 text-black"
                )}>
                  {order.paymentMethod === "cod" ? (
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider">CASH ON DELIVERY (COD)</p>
                      <p className="text-sm font-extrabold mt-0.5">COLLECT EXACT CASH: {formatINR(order.total)}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider">PREPAID SHIPMENT</p>
                      <p className="text-[10px] font-bold">DO NOT COLLECT ANY CASH FROM CONSIGNEE</p>
                    </div>
                  )}
                </div>

                {/* Package Details & QR Section */}
                <div className="flex items-center justify-between border-b border-black pb-2 pt-1">
                  <div className="space-y-0.5 text-[10px]">
                    <p><span className="font-bold">Order No:</span> #{order.number}</p>
                    <p><span className="font-bold">Order Date:</span> {new Date(order.placedAt).toLocaleDateString("en-IN")}</p>
                    <p><span className="font-bold">Contents:</span> Fine Crafted Fashion Jewellery</p>
                    <p><span className="font-bold">Total Items:</span> {order.items.reduce((s, i) => s + i.qty, 0)} Units ({estimatedWeight} kg)</p>
                    <p><span className="font-bold">Security Seal:</span> TS-94812-PASS</p>
                  </div>
                  <div>
                    <QrCodeSvg value={`https://vrundora.com/track?awb=${trackingAwb}`} />
                  </div>
                </div>

                {/* Tamper Warning */}
                <div className="border border-neutral-400 p-1.5 text-[9px] text-neutral-800 bg-neutral-50 leading-tight">
                  <span className="font-bold text-black uppercase">⚠️ VALUABLE CARGO:</span> Tamper-evident packaging. Customer must refuse parcel if tape is broken or tampered. Unboxing video recommended. Delivery OTP required.
                </div>
              </div>
            ) : (
              /* ================= A4 FULL DISPATCH SHEET & INVOICE ================= */
              <div className="space-y-5">
                {/* Invoice Header */}
                <div className="flex items-start justify-between border-b-2 border-black pb-3">
                  <div>
                    <h2 className="font-serif text-2xl font-bold tracking-tight text-black">
                      {storeSettings?.storeName || "VRUNDORA Fine Jewellery"}
                    </h2>
                    <p className="text-xs text-neutral-600">Luxury Handcrafted Jewellery & Solitaires</p>
                    <p className="text-[11px] text-neutral-500 mt-1">
                      Vault 4B, Peninsula Tower, Lower Parel, Mumbai, MH - 400013 · GSTIN: 27AADCS1234F1Z8
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block bg-black text-white px-2 py-1 text-xs font-bold uppercase tracking-wider mb-1">
                      TAX INVOICE & DISPATCH NOTE
                    </span>
                    <p className="font-mono text-xs font-bold">INV-{order.number}</p>
                    <p className="text-[11px] text-neutral-600">
                      Date: {new Date(order.placedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>

                {/* Addresses Grid */}
                <div className="grid grid-cols-2 gap-4 border border-black p-3 bg-neutral-50 text-xs">
                  <div>
                    <p className="font-bold uppercase text-[10px] tracking-wider text-neutral-600 mb-1">Billed & Shipped To:</p>
                    <p className="font-bold text-sm text-black">{order.address.name}</p>
                    <p>{order.address.line1}</p>
                    {order.address.line2 && <p>{order.address.line2}</p>}
                    <p className="font-semibold">{order.address.city}, {order.address.state} - {order.address.pincode}</p>
                    <p>Phone: +91 {order.address.phone}</p>
                  </div>
                  <div>
                    <p className="font-bold uppercase text-[10px] tracking-wider text-neutral-600 mb-1">Logistics & Payment Details:</p>
                    <p><span className="font-medium text-neutral-600">Carrier:</span> <span className="font-semibold">{carrier}</span></p>
                    <p><span className="font-medium text-neutral-600">AWB Tracking:</span> <span className="font-mono font-bold">{trackingAwb}</span></p>
                    <p><span className="font-medium text-neutral-600">Payment Mode:</span> <span className="capitalize font-semibold">{order.paymentMethod} ({order.paymentStatus})</span></p>
                    <p><span className="font-medium text-neutral-600">Package Weight:</span> <span className="font-semibold">{estimatedWeight} KG</span></p>
                  </div>
                </div>

                {/* Items Table */}
                <div>
                  <table className="w-full text-left text-xs border border-black">
                    <thead className="bg-neutral-200 border-b border-black text-[11px] font-bold uppercase">
                      <tr>
                        <th className="p-2 border-r border-black">Item Description</th>
                        <th className="p-2 border-r border-black text-center">Color/Finish</th>
                        <th className="p-2 border-r border-black text-center">Qty</th>
                        <th className="p-2 border-r border-black text-right">Rate</th>
                        <th className="p-2 border-r border-black text-right">GST (3%)</th>
                        <th className="p-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/30">
                      {order.items.map((i, idx) => (
                        <tr key={idx}>
                          <td className="p-2 border-r border-black/30 font-medium">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span>{i.name}</span>
                              {i.isCombo && (
                                <span className="text-[9px] bg-amber-100 text-amber-900 border border-amber-300 font-bold px-1.5 py-0.2 rounded">
                                  COMBO
                                </span>
                              )}
                            </div>
                            {i.isCombo && i.comboComponents && i.comboComponents.length > 0 && (
                              <div className="mt-1 text-[10px] text-gray-600 font-normal space-y-0.5">
                                {i.comboComponents.map((c, cIdx) => (
                                  <div key={cIdx}>
                                    • {c.name} ({c.sku}) × {c.qty * i.qty}
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="p-2 border-r border-black/30 text-center">{i.colorName}</td>
                          <td className="p-2 border-r border-black/30 text-center font-bold">{i.qty}</td>
                          <td className="p-2 border-r border-black/30 text-right">{formatINR(i.price)}</td>
                          <td className="p-2 border-r border-black/30 text-right">{formatINR(Math.round(i.price * i.qty * 0.03))}</td>
                          <td className="p-2 text-right font-semibold">{formatINR(i.price * i.qty)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Financial Summary */}
                <div className="flex justify-end">
                  <div className="w-64 border border-black p-2.5 text-xs space-y-1 bg-neutral-50">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Subtotal:</span>
                      <span>{formatINR(order.subtotal)}</span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex justify-between text-neutral-800">
                        <span>Discount:</span>
                        <span>-{formatINR(order.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Shipping:</span>
                      <span>{order.shipping === 0 ? "FREE" : formatINR(order.shipping)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Applicable GST (3%):</span>
                      <span>{formatINR(order.tax)}</span>
                    </div>
                    <div className="border-t border-black pt-1 flex justify-between font-bold text-sm text-black">
                      <span>Total Invoice Value:</span>
                      <span>{formatINR(order.total)}</span>
                    </div>
                  </div>
                </div>

                {/* QC Sign-off */}
                <div className="grid grid-cols-3 gap-3 border border-neutral-300 p-2.5 text-[10px] bg-white">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                    <span>Quality Checked & BIS Hallmarked</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <PackageCheck className="h-4 w-4 text-emerald-700" />
                    <span>Tamper-Proof Luxury Pouch Applied</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-emerald-700" />
                    <span>Certificate of Authenticity Enclosed</span>
                  </div>
                </div>

                {/* Dotted Cut Line for Label */}
                <div className="relative py-2 text-center">
                  <div className="border-t-2 border-dashed border-neutral-400 w-full" />
                  <span className="bg-white px-2 text-[10px] text-neutral-500 font-mono absolute top-0.5 left-1/2 -translate-x-1/2">
                    ✂ CUT ALONG DOTTED LINE FOR CARRIER SHIPPING LABEL ✂
                  </span>
                </div>

                {/* Lower Mini Courier Label for A4 Tear-off */}
                <div className="border-2 border-black p-3 text-[11px] grid grid-cols-2 gap-3 bg-white">
                  <div>
                    <p className="font-extrabold text-sm uppercase">{carrier}</p>
                    <p className="font-mono text-xs font-bold mt-1">AWB: {trackingAwb}</p>
                    <div className="mt-2">
                      <p className="font-bold text-xs uppercase bg-black text-white px-1 py-0.5 inline-block">DELIVER TO:</p>
                      <p className="font-extrabold text-sm text-black mt-1">{order.address.name}</p>
                      <p>{order.address.line1}, {order.address.city}, {order.address.state}</p>
                      <p className="font-mono font-black text-base mt-1">PIN: {order.address.pincode}</p>
                      <p className="font-semibold">Phone: +91 {order.address.phone}</p>
                    </div>
                  </div>
                  <div className="flex flex-col justify-between items-end text-right">
                    <BarcodeSvg value={trackingAwb} height={36} />
                    <div className="border border-black p-1.5 w-full text-center mt-2">
                      <span className="font-extrabold text-xs uppercase">
                        {order.paymentMethod === "cod" ? `COD COLLECT: ${formatINR(order.total)}` : "PREPAID · DO NOT COLLECT CASH"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Actions Footer */}
        <DialogFooter className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:justify-between w-full pt-2 border-t border-border/50">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyTracking}
            className="text-xs gap-1.5 h-8"
          >
            {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            {isCopied ? "Copied AWB" : "Copy Tracking AWB"}
          </Button>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs h-8 flex-1 sm:flex-initial">
              Close
            </Button>
            <Button
              type="button"
              onClick={handlePrint}
              className="bg-charcoal text-ivory hover:bg-charcoal/90 text-xs gap-1.5 shadow-xs h-8 flex-1 sm:flex-initial"
            >
              <Printer className="h-4 w-4 text-champagne" /> Print Shipping Label
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function OrdersSection({
  orders,
  selectedOrder,
  onSelectOrder,
  initialTab = "all",
}: {
  orders: ReturnType<typeof useStore.getState>["orders"];
  selectedOrder?: Order | null;
  onSelectOrder?: (o: Order | null) => void;
  initialTab?: "all" | "today" | "pending" | "shipped" | "delivered" | "cancelled";
}) {
  const advanceOrder = useStore((s) => s.advanceOrder);
  const updateOrderStatus = useStore((s) => s.updateOrderStatus);
  const cancelOrder = useStore((s) => s.cancelOrder);

  const [activeModalOrder, setActiveModalOrder] = useState<Order | null>(selectedOrder || null);
  const [labelOrder, setLabelOrder] = useState<Order | null>(null);
  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState<"all" | "today" | "pending" | "shipped" | "delivered" | "cancelled">(initialTab);

  useEffect(() => {
    if (initialTab) setStatusTab(initialTab);
  }, [initialTab]);

  const isOrderToday = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const isSameDay = d.toDateString() === now.toDateString();
    const isWithin24Hours = now.getTime() - d.getTime() <= 24 * 60 * 60 * 1000;
    return isSameDay || isWithin24Hours;
  };

  const list = orders.length > 0 ? orders : sampleOrders;
  const todayOrdersCount = list.filter((o) => isOrderToday(o.placedAt)).length;

  const filteredOrders = list.filter((o) => {
    const matchesSearch =
      o.number.toLowerCase().includes(search.toLowerCase()) ||
      o.address.name.toLowerCase().includes(search.toLowerCase()) ||
      o.address.city.toLowerCase().includes(search.toLowerCase()) ||
      o.address.phone.includes(search);

    if (!matchesSearch) return false;

    if (statusTab === "all") return true;
    if (statusTab === "today") return isOrderToday(o.placedAt);
    if (statusTab === "pending") return ["placed", "confirmed", "processing", "packed"].includes(o.status);
    if (statusTab === "shipped") return ["shipped", "out_for_delivery"].includes(o.status);
    if (statusTab === "delivered") return o.status === "delivered";
    if (statusTab === "cancelled") return o.status === "cancelled";
    return true;
  });

  const handleOpenOrder = (o: Order) => {
    setActiveModalOrder(o);
    onSelectOrder?.(o);
  };

  const handleCloseOrder = () => {
    setActiveModalOrder(null);
    onSelectOrder?.(null);
  };

  return (
    <div className="animate-fade-up">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {[
          { label: "Total orders", value: list.length, cls: "text-foreground" },
          { label: "Today's orders", value: todayOrdersCount, cls: "text-emerald-700 font-bold" },
          { label: "Pending", value: list.filter((o) => ["placed", "confirmed", "processing", "packed"].includes(o.status)).length, cls: "text-amber-600" },
          { label: "Delivered", value: list.filter((o) => o.status === "delivered").length, cls: "text-emerald-600" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-xs">
            <p className={cn("font-serif text-xl sm:text-2xl", s.cls)}>{s.value}</p>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 shadow-xs w-full sm:w-auto">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order #, customer, city…"
            className="w-full sm:w-56 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-xs text-muted-foreground hover:text-foreground">
              ✕
            </button>
          )}
        </div>

        <div className="flex gap-1.5 flex-wrap items-center overflow-x-auto py-1">
          {(["all", "today", "pending", "shipped", "delivered", "cancelled"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusTab(tab)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium capitalize transition flex items-center gap-1.5 shrink-0",
                statusTab === tab
                  ? "bg-charcoal text-ivory shadow-xs"
                  : "bg-accent/40 text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {tab === "today" && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />}
              {tab === "today" ? "Today's Orders" : tab}
              {tab === "today" && (
                <span className="rounded-full bg-champagne/20 text-charcoal px-1.5 py-0.2 text-[10px] font-bold">
                  {todayOrdersCount}
                </span>
              )}
            </button>
          ))}
          {filteredOrders.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLabelOrder(filteredOrders[0])}
              className="h-8 gap-1.5 text-xs border-charcoal/20 bg-card hover:border-champagne shrink-0"
              title="Print shipping label for newest order"
            >
              <Printer className="h-3.5 w-3.5 text-champagne" /> Print Latest Label
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Orders Cards */}
      <div className="mt-4 md:hidden space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground text-sm">
            No orders match your filter criteria.
          </div>
        ) : (
          filteredOrders.map((o) => (
            <div
              key={o.id || o.number}
              className="rounded-xl border border-border/80 bg-card p-3.5 shadow-2xs space-y-3 transition hover:border-champagne"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-xs sm:text-sm text-charcoal">{o.number}</span>
                    {isOrderToday(o.placedAt) && (
                      <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wider">
                        Today
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {new Date(o.placedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <span className={cn("rounded-full border px-2 py-0.5 text-[10px] capitalize font-medium shrink-0", statusBadge[o.status])}>
                  {o.status.replace(/_/g, " ")}
                </span>
              </div>

              <div className="rounded-lg bg-accent/30 p-2.5 text-xs space-y-1">
                <div className="flex justify-between items-baseline">
                  <span className="font-medium text-foreground">{o.address.name}</span>
                  <span className="font-semibold text-charcoal text-sm">{formatINR(o.total)}</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground text-[11px]">
                  <span>{o.address.city}, {o.address.pincode}</span>
                  <span className="capitalize">{o.paymentMethod} · {o.paymentStatus}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {o.items.reduce((n, i) => n + i.qty, 0)} item{o.items.reduce((n, i) => n + i.qty, 0) > 1 ? "s" : ""}
                </p>
              </div>

              <div className="pt-2 border-t border-border/50 flex items-center justify-between gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setLabelOrder(o)}
                  className="flex-1 h-8 text-xs gap-1.5 bg-charcoal text-ivory hover:bg-charcoal/90"
                >
                  <Printer className="h-3.5 w-3.5 text-champagne" /> Print Label
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenOrder(o)}
                  className="flex-1 h-8 text-xs gap-1.5"
                >
                  <Eye className="h-3.5 w-3.5" /> Details
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop & Tablet Orders Table */}
      <div className="mt-4 hidden md:block overflow-x-auto rounded-xl border border-border bg-card shadow-xs">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-accent/30 text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Items</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Payment</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                  No orders match your filter criteria.
                </td>
              </tr>
            ) : (
              filteredOrders.map((o) => (
                <tr
                  key={o.id || o.number}
                  className="border-b border-border/50 last:border-0 hover:bg-accent/20 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-charcoal">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span>{o.number}</span>
                      {isOrderToday(o.placedAt) && (
                        <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[9px] font-bold px-1.5 py-0.5 tracking-wider uppercase">
                          Today
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <span className="font-medium text-foreground">{o.address.name}</span>
                    <br />
                    <span className="text-xs">{o.address.city}, {o.address.pincode}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {o.items.reduce((n, i) => n + i.qty, 0)} items
                  </td>
                  <td className="px-4 py-3 font-medium">{formatINR(o.total)}</td>
                  <td className="px-4 py-3">
                    <span className="capitalize text-xs font-medium">{o.paymentMethod}</span>
                    <br />
                    <span className={cn("text-[11px]", o.paymentStatus === "paid" ? "text-emerald-600" : o.paymentStatus === "refunded" ? "text-purple-600" : "text-amber-600")}>
                      {o.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("rounded-full border px-2 py-0.5 text-xs capitalize", statusBadge[o.status])}>
                      {o.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(o.placedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setLabelOrder(o)}
                        className="h-8 text-xs gap-1.5 border-charcoal/20 bg-charcoal text-ivory hover:bg-charcoal/90 hover:text-ivory shadow-xs"
                        title="Print Shipping Label for received order"
                      >
                        <Printer className="h-3.5 w-3.5 text-champagne" /> Print Label
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenOrder(o)}
                        className="h-8 text-xs gap-1.5"
                      >
                        <Eye className="h-3.5 w-3.5" /> Details
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {activeModalOrder && (
        <Dialog open={!!activeModalOrder} onOpenChange={(open) => !open && handleCloseOrder()}>
          <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <DialogTitle className="font-serif text-lg sm:text-xl">Order {activeModalOrder.number}</DialogTitle>
                  <DialogDescription className="text-xs mt-0.5">
                    Placed on {new Date(activeModalOrder.placedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                  </DialogDescription>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setLabelOrder(activeModalOrder)}
                    className="h-8 text-xs gap-1.5 border-charcoal/20 bg-charcoal text-ivory hover:bg-charcoal/90"
                  >
                    <Printer className="h-3.5 w-3.5 text-champagne" /> Print Label
                  </Button>
                  <span className={cn("rounded-full border px-2.5 py-1 text-xs capitalize font-medium", statusBadge[activeModalOrder.status])}>
                    {activeModalOrder.status.replace(/_/g, " ")}
                  </span>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Order Status Management Box */}
              <div className="rounded-lg border border-border bg-accent/20 p-3.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Update Order Fulfillment
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-foreground/80">Change status:</span>
                  <select
                    value={activeModalOrder.status}
                    onChange={(e) => {
                      const newStatus = e.target.value as OrderStatus;
                      updateOrderStatus(activeModalOrder.id, newStatus);
                      setActiveModalOrder({ ...activeModalOrder, status: newStatus });
                    }}
                    className="h-8 rounded-md border border-border bg-card px-2.5 text-xs font-medium outline-none shadow-xs"
                  >
                    <option value="placed">Placed</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="packed">Packed</option>
                    <option value="shipped">Shipped</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  {["placed", "confirmed", "processing", "packed"].includes(activeModalOrder.status) && (
                    <Button
                      size="sm"
                      onClick={() => setLabelOrder(activeModalOrder)}
                      className="h-8 text-xs bg-champagne text-charcoal hover:bg-champagne/90 font-medium gap-1.5 shadow-xs"
                    >
                      <Printer className="h-3.5 w-3.5" /> Print Shipping Label
                    </Button>
                  )}

                  {activeModalOrder.status !== "delivered" && activeModalOrder.status !== "cancelled" && (
                    <Button
                      size="sm"
                      onClick={() => {
                        advanceOrder(activeModalOrder.id);
                        // refresh
                        const nextOrders = useStore.getState().orders;
                        const updated = nextOrders.find((x) => x.id === activeModalOrder.id || x.number === activeModalOrder.number);
                        if (updated) setActiveModalOrder(updated);
                      }}
                      className="h-8 text-xs bg-charcoal text-ivory hover:bg-charcoal/90"
                    >
                      <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Advance to Next Stage
                    </Button>
                  )}

                  {activeModalOrder.status !== "cancelled" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        cancelOrder(activeModalOrder.id);
                        setActiveModalOrder({ ...activeModalOrder, status: "cancelled" });
                      }}
                      className="h-8 text-xs text-red-600 hover:bg-red-50"
                    >
                      Cancel Order
                    </Button>
                  )}
                </div>
              </div>

              {/* Items Breakdown */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Order Items ({activeModalOrder.items.length})
                </p>
                <div className="space-y-2 rounded-lg border border-border p-3">
                  {activeModalOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 py-1 text-sm border-b border-border/40 last:border-0">
                      <img src={item.image} alt={item.name} className="h-12 w-12 rounded-md object-cover border border-border shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-medium truncate">{item.name}</p>
                          {item.isCombo && (
                            <Badge className="bg-amber-800 text-amber-50 hover:bg-amber-800 border-amber-600/40 text-[9px] px-1.5 py-0 font-bold">
                              COMBO
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">Color: {item.colorName} · Qty: {item.qty}</p>
                        {item.isCombo && item.comboComponents && item.comboComponents.length > 0 && (
                          <div className="mt-1.5 pl-2.5 border-l-2 border-amber-300 bg-amber-50/60 p-1.5 rounded text-[11px] text-amber-950 space-y-0.5">
                            <span className="font-semibold text-amber-900 block text-[10px] uppercase tracking-wider">
                              Bundle Components (stock deducted):
                            </span>
                            {item.comboComponents.map((c, cIdx) => (
                              <div key={cIdx} className="flex items-center justify-between text-muted-foreground">
                                <span>• {c.name} ({c.sku})</span>
                                <span className="font-mono font-medium text-amber-900">Qty: {c.qty * item.qty}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-medium">{formatINR(item.price * item.qty)}</p>
                        <p className="text-xs text-muted-foreground">{formatINR(item.price)} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer and Shipping Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-lg border border-border p-3 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-charcoal">
                    <MapPin className="h-3.5 w-3.5 text-champagne" /> Shipping Address
                  </div>
                  <p className="font-medium text-foreground">{activeModalOrder.address.name}</p>
                  <p className="text-muted-foreground">{activeModalOrder.address.line1}</p>
                  {activeModalOrder.address.line2 && <p className="text-muted-foreground">{activeModalOrder.address.line2}</p>}
                  <p className="text-muted-foreground">{activeModalOrder.address.city}, {activeModalOrder.address.state} - {activeModalOrder.address.pincode}</p>
                  <p className="text-muted-foreground">Phone: {activeModalOrder.address.phone}</p>
                </div>

                <div className="rounded-lg border border-border p-3 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-charcoal">
                    <CreditCard className="h-3.5 w-3.5 text-champagne" /> Payment & Delivery
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-muted-foreground">Payment Method:</span>
                    <span className="font-medium capitalize">{activeModalOrder.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-muted-foreground">Payment Status:</span>
                    <span className="font-medium capitalize">{activeModalOrder.paymentStatus}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-muted-foreground">Courier Partner:</span>
                    <span className="font-medium">{activeModalOrder.courier || "Sequel 24K Logistics"}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-muted-foreground">Tracking No:</span>
                    <span className="font-mono">{activeModalOrder.trackingNumber || "SEQ-DEL-894120"}</span>
                  </div>
                </div>
              </div>

              {/* Cost Summary */}
              <div className="rounded-lg border border-border bg-accent/10 p-3 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Items Subtotal:</span>
                  <span>{formatINR(activeModalOrder.subtotal)}</span>
                </div>
                {activeModalOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount {activeModalOrder.couponCode ? `(${activeModalOrder.couponCode})` : ""}:</span>
                    <span>-{formatINR(activeModalOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping:</span>
                  <span>{activeModalOrder.shipping === 0 ? "Free" : formatINR(activeModalOrder.shipping)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taxes (GST):</span>
                  <span>{formatINR(activeModalOrder.tax)}</span>
                </div>
                <Separator className="my-1" />
                <div className="flex justify-between text-sm font-semibold text-charcoal">
                  <span>Grand Total:</span>
                  <span>{formatINR(activeModalOrder.total)}</span>
                </div>
              </div>
            </div>

            <DialogFooter className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 w-full pt-2 border-t border-border/50">
              <Button
                variant="outline"
                onClick={() => setLabelOrder(activeModalOrder)}
                className="gap-1.5 text-xs font-medium h-8"
              >
                <Printer className="h-4 w-4 text-champagne" /> Print Shipping Label
              </Button>
              <Button variant="outline" onClick={handleCloseOrder} className="h-8 text-xs">
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Shipping Label & Packing Slip Modal */}
      {labelOrder && (
        <ShippingLabelModal
          order={labelOrder}
          onClose={() => setLabelOrder(null)}
          onStatusChange={(id, newStatus) => {
            if (activeModalOrder && (activeModalOrder.id === id || activeModalOrder.number === id)) {
              setActiveModalOrder({ ...activeModalOrder, status: newStatus });
            }
          }}
        />
      )}
    </div>
  );
}

function CustomersSection({ orders }: { orders: ReturnType<typeof useStore.getState>["orders"] }) {
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<"all" | "gold" | "silver" | "bronze">("all");
  const [selectedCustomer, setSelectedCustomer] = useState<{
    name: string;
    email: string;
    city: string;
    orders: number;
    spent: number;
  } | null>(null);

  const customers = useMemo(() => {
    const map = new Map<string, { name: string; email: string; city: string; orders: number; spent: number }>();
    orders.forEach((o) => {
      const key = `${o.address.name}|${o.address.city}|${o.address.pincode}`;
      const existing = map.get(key) || { name: o.address.name, email: key, city: o.address.city, orders: 0, spent: 0 };
      existing.orders += 1;
      existing.spent += o.total;
      map.set(key, existing);
    });
    // add sample customers
    sampleCustomers.forEach((c) => map.set(c.email, c));
    return Array.from(map.values()).sort((a, b) => b.spent - a.spent);
  }, [orders]);

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    const tier = c.spent > 20000 ? "gold" : c.spent > 5000 ? "silver" : "bronze";
    if (tierFilter !== "all" && tier !== tierFilter) return false;

    return true;
  });

  const customerOrders = useMemo(() => {
    if (!selectedCustomer) return [];
    return orders.filter(
      (o) => o.address.name.toLowerCase() === selectedCustomer.name.toLowerCase()
    );
  }, [orders, selectedCustomer]);

  return (
    <div className="animate-fade-up">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <p className="font-serif text-2xl">{customers.length}</p>
          <p className="text-xs text-muted-foreground">Total registered customers</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <p className="font-serif text-2xl">{formatINR(customers.reduce((s, c) => s + c.spent, 0))}</p>
          <p className="text-xs text-muted-foreground">Total customer lifetime value</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <p className="font-serif text-2xl">{formatINR(Math.round(customers.reduce((s, c) => s + c.spent, 0) / Math.max(customers.length, 1)))}</p>
          <p className="text-xs text-muted-foreground">Average revenue per customer</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 shadow-xs w-full sm:w-auto">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers by name, email, city…"
            className="w-full sm:w-56 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-xs text-muted-foreground hover:text-foreground">
              ✕
            </button>
          )}
        </div>

        <div className="flex gap-1.5 overflow-x-auto py-1">
          {(["all", "gold", "silver", "bronze"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTierFilter(t)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium capitalize transition shrink-0",
                tierFilter === t
                  ? "bg-charcoal text-ivory shadow-xs"
                  : "bg-accent/40 text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Customers Cards */}
      <div className="mt-4 md:hidden space-y-3">
        {filteredCustomers.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground text-sm">
            No customers found matching your criteria.
          </div>
        ) : (
          filteredCustomers.map((c, i) => (
            <div
              key={i}
              className="rounded-xl border border-border/80 bg-card p-3.5 shadow-2xs space-y-3 transition hover:border-champagne"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-charcoal text-xs font-medium text-ivory shrink-0">
                    {c.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{c.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                  </div>
                </div>
                <Badge variant="outline" className={cn(
                  "shrink-0 text-[10px] py-0",
                  c.spent > 20000 ? "border-champagne bg-champagne/10 text-charcoal font-medium" : c.spent > 5000 ? "border-blue-200 bg-blue-50 text-blue-700" : "border-zinc-200"
                )}>
                  {c.spent > 20000 ? "Gold VIP" : c.spent > 5000 ? "Silver" : "Bronze"}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 rounded-lg bg-accent/30 p-2 text-center text-xs">
                <div>
                  <p className="text-[10px] text-muted-foreground">City</p>
                  <p className="font-medium truncate">{c.city}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Orders</p>
                  <p className="font-semibold">{c.orders}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Spent</p>
                  <p className="font-semibold text-charcoal">{formatINR(c.spent)}</p>
                </div>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedCustomer(c)}
                className="w-full h-8 text-xs gap-1.5"
              >
                <Eye className="h-3.5 w-3.5" /> View Profile & History
              </Button>
            </div>
          ))
        )}
      </div>

      {/* Desktop & Tablet Customers Table */}
      <div className="mt-4 hidden md:block overflow-x-auto rounded-xl border border-border bg-card shadow-xs">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-accent/30 text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">City</th>
              <th className="px-4 py-3 font-medium">Orders</th>
              <th className="px-4 py-3 font-medium">Total spent</th>
              <th className="px-4 py-3 font-medium">Tier</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No customers found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredCustomers.map((c, i) => (
                <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-accent/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-charcoal text-xs font-medium text-ivory">
                        {c.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.city}</td>
                  <td className="px-4 py-3 font-medium">{c.orders} orders</td>
                  <td className="px-4 py-3 font-medium">{formatINR(c.spent)}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={cn(
                      c.spent > 20000 ? "border-champagne bg-champagne/10 text-charcoal font-medium" : c.spent > 5000 ? "border-blue-200 bg-blue-50 text-blue-700" : "border-zinc-200"
                    )}>
                      {c.spent > 20000 ? "Gold VIP" : c.spent > 5000 ? "Silver" : "Bronze"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedCustomer(c)}
                      className="h-8 text-xs gap-1.5"
                    >
                      <Eye className="h-3.5 w-3.5" /> View Profile
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Customer Profile Modal */}
      {selectedCustomer && (
        <Dialog open={!!selectedCustomer} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
          <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif text-lg">Customer Profile</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-charcoal text-base font-semibold text-ivory">
                  {selectedCustomer.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <h3 className="font-medium text-base">{selectedCustomer.name}</h3>
                  <p className="text-xs text-muted-foreground">{selectedCustomer.email}</p>
                  <p className="text-xs text-muted-foreground">{selectedCustomer.city}, India</p>
                </div>
                <div className="ml-auto">
                  <Badge variant="outline" className={cn(
                    selectedCustomer.spent > 20000 ? "border-champagne bg-champagne/10 text-charcoal font-semibold" : selectedCustomer.spent > 5000 ? "border-blue-200 bg-blue-50 text-blue-700" : "border-zinc-200"
                  )}>
                    {selectedCustomer.spent > 20000 ? "Gold VIP" : selectedCustomer.spent > 5000 ? "Silver" : "Bronze"}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center rounded-lg border border-border bg-accent/20 p-3">
                <div>
                  <p className="text-xs text-muted-foreground">Orders</p>
                  <p className="font-serif text-lg font-medium">{selectedCustomer.orders}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Spent</p>
                  <p className="font-serif text-lg font-medium">{formatINR(selectedCustomer.spent)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg. Order</p>
                  <p className="font-serif text-lg font-medium">{formatINR(Math.round(selectedCustomer.spent / Math.max(selectedCustomer.orders, 1)))}</p>
                </div>
              </div>

              {customerOrders.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Recent Store Orders
                  </p>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {customerOrders.map((o) => (
                      <div key={o.id} className="flex items-center justify-between rounded-md border border-border p-2 text-xs">
                        <div>
                          <p className="font-medium">{o.number}</p>
                          <p className="text-[10px] text-muted-foreground">{new Date(o.placedAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatINR(o.total)}</p>
                          <span className={cn("text-[10px] capitalize", statusBadge[o.status])}>
                            {o.status.replace(/_/g, " ")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedCustomer(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function CouponsSection() {
  const coupons = useStore((s) => s.coupons || defaultCoupons);
  const addCoupon = useStore((s) => s.addCoupon);
  const deleteCoupon = useStore((s) => s.deleteCoupon);

  const [isNewCouponOpen, setIsNewCouponOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);

  const initialCoupon: {
    code: string;
    type: "percent" | "flat";
    value: number;
    minOrder: number;
    maxDiscount?: number;
    description: string;
    expiresOn: string;
  } = {
    code: "",
    type: "percent",
    value: 15,
    minOrder: 999,
    maxDiscount: 500,
    description: "15% off orders above ₹999",
    expiresOn: "2026-12-31",
  };
  const [couponForm, setCouponForm] = useState(initialCoupon);

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = couponForm.code.trim().toUpperCase();
    if (!cleanCode) return;

    addCoupon({
      code: cleanCode,
      type: couponForm.type,
      value: Number(couponForm.value) || 10,
      minOrder: Number(couponForm.minOrder) || 0,
      maxDiscount: couponForm.maxDiscount ? Number(couponForm.maxDiscount) : undefined,
      description: couponForm.description.trim() || `${couponForm.type === "percent" ? `${couponForm.value}%` : `₹${couponForm.value}`} discount coupon`,
      expiresOn: couponForm.expiresOn || "2026-12-31",
    });

    setCouponForm(initialCoupon);
    setIsNewCouponOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteCoupon(deleteTarget.code);
    setDeleteTarget(null);
  };

  return (
    <div className="animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Manage active promotional codes and discount rules</p>
        </div>
        <Button
          onClick={() => setIsNewCouponOpen(true)}
          className="bg-charcoal text-ivory hover:bg-charcoal/90 transition shadow-sm"
        >
          <Plus className="mr-1.5 h-4 w-4" /> New coupon
        </Button>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {coupons.map((c) => (
          <div key={c.code} className="group relative overflow-hidden rounded-xl border border-dashed border-champagne/50 bg-card p-5 shadow-xs transition hover:border-champagne">
            <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-champagne/10 transition-transform group-hover:scale-125" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <span className="font-serif text-xl tracking-wide font-medium text-charcoal">{c.code}</span>
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                    Active
                  </Badge>
                  <button
                    title="Delete coupon"
                    onClick={() => setDeleteTarget(c)}
                    className="rounded p-1 text-muted-foreground hover:bg-red-50 hover:text-red-600 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <p className="mt-2 text-sm text-foreground/80 min-h-[40px]">{c.description}</p>
              <Separator className="my-3" />
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Discount</p>
                  <p className="font-semibold text-charcoal">{c.type === "percent" ? `${c.value}% off` : formatINR(c.value) + " flat"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Min order</p>
                  <p className="font-medium">{formatINR(c.minOrder)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Max cap</p>
                  <p className="font-medium">{c.maxDiscount ? formatINR(c.maxDiscount) : "No cap"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Expires on</p>
                  <p className="font-medium">{new Date(c.expiresOn).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Coupon Dialog */}
      <Dialog open={isNewCouponOpen} onOpenChange={setIsNewCouponOpen}>
        <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Create New Coupon</DialogTitle>
            <DialogDescription>
              Generate a promotional discount code applicable during checkout.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateCoupon} className="space-y-4 py-2">
            <div>
              <label className="text-xs font-medium text-foreground/80">Coupon Code *</label>
              <Input
                required
                placeholder="e.g. DIWALI25"
                value={couponForm.code}
                onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                className="mt-1 font-mono uppercase"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-foreground/80">Discount Type</label>
                <select
                  value={couponForm.type}
                  onChange={(e) => setCouponForm({ ...couponForm, type: e.target.value as "percent" | "flat" })}
                  className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none"
                >
                  <option value="percent">Percentage (%)</option>
                  <option value="flat">Flat Amount (₹)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-foreground/80">
                  {couponForm.type === "percent" ? "Percentage Value (%)" : "Flat Value (₹)"} *
                </label>
                <Input
                  required
                  type="number"
                  min="1"
                  max={couponForm.type === "percent" ? "100" : "50000"}
                  value={couponForm.value}
                  onChange={(e) => setCouponForm({ ...couponForm, value: Number(e.target.value) })}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-foreground/80">Min Order (₹)</label>
                <Input
                  type="number"
                  min="0"
                  value={couponForm.minOrder}
                  onChange={(e) => setCouponForm({ ...couponForm, minOrder: Number(e.target.value) })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground/80">Max Discount (₹)</label>
                <Input
                  type="number"
                  min="0"
                  placeholder="Optional"
                  value={couponForm.maxDiscount || ""}
                  onChange={(e) => setCouponForm({ ...couponForm, maxDiscount: e.target.value ? Number(e.target.value) : undefined })}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground/80">Expiry Date</label>
              <Input
                type="date"
                required
                value={couponForm.expiresOn}
                onChange={(e) => setCouponForm({ ...couponForm, expiresOn: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground/80">Description</label>
              <Input
                placeholder="e.g. 20% off all orders during festive week"
                value={couponForm.description}
                onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                className="mt-1"
              />
            </div>

            <DialogFooter className="mt-4 pt-2 border-t border-border flex flex-col-reverse sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={() => setIsNewCouponOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-charcoal text-ivory hover:bg-charcoal/90">
                <Plus className="mr-1.5 h-4 w-4" /> Create Coupon
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      {deleteTarget && (
        <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600 font-serif text-lg">
                <AlertCircle className="h-5 w-5" /> Delete Coupon
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to remove coupon &quot;{deleteTarget.code}&quot;? Customers will no longer be able to apply it.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="gap-2 sm:gap-0 mt-3">
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>
                Delete Coupon
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function ReviewsSection() {
  const reviews = useStore((s) => s.reviews);
  const approveReview = useStore((s) => s.approveReview);
  const rejectReview = useStore((s) => s.rejectReview);
  const replyReview = useStore((s) => s.replyReview);

  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const filteredReviews = (reviews || []).filter((r) => {
    if (filter === "all") return true;
    if (filter === "approved") return r.status === "approved" || (r.verified && r.status !== "rejected");
    if (filter === "pending") return r.status === "pending" || (!r.verified && r.status !== "rejected" && r.status !== "approved");
    if (filter === "rejected") return r.status === "rejected";
    return true;
  });

  const totalReviews = reviews?.length || 0;
  const avgRating = totalReviews > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / totalReviews).toFixed(1)
    : "5.0";
  const pendingCount = (reviews || []).filter((r) => r.status === "pending" || (!r.verified && r.status !== "rejected" && r.status !== "approved")).length;

  const handleOpenReply = (reviewId: string, currentReply?: string) => {
    if (activeReplyId === reviewId) {
      setActiveReplyId(null);
      setReplyContent("");
    } else {
      setActiveReplyId(reviewId);
      setReplyContent(currentReply || "");
    }
  };

  const handleSendReply = (reviewId: string) => {
    if (!replyContent.trim()) return;
    replyReview(reviewId, replyContent.trim());
    setActiveReplyId(null);
    setReplyContent("");
  };

  return (
    <div className="animate-fade-up">
      {/* Metrics */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="font-serif text-2xl">{totalReviews}</p>
          <p className="text-xs text-muted-foreground">Total reviews received</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="font-serif text-2xl">{avgRating} ★</p>
          <p className="text-xs text-muted-foreground">Average customer rating</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="font-serif text-2xl text-amber-600">{pendingCount}</p>
          <p className="text-xs text-muted-foreground">Pending moderation</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mt-6 flex items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex gap-2">
          {(["all", "pending", "approved", "rejected"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium capitalize transition",
                filter === tab
                  ? "bg-charcoal text-ivory shadow-xs"
                  : "bg-accent/40 text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        <span className="text-xs text-muted-foreground">
          Showing {filteredReviews.length} of {totalReviews} reviews
        </span>
      </div>

      {/* Reviews List */}
      <div className="mt-4 space-y-3">
        {filteredReviews.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground text-sm">
            No reviews match the selected filter.
          </div>
        ) : (
          filteredReviews.map((r) => {
            const isApproved = r.status === "approved" || (r.verified && r.status !== "rejected");
            const isRejected = r.status === "rejected";
            const isPending = !isApproved && !isRejected;

            return (
              <div key={r.id} className="rounded-xl border border-border bg-card p-4 shadow-xs transition hover:border-border/80">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-charcoal text-xs font-medium text-ivory">
                      {r.author.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{r.author}</p>
                      <p className="text-xs text-muted-foreground">
                        on <span className="font-medium text-foreground/80">{r.productName || "VRUNDORA Jewellery"}</span> · {r.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star
                          key={j}
                          className={cn(
                            "h-3.5 w-3.5",
                            j < r.rating ? "fill-champagne text-champagne" : "fill-muted text-muted"
                          )}
                        />
                      ))}
                    </span>
                    {isApproved ? (
                      <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 font-normal">
                        Approved
                      </Badge>
                    ) : isRejected ? (
                      <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700 font-normal">
                        Rejected
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 font-normal">
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>

                <p className="mt-2 text-sm font-medium text-foreground">{r.title}</p>
                <p className="mt-1 text-sm text-foreground/80 leading-relaxed">{r.body}</p>

                {/* Official Response Banner */}
                {r.adminReply && (
                  <div className="mt-3 rounded-lg border border-champagne/30 bg-champagne/5 p-3 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-medium text-charcoal">
                        <MessageSquare className="h-3.5 w-3.5 text-champagne" />
                        <span>Official Store Response</span>
                        {r.adminReplyDate && <span className="text-[11px] font-normal text-muted-foreground">· {r.adminReplyDate}</span>}
                      </div>
                      <button
                        onClick={() => handleOpenReply(r.id, r.adminReply)}
                        className="text-[11px] text-champagne hover:underline"
                      >
                        Edit reply
                      </button>
                    </div>
                    <p className="mt-1.5 text-foreground/80 pl-5">{r.adminReply}</p>
                  </div>
                )}

                {/* Inline Reply Box */}
                {activeReplyId === r.id && (
                  <div className="mt-3 rounded-lg border border-border bg-accent/20 p-3 space-y-2 animate-fade-in">
                    <label className="text-xs font-medium text-foreground/90">
                      Write response to {r.author}:
                    </label>
                    <Textarea
                      rows={2}
                      placeholder="Thank you for sharing your experience! We are delighted that you loved the jewellery..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      className="text-xs bg-card"
                    />
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => setActiveReplyId(null)}>
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSendReply(r.id)}
                        className="bg-charcoal text-ivory hover:bg-charcoal/90"
                      >
                        <Check className="mr-1 h-3.5 w-3.5" /> Save Response
                      </Button>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-3 flex items-center gap-2 pt-1 border-t border-border/40">
                  <Button
                    size="sm"
                    variant={isApproved ? "outline" : "default"}
                    onClick={() => approveReview(r.id)}
                    className={cn(
                      "h-8 text-xs font-medium transition",
                      isApproved
                        ? "border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100/60"
                        : "bg-charcoal text-ivory hover:bg-charcoal/90"
                    )}
                  >
                    {isApproved ? "Approved ✓" : "Approve"}
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => rejectReview(r.id)}
                    className={cn(
                      "h-8 text-xs transition",
                      isRejected ? "bg-red-50 text-red-700" : "text-red-600 hover:bg-red-50 hover:text-red-700"
                    )}
                  >
                    {isRejected ? "Rejected" : "Reject"}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenReply(r.id, r.adminReply)}
                    className="h-8 text-xs text-foreground/80 hover:text-foreground ml-auto"
                  >
                    <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                    {r.adminReply ? "Edit reply" : "Reply"}
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function ReportsSection({ orders }: { orders: ReturnType<typeof useStore.getState>["orders"] }) {
  const pushToast = useStore((s) => s.pushToast);
  const [timeRange, setTimeRange] = useState<"7m" | "30d" | "ytd">("7m");

  const dynamicSalesData = useMemo(() => {
    if (timeRange === "30d") {
      return [
        { month: "Week 1", sales: 74000, orders: 58 },
        { month: "Week 2", sales: 92000, orders: 74 },
        { month: "Week 3", sales: 86000, orders: 69 },
        { month: "Week 4", sales: 106000, orders: 86 },
      ];
    }
    if (timeRange === "ytd") {
      return [
        { month: "Jan-Mar", sales: 490000, orders: 390 },
        { month: "Apr-Jun", sales: 602000, orders: 461 },
        { month: "Jul-Sep", sales: 866000, orders: 653 },
        { month: "Oct-Dec", sales: 358000, orders: 287 },
      ];
    }
    return salesData;
  }, [timeRange]);

  const handleExportCSV = () => {
    const csvRows = [
      ["Timeframe", "Sales (INR)", "Orders Count"],
      ...dynamicSalesData.map((d) => [d.month, d.sales.toString(), d.orders.toString()]),
      [],
      ["Category", "Share (%)"],
      ...categoryData.map((c) => [c.name, c.value.toString()]),
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `vrundora_sales_report_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    pushToast({
      title: "Report exported",
      description: "Sales data downloaded successfully as CSV.",
      variant: "success",
    });
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1.5">
          {[
            { id: "30d", label: "Last 30 Days" },
            { id: "7m", label: "Last 7 Months" },
            { id: "ytd", label: "Year to Date" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTimeRange(t.id as "7m" | "30d" | "ytd")}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition",
                timeRange === t.id
                  ? "bg-charcoal text-ivory shadow-xs"
                  : "bg-card border border-border text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <Button
          onClick={handleExportCSV}
          variant="outline"
          size="sm"
          className="gap-1.5 h-8 text-xs shadow-xs"
        >
          <Download className="h-3.5 w-3.5" /> Export Report (CSV)
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
          <h2 className="font-serif text-lg">Orders trend</h2>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dynamicSalesData} margin={{ left: -15, right: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e1d8" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#888" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#888" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e1d8", fontSize: 12 }} />
                <Bar dataKey="orders" fill="#c9a96a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
          <h2 className="font-serif text-lg">Revenue trend</h2>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dynamicSalesData} margin={{ left: -10, right: 10 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b7355" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#8b7355" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e1d8" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#888" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#888" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e1d8", fontSize: 12 }} formatter={(v: number) => formatINR(v)} />
                <Area type="monotone" dataKey="sales" stroke="#8b7355" strokeWidth={2} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Conversion rate", value: "3.4%", change: "+0.5%", up: true },
          { label: "Repeat customers", value: "42%", change: "+3%", up: true },
          { label: "Cart abandonment", value: "28%", change: "-2%", up: true },
          { label: "Avg. session", value: "4m 12s", change: "+18s", up: true },
        ].map((m) => (
          <div key={m.label} className="rounded-xl border border-border bg-card p-4 shadow-xs">
            <p className="font-serif text-2xl">{m.value}</p>
            <p className="text-xs text-muted-foreground">{m.label}</p>
            <p className={cn("mt-1 inline-flex items-center gap-0.5 text-xs", m.up ? "text-emerald-600" : "text-red-600")}>
              {m.up ? <ArrowUpRight className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />} {m.change}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsSection() {
  const storeSettings = useStore((s) => s.storeSettings);
  const updateStoreSettings = useStore((s) => s.updateStoreSettings);
  const adminUsers = useStore((s) => s.adminUsers);
  const addAdminUser = useStore((s) => s.addAdminUser);
  const deleteAdminUser = useStore((s) => s.deleteAdminUser);

  const [formSettings, setFormSettings] = useState<StoreSettings>(storeSettings);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    name: "",
    email: "",
    role: "Store Manager",
    perms: "Catalog, Orders, Customers",
  });

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreSettings(formSettings);
  };

  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.name.trim() || !inviteForm.email.trim()) return;

    let perms = "Catalog, Orders";
    if (inviteForm.role === "Super Admin") perms = "All access";
    if (inviteForm.role === "Support Agent") perms = "Orders, Support, Reviews";
    if (inviteForm.role === "Analytics Viewer") perms = "Reports only";

    addAdminUser({
      name: inviteForm.name.trim(),
      email: inviteForm.email.trim(),
      role: inviteForm.role,
      perms,
    });

    setInviteForm({ name: "", email: "", role: "Store Manager", perms: "Catalog, Orders, Customers" });
    setIsInviteOpen(false);
  };

  return (
    <div className="animate-fade-up max-w-3xl space-y-6">
      {/* Store Settings Form */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
        <h2 className="font-serif text-lg">Store settings</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Configure store identity, support information, and checkout rules</p>
        
        <form onSubmit={handleSaveSettings} className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-foreground/80">Store name</label>
              <Input
                value={formSettings.storeName}
                onChange={(e) => setFormSettings({ ...formSettings, storeName: e.target.value })}
                className="mt-1"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground/80">Support email</label>
              <Input
                type="email"
                value={formSettings.supportEmail}
                onChange={(e) => setFormSettings({ ...formSettings, supportEmail: e.target.value })}
                className="mt-1"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground/80">Support phone</label>
              <Input
                value={formSettings.supportPhone}
                onChange={(e) => setFormSettings({ ...formSettings, supportPhone: e.target.value })}
                className="mt-1"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground/80">Currency</label>
              <Input
                value={formSettings.currency}
                onChange={(e) => setFormSettings({ ...formSettings, currency: e.target.value })}
                className="mt-1"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground/80">Free shipping threshold (₹)</label>
              <Input
                type="number"
                value={formSettings.freeShippingThreshold}
                onChange={(e) => setFormSettings({ ...formSettings, freeShippingThreshold: Number(e.target.value) })}
                className="mt-1"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground/80">Tax rate (%)</label>
              <Input
                type="number"
                value={formSettings.taxRate}
                onChange={(e) => setFormSettings({ ...formSettings, taxRate: Number(e.target.value) })}
                className="mt-1"
                required
              />
            </div>
          </div>
          <Button type="submit" className="bg-charcoal text-ivory hover:bg-charcoal/90">
            Save changes
          </Button>
        </form>
      </div>

      {/* Roles & Permissions */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg">Roles & permissions</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Manage administrative team members and access levels</p>
          </div>
          <Button
            size="sm"
            onClick={() => setIsInviteOpen(true)}
            className="bg-charcoal text-ivory hover:bg-charcoal/90 text-xs gap-1.5"
          >
            <UserPlus className="h-3.5 w-3.5" /> Invite Member
          </Button>
        </div>

        <div className="mt-4 space-y-2">
          {(adminUsers || []).map((u) => (
            <div key={u.id} className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-accent/20 transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-semibold">
                  {u.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-medium">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.email} · <span className="font-medium text-foreground/70">{u.perms}</span></p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={cn(
                  u.role === "Super Admin" ? "border-champagne bg-champagne/10 text-charcoal font-medium" : "border-border"
                )}>
                  {u.role}
                </Badge>
                {u.role !== "Super Admin" && (
                  <button
                    title="Remove member"
                    onClick={() => deleteAdminUser(u.id)}
                    className="p-1 rounded text-muted-foreground hover:bg-red-50 hover:text-red-600 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Member Dialog */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">Invite Team Member</DialogTitle>
            <DialogDescription>Grant administrative permissions to a staff member.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleInviteUser} className="space-y-4 py-2">
            <div>
              <label className="text-xs font-medium text-foreground/80">Full Name *</label>
              <Input
                required
                placeholder="e.g. Ramesh Patel"
                value={inviteForm.name}
                onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground/80">Work Email *</label>
              <Input
                required
                type="email"
                placeholder="ramesh@vrundora.com"
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground/80">Role</label>
              <select
                value={inviteForm.role}
                onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none"
              >
                <option value="Store Manager">Store Manager (Catalog, Orders, Customers)</option>
                <option value="Support Agent">Support Agent (Orders, Support, Reviews)</option>
                <option value="Analytics Viewer">Analytics Viewer (Reports only)</option>
                <option value="Super Admin">Super Admin (All access)</option>
              </select>
            </div>

            <DialogFooter className="mt-4 pt-2 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setIsInviteOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-charcoal text-ivory hover:bg-charcoal/90">
                <UserPlus className="mr-1.5 h-3.5 w-3.5" /> Send Invitation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Sample data for when store is empty
const sampleOrders: ReturnType<typeof useStore.getState>["orders"] = [
  {
    id: "s1", number: "ORD-2026-287341", items: [{ productId: "p1", name: "Aurora Pearl Drop Earrings", image: allProducts[0].images[0], price: 1299, qty: 1, colorId: "gold", colorName: "Gold-tone" }],
    subtotal: 1299, discount: 130, shipping: 0, tax: 39, total: 1208, address: { id: "a1", label: "Home", name: "Priya Sharma", phone: "+91 98765 43210", line1: "12 Hill Road", city: "Mumbai", state: "Maharashtra", pincode: "400050", country: "India", isDefault: true },
    paymentMethod: "card", paymentStatus: "paid", status: "delivered", placedAt: new Date(Date.now() - 86400000 * 8).toISOString(), estimatedDelivery: new Date(Date.now() - 86400000 * 2).toISOString(),
    timeline: [],
  },
  {
    id: "s2", number: "ORD-2026-287205", items: [{ productId: "p5", name: "Elara Layered Pendant Necklace", image: allProducts[4].images[0], price: 1799, qty: 1, colorId: "gold", colorName: "Gold-tone" }],
    subtotal: 1799, discount: 0, shipping: 0, tax: 54, total: 1853, address: { id: "a2", label: "Home", name: "Ananya Reddy", phone: "+91 99887 76655", line1: "45 Brigade Road", city: "Bengaluru", state: "Karnataka", pincode: "560001", country: "India", isDefault: true },
    paymentMethod: "upi", paymentStatus: "paid", status: "shipped", placedAt: new Date(Date.now() - 86400000 * 2).toISOString(), estimatedDelivery: new Date(Date.now() + 86400000).toISOString(),
    timeline: [],
  },
  {
    id: "s3", number: "ORD-2026-287118", items: [{ productId: "p8", name: "Celestine Cocktail Ring", image: allProducts[7].images[0], price: 1099, qty: 2, colorId: "silver", colorName: "Silver-tone" }],
    subtotal: 2198, discount: 220, shipping: 0, tax: 66, total: 2044, address: { id: "a3", label: "Home", name: "Meera Krishnan", phone: "+91 90080 70605", line1: "8 T Nagar", city: "Chennai", state: "Tamil Nadu", pincode: "600017", country: "India", isDefault: true },
    paymentMethod: "cod", paymentStatus: "pending", status: "processing", placedAt: new Date(Date.now() - 86400000).toISOString(), estimatedDelivery: new Date(Date.now() + 86400000 * 4).toISOString(),
    timeline: [],
  },
];

const sampleCustomers = [
  { name: "Priya Sharma", email: "priya.s@email.com", city: "Mumbai", orders: 8, spent: 24500 },
  { name: "Ananya Reddy", email: "ananya.r@email.com", city: "Bengaluru", orders: 5, spent: 18200 },
  { name: "Meera Krishnan", email: "meera.k@email.com", city: "Chennai", orders: 6, spent: 15800 },
  { name: "Ishita Verma", email: "ishita.v@email.com", city: "Delhi", orders: 3, spent: 8900 },
  { name: "Sneha Das", email: "sneha.d@email.com", city: "Kolkata", orders: 4, spent: 6400 },
];
