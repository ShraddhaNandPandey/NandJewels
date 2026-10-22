"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MapPin, Plus, Pencil, Trash2, Check, Home, Briefcase, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Address } from "@/lib/types";

const empty: Omit<Address, "id"> = {
  label: "Home",
  name: "",
  phone: "",
  line1: "",
  line2: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  isDefault: false,
};

export function AddressesView() {
  const navigate = useStore((s) => s.navigate);
  const addresses = useStore((s) => s.addresses);
  const addAddress = useStore((s) => s.addAddress);
  const updateAddress = useStore((s) => s.updateAddress);
  const removeAddress = useStore((s) => s.removeAddress);
  const setDefaultAddress = useStore((s) => s.setDefaultAddress);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Address, "id">>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const openAdd = () => {
    setForm(empty);
    setEditingId(null);
    setErrors({});
    setOpen(true);
  };

  const openEdit = (a: Address) => {
    setForm({ ...a });
    setEditingId(a.id);
    setErrors({});
    setOpen(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ""))) e.phone = "Enter a valid 10-digit phone";
    if (!form.line1.trim()) e.line1 = "Required";
    if (!form.city.trim()) e.city = "Required";
    if (!form.state.trim()) e.state = "Required";
    if (!/^\d{6}$/.test(form.pincode)) e.pincode = "Enter a valid 6-digit PIN";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = () => {
    if (!validate()) return;
    if (editingId) updateAddress(editingId, form);
    else addAddress(form);
    setOpen(false);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 animate-fade-up">
      <Breadcrumbs items={[{ label: "My Account", view: "account" }, { label: "Addresses" }]} />

      <div className="mt-4 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl">Saved Addresses</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage where your orders get delivered</p>
        </div>
        <Button onClick={openAdd} className="bg-charcoal text-ivory hover:bg-charcoal/90">
          <Plus className="mr-1.5 h-4 w-4" /> Add address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="mt-8 flex flex-col items-center rounded-xl border border-dashed border-border py-16 text-center">
          <MapPin className="h-10 w-10 text-muted-foreground" />
          <p className="mt-3 font-serif text-xl">No saved addresses</p>
          <p className="mt-1 text-sm text-muted-foreground">Add an address to speed up checkout.</p>
          <Button onClick={openAdd} className="mt-4 bg-charcoal text-ivory hover:bg-charcoal/90">Add your first address</Button>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {addresses.map((a) => (
            <div key={a.id} className={cn("rounded-xl border bg-card p-5", a.isDefault ? "border-charcoal" : "border-border")}>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-0.5 text-xs">
                  {a.label === "Home" ? <Home className="h-3 w-3" /> : a.label === "Work" ? <Briefcase className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                  {a.label}
                </span>
                {a.isDefault && (
                  <span className="inline-flex items-center gap-1 text-xs text-champagne">
                    <Star className="h-3 w-3 fill-champagne" /> Default
                  </span>
                )}
              </div>
              <p className="mt-3 text-sm font-medium">{a.name}</p>
              <p className="mt-1 text-sm text-foreground/80">
                {a.line1}{a.line2 && `, ${a.line2}`}
                {a.landmark && <><br />Landmark: {a.landmark}</>}
                <br />{a.city}, {a.state} - {a.pincode}
                <br />{a.country}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{a.phone}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(a)}>
                  <Pencil className="mr-1.5 h-3 w-3" /> Edit
                </Button>
                {!a.isDefault && (
                  <Button size="sm" variant="outline" onClick={() => setDefaultAddress(a.id)}>
                    <Check className="mr-1.5 h-3 w-3" /> Set default
                  </Button>
                )}
                <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => removeAddress(a.id)}>
                  <Trash2 className="mr-1.5 h-3 w-3" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit address" : "Add a new address"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Update the details below." : "Fill in your delivery details. We'll save it for faster checkout."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <Label className="text-xs">Address type</Label>
              <RadioGroup
                value={form.label}
                onValueChange={(v) => setForm({ ...form, label: v as Address["label"] })}
                className="mt-1.5 flex gap-4"
              >
                {(["Home", "Work", "Other"] as const).map((l) => (
                  <label key={l} className="flex cursor-pointer items-center gap-2 text-sm">
                    <RadioGroupItem value={l} /> {l}
                  </label>
                ))}
              </RadioGroup>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Full name" error={errors.name}>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Aria Mehta" />
              </Field>
              <Field label="Phone" error={errors.phone}>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
              </Field>
            </div>

            <Field label="Address line 1" error={errors.line1}>
              <Input value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} placeholder="Flat / House no, Building" />
            </Field>
            <Field label="Address line 2">
              <Input value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} placeholder="Area, Street (optional)" />
            </Field>
            <Field label="Landmark">
              <Input value={form.landmark} onChange={(e) => setForm({ ...form, landmark: e.target.value })} placeholder="Near… (optional)" />
            </Field>

            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="City" error={errors.city}>
                <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Mumbai" />
              </Field>
              <Field label="State" error={errors.state}>
                <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="Maharashtra" />
              </Field>
              <Field label="PIN code" error={errors.pincode}>
                <Input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })} placeholder="400050" inputMode="numeric" />
              </Field>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} className="accent-charcoal" />
              Set as default address
            </label>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} className="bg-charcoal text-ivory hover:bg-charcoal/90">{editingId ? "Save changes" : "Add address"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs font-medium text-foreground/80">{label}</Label>
      <div className="mt-1">{children}</div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
