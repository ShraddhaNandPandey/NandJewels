"use client";

import { useEffect, useMemo, useState } from "react";
import { useStore, formatINR, discountPct } from "@/store/useStore";
import { getProduct, products as allProducts, calculateComboStock } from "@/data/products";
import { getCategory } from "@/data/categories";
import { ProductCard } from "@/components/product/ProductCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Star,
  Heart,
  ShoppingBag,
  Truck,
  RotateCcw,
  ShieldCheck,
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
  Check,
  Share2,
  ThumbsUp,
  MapPin,
  Sparkles,
  Layers,
  PackageCheck,
} from "lucide-react";

export function ProductView() {
  const params = useStore((s) => s.params);
  const navigate = useStore((s) => s.navigate);
  const addToCart = useStore((s) => s.addToCart);
  const toggleWishlist = useStore((s) => s.toggleWishlist);
  const isWishlisted = useStore((s) => s.wishlist.includes(params.id || ""));
  const addRecentlyViewed = useStore((s) => s.addRecentlyViewed);
  const recentlyViewed = useStore((s) => s.recentlyViewed);
  const pushToast = useStore((s) => s.pushToast);
  const allProductsList = useStore((s) => s.products || allProducts);

  const product = useMemo(() => {
    if (!params.id) return undefined;
    const found = allProductsList.find((p) => p.id === params.id || p.slug === params.id);
    return found || getProduct(params.id);
  }, [params.id, allProductsList]);

  const [activeImg, setActiveImg] = useState(0);
  const [colorId, setColorId] = useState(product?.colors[0]?.id || "");
  const [size, setSize] = useState(product?.sizes[0]);
  const [qty, setQty] = useState(1);
  const [pincode, setPincode] = useState("");
  const [pincodeResult, setPincodeResult] = useState<string | null>(null);
  const [tab, setTab] = useState("description");
  const [helpfulReviews, setHelpfulReviews] = useState<string[]>([]);

  useEffect(() => {
    if (product) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveImg(0);
      setColorId(product.colors[0]?.id || "");
      setSize(product.sizes[0]);
      setQty(1);
      addRecentlyViewed(product.id);
    }
  }, [product?.id]);

  const isCombo = product?.productType === "combo";
  const effectiveStock = useMemo(() => {
    if (!product) return 0;
    return isCombo
      ? calculateComboStock(product.comboComponents, allProductsList)
      : product.stock;
  }, [product, isCombo, allProductsList]);

  const comboItems = useMemo(() => {
    if (!product || !isCombo || !product.comboComponents) return [];
    return product.comboComponents.map((c) => {
      const item = allProductsList.find((p) => p.id === c.componentProductId) || getProduct(c.componentProductId);
      return {
        component: c,
        product: item,
      };
    });
  }, [product, isCombo, allProductsList]);

  const individualTotal = useMemo(() => {
    return comboItems.reduce((acc, ci) => acc + (ci.product?.price || 0) * ci.component.quantity, 0);
  }, [comboItems]);

  const related = useMemo(() => {
    if (!product) return [];
    return allProductsList
      .filter((p) => p.id !== product.id && p.category === product.category)
      .slice(0, 4);
  }, [product, allProductsList]);

  const recentlyViewedProducts = useMemo(() => {
    return recentlyViewed
      .filter((id) => id !== product?.id)
      .map((id) => allProductsList.find((p) => p.id === id || p.slug === id) || getProduct(id))
      .filter(Boolean)
      .slice(0, 4) as NonNullable<ReturnType<typeof getProduct>>[];
  }, [recentlyViewed, product?.id, allProductsList]);

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="font-serif text-2xl">Product not found</p>
        <Button onClick={() => navigate("shop")} className="mt-4">Back to shop</Button>
      </div>
    );
  }

  const pct = discountPct(product.price, product.mrp);
  const selectedColor = product.colors.find((c) => c.id === colorId);
  const outOfStock = effectiveStock <= 0;
  const lowStock = effectiveStock > 0 && effectiveStock <= 8;

  const ratingDist = [5, 4, 3, 2, 1].map((star) => {
    // derive a believable distribution
    const base = product.rating >= star ? Math.round(product.reviewCount * (0.6 - star * 0.07)) : Math.round(product.reviewCount * 0.05);
    return { star, count: Math.max(0, base) };
  });

  const handleAddToCart = () => {
    if (outOfStock) return;
    addToCart(product.id, qty, colorId, size);
  };

  const handleBuyNow = () => {
    if (outOfStock) return;
    addToCart(product.id, qty, colorId, size);
    navigate("checkout");
  };

  const checkPincode = () => {
    if (!/^\d{6}$/.test(pincode)) {
      setPincodeResult("Please enter a valid 6-digit PIN code.");
      return;
    }
    const days = 2 + (parseInt(pincode[5]) % 4);
    setPincodeResult(`Delivery by ${new Date(Date.now() + days * 86400000).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · COD available`);
  };

  const share = () => {
    pushToast({ title: "Link copied", description: "Share this product with friends.", variant: "success" });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 animate-fade-up">
      <Breadcrumbs
        items={[
          { label: "Shop", view: "shop" },
          { label: getCategory(product.category)?.name || product.category, view: "shop", params: { category: product.category } },
          { label: product.name },
        ]}
      />

      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Gallery */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row min-w-0">
          <div className="flex gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar sm:overflow-visible pb-1 sm:pb-0 sm:flex-col shrink-0">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={cn(
                  "h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-lg border-2 transition",
                  activeImg === i ? "border-charcoal shadow-xs" : "border-transparent opacity-70 hover:opacity-100"
                )}
              >
                <img src={img} alt={`${product.name} ${i + 1}`} className="h-full w-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
          <div className="relative flex-1">
            <div className="group relative aspect-square overflow-hidden rounded-xl bg-accent">
              <img
                src={product.images[activeImg]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
              {pct > 0 && (
                <span className="absolute left-3 top-3 rounded bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
                  -{pct}%
                </span>
              )}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImg((i) => (i - 1 + product.images.length) % product.images.length)}
                    className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 sm:opacity-0 transition sm:group-hover:opacity-100 shadow-sm"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setActiveImg((i) => (i + 1) % product.images.length)}
                    className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 sm:opacity-0 transition sm:group-hover:opacity-100 shadow-sm"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
              <span className="absolute bottom-3 right-3 rounded-full bg-background/80 px-2 py-0.5 text-xs">
                {activeImg + 1} / {product.images.length}
              </span>
            </div>
          </div>
        </div>

        {/* Info */}
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-champagne">{product.collection}</p>
          <h1 className="mt-1 font-serif text-3xl sm:text-4xl">{product.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setTab("reviews")}
              className="inline-flex items-center gap-1 text-sm"
            >
              <span className="inline-flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-4 w-4",
                      i < Math.round(product.rating)
                        ? "fill-champagne text-champagne"
                        : "fill-muted text-muted"
                    )}
                  />
                ))}
              </span>
              <span className="font-medium">{product.rating.toFixed(1)}</span>
            </button>
            <span className="text-sm text-muted-foreground">{product.reviewCount} reviews</span>
            <span className="text-sm text-muted-foreground">·</span>
            <span className="text-sm text-muted-foreground">SKU: {product.sku}</span>
          </div>

          <div className="mt-4 flex items-end gap-3 flex-wrap">
            <span className="font-serif text-3xl text-charcoal">{formatINR(product.price)}</span>
            {product.mrp > product.price && (
              <span className="text-lg text-muted-foreground line-through">{formatINR(product.mrp)}</span>
            )}
            {pct > 0 && (
              <span className="mb-1 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 text-xs font-semibold">
                Save {pct}%
              </span>
            )}
            {isCombo && (
              <span className="mb-1 rounded-md bg-amber-800 text-amber-50 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                <Layers className="h-3 w-3" /> Combo Deal
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Inclusive of all taxes · Verified Genuine Jewellery</p>

          {/* Combo Includes Section */}
          {isCombo && comboItems.length > 0 && (
            <div className="mt-6 rounded-xl border border-champagne/50 bg-champagne/10 p-4.5 space-y-3.5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-champagne/30 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-champagne/30 text-charcoal">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-semibold text-charcoal leading-tight">
                      Combo Includes
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Curated set of {comboItems.length} complementary jewellery pieces
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-charcoal bg-champagne/30 px-2 py-1 rounded-md">
                  Bundle Price: {formatINR(product.price)}
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                {comboItems.map(({ component, product: compProduct }, idx) => (
                  <div
                    key={idx}
                    onClick={() => compProduct && navigate("product", { id: compProduct.id })}
                    className="flex items-center gap-3 rounded-lg border border-border/80 bg-background/90 p-2.5 shadow-2xs hover:border-champagne transition cursor-pointer group"
                  >
                    <img
                      src={compProduct?.images[0] || product.images[0]}
                      alt={compProduct?.name}
                      className="h-12 w-12 rounded-md object-cover border border-border shrink-0 group-hover:scale-105 transition"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <p className="font-medium text-xs sm:text-sm text-foreground truncate group-hover:text-charcoal transition">
                          {compProduct?.name || "Included Component Piece"}
                        </p>
                      </div>
                      <p className="text-[11px] text-muted-foreground pl-5">
                        SKU: {compProduct?.sku || "SKU-N/A"} · Single: {formatINR(compProduct?.price || 0)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="inline-block rounded-md bg-accent px-2 py-0.5 text-xs font-semibold text-charcoal">
                        Qty: {component.quantity}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Complimentary Perk */}
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50/70 border border-emerald-200/80 px-3 py-2 text-xs text-emerald-800">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">
                    Complimentary Signature Velvet Jewellery Pouch & Certificate of Authenticity
                  </span>
                </div>
              </div>

              {/* Automatic Pricing Summary Cards */}
              <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-background/80 rounded-lg p-2 border border-border/60">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide block">Individual Total</span>
                  <span className="font-semibold text-foreground text-sm">{formatINR(individualTotal || product.mrp)}</span>
                </div>
                <div className="bg-background/80 rounded-lg p-2 border border-border/60">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide block">Total MRP</span>
                  <span className="font-medium line-through text-muted-foreground text-sm">{formatINR(product.mrp)}</span>
                </div>
                <div className="bg-champagne/25 rounded-lg p-2 border border-champagne/50">
                  <span className="text-[10px] text-charcoal font-bold uppercase tracking-wide block">Combo Price</span>
                  <span className="font-bold text-charcoal text-sm">{formatINR(product.price)}</span>
                </div>
                <div className="bg-emerald-50 rounded-lg p-2 border border-emerald-300">
                  <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wide block">You Save</span>
                  <span className="font-bold text-emerald-700 text-sm">
                    {formatINR(Math.max(0, (individualTotal || product.mrp) - product.price))}
                    {pct > 0 && ` (${pct}%)`}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Colors */}
          <div className="mt-6">
            <p className="text-sm font-medium">
              Colour: <span className="text-muted-foreground">{selectedColor?.name}</span>
            </p>
            <div className="mt-2 flex gap-2">
              {product.colors.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setColorId(c.id)}
                  className={cn(
                    "relative h-10 w-10 rounded-full border-2 transition",
                    colorId === c.id ? "border-charcoal" : "border-border"
                  )}
                  title={c.name}
                >
                  <span className="absolute inset-1 rounded-full" style={{ background: c.color }} />
                  {colorId === c.id && (
                    <Check className="absolute inset-0 m-auto h-4 w-4 text-ivory mix-blend-difference" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Sizes */}
          {product.sizes.length > 1 && (
            <div className="mt-5">
              <p className="text-sm font-medium">Size</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={cn(
                      "rounded-md border px-3 py-1.5 text-sm transition",
                      size === s ? "border-charcoal bg-charcoal text-ivory" : "border-border hover:border-charcoal"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mt-5">
            <p className="text-sm font-medium">Quantity</p>
            <div className="mt-2 inline-flex items-center rounded-md border border-border">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="flex h-10 w-10 items-center justify-center text-muted-foreground hover:text-foreground"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center text-sm font-medium">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="flex h-10 w-10 items-center justify-center text-muted-foreground hover:text-foreground"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {lowStock && (
              <p className="mt-2 text-xs text-amber-600 font-medium">Hurry, only {effectiveStock} left in stock!</p>
            )}
            {outOfStock && (
              <p className="mt-2 text-xs text-red-600 font-medium">Currently out of stock. Dependent on component product inventory.</p>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <Button
              onClick={handleAddToCart}
              disabled={outOfStock}
              size="lg"
              variant="outline"
              className="flex-1 h-12 text-sm font-semibold border-charcoal text-charcoal hover:bg-charcoal hover:text-ivory disabled:opacity-40"
            >
              <ShoppingBag className="mr-2 h-4 w-4" /> Add to Cart
            </Button>
            <Button
              onClick={handleBuyNow}
              disabled={outOfStock}
              size="lg"
              className="flex-1 h-12 text-sm font-semibold bg-charcoal text-ivory hover:bg-charcoal/90 disabled:opacity-40"
            >
              Buy Now
            </Button>
            <div className="flex gap-2 self-stretch sm:self-auto">
              <Button
                onClick={() => toggleWishlist(product.id)}
                size="lg"
                variant="outline"
                className="flex-1 sm:flex-none h-12 px-4"
                aria-label="Toggle wishlist"
              >
                <Heart className={cn("h-5 w-5", isWishlisted && "fill-red-500 text-red-500")} />
                <span className="sm:hidden ml-1.5 text-xs">Wishlist</span>
              </Button>
              <Button onClick={share} size="lg" variant="outline" className="flex-1 sm:flex-none h-12 px-4" aria-label="Share">
                <Share2 className="h-5 w-5" />
                <span className="sm:hidden ml-1.5 text-xs">Share</span>
              </Button>
            </div>
          </div>

          {/* Pincode check */}
          <div className="mt-6 rounded-lg border border-border bg-accent/30 p-4">
            <p className="flex items-center gap-1.5 text-sm font-medium">
              <MapPin className="h-4 w-4 text-charcoal" /> Check delivery
            </p>
            <div className="mt-2 flex gap-2">
              <input
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="Enter 6-digit PIN code"
                className="h-10 flex-1 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-charcoal"
              />
              <Button onClick={checkPincode} variant="outline" size="sm" className="h-10">Check</Button>
            </div>
            {pincodeResult && (
              <p className={cn("mt-2 text-xs", pincodeResult.includes("Delivery") ? "text-emerald-700" : "text-red-600")}>
                {pincodeResult}
              </p>
            )}
          </div>

          {/* Assurances */}
          <div className="mt-6 grid grid-cols-3 gap-3 text-center text-xs">
            <div className="rounded-lg border border-border p-3">
              <Truck className="mx-auto h-5 w-5 text-charcoal" />
              <p className="mt-1.5 font-medium">Free shipping</p>
              <p className="text-muted-foreground">Above ₹999</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <RotateCcw className="mx-auto h-5 w-5 text-charcoal" />
              <p className="mt-1.5 font-medium">7-day returns</p>
              <p className="text-muted-foreground">Easy & free</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <ShieldCheck className="mx-auto h-5 w-5 text-charcoal" />
              <p className="mt-1.5 font-medium">Quality promise</p>
              <p className="text-muted-foreground">Hypoallergenic</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-12">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full justify-start overflow-x-auto no-scrollbar bg-transparent p-0 h-auto">
            {[
              { v: "description", l: "Description" },
              { v: "details", l: "Product Details" },
              { v: "reviews", l: `Reviews (${product.reviewCount})` },
            ].map((t) => (
              <TabsTrigger
                key={t.v}
                value={t.v}
                className="rounded-none border-b-2 border-transparent px-4 py-3 text-sm data-[state=active]:border-charcoal data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                {t.l}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="description" className="mt-6">
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <p className="text-sm leading-relaxed text-foreground/80">{product.description}</p>
                <p className="mt-4 text-sm leading-relaxed text-foreground/80">
                  Each piece is hand-finished in our studio and undergoes a multi-step quality check
                  before being carefully packed in our signature Shraddhanand box — ready to gift or treasure.
                </p>
              </div>
              <div className="rounded-lg border border-border p-5">
                <p className="text-sm font-semibold">Highlights</p>
                <ul className="mt-3 space-y-2 text-sm text-foreground/80">
                  <li className="flex gap-2"><Check className="h-4 w-4 text-champagne shrink-0" /> {product.material}</li>
                  <li className="flex gap-2"><Check className="h-4 w-4 text-champagne shrink-0" /> Weight: {product.weight}</li>
                  <li className="flex gap-2"><Check className="h-4 w-4 text-champagne shrink-0" /> {product.dimensions}</li>
                  <li className="flex gap-2"><Check className="h-4 w-4 text-champagne shrink-0" /> Hypoallergenic & skin-safe</li>
                  <li className="flex gap-2"><Check className="h-4 w-4 text-champagne shrink-0" /> Comes in a signature gift box</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details" className="mt-6">
            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <h3 className="font-serif text-xl">Specifications</h3>
                <dl className="mt-4 divide-y divide-border text-sm">
                  {[
                    ["Material", product.material],
                    ["Weight", product.weight],
                    ["Dimensions", product.dimensions],
                    ["Collection", product.collection],
                    ["Category", getCategory(product.category)?.name || product.category],
                    ["Subcategory", product.subcategory],
                    ["SKU", product.sku],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4 py-2.5">
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd className="text-right font-medium capitalize">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="font-serif text-xl">Care instructions</h3>
                  <p className="mt-2 text-sm text-foreground/80">{product.care}</p>
                </div>
                <div>
                  <h3 className="font-serif text-xl">Shipping & returns</h3>
                  <p className="mt-2 text-sm text-foreground/80">
                    Free shipping on orders above ₹999. Dispatched within 24 hours. Easy 7-day
                    returns on unused pieces in original packaging. Refunds processed within 5–7
                    business days.
                  </p>
                </div>
                <Separator />
                <div>
                  <h3 className="font-serif text-xl">Tags</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {product.tags.map((t) => (
                      <span key={t} className="rounded-full bg-accent px-2.5 py-1 text-xs capitalize">#{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Summary */}
              <div className="rounded-lg border border-border p-5">
                <p className="font-serif text-5xl">{product.rating.toFixed(1)}</p>
                <div className="mt-1 flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={cn("h-4 w-4", i < Math.round(product.rating) ? "fill-champagne text-champagne" : "fill-muted text-muted")} />
                  ))}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{product.reviewCount} verified reviews</p>
                <div className="mt-4 space-y-1.5">
                  {ratingDist.map((r) => (
                    <div key={r.star} className="flex items-center gap-2 text-xs">
                      <span className="w-3">{r.star}</span>
                      <Star className="h-3 w-3 fill-champagne text-champagne" />
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-champagne"
                          style={{ width: `${product.reviewCount ? (r.count / product.reviewCount) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-muted-foreground">{r.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews list */}
              <div className="lg:col-span-2 space-y-4">
                {product.reviews.length === 0 && (
                  <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review!</p>
                )}
                {product.reviews.map((r) => (
                  <div key={r.id} className="rounded-lg border border-border p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-xs font-semibold text-charcoal">
                          {r.author.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{r.author}</p>
                          {r.verified && (
                            <p className="inline-flex items-center gap-1 text-xs text-emerald-600">
                              <Check className="h-3 w-3" /> Verified purchase
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{r.date}</span>
                    </div>
                    <div className="mt-3 flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={cn("h-3.5 w-3.5", i < r.rating ? "fill-champagne text-champagne" : "fill-muted text-muted")} />
                      ))}
                    </div>
                    <p className="mt-2 font-medium">{r.title}</p>
                    <p className="mt-1 text-sm text-foreground/80">{r.body}</p>
                    <button
                      onClick={() => setHelpfulReviews((p) => p.includes(r.id) ? p.filter((x) => x !== r.id) : [...p, r.id])}
                      className={cn(
                        "mt-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition",
                        helpfulReviews.includes(r.id) ? "border-charcoal bg-charcoal text-ivory" : "border-border hover:border-charcoal"
                      )}
                    >
                      <ThumbsUp className="h-3 w-3" /> Helpful ({r.helpful + (helpfulReviews.includes(r.id) ? 1 : 0)})
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-14">
          <h2 className="font-serif text-2xl">You may also like</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Recently viewed */}
      {recentlyViewedProducts.length > 0 && (
        <div className="mt-14">
          <h2 className="font-serif text-2xl">Recently viewed</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {recentlyViewedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
