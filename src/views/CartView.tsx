"use client";

import { useState, useMemo } from "react";
import { useStore, formatINR } from "@/store/useStore";
import { getProduct, products as allProducts, calculateComboStock } from "@/data/products";
import { coupons } from "@/data/coupons";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingBag,
  Trash2,
  Heart,
  Minus,
  Plus,
  Tag,
  X,
  ArrowRight,
  Truck,
  ShieldCheck,
  ChevronRight,
  Layers,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function CartView() {
  const navigate = useStore((s) => s.navigate);
  const cart = useStore((s) => s.cart);
  const cartItems = useMemo(() => cart.filter((i) => !i.savedForLater), [cart]);
  const savedItems = useMemo(() => cart.filter((i) => i.savedForLater), [cart]);
  const updateQty = useStore((s) => s.updateQty);
  const removeFromCart = useStore((s) => s.removeFromCart);
  const saveForLater = useStore((s) => s.saveForLater);
  const couponCode = useStore((s) => s.couponCode);
  const couponDiscount = useStore((s) => s.couponDiscount);
  const applyCoupon = useStore((s) => s.applyCoupon);
  const removeCoupon = useStore((s) => s.removeCoupon);
  const allProductsList = useStore((s) => s.products || allProducts);

  const [code, setCode] = useState("");
  const [showCoupons, setShowCoupons] = useState(false);

  const items = cartItems
    .map((i) => ({
      item: i,
      product: allProductsList.find((p) => p.id === i.productId) || getProduct(i.productId),
    }))
    .filter((x) => x.product);

  const subtotal = items.reduce((s, x) => s + (x.product!.price * x.item.qty), 0);
  const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 79;
  const tax = Math.round(subtotal * 0.03);
  const total = Math.max(0, subtotal - couponDiscount + shipping + tax);

  const handleApply = () => {
    if (!code.trim()) return;
    const res = applyCoupon(code, subtotal);
    if (!res.ok) {
      useStore.getState().pushToast({ title: "Coupon invalid", description: res.message, variant: "destructive" });
    }
    setCode("");
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center animate-fade-up">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-accent">
          <ShoppingBag className="h-9 w-9 text-muted-foreground" />
        </div>
        <h1 className="mt-6 font-serif text-3xl">Your cart is empty</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Looks like you haven't added anything yet. Let's find something you'll love.
        </p>
        <Button onClick={() => navigate("shop")} className="mt-6 bg-charcoal text-ivory hover:bg-charcoal/90">
          Continue shopping <ArrowRight className="ml-2 h-4 w-4" />
        </Button>

        {savedItems.length > 0 && (
          <div className="mt-12 text-left">
            <h2 className="font-serif text-xl">Saved for later</h2>
            <div className="mt-4 space-y-3">
              {savedItems.map((i) => {
                const p = getProduct(i.productId);
                if (!p) return null;
                return (
                  <div key={`${i.productId}-${i.colorId}`} className="flex items-center gap-3 rounded-lg border border-border p-3">
                    <img src={p.images[0]} alt={p.name} className="h-16 w-16 rounded object-cover" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{formatINR(p.price)}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => saveForLater(i.productId, i.colorId, false, i.size)}>
                      Move to cart
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 animate-fade-up">
      <Breadcrumbs items={[{ label: "Cart" }]} />
      <h1 className="mt-4 font-serif text-3xl sm:text-4xl">Shopping Cart</h1>
      <p className="mt-1 text-sm text-muted-foreground">{items.length} {items.length === 1 ? "item" : "items"} in your cart</p>

      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {/* Free shipping progress */}
          {shipping > 0 && (
            <div className="rounded-lg border border-champagne/40 bg-champagne/10 p-3">
              <p className="flex items-center gap-2 text-sm">
                <Truck className="h-4 w-4 text-charcoal" />
                Add <strong>{formatINR(999 - subtotal)}</strong> more to get <strong>FREE shipping</strong>
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-champagne transition-all" style={{ width: `${Math.min(100, (subtotal / 999) * 100)}%` }} />
              </div>
            </div>
          )}
          {shipping === 0 && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
              <p className="flex items-center gap-2 text-sm text-emerald-700">
                <Truck className="h-4 w-4" /> You've unlocked <strong>FREE shipping!</strong>
              </p>
            </div>
          )}

          {items.map(({ item, product }) => {
            const color = product!.colors?.find((c) => c.id === item.colorId);
            const lineTotal = product!.price * item.qty;
            const isCombo = product!.productType === "combo";
            const effectiveStock = isCombo
              ? calculateComboStock(product!.comboComponents, allProductsList)
              : product!.stock;
            const outOfStock = effectiveStock <= 0;

            return (
              <div key={`${item.productId}-${item.colorId}`} className="flex gap-3 sm:gap-4 rounded-lg border border-border p-3 sm:p-4 bg-card">
                <button onClick={() => navigate("product", { id: product!.id })} className="shrink-0">
                  <img src={product!.images[0]} alt={product!.name} className="h-20 w-20 sm:h-28 sm:w-28 rounded-md object-cover border border-border" />
                </button>
                <div className="flex flex-1 min-w-0 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <button onClick={() => navigate("product", { id: product!.id })} className="text-left text-sm font-medium hover:text-charcoal sm:text-base">
                          {product!.name}
                        </button>
                        {isCombo && (
                          <span className="rounded bg-amber-800 text-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1">
                            <Layers className="h-2.5 w-2.5" /> Combo
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{product!.collection}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        {color && (
                          <span className="inline-flex items-center gap-1">
                            <span className="h-3 w-3 rounded-full border border-black/10" style={{ background: color.color }} />
                            {color.name}
                          </span>
                        )}
                        {item.size && <span>Size: {item.size}</span>}
                        <span>SKU: {product!.sku}</span>
                      </div>

                      {/* Combo Included Components Breakdown */}
                      {isCombo && product!.comboComponents && product!.comboComponents.length > 0 && (
                        <div className="mt-2.5 rounded-md bg-accent/40 p-2.5 text-xs border border-border/60 space-y-1.5">
                          <p className="font-semibold text-charcoal text-[11px] flex items-center gap-1">
                            <Sparkles className="h-3 w-3 text-champagne" /> Includes {product!.comboComponents.length} pieces:
                          </p>
                          <div className="space-y-1 pl-1">
                            {product!.comboComponents.map((c, cIdx) => {
                              const compP = allProductsList.find((p) => p.id === c.componentProductId) || getProduct(c.componentProductId);
                              return (
                                <div key={cIdx} className="flex items-center justify-between text-[11px] text-muted-foreground">
                                  <span className="truncate pr-2">
                                    • {c.quantity * item.qty} × {compP?.name || "Included Item"}
                                  </span>
                                  <span className="font-mono text-[10px] shrink-0 text-foreground/70">{compP?.sku}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.productId, item.colorId, item.size)}
                      className="text-muted-foreground transition hover:text-red-600"
                      aria-label="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {outOfStock && (
                    <p className="mt-1.5 text-xs text-red-600 font-medium">Currently out of stock (insufficient component inventory)</p>
                  )}

                  <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3">
                    <div className="inline-flex items-center rounded-md border border-border">
                      <button
                        onClick={() => updateQty(item.productId, item.colorId, item.qty - 1, item.size)}
                        className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground"
                        aria-label="Decrease"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 sm:w-9 text-center text-sm">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.productId, item.colorId, item.qty + 1, item.size)}
                        className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground"
                        aria-label="Increase"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="text-right ml-auto">
                      <p className="text-sm font-semibold">{formatINR(lineTotal)}</p>
                      {product!.mrp > product!.price && (
                        <p className="text-xs text-muted-foreground line-through">{formatINR(product!.mrp * item.qty)}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => saveForLater(item.productId, item.colorId, true, item.size)}
                    className="mt-2 inline-flex items-center gap-1 text-xs text-charcoal hover:underline"
                  >
                    <Heart className="h-3 w-3" /> Save for later
                  </button>
                </div>
              </div>
            );
          })}

          <div className="flex justify-between pt-2">
            <Button variant="ghost" onClick={() => navigate("shop")}>
              <ChevronRight className="mr-1 h-4 w-4 rotate-180" /> Continue shopping
            </Button>
          </div>

          {/* Saved for later */}
          {savedItems.length > 0 && (
            <div className="mt-8">
              <h2 className="font-serif text-xl">Saved for later ({savedItems.length})</h2>
              <div className="mt-3 space-y-3">
                {savedItems.map((i) => {
                  const p = getProduct(i.productId);
                  if (!p) return null;
                  return (
                    <div key={`${i.productId}-${i.colorId}`} className="flex items-center gap-3 rounded-lg border border-border p-3">
                      <img src={p.images[0]} alt={p.name} className="h-16 w-16 rounded object-cover" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{formatINR(p.price)}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => saveForLater(i.productId, i.colorId, false, i.size)}>
                        Move to cart
                      </Button>
                      <button onClick={() => removeFromCart(i.productId, i.colorId, i.size)} className="text-muted-foreground hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-32 rounded-xl border border-border bg-card p-5">
            <h2 className="font-serif text-xl">Order Summary</h2>

            {/* Coupon */}
            <div className="mt-4">
              {couponCode ? (
                <div className="flex items-center justify-between rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                  <span className="inline-flex items-center gap-2 text-sm">
                    <Tag className="h-4 w-4 text-emerald-600" />
                    <strong className="text-emerald-700">{couponCode}</strong> applied
                  </span>
                  <button onClick={removeCoupon} className="text-emerald-700 hover:text-emerald-900">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <Input
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      placeholder="Coupon code"
                      className="h-10 uppercase"
                    />
                    <Button onClick={handleApply} variant="outline" className="h-10">Apply</Button>
                  </div>
                  <button
                    onClick={() => setShowCoupons((v) => !v)}
                    className="mt-2 text-xs text-charcoal hover:underline"
                  >
                    {showCoupons ? "Hide" : "Show"} available coupons
                  </button>
                  {showCoupons && (
                    <div className="mt-2 space-y-2">
                      {coupons.map((c) => (
                        <button
                          key={c.code}
                          onClick={() => setCode(c.code)}
                          className="block w-full rounded-md border border-dashed border-champagne/60 bg-champagne/5 p-2.5 text-left transition hover:border-champagne"
                        >
                          <p className="text-xs font-semibold text-charcoal">{c.code}</p>
                          <p className="text-xs text-muted-foreground">{c.description}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            <Separator className="my-4" />

            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>{formatINR(subtotal)}</dd>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <dt>Discount</dt>
                  <dd>-{formatINR(couponDiscount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd>{shipping === 0 ? <span className="text-emerald-700">Free</span> : formatINR(shipping)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Tax (3%)</dt>
                <dd>{formatINR(tax)}</dd>
              </div>
            </dl>

            <Separator className="my-4" />

            <div className="flex items-center justify-between">
              <span className="font-medium">Total</span>
              <span className="font-serif text-2xl">{formatINR(total)}</span>
            </div>

            <Button
              onClick={() => navigate("checkout")}
              className="mt-4 w-full bg-charcoal text-ivory hover:bg-charcoal/90"
              size="lg"
            >
              Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" /> Secure checkout</span>
              <span className="inline-flex items-center gap-1"><Truck className="h-3.5 w-3.5" /> Fast dispatch</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
