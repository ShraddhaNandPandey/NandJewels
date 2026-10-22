"use client";

import { useState } from "react";
import { useStore, formatINR } from "@/store/useStore";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Package, ChevronRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/lib/types";

const statusFilters: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "placed", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "returned", label: "Returned" },
];

const statusMeta: Record<OrderStatus, { label: string; cls: string }> = {
  placed: { label: "Placed", cls: "bg-blue-50 text-blue-700" },
  confirmed: { label: "Confirmed", cls: "bg-blue-50 text-blue-700" },
  processing: { label: "Processing", cls: "bg-blue-50 text-blue-700" },
  packed: { label: "Packed", cls: "bg-indigo-50 text-indigo-700" },
  shipped: { label: "Shipped", cls: "bg-amber-50 text-amber-700" },
  out_for_delivery: { label: "Out for Delivery", cls: "bg-amber-50 text-amber-700" },
  delivered: { label: "Delivered", cls: "bg-emerald-50 text-emerald-700" },
  cancelled: { label: "Cancelled", cls: "bg-red-50 text-red-700" },
  returned: { label: "Returned", cls: "bg-zinc-100 text-zinc-700" },
};

export function OrdersView() {
  const navigate = useStore((s) => s.navigate);
  const orders = useStore((s) => s.orders);
  const [filter, setFilter] = useState("all");
  const [trackInput, setTrackInput] = useState("");

  const filtered = filter === "all" ? orders : orders.filter((o) => {
    if (filter === "placed") return ["placed", "confirmed", "processing", "packed"].includes(o.status);
    if (filter === "shipped") return ["shipped", "out_for_delivery"].includes(o.status);
    return o.status === filter;
  });

  const handleTrack = () => {
    if (!trackInput.trim()) return;
    const order = orders.find((o) => o.number.toLowerCase() === trackInput.trim().toLowerCase());
    if (order) navigate("order-details", { id: order.id });
    else useStore.getState().pushToast({ title: "Order not found", description: "Check your order number and try again.", variant: "destructive" });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 animate-fade-up">
      <Breadcrumbs items={[{ label: "My Orders" }]} />
      <div className="mt-4 flex flex-col gap-1">
        <h1 className="font-serif text-3xl sm:text-4xl">My Orders</h1>
        <p className="text-sm text-muted-foreground">Track, return or cancel your purchases</p>
      </div>

      {/* Track order */}
      <div className="mt-5 flex gap-2 rounded-lg border border-border bg-card p-3">
        <Search className="ml-1 h-5 w-5 text-muted-foreground" />
        <input
          value={trackInput}
          onChange={(e) => setTrackInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleTrack()}
          placeholder="Track an order — enter order number (e.g. ORD-2026-123456)"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <Button size="sm" onClick={handleTrack} className="bg-charcoal text-ivory hover:bg-charcoal/90">Track</Button>
      </div>

      {/* Filters */}
      <div className="mt-5 flex gap-2 overflow-x-auto no-scrollbar">
        {statusFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-1.5 text-sm transition",
              filter === f.value ? "border-charcoal bg-charcoal text-ivory" : "border-border hover:border-charcoal"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Orders */}
      {filtered.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <Package className="h-10 w-10 text-muted-foreground" />
          <p className="mt-3 font-serif text-xl">No orders here yet</p>
          <p className="mt-1 text-sm text-muted-foreground">When you place an order, it'll show up here.</p>
          <Button onClick={() => navigate("shop")} className="mt-4 bg-charcoal text-ivory hover:bg-charcoal/90">Start shopping</Button>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {filtered.map((o) => {
            const meta = statusMeta[o.status];
            const placed = new Date(o.placedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
            const est = new Date(o.estimatedDelivery).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
            return (
              <div key={o.id} className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-accent/30 px-4 py-3">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">Order</p>
                      <p className="text-sm font-semibold">{o.number}</p>
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">Placed on</p>
                      <p className="text-sm">{placed}</p>
                    </div>
                    <div className="hidden md:block">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">Total</p>
                      <p className="text-sm font-semibold">{formatINR(o.total)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn("rounded-full px-3 py-1 text-xs font-medium", meta.cls)}>{meta.label}</span>
                    <Button size="sm" variant="outline" onClick={() => navigate("order-details", { id: o.id })}>
                      Details <ChevronRight className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 p-4">
                  <div className="flex -space-x-3">
                    {o.items.slice(0, 3).map((i, idx) => (
                      <img key={idx} src={i.image} alt={i.name} className="h-14 w-14 rounded-md border-2 border-background object-cover" />
                    ))}
                    {o.items.length > 3 && (
                      <div className="flex h-14 w-14 items-center justify-center rounded-md border-2 border-background bg-accent text-xs font-medium">
                        +{o.items.length - 3}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {o.items.map((i) => i.name).join(", ")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {o.items.reduce((n, i) => n + i.qty, 0)} items · Payment: {o.paymentMethod === "cod" ? "COD" : o.paymentMethod.toUpperCase()}
                      {o.status === "delivered" && " · Delivered"}
                      {o.status !== "delivered" && o.status !== "cancelled" && ` · Arrives by ${est}`}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
