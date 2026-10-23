"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageCircle, Plus, Mail, Phone, Clock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  { q: "How long does delivery take?", a: "Standard delivery takes 3–5 business days. Express delivery (1–2 days) is available at checkout." },
  { q: "What is your return policy?", a: "We offer easy 7-day returns on unused pieces in original packaging. Refunds are processed within 5–7 business days." },
  { q: "Are your pieces safe for sensitive skin?", a: "Yes — all our jewellery is hypoallergenic, nickel-free and skin-safe." },
  { q: "How do I care for my jewellery?", a: "Keep pieces away from water, perfume and sweat. Store them in the pouch provided to prevent tarnishing." },
  { q: "Do you offer COD?", a: "Yes, Cash on Delivery is available across India with a nominal ₹40 fee." },
];

export function SupportView() {
  const params = useStore((s) => s.params);
  const navigate = useStore((s) => s.navigate);
  const tickets = useStore((s) => s.tickets);
  const orders = useStore((s) => s.orders);
  const createTicket = useStore((s) => s.createTicket);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    subject: "",
    category: params.category || "Order",
    orderId: params.orderId || "",
    priority: "medium" as "low" | "medium" | "high",
    description: "",
  });

  useEffect(() => {
    if (params.category || params.orderId) {
      setForm((f) => ({
        ...f,
        category: params.category || f.category,
        orderId: params.orderId || f.orderId,
      }));
      setOpen(true);
    }
  }, [params.category, params.orderId]);

  const submit = () => {
    if (!form.subject.trim() || !form.description.trim()) {
      useStore.getState().pushToast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    createTicket(form);
    setForm({ subject: "", category: "Order", orderId: "", priority: "medium", description: "" });
    setOpen(false);
  };

  const statusCls: Record<string, string> = {
    open: "bg-blue-50 text-blue-700",
    in_progress: "bg-amber-50 text-amber-700",
    resolved: "bg-emerald-50 text-emerald-700",
    closed: "bg-zinc-100 text-zinc-600",
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 animate-fade-up">
      <Breadcrumbs items={[{ label: "My Account", view: "account" }, { label: "Support" }]} />

      <div className="mt-4 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl">Help & Support</h1>
          <p className="mt-1 text-sm text-muted-foreground">We're here to help — usually replies within 24 hours</p>
        </div>
        <Button onClick={() => setOpen(!open)} className="bg-charcoal text-ivory hover:bg-charcoal/90">
          <Plus className="mr-1.5 h-4 w-4" /> New ticket
        </Button>
      </div>

      {/* Contact options */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <Mail className="h-5 w-5 text-charcoal" />
          <p className="mt-2 text-sm font-medium">Email us</p>
          <p className="text-xs text-muted-foreground">care@vrundora.com</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <Phone className="h-5 w-5 text-charcoal" />
          <p className="mt-2 text-sm font-medium">Call us</p>
          <p className="text-xs text-muted-foreground">1800-200-VRUN (24/7)</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <Clock className="h-5 w-5 text-charcoal" />
          <p className="mt-2 text-sm font-medium">Response time</p>
          <p className="text-xs text-muted-foreground">Within 24 hours</p>
        </div>
      </div>

      {/* New ticket form */}
      {open && (
        <div className="mt-6 rounded-xl border border-border bg-card p-5 animate-fade-up">
          <h2 className="font-serif text-lg">Create a support ticket</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label className="text-xs">Subject</Label>
              <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Briefly describe your issue" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Order", "Payment", "Shipping", "Returns", "Product", "Account", "Other"].map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Related order (optional)</Label>
              <Select value={form.orderId} onValueChange={(v) => setForm({ ...form, orderId: v })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select an order" /></SelectTrigger>
                <SelectContent>
                  {orders.map((o) => (
                    <SelectItem key={o.id} value={o.number}>{o.number}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as typeof form.priority })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs">Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Tell us more about your issue…" rows={4} className="mt-1" />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={submit} className="bg-charcoal text-ivory hover:bg-charcoal/90">Submit ticket</Button>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Tickets */}
      {tickets.length > 0 && (
        <div className="mt-8">
          <h2 className="font-serif text-xl">Your tickets</h2>
          <div className="mt-3 space-y-3">
            {tickets.map((t) => (
              <div key={t.id} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{t.subject}</p>
                  <span className={cn("rounded-full px-2.5 py-0.5 text-xs capitalize", statusCls[t.status])}>
                    {t.status.replace(/_/g, " ")}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{t.category} · {t.priority} priority · {new Date(t.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                <p className="mt-2 text-sm text-foreground/80 line-clamp-2">{t.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQs */}
      <div className="mt-10">
        <h2 className="font-serif text-2xl flex items-center gap-2"><MessageCircle className="h-5 w-5 text-charcoal" /> Frequently asked questions</h2>
        <div className="mt-4 divide-y divide-border rounded-xl border border-border bg-card">
          {faqs.map((f, i) => (
            <details key={i} className="group p-4">
              <summary className="flex cursor-pointer items-center justify-between text-sm font-medium list-none">
                {f.q}
                <ChevronRight className="h-4 w-4 text-muted-foreground transition group-open:rotate-90" />
              </summary>
              <p className="mt-2 text-sm text-foreground/80">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
