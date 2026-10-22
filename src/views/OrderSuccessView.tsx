"use client";

import { useEffect, useState } from "react";
import { useStore, formatINR } from "@/store/useStore";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Package, Truck, ArrowRight, Mail, Download } from "lucide-react";

export function OrderSuccessView() {
  const params = useStore((s) => s.params);
  const navigate = useStore((s) => s.navigate);
  const orders = useStore((s) => s.orders);
  const [show, setShow] = useState(false);

  const order = orders.find((o) => o.id === params.id);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 50);
    return () => clearTimeout(t);
  }, []);

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <p className="font-serif text-2xl">Order not found</p>
        <Button onClick={() => navigate("orders")} className="mt-4">View my orders</Button>
      </div>
    );
  }

  const estDate = new Date(order.estimatedDelivery).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 animate-fade-up">
      <div className={show ? "transition-all duration-500" : "opacity-0"}>
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2 className="h-11 w-11 text-emerald-600" />
          </div>
          <h1 className="mt-6 font-serif text-3xl sm:text-4xl">Order Confirmed!</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Thank you for your order. We've sent a confirmation to your email.
          </p>
          <div className="mt-5 inline-flex flex-col items-center rounded-lg border border-border bg-card px-6 py-3">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Order number</span>
            <span className="font-serif text-lg font-semibold text-charcoal">{order.number}</span>
          </div>
        </div>

        {/* Estimated delivery */}
        <div className="mt-8 flex items-center justify-center gap-3 rounded-xl border border-champagne/40 bg-champagne/10 px-5 py-4">
          <Truck className="h-5 w-5 text-charcoal" />
          <p className="text-sm">
            Expected delivery by <strong>{estDate}</strong>
          </p>
        </div>

        {/* Order items */}
        <div className="mt-8 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg">Order summary</h2>
            <Button variant="outline" size="sm" onClick={() => useStore.getState().pushToast({ title: "Invoice downloaded", variant: "success" })}>
              <Download className="mr-1.5 h-3.5 w-3.5" /> Invoice
            </Button>
          </div>
          <div className="mt-4 space-y-3">
            {order.items.map((i) => (
              <div key={`${i.productId}-${i.colorId}`} className="flex items-center gap-3">
                <img src={i.image} alt={i.name} className="h-14 w-14 rounded object-cover" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{i.name}</p>
                  <p className="text-xs text-muted-foreground">{i.colorName} · Qty {i.qty}</p>
                </div>
                <p className="text-sm font-semibold">{formatINR(i.price * i.qty)}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-border pt-4 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatINR(order.subtotal)}</span></div>
            {order.discount > 0 && <div className="flex justify-between text-emerald-700"><span>Discount{order.couponCode && ` (${order.couponCode})`}</span><span>-{formatINR(order.discount)}</span></div>}
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{order.shipping === 0 ? "Free" : formatINR(order.shipping)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>{formatINR(order.tax)}</span></div>
            <div className="mt-2 flex justify-between border-t border-border pt-2 font-semibold"><span>Total</span><span className="font-serif text-lg">{formatINR(order.total)}</span></div>
          </div>
        </div>

        {/* Next steps */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            { icon: Mail, title: "Confirmation sent", text: "Check your inbox for order details" },
            { icon: Package, title: "Packing your order", text: "We'll dispatch within 24 hours" },
            { icon: Truck, title: "On the way", text: `Arrives by ${estDate}` },
          ].map((s) => (
            <div key={s.title} className="rounded-lg border border-border p-4 text-center">
              <s.icon className="mx-auto h-5 w-5 text-charcoal" />
              <p className="mt-2 text-sm font-medium">{s.title}</p>
              <p className="text-xs text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={() => navigate("order-details", { id: order.id })} className="bg-charcoal text-ivory hover:bg-charcoal/90">
            View order details <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => navigate("orders")}>Track my orders</Button>
          <Button variant="ghost" onClick={() => navigate("shop")}>Continue shopping</Button>
        </div>
      </div>
    </div>
  );
}
