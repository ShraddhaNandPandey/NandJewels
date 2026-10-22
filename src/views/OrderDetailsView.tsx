"use client";

import { useState } from "react";
import { useStore, formatINR } from "@/store/useStore";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ChevronRight,
  Check,
  Truck,
  MapPin,
  CreditCard,
  Package,
  Download,
  X,
  RotateCcw,
  MessageCircle,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function OrderDetailsView() {
  const params = useStore((s) => s.params);
  const navigate = useStore((s) => s.navigate);
  const orders = useStore((s) => s.orders);
  const cancelOrder = useStore((s) => s.cancelOrder);
  const advanceOrder = useStore((s) => s.advanceOrder);
  const requestReturn = useStore((s) => s.requestReturn);

  const [cancelOpen, setCancelOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [returnReason, setReturnReason] = useState("");

  const order = orders.find((o) => o.id === params.id);

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <p className="font-serif text-2xl">Order not found</p>
        <Button onClick={() => navigate("orders")} className="mt-4">View my orders</Button>
      </div>
    );
  }

  const canCancel = ["placed", "confirmed", "processing", "packed"].includes(order.status);
  const canReturn = order.status === "delivered";
  const placed = new Date(order.placedAt);
  const est = new Date(order.estimatedDelivery);

  const handleCancel = () => {
    cancelOrder(order.id);
    setCancelOpen(false);
    navigate("orders");
  };

  const handleReturn = () => {
    if (!returnReason.trim()) return;
    requestReturn(order.id, returnReason);
    setReturnOpen(false);
    setReturnReason("");
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 animate-fade-up">
      <Breadcrumbs items={[{ label: "My Orders", view: "orders" }, { label: order.number }]} />

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl">Order Details</h1>
          <p className="mt-1 text-sm text-muted-foreground">{order.number} · Placed on {placed.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => useStore.getState().pushToast({ title: "Invoice downloaded", variant: "success" })}>
            <Download className="mr-1.5 h-3.5 w-3.5" /> Invoice
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate("support")}>
            <MessageCircle className="mr-1.5 h-3.5 w-3.5" /> Support
          </Button>
          {/* Dev helper to advance status for demo */}
          {order.status !== "delivered" && order.status !== "cancelled" && (
            <Button variant="ghost" size="sm" onClick={() => advanceOrder(order.id)} className="text-xs">
              Advance ▶
            </Button>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Tracking timeline */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl flex items-center gap-2"><Truck className="h-5 w-5 text-charcoal" /> Shipment tracking</h2>
              {order.trackingNumber && (
                <span className="text-xs text-muted-foreground">AWB: {order.trackingNumber}</span>
              )}
            </div>

            {order.status === "cancelled" ? (
              <div className="mt-6 rounded-lg bg-red-50 p-4 text-center">
                <X className="mx-auto h-6 w-6 text-red-600" />
                <p className="mt-2 text-sm font-medium text-red-700">This order was cancelled</p>
                {order.paymentStatus === "refunded" && <p className="text-xs text-red-600">Refund has been initiated.</p>}
              </div>
            ) : order.status === "returned" ? (
              <div className="mt-6 rounded-lg bg-zinc-100 p-4 text-center">
                <RotateCcw className="mx-auto h-6 w-6 text-zinc-600" />
                <p className="mt-2 text-sm font-medium">Return requested</p>
                <p className="text-xs text-muted-foreground">We're reviewing your return request.</p>
              </div>
            ) : (
              <>
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Estimated delivery</p>
                    <p className="text-sm font-medium">{est.toLocaleDateString("en-IN", { day: "numeric", month: "long" })}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Courier</p>
                    <p className="text-sm font-medium">{order.courier}</p>
                  </div>
                </div>

                {/* Timeline */}
                <div className="relative mt-6">
                  <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-border" />
                  <div className="space-y-5">
                    {order.timeline.map((t, i) => (
                      <div key={i} className="relative flex items-start gap-4">
                        <span className={cn(
                          "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2",
                          t.done ? "border-charcoal bg-charcoal text-ivory" : "border-border bg-background text-muted-foreground"
                        )}>
                          {t.done ? <Check className="h-4 w-4" /> : <Clock className="h-3.5 w-3.5" />}
                        </span>
                        <div className={cn("pt-1", !t.done && "opacity-50")}>
                          <p className="text-sm font-medium">{t.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {t.done
                              ? new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
                              : "Pending"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Items */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-serif text-xl flex items-center gap-2"><Package className="h-5 w-5 text-charcoal" /> Items in order</h2>
            <div className="mt-4 space-y-3">
              {order.items.map((i) => (
                <div key={`${i.productId}-${i.colorId}`} className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <button onClick={() => navigate("product", { id: i.productId })}>
                    <img src={i.image} alt={i.name} className="h-16 w-16 rounded object-cover" />
                  </button>
                  <div className="flex-1">
                    <button onClick={() => navigate("product", { id: i.productId })} className="text-left text-sm font-medium hover:text-charcoal">{i.name}</button>
                    <p className="text-xs text-muted-foreground">{i.colorName}{i.size && ` · ${i.size}`} · Qty {i.qty}</p>
                    {canReturn && (
                      <Button size="sm" variant="link" className="h-auto px-0 text-xs text-charcoal" onClick={() => setReturnOpen(true)}>
                        Return this item
                      </Button>
                    )}
                  </div>
                  <p className="text-sm font-semibold">{formatINR(i.price * i.qty)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Address & payment */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold"><MapPin className="h-4 w-4 text-charcoal" /> Shipping address</h3>
              <div className="mt-3 text-sm text-foreground/80">
                <p className="font-medium">{order.address.name}</p>
                <p>{order.address.line1}{order.address.line2 && `, ${order.address.line2}`}</p>
                <p>{order.address.city}, {order.address.state} - {order.address.pincode}</p>
                <p>{order.address.country}</p>
                <p className="mt-1 text-muted-foreground">{order.address.phone}</p>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold"><CreditCard className="h-4 w-4 text-charcoal" /> Payment</h3>
              <dl className="mt-3 space-y-1.5 text-sm">
                <div className="flex justify-between"><dt className="text-muted-foreground">Method</dt><dd className="capitalize">{order.paymentMethod === "cod" ? "Cash on Delivery" : order.paymentMethod}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Status</dt><dd className="capitalize">{order.paymentStatus}</dd></div>
                <Separator className="my-2" />
                <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{formatINR(order.subtotal)}</dd></div>
                {order.discount > 0 && <div className="flex justify-between text-emerald-700"><dt>Discount</dt><dd>-{formatINR(order.discount)}</dd></div>}
                <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd>{order.shipping === 0 ? "Free" : formatINR(order.shipping)}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Tax</dt><dd>{formatINR(order.tax)}</dd></div>
                <div className="flex justify-between font-semibold"><dt>Total</dt><dd className="font-serif text-base">{formatINR(order.total)}</dd></div>
              </dl>
            </div>
          </div>
        </div>

        {/* Sidebar actions */}
        <div className="space-y-4">
          <div className="sticky top-32 rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold">Need help with this order?</h3>
            <div className="mt-3 space-y-2">
              {canCancel && (
                <Button variant="outline" className="w-full justify-start text-red-600 hover:bg-red-50" onClick={() => setCancelOpen(true)}>
                  <X className="mr-2 h-4 w-4" /> Cancel order
                </Button>
              )}
              {canReturn && (
                <Button variant="outline" className="w-full justify-start" onClick={() => setReturnOpen(true)}>
                  <RotateCcw className="mr-2 h-4 w-4" /> Request return
                </Button>
              )}
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate("support")}>
                <MessageCircle className="mr-2 h-4 w-4" /> Contact support
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("orders")}>
                <ChevronRight className="mr-1 h-4 w-4 rotate-180" /> Back to orders
              </Button>
            </div>
            {order.couponCode && (
              <div className="mt-4 rounded-lg bg-accent/40 p-3 text-xs">
                <p className="text-muted-foreground">Coupon applied</p>
                <p className="font-semibold text-charcoal">{order.couponCode}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cancel dialog */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel this order?</DialogTitle>
            <DialogDescription>
              This action can't be undone. If you've already paid, a full refund will be initiated to your original payment method within 5–7 business days.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>Keep order</Button>
            <Button variant="destructive" onClick={handleCancel}>Yes, cancel order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Return dialog */}
      <Dialog open={returnOpen} onOpenChange={setReturnOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request a return</DialogTitle>
            <DialogDescription>
              Tell us why you'd like to return this item. We'll arrange a free pickup within 2–3 days.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for return</Label>
            <Textarea
              id="reason"
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              placeholder="e.g. Doesn't match the photos, wrong size, changed my mind…"
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReturnOpen(false)}>Cancel</Button>
            <Button onClick={handleReturn} disabled={!returnReason.trim()} className="bg-charcoal text-ivory hover:bg-charcoal/90">Submit return</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
