"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Package,
  Heart,
  MapPin,
  RotateCcw,
  Star,
  Bell,
  MessageCircle,
  LogOut,
  ShoppingBag,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function AccountView() {
  const navigate = useStore((s) => s.navigate);
  const user = useStore((s) => s.user);
  const orders = useStore((s) => s.orders);
  const wishlist = useStore((s) => s.wishlist);
  const addresses = useStore((s) => s.addresses);
  const notifications = useStore((s) => s.notifications);
  const tickets = useStore((s) => s.tickets);
  const logout = useStore((s) => s.logout);
  const updateProfile = useStore((s) => s.register);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center animate-fade-up">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-accent/50 p-2">
          <picture>
            <source srcSet="/vrundora-emblem.webp" type="image/webp" />
            <img src="/vrundora-emblem.png" alt="वृन्दोरा" className="h-16 w-16 object-contain" />
          </picture>
        </div>
        <h1 className="mt-6 font-serif text-3xl">Welcome to VRUNDORA (वृन्दोरा)</h1>
        <p className="mt-2 text-sm text-muted-foreground">Log in or create an account to access your dashboard.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={() => navigate("login")} className="bg-charcoal text-ivory hover:bg-charcoal/90">Login</Button>
          <Button variant="outline" onClick={() => navigate("register")}>Create account</Button>
        </div>
      </div>
    );
  }

  const unread = notifications.filter((n) => !n.read).length;
  const recentOrders = orders.slice(0, 3);

  const menu = [
    { icon: Package, label: "My Orders", count: orders.length, view: "orders" as const },
    { icon: Heart, label: "Wishlist", count: wishlist.length, view: "wishlist" as const },
    { icon: MapPin, label: "Addresses", count: addresses.length, view: "addresses" as const },
    { icon: RotateCcw, label: "Returns", count: orders.filter((o) => o.status === "returned").length, view: "orders" as const },
    { icon: Star, label: "My Reviews", count: 0, view: "orders" as const },
    { icon: Bell, label: "Notifications", count: unread, view: "notifications" as const },
    { icon: MessageCircle, label: "Support", count: tickets.length, view: "support" as const },
  ];

  const save = () => {
    updateProfile(form);
    setEditing(false);
    useStore.getState().pushToast({ title: "Profile updated", variant: "success" });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 animate-fade-up">
      <Breadcrumbs items={[{ label: "My Account" }]} />

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Profile card */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-border bg-card p-5 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-charcoal text-2xl font-serif text-ivory">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <p className="mt-3 font-medium">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
            <p className="mt-1 text-xs text-muted-foreground">Member since {new Date(user.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</p>
            <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => setEditing(!editing)}>
              {editing ? "Cancel" : "Edit profile"}
            </Button>
            <Button variant="ghost" size="sm" className="mt-1 w-full text-red-600" onClick={() => { logout(); }}>
              <LogOut className="mr-1.5 h-3.5 w-3.5" /> Logout
            </Button>
          </div>

          {/* Quick stats */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Stat label="Orders" value={orders.length} />
            <Stat label="Wishlist" value={wishlist.length} />
            <Stat label="Alerts" value={unread} />
          </div>
        </div>

        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {editing && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="font-serif text-lg">Edit profile</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Field label="First name"><Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></Field>
                <Field label="Last name"><Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></Field>
                <Field label="Email"><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
                <Field label="Phone"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
              </div>
              <div className="mt-4 flex gap-2">
                <Button onClick={save} className="bg-charcoal text-ivory hover:bg-charcoal/90">Save changes</Button>
                <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </div>
          )}

          {/* Menu grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {menu.map((m) => (
              <button
                key={m.label}
                onClick={() => navigate(m.view)}
                className="group flex flex-col items-start rounded-xl border border-border bg-card p-4 text-left transition hover:border-charcoal hover:shadow-sm"
              >
                <div className="flex w-full items-center justify-between">
                  <m.icon className="h-5 w-5 text-charcoal" />
                  {m.count > 0 && (
                    <span className="rounded-full bg-champagne/20 px-2 py-0.5 text-xs font-medium text-charcoal">{m.count}</span>
                  )}
                </div>
                <p className="mt-2 text-sm font-medium">{m.label}</p>
                <span className="mt-0.5 inline-flex items-center gap-0.5 text-xs text-muted-foreground group-hover:text-charcoal">
                  View <ChevronRight className="h-3 w-3" />
                </span>
              </button>
            ))}
          </div>

          {/* Recent orders */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg">Recent orders</h2>
              <Button variant="link" className="px-0 text-charcoal" onClick={() => navigate("orders")}>View all</Button>
            </div>
            {recentOrders.length === 0 ? (
              <div className="mt-4 flex flex-col items-center rounded-lg border border-dashed border-border py-8 text-center">
                <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">No orders yet</p>
                <Button size="sm" onClick={() => navigate("shop")} className="mt-3 bg-charcoal text-ivory hover:bg-charcoal/90">Start shopping</Button>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {recentOrders.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => navigate("order-details", { id: o.id })}
                    className="flex w-full items-center gap-3 rounded-lg border border-border p-3 text-left transition hover:border-charcoal"
                  >
                    <img src={o.items[0].image} alt="" className="h-12 w-12 rounded object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{o.number}</p>
                      <p className="text-xs text-muted-foreground capitalize">{o.status.replace(/_/g, " ")} · {new Date(o.placedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 text-center">
      <p className="font-serif text-xl">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs font-medium text-foreground/80">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
