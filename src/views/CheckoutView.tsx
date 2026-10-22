"use client";

import { useState, useMemo } from "react";
import { useStore, formatINR } from "@/store/useStore";
import { getProduct } from "@/data/products";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  Check,
  ChevronRight,
  CreditCard,
  Wallet,
  Truck,
  MapPin,
  Package,
  ShieldCheck,
  Loader2,
  Smartphone,
  Banknote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Address, PaymentMethod } from "@/lib/types";

const steps = [
  { id: 1, label: "Contact", icon: MapPin },
  { id: 2, label: "Address", icon: Truck },
  { id: 3, label: "Delivery", icon: Package },
  { id: 4, label: "Payment", icon: CreditCard },
  { id: 5, label: "Review", icon: ShieldCheck },
];

export function CheckoutView() {
  const navigate = useStore((s) => s.navigate);
  const cart = useStore((s) => s.cart);
  const cartItems = useMemo(() => cart.filter((i) => !i.savedForLater), [cart]);
  const couponDiscount = useStore((s) => s.couponDiscount);
  const couponCode = useStore((s) => s.couponCode);
  const addresses = useStore((s) => s.addresses);
  const user = useStore((s) => s.user);
  const placeOrder = useStore((s) => s.placeOrder);

  const [step, setStep] = useState(1);
  const [contact, setContact] = useState({
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [selectedAddrId, setSelectedAddrId] = useState(
    addresses.find((a) => a.isDefault)?.id || addresses[0]?.id || ""
  );
  const [delivery, setDelivery] = useState<"standard" | "express">("standard");
  const [payment, setPayment] = useState<PaymentMethod>("card");
  const [processing, setProcessing] = useState(false);

  const items = cartItems.map((i) => ({ item: i, product: getProduct(i.productId) })).filter((x) => x.product);
  const subtotal = items.reduce((s, x) => s + x.product!.price * x.item.qty, 0);
  const shipping = delivery === "express" ? 149 : subtotal >= 999 ? 0 : 79;
  const tax = Math.round(subtotal * 0.03);
  const total = Math.max(0, subtotal - couponDiscount + shipping + tax);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <p className="font-serif text-2xl">Your cart is empty</p>
        <Button onClick={() => navigate("shop")} className="mt-4">Continue shopping</Button>
      </div>
    );
  }

  const selectedAddress = addresses.find((a) => a.id === selectedAddrId);

  const canProceed = () => {
    if (step === 1) return contact.email.includes("@") && contact.phone.length >= 10;
    if (step === 2) return !!selectedAddress;
    return true;
  };

  const handlePlaceOrder = () => {
    if (!selectedAddress) return;
    setProcessing(true);
    setTimeout(() => {
      const order = placeOrder({
        address: selectedAddress,
        paymentMethod: payment,
        shipping,
        tax,
      });
      setProcessing(false);
      navigate("order-success", { id: order.id });
    }, 1800);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 animate-fade-up">
      <Breadcrumbs items={[{ label: "Cart", view: "cart" }, { label: "Checkout" }]} />
      <h1 className="mt-4 font-serif text-3xl sm:text-4xl">Checkout</h1>

      {/* Stepper */}
      <div className="mt-6 flex items-center overflow-x-auto no-scrollbar">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const done = step > s.id;
          const active = step === s.id;
          return (
            <div key={s.id} className="flex items-center">
              <button
                onClick={() => s.id < step && setStep(s.id)}
                disabled={s.id >= step}
                className={cn(
                  "flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition",
                  active && "bg-charcoal text-ivory",
                  done && "text-charcoal",
                  !active && !done && "text-muted-foreground"
                )}
              >
                <span className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-xs",
                  active ? "bg-ivory text-charcoal" : done ? "bg-champagne text-charcoal" : "bg-muted"
                )}>
                  {done ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                </span>
                <span className="whitespace-nowrap">{s.label}</span>
              </button>
              {i < steps.length - 1 && <ChevronRight className="mx-1 h-4 w-4 text-muted-foreground" />}
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        {/* Step content */}
        <div className="lg:col-span-2">
          {step === 1 && (
            <Section title="Contact information" subtitle="We'll send your order updates here">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Email address">
                  <Input
                    type="email"
                    value={contact.email}
                    onChange={(e) => setContact({ ...contact, email: e.target.value })}
                    placeholder="you@example.com"
                  />
                </Field>
                <Field label="Phone number">
                  <Input
                    value={contact.phone}
                    onChange={(e) => setContact({ ...contact, phone: e.target.value.replace(/[^\d+]/g, "") })}
                    placeholder="+91 98765 43210"
                  />
                </Field>
              </div>
              <label className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <input type="checkbox" defaultChecked className="accent-charcoal" />
                Send me offers, early access and styling notes
              </label>
            </Section>
          )}

          {step === 2 && (
            <Section title="Shipping address" subtitle="Where should we deliver your order?">
              {addresses.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-6 text-center">
                  <p className="text-sm text-muted-foreground">No addresses saved yet.</p>
                  <Button onClick={() => navigate("addresses")} variant="outline" className="mt-3">Add an address</Button>
                </div>
              ) : (
                <RadioGroup value={selectedAddrId} onValueChange={setSelectedAddrId} className="space-y-3">
                  {addresses.map((a) => (
                    <AddressOption key={a.id} address={a} selected={selectedAddrId === a.id} />
                  ))}
                </RadioGroup>
              )}
              <Button onClick={() => navigate("addresses")} variant="link" className="mt-2 px-0 text-charcoal">
                + Add a new address
              </Button>
            </Section>
          )}

          {step === 3 && (
            <Section title="Delivery method" subtitle="Choose how fast you'd like it">
              <RadioGroup value={delivery} onValueChange={(v) => setDelivery(v as typeof delivery)} className="space-y-3">
                <DeliveryOption
                  value="standard"
                  title="Standard delivery"
                  desc="3–5 business days"
                  price={subtotal >= 999 ? "Free" : formatINR(79)}
                  selected={delivery === "standard"}
                />
                <DeliveryOption
                  value="express"
                  title="Express delivery"
                  desc="1–2 business days"
                  price={formatINR(149)}
                  selected={delivery === "express"}
                />
              </RadioGroup>
            </Section>
          )}

          {step === 4 && (
            <Section title="Payment method" subtitle="All transactions are secure & encrypted">
              <RadioGroup value={payment} onValueChange={(v) => setPayment(v as PaymentMethod)} className="space-y-3">
                <PaymentOption value="card" title="Credit / Debit Card" desc="Visa, Mastercard, RuPay" icon={CreditCard} selected={payment === "card"} />
                <PaymentOption value="upi" title="UPI" desc="GPay, PhonePe, Paytm" icon={Smartphone} selected={payment === "upi"} />
                <PaymentOption value="wallet" title="Wallets" desc="Paytm, Mobikwik, Amazon Pay" icon={Wallet} selected={payment === "wallet"} />
                <PaymentOption value="cod" title="Cash on Delivery" desc="Pay when you receive · ₹40 fee" icon={Banknote} selected={payment === "cod"} />
              </RadioGroup>

              {payment === "card" && (
                <div className="mt-4 grid gap-3 rounded-lg border border-border p-4">
                  <Field label="Card number">
                    <Input placeholder="1234 5678 9012 3456" inputMode="numeric" />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Expiry"><Input placeholder="MM/YY" /></Field>
                    <Field label="CVV"><Input placeholder="•••" type="password" /></Field>
                  </div>
                  <p className="text-xs text-muted-foreground">🔒 This is a simulated payment — do not enter real card details.</p>
                </div>
              )}
              {payment === "upi" && (
                <div className="mt-4 rounded-lg border border-border p-4">
                  <Field label="UPI ID">
                    <Input placeholder="yourname@upi" />
                  </Field>
                </div>
              )}
            </Section>
          )}

          {step === 5 && (
            <Section title="Review your order" subtitle="Please confirm everything looks right">
              <div className="space-y-3">
                {items.map(({ item, product }) => {
                  const color = product!.colors.find((c) => c.id === item.colorId);
                  return (
                    <div key={`${item.productId}-${item.colorId}`} className="flex items-center gap-3 rounded-lg border border-border p-3">
                      <img src={product!.images[0]} alt={product!.name} className="h-14 w-14 rounded object-cover" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{product!.name}</p>
                        <p className="text-xs text-muted-foreground">{color?.name} {item.size && `· ${item.size}`} · Qty {item.qty}</p>
                      </div>
                      <p className="text-sm font-semibold">{formatINR(product!.price * item.qty)}</p>
                    </div>
                  );
                })}
              </div>
              <Separator className="my-4" />
              <div className="grid gap-4 sm:grid-cols-2">
                <ReviewBlock title="Shipping to">
                  {selectedAddress && (
                    <p className="text-sm text-foreground/80">
                      {selectedAddress.name}<br />
                      {selectedAddress.line1}{selectedAddress.line2 && `, ${selectedAddress.line2}`}<br />
                      {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}<br />
                      {selectedAddress.phone}
                    </p>
                  )}
                </ReviewBlock>
                <ReviewBlock title="Payment">
                  <p className="text-sm capitalize text-foreground/80">
                    {payment === "cod" ? "Cash on Delivery" : payment === "upi" ? "UPI" : payment === "wallet" ? "Wallet" : "Card"}
                    {payment === "cod" && " · ₹40 fee included"}
                  </p>
                  <p className="mt-1 text-sm text-foreground/80">
                    Delivery: {delivery === "express" ? "Express (1–2 days)" : "Standard (3–5 days)"}
                  </p>
                </ReviewBlock>
              </div>
            </Section>
          )}

          {/* Nav buttons */}
          <div className="mt-6 flex justify-between">
            <Button variant="ghost" onClick={() => (step > 1 ? setStep(step - 1) : navigate("cart"))}>
              <ChevronRight className="mr-1 h-4 w-4 rotate-180" /> Back
            </Button>
            {step < 5 ? (
              <Button onClick={() => setStep(step + 1)} disabled={!canProceed()} className="bg-charcoal text-ivory hover:bg-charcoal/90">
                Continue <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handlePlaceOrder} disabled={processing} className="bg-charcoal text-ivory hover:bg-charcoal/90">
                {processing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing…</> : <>Place Order · {formatINR(total)}</>}
              </Button>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-32 rounded-xl border border-border bg-card p-5">
            <h2 className="font-serif text-lg">Order summary</h2>
            <div className="mt-3 max-h-52 space-y-3 overflow-y-auto scroll-area-custom pr-1">
              {items.map(({ item, product }) => (
                <div key={`${item.productId}-${item.colorId}`} className="flex gap-3">
                  <div className="relative shrink-0">
                    <img src={product!.images[0]} alt={product!.name} className="h-12 w-12 rounded object-cover" />
                    <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-charcoal px-1 text-[10px] text-ivory">{item.qty}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">{product!.name}</p>
                    <p className="text-xs text-muted-foreground">{product!.colors.find((c) => c.id === item.colorId)?.name}</p>
                  </div>
                  <p className="text-xs font-semibold">{formatINR(product!.price * item.qty)}</p>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{formatINR(subtotal)}</dd></div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-700"><dt>Discount ({couponCode})</dt><dd>-{formatINR(couponDiscount)}</dd></div>
              )}
              <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd>{shipping === 0 ? "Free" : formatINR(shipping)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Tax</dt><dd>{formatINR(tax)}</dd></div>
              {payment === "cod" && <div className="flex justify-between"><dt className="text-muted-foreground">COD fee</dt><dd>{formatINR(40)}</dd></div>}
            </dl>
            <Separator className="my-4" />
            <div className="flex items-center justify-between">
              <span className="font-medium">Total</span>
              <span className="font-serif text-2xl">{formatINR(total + (payment === "cod" ? 40 : 0))}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 sm:p-6 animate-fade-up">
      <h2 className="font-serif text-xl">{title}</h2>
      {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
      <div className="mt-4">{children}</div>
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

function AddressOption({ address, selected }: { address: Address; selected: boolean }) {
  return (
    <label className={cn(
      "flex cursor-pointer gap-3 rounded-lg border p-4 transition",
      selected ? "border-charcoal bg-accent/40" : "border-border hover:border-charcoal/50"
    )}>
      <RadioGroupItem value={address.id} className="mt-1" />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">{address.name}</p>
          <span className="rounded bg-accent px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{address.label}</span>
          {address.isDefault && <span className="rounded bg-champagne/20 px-1.5 py-0.5 text-[10px] text-charcoal">Default</span>}
        </div>
        <p className="mt-1 text-sm text-foreground/80">
          {address.line1}{address.line2 && `, ${address.line2}`}, {address.city}, {address.state} - {address.pincode}
        </p>
        <p className="text-xs text-muted-foreground">{address.phone}</p>
      </div>
    </label>
  );
}

function DeliveryOption({ value, title, desc, price, selected }: { value: string; title: string; desc: string; price: string; selected: boolean }) {
  return (
    <label className={cn(
      "flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition",
      selected ? "border-charcoal bg-accent/40" : "border-border hover:border-charcoal/50"
    )}>
      <RadioGroupItem value={value} />
      <div className="flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <span className={cn("text-sm font-semibold", price === "Free" && "text-emerald-700")}>{price}</span>
    </label>
  );
}

function PaymentOption({ value, title, desc, icon: Icon, selected }: { value: string; title: string; desc: string; icon: React.ElementType; selected: boolean }) {
  return (
    <label className={cn(
      "flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition",
      selected ? "border-charcoal bg-accent/40" : "border-border hover:border-charcoal/50"
    )}>
      <RadioGroupItem value={value} />
      <Icon className="h-5 w-5 text-charcoal" />
      <div className="flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </label>
  );
}

function ReviewBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
      <div className="mt-2">{children}</div>
    </div>
  );
}
