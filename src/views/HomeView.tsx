"use client";

import { useMemo } from "react";
import { useStore } from "@/store/useStore";
import { categories } from "@/data/categories";
import { collections, products as allProducts } from "@/data/products";
import { ProductCard } from "@/components/product/ProductCard";
import { Star, ArrowRight, Truck, ShieldCheck, RotateCcw, Sparkles, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";

import { EditorialHero } from "@/components/home/EditorialHero";
import { ReelsSection } from "@/components/reels/ReelsSection";

export function HomeView() {
  const navigate = useStore((s) => s.navigate);
  const pushToast = useStore((s) => s.pushToast);
  const allProductsList = useStore((s) => s.products || allProducts);
  const bestsellers = useMemo(() => allProductsList.filter((p) => p.bestseller), [allProductsList]);
  const newArrivals = useMemo(() => allProductsList.filter((p) => p.newArrival), [allProductsList]);
  const featured = useMemo(() => allProductsList.filter((p) => p.featured), [allProductsList]);

  return (
    <div className="animate-fade-up">
      {/* Editorial Luxury Hero inspired by Palmonas */}
      <EditorialHero />

      {/* Trust strip with working interactive buttons */}
      <section className="border-y border-border bg-background">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-2.5 sm:gap-4 px-4 sm:px-6 lg:px-8 py-5 sm:py-6 md:grid-cols-4">
          {[
            {
              icon: Truck,
              title: "Free shipping",
              sub: "On orders above ₹999",
              action: () => navigate("support", { category: "Shipping" }),
            },
            {
              icon: RotateCcw,
              title: "7-day returns",
              sub: "Easy & hassle-free",
              action: () => navigate("support", { category: "Returns" }),
            },
            {
              icon: ShieldCheck,
              title: "Quality promise",
              sub: "Hypoallergenic & safe",
              action: () =>
                pushToast({
                  title: "VRUNDORA Quality Promise",
                  description: "100% skin-safe, anti-tarnish 18k gold vermeil backed by our lifetime polish care.",
                  variant: "success",
                }),
            },
            {
              icon: Sparkles,
              title: "Hand-finished",
              sub: "Designed in-house",
              action: () => navigate("shop", { filter: "collections" }),
            },
          ].map((f) => (
            <button
              key={f.title}
              onClick={f.action}
              className="group flex items-center gap-3.5 p-2 rounded-xl text-left transition-all duration-300 hover:bg-accent/60 border border-transparent hover:border-champagne/30 cursor-pointer active:scale-[0.98]"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-charcoal transition-all duration-300 group-hover:bg-champagne group-hover:text-charcoal group-hover:scale-105 shadow-sm">
                <f.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground group-hover:text-charcoal transition-colors">
                  {f.title}
                </p>
                <p className="text-xs text-muted-foreground">{f.sub}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Shop by Category */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <SectionHeader
          eyebrow="Curated edits"
          title="Shop by category"
          onAction={() => navigate("shop")}
          actionLabel="View all"
        />
        <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.slice(0, 8).map((c) => (
            <button
              key={c.id}
              onClick={() => navigate("shop", { category: c.slug })}
              className="group relative aspect-[4/5] overflow-hidden rounded-xl border border-border/60 shadow-sm transition-all duration-500 hover:border-champagne/50 hover:shadow-lg"
            >
              <img
                src={c.image}
                alt={c.name}
                loading="lazy"
                className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/20 to-transparent transition-opacity group-hover:opacity-95" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-left text-ivory">
                <p className="font-serif text-xl font-medium">{c.name}</p>
                <p className="text-xs text-ivory/70 line-clamp-1 mt-0.5">{c.tagline}</p>
                <span className="mt-2.5 inline-flex items-center gap-1.5 text-xs text-champagne font-medium transition-transform group-hover:translate-x-1">
                  Shop now <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="bg-accent/40 border-y border-border/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <SectionHeader
            eyebrow="Just landed"
            title="New arrivals"
            onAction={() => navigate("shop", { filter: "new" })}
            actionLabel="Shop all new"
          />
          <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {newArrivals.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Promo banner with copyable coupon code */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="relative overflow-hidden rounded-2xl bg-[#141312] text-ivory border border-white/10 shadow-2xl">
          <div className="grid lg:grid-cols-2 items-center">
            <div className="p-6 sm:p-10 lg:p-16">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-champagne/40 bg-champagne/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-champagne font-medium">
                <Sparkles className="h-3 w-3" /> Limited time privilege
              </span>
              <h2 className="mt-4 font-serif text-2xl sm:text-4xl lg:text-5xl leading-tight text-ivory">
                Flat 20% off the <span className="text-champagne italic">Noir Haute Collection</span>
              </h2>
              <p className="mt-3 sm:mt-4 max-w-md text-xs sm:text-sm text-ivory/75 leading-relaxed">
                Opulent statement pieces with antique gold settings, handcrafted kundan, and brilliant crystal faceting.
              </p>

              {/* Copyable coupon chip */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText("FESTIVE20");
                    pushToast({
                      title: "Coupon FESTIVE20 Copied!",
                      description: "Flat 20% discount code copied to clipboard.",
                      variant: "success",
                    });
                  }}
                  className="group flex items-center gap-2 rounded-lg border border-dashed border-champagne/60 bg-champagne/10 px-4 py-2.5 text-xs font-semibold text-champagne hover:bg-champagne/20 transition-all cursor-pointer"
                  title="Click to copy coupon code"
                >
                  <span>Code:</span>
                  <span className="font-mono text-sm tracking-wider font-bold text-ivory group-hover:text-champagne">
                    FESTIVE20
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-ivory/60 group-hover:text-champagne ml-1">
                    (Click to copy)
                  </span>
                </button>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row flex-wrap gap-3">
                <Button
                  onClick={() => navigate("shop", { collection: "noir" })}
                  className="bg-champagne text-charcoal hover:brightness-110 font-semibold px-6 py-5 text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-champagne/20"
                >
                  Shop the Noir Edit <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  onClick={() => navigate("shop", { filter: "collections" })}
                  variant="outline"
                  className="border-white/20 bg-white/5 text-ivory hover:border-champagne hover:bg-champagne/10 hover:text-champagne px-6 py-5 text-xs sm:text-sm uppercase tracking-wider"
                >
                  All Collections
                </Button>
              </div>
            </div>
            <div className="relative min-h-[220px] sm:min-h-[300px] lg:min-h-[460px]">
              <img
                src="https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?auto=format&fit=crop&w=1200&q=80"
                alt="Noir collection"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#141312] via-transparent to-transparent hidden lg:block" />
            </div>
          </div>
        </div>
      </section>

      {/* Bestsellers */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-10 sm:pb-14">
        <SectionHeader
          eyebrow="Loved by all"
          title="Bestsellers"
          onAction={() => navigate("shop", { filter: "best" })}
          actionLabel="View all"
        />
        <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {bestsellers.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Featured collection */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <SectionHeader
          eyebrow="Featured"
          title="Explore our collections"
          onAction={() => navigate("shop", { filter: "collections" })}
          actionLabel="All collections"
        />
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {collections.map((col) => (
            <button
              key={col.id}
              onClick={() => navigate("shop", { collection: col.id })}
              className="group relative aspect-[3/4] overflow-hidden rounded-xl text-left border border-border/50 shadow-md transition-all duration-500 hover:border-champagne/50 hover:shadow-xl"
            >
              <img
                src={col.image}
                alt={col.name}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-108"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-ivory">
                <p className="text-xs uppercase tracking-[0.25em] text-champagne font-medium">{col.tagline}</p>
                <p className="mt-1 font-serif text-2xl font-medium">{col.name}</p>
                <p className="mt-1.5 text-xs text-ivory/75 line-clamp-2 leading-relaxed">{col.description}</p>
                <span className="mt-3.5 inline-flex items-center gap-1.5 text-xs text-champagne font-medium transition-transform group-hover:translate-x-1">
                  Discover Collection <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Featured products with functional header action */}
      {featured.length > 0 && (
        <section className="bg-accent/40 border-y border-border/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            <SectionHeader
              eyebrow="Editor's pick"
              title="Featured pieces"
              onAction={() => navigate("shop", { filter: "featured" })}
              actionLabel="View all featured"
            />
            <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {featured.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <SectionHeader eyebrow="Loved by customers" title="What they're saying" />
        <div className="mt-6 sm:mt-8 grid gap-4 sm:gap-5 sm:grid-cols-2 md:grid-cols-3">
          {[
            {
              name: "Priya Sharma",
              city: "Mumbai",
              text: "The Aurora pearl drops are my new favourite. Quality you can feel — and the signature VRUNDORA packaging is breathtaking.",
              rating: 5,
            },
            {
              name: "Ananya Reddy",
              city: "Bengaluru",
              text: "I've ordered three times now. Fast express dispatch, easy returns, and every piece looks even more radiant in person.",
              rating: 5,
            },
            {
              name: "Meera Krishnan",
              city: "Chennai",
              text: "Purchased the Amara bridal set for my wedding reception. Honestly looked like heirloom real gold in every portrait.",
              rating: 5,
            },
          ].map((t) => (
            <div
              key={t.name}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-champagne/40"
            >
              <div className="flex items-center justify-between">
                <Quote className="h-6 w-6 text-champagne" />
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                  Verified Buyer ✓
                </span>
              </div>
              <div className="mt-3 flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-champagne text-champagne" />
                ))}
              </div>
              <p className="mt-3 text-sm text-foreground/80 leading-relaxed italic">"{t.text}"</p>
              <div className="mt-4 flex items-center gap-3 border-t border-border pt-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-champagne/20 text-xs font-semibold text-charcoal">
                  {t.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.city}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* VRUNDORA Instagram Reels experience with Embla carousel & Shop This Look */}
      <ReelsSection />
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  actionLabel,
  onAction,
}: {
  eyebrow?: string;
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.25em] text-champagne font-medium">{eyebrow}</p>
        )}
        <h2 className="mt-0.5 sm:mt-1 font-serif text-xl sm:text-2xl md:text-3xl text-foreground truncate">{title}</h2>
      </div>
      {actionLabel && (
        <button
          onClick={onAction}
          className="inline-flex shrink-0 items-center gap-1 text-xs sm:text-sm font-medium text-charcoal hover:gap-1.5 transition-all"
        >
          {actionLabel} <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </button>
      )}
    </div>
  );
}
