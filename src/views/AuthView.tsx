"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function AuthView() {
  const params = useStore((s) => s.params);
  const navigate = useStore((s) => s.navigate);
  const login = useStore((s) => s.login);
  const register = useStore((s) => s.register);

  const isRegister = params.mode === "register";
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
    agree: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (isRegister) {
      if (!form.firstName.trim()) e.firstName = "First name is required";
      if (!form.lastName.trim()) e.lastName = "Last name is required";
      if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ""))) e.phone = "Enter a valid 10-digit phone";
      if (form.password !== form.confirm) e.confirm = "Passwords don't match";
      if (!form.agree) e.agree = "Please accept the terms";
    }
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(form.email)) e.email = "Enter a valid email";
    if (form.password.length < 6) e.password = "Password must be at least 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    if (isRegister) {
      register({ firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone });
      navigate("account");
    } else {
      login(form.email);
      navigate("account");
    }
  };

  return (
    <div className="mx-auto grid min-h-[70vh] max-w-6xl items-center gap-8 px-4 sm:px-6 py-10 lg:grid-cols-2 animate-fade-up">
      {/* Left visual */}
      <div className="relative hidden lg:block">
        <div className="relative h-[520px] overflow-hidden rounded-xl">
          <img
            src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80"
            alt="वृन्दोरा"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-8 text-ivory">
            <Sparkles className="h-6 w-6 text-champagne" />
            <p className="mt-3 font-serif text-2xl">Join the VRUNDORA circle</p>
            <p className="mt-1 text-sm text-ivory/70">
              Early access to new collections, private sales and member-only styling notes.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="mx-auto w-full max-w-md">
        <button onClick={() => navigate("home")} className="flex items-center gap-3 group text-left" aria-label="वृन्दोरा (VRUNDORA) home">
          <picture className="shrink-0">
            <source srcSet="/vrundora-emblem.webp" type="image/webp" />
            <img src="/vrundora-emblem.png" alt="वृन्दोरा" className="h-12 w-12 object-contain transition-transform group-hover:scale-105" />
          </picture>
          <div className="flex flex-col">
            <span className="font-serif text-3xl font-bold tracking-tight text-foreground leading-none">वृन्दोरा</span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-champagne font-semibold mt-1">
              VRUNDORA Jewellery
            </span>
          </div>
        </button>
        <h1 className="mt-6 font-serif text-3xl">{isRegister ? "Create your account" : "Welcome back"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isRegister ? "Join us in under a minute." : "Log in to continue to your account."}
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          {isRegister && (
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="First name" error={errors.firstName} icon={User}>
                <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="Aria" />
              </FormField>
              <FormField label="Last name" error={errors.lastName} icon={User}>
                <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="Mehta" />
              </FormField>
            </div>
          )}

          <FormField label="Email" error={errors.email} icon={Mail}>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
          </FormField>

          {isRegister && (
            <FormField label="Phone" error={errors.phone} icon={Phone}>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
            </FormField>
          )}

          <FormField label="Password" error={errors.password} icon={Lock}>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="pr-10"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </FormField>

          {isRegister && (
            <FormField label="Confirm password" error={errors.confirm} icon={Lock}>
              <Input type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} placeholder="••••••••" />
            </FormField>
          )}

          {!isRegister && (
            <div className="flex items-center justify-between text-xs">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" className="accent-charcoal" /> Remember me
              </label>
              <button type="button" onClick={() => useStore.getState().pushToast({ title: "Reset link sent", description: "Check your email for instructions.", variant: "success" })} className="text-charcoal hover:underline">
                Forgot password?
              </button>
            </div>
          )}

          {isRegister && (
            <label className="flex items-start gap-2 text-xs text-muted-foreground">
              <input type="checkbox" checked={form.agree} onChange={(e) => setForm({ ...form, agree: e.target.checked })} className="mt-0.5 accent-charcoal" />
              <span>
                I agree to the <button type="button" className="text-charcoal underline">Terms</button> and <button type="button" className="text-charcoal underline">Privacy Policy</button>
                {errors.agree && <span className="block text-red-600">{errors.agree}</span>}
              </span>
            </label>
          )}

          <Button type="submit" className="w-full bg-charcoal text-ivory hover:bg-charcoal/90" size="lg">
            {isRegister ? "Create account" : "Login"} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">or</span>
          <Separator className="flex-1" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={() => { login("guest@vrundora.com"); navigate("account"); }}>Continue with Google</Button>
          <Button variant="outline" onClick={() => { login("guest@vrundora.com"); navigate("account"); }}>Continue as guest</Button>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isRegister ? "Already have an account?" : "New to VRUNDORA?"}{" "}
          <button onClick={() => navigate("login", { mode: isRegister ? "login" : "register" })} className="font-medium text-charcoal hover:underline">
            {isRegister ? "Login" : "Create an account"}
          </button>
        </p>
      </div>
    </div>
  );
}

function FormField({ label, error, icon: Icon, children }: { label: string; error?: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs font-medium text-foreground/80">{label}</Label>
      <div className="mt-1 flex items-center gap-2 rounded-md border border-input bg-background px-3 focus-within:border-charcoal">
        <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
        <div className="flex-1 [&_input]:border-0 [&_input]:bg-transparent [&_input]:shadow-none [&_input]:focus-visible:ring-0 [&_input]:px-0 [&_input]:h-10">
          {children}
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
