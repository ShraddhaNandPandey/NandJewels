"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { categories } from "@/data/categories";
import { Instagram, Facebook, Mail, Phone, MapPin, Send, Sparkles, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function Footer() {
  const navigate = useStore((s) => s.navigate);
  const pushToast = useStore((s) => s.pushToast);
  const [email, setEmail] = useState("");
  const [aboutOpen, setAboutOpen] = useState(false);
  const [policyType, setPolicyType] = useState<string | null>(null);

  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      pushToast({ title: "Enter a valid email", variant: "destructive" });
      return;
    }
    pushToast({
      title: "Subscribed to Shraddhanand Circle!",
      description: "Welcome privilege: Use code WELCOME10 for 10% off your first purchase.",
      variant: "success",
    });
    setEmail("");
  };

  const getPolicyContent = (type: string | null) => {
    switch (type) {
      case "privacy":
        return {
          title: "Privacy & Data Protection Policy",
          content:
            "At Shraddhanand Jewellery, your personal data and privacy are held with utmost sanctity. We use industry-standard 256-bit SSL encryption to process all transactions. We never sell, rent, or share your personal details with third-party advertising brokers. Your order and contact details are used strictly for order fulfillment, dispatch updates, and confidential customer care.",
        };
      case "terms":
        return {
          title: "Terms of Service",
          content:
            "By browsing and shopping on Shraddhanand (श्रद्धानंद), you agree to our fair terms of service. All demi-fine fashion jewellery pieces are crafted with hypoallergenic materials, 18K gold vermeil plating, and premium crystal accents as specified in the item descriptions. Product dimensions, materials, and care guides are meticulously detailed to ensure total transparency.",
        };
      case "refund":
        return {
          title: "7-Day Hassle-Free Refund Policy",
          content:
            "We offer a 7-day complimentary return and full refund policy on all unworn items in their original Shraddhanand luxury packaging. Once picked up and verified by our quality studio, your refund is credited directly to your original payment method (or UPI account) within 5–7 business days without hidden deductions.",
        };
      case "shipping":
        return {
          title: "Complimentary Express Shipping Policy",
          content:
            "Enjoy free tracked shipping on all orders above ₹999 across India. Standard orders are dispatched within 24 hours via premium air courier partners (Bluedart, Delhivery, Express Air) with an average transit time of 2–4 business days. Real-time SMS and tracking numbers are issued upon dispatch.",
        };
      default:
        return { title: "", content: "" };
    }
  };

  const policy = getPolicyContent(policyType);

  return (
    <footer className="mt-auto border-t border-border bg-charcoal text-ivory/80">
      {/* Newsletter */}
      <div className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:flex-row md:items-center md:justify-between">
          <div className="max-w-md">
            <h3 className="font-serif text-2xl text-ivory">Join the Shraddhanand circle</h3>
            <p className="mt-1 text-sm text-ivory/60">
              Early access to new collections, private sales and styling notes — straight to your inbox.
            </p>
          </div>
          <form onSubmit={subscribe} className="flex flex-col sm:flex-row w-full max-w-md gap-2.5">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="h-11 flex-1 rounded-md border border-white/20 bg-white/5 px-4 text-sm text-ivory placeholder:text-ivory/40 focus:border-champagne focus:outline-none"
            />
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-champagne px-5 text-sm font-medium text-charcoal transition hover:brightness-105 cursor-pointer shrink-0"
            >
              <Send className="h-4 w-4" /> Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Links */}
      <div className="mx-auto grid max-w-7xl grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="col-span-2 lg:col-span-1">
          <button
            onClick={() => navigate("home")}
            className="flex items-center gap-3 text-left group"
          >
            <img src="/logo.svg" alt="श्रद्धानंद" className="h-9 w-9 object-contain transition-transform group-hover:scale-105" />
            <div>
              <p className="font-serif text-2xl text-ivory font-bold leading-none">श्रद्धानंद</p>
              <p className="text-[10px] uppercase tracking-[0.25em] text-champagne font-medium mt-0.5">
                Shraddhanand Jewellery
              </p>
            </div>
          </button>
          <p className="mt-3 text-sm text-ivory/60 max-w-xs">
            Modern demi-fine jewellery, crafted for everyday radiance and the moments that matter most.
          </p>
          <div className="mt-4 flex gap-3">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="rounded-full border border-white/20 p-2 transition hover:border-champagne hover:text-champagne cursor-pointer"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="rounded-full border border-white/20 p-2 transition hover:border-champagne hover:text-champagne cursor-pointer"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              href="mailto:care@shraddhanand.com"
              aria-label="Email"
              className="rounded-full border border-white/20 p-2 transition hover:border-champagne hover:text-champagne cursor-pointer"
            >
              <Mail className="h-4 w-4" />
            </a>
          </div>
        </div>

        <FooterCol title="Shop">
          {categories.slice(0, 6).map((c) => (
            <FooterLink key={c.id} onClick={() => navigate("shop", { category: c.slug })}>
              {c.name}
            </FooterLink>
          ))}
        </FooterCol>

        <FooterCol title="Customer Service">
          <FooterLink onClick={() => navigate("support")}>Contact Us</FooterLink>
          <FooterLink onClick={() => navigate("support", { category: "Shipping" })}>Shipping & Dispatch</FooterLink>
          <FooterLink onClick={() => navigate("support", { category: "Returns" })}>Returns & Exchange</FooterLink>
          <FooterLink onClick={() => navigate("support")}>Frequently Asked Questions</FooterLink>
          <FooterLink onClick={() => navigate("orders")}>Track Order Status</FooterLink>
        </FooterCol>

        <FooterCol title="Company">
          <FooterLink onClick={() => setAboutOpen(true)}>About Shraddhanand</FooterLink>
          <FooterLink
            onClick={() =>
              pushToast({
                title: "Careers at Shraddhanand",
                description: "We're expanding! Send your CV and portfolio to careers@shraddhanand.com.",
                variant: "success",
              })
            }
          >
            Careers & Press
          </FooterLink>
          <FooterLink onClick={() => navigate("admin")}>Admin Panel</FooterLink>
        </FooterCol>

        <FooterCol title="Policies">
          <FooterLink onClick={() => setPolicyType("privacy")}>Privacy Policy</FooterLink>
          <FooterLink onClick={() => setPolicyType("terms")}>Terms of Service</FooterLink>
          <FooterLink onClick={() => setPolicyType("refund")}>Refund & Return Policy</FooterLink>
          <FooterLink onClick={() => setPolicyType("shipping")}>Shipping Policy</FooterLink>
        </FooterCol>
      </div>

      {/* Contact strip with functional links */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-6 text-xs text-ivory/60 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <a
              href="tel:18002007473"
              className="inline-flex items-center gap-1.5 hover:text-champagne transition-colors cursor-pointer"
            >
              <Phone className="h-3.5 w-3.5 text-champagne" /> 1800-200-SHRD (24/7 Helpline)
            </a>
            <a
              href="mailto:care@shraddhanand.com"
              className="inline-flex items-center gap-1.5 hover:text-champagne transition-colors cursor-pointer"
            >
              <Mail className="h-3.5 w-3.5 text-champagne" /> care@shraddhanand.com
            </a>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-champagne" /> Mumbai, Maharashtra, India
            </span>
          </div>
          <div className="flex flex-col items-start gap-1 sm:items-end">
            <p>© {new Date().getFullYear()} Shraddhanand (श्रद्धानंद) Jewellery. All rights reserved.</p>
            <p className="text-[11px] text-ivory/70">
              Developer contact: <span className="font-medium text-ivory">Shraddha Nand Pandey</span>{" "}
              <span aria-label="blue heart" className="text-blue-500">♥</span>
            </p>
          </div>
        </div>
      </div>

      {/* About Us Dialog */}
      <Dialog open={aboutOpen} onOpenChange={setAboutOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-champagne" />
              <span className="text-xs uppercase tracking-[0.25em] text-champagne font-semibold">Our Heritage</span>
            </div>
            <DialogTitle className="font-serif text-2xl">About Shraddhanand (श्रद्धानंद)</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-foreground/80 pt-2 space-y-3">
              <p>
                Rooted in the timeless Sanskrit essence of devotion (<em>Shraddha</em>) and pure bliss (<em>Anand</em>), 
                <strong> Shraddhanand Jewellery</strong> creates demi-fine heirlooms crafted to celebrate life's everyday brilliance.
              </p>
              <p>
                Each piece is cast in skin-safe, hypoallergenic brass alloys and finished with thick 18K gold vermeil plating, 
                flawless cubic zirconia, and organic freshwater pearls. We design in-house to bridge the gap between heavy traditional 
                gold and ephemeral fast fashion — providing modern, waterproof luxury that endures.
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-end">
            <Button onClick={() => setAboutOpen(false)} className="bg-charcoal text-ivory hover:bg-charcoal/90">
              Close Story
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Policy Dialog */}
      <Dialog open={Boolean(policyType)} onOpenChange={(open) => !open && setPolicyType(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="h-4 w-4 text-champagne" />
              <span className="text-xs uppercase tracking-[0.25em] text-champagne font-semibold">Official Policy</span>
            </div>
            <DialogTitle className="font-serif text-2xl">{policy.title}</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-foreground/80 pt-2">
              {policy.content}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-end">
            <Button onClick={() => setPolicyType(null)} className="bg-charcoal text-ivory hover:bg-charcoal/90">
              Understood
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-ivory">{title}</p>
      <ul className="mt-4 space-y-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <li>
      <button
        onClick={onClick}
        className="text-sm text-ivory/60 transition hover:text-champagne text-left"
      >
        {children}
      </button>
    </li>
  );
}
