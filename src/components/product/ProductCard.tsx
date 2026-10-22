"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import { useStore, formatINR, discountPct } from "@/store/useStore";
import { calculateComboStock, products as allProducts } from "@/data/products";
import { Heart, Eye, Star, ShoppingBag, Check, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProductCard({ product, compact = false }: { product: Product; compact?: boolean }) {
  const navigate = useStore((s) => s.navigate);
  const toggleWishlist = useStore((s) => s.toggleWishlist);
  const isWishlisted = useStore((s) => s.wishlist.includes(product.id));
  const addToCart = useStore((s) => s.addToCart);
  const allProductsList = useStore((s) => s.products || allProducts);
  const [imgIdx, setImgIdx] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const isCombo = product.productType === "combo";
  const effectiveStock = isCombo
    ? calculateComboStock(product.comboComponents, allProductsList)
    : product.stock;

  const pct = discountPct(product.price, product.mrp);
  const outOfStock = effectiveStock <= 0;
  const lowStock = effectiveStock > 0 && effectiveStock <= 8;

  const badge = product.bestseller
    ? { label: "Bestseller", cls: "bg-charcoal text-ivory" }
    : product.newArrival
    ? { label: "New Season", cls: "bg-champagne text-charcoal font-bold" }
    : pct > 0
    ? { label: `-${pct}%`, cls: "bg-red-600 text-white" }
    : null;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (outOfStock) return;
    addToCart(product.id, 1, product.colors[0]?.id, product.sizes[0]);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
  };

  return (
    <div
      className="group flex flex-col rounded-xl p-1.5 transition-all duration-300 hover:shadow-lg border border-transparent hover:border-champagne/30 bg-card/40"
      onMouseEnter={() => {
        setHovered(true);
        if (product.images.length > 1) setImgIdx(1);
      }}
      onMouseLeave={() => {
        setHovered(false);
        setImgIdx(0);
      }}
    >
      <div
        className="relative aspect-[4/5] cursor-pointer overflow-hidden rounded-lg bg-accent"
        onClick={() => navigate("product", { id: product.id })}
      >
        <img
          src={product.images[imgIdx] || product.images[0]}
          alt={product.name}
          loading="lazy"
          className={cn(
            "h-full w-full object-cover transition-all duration-700",
            hovered ? "scale-108" : "scale-100",
            outOfStock && "opacity-60"
          )}
        />

        {/* Badges */}
        <div className="absolute left-2.5 top-2.5 flex flex-col gap-1 z-10">
          {isCombo && (
            <span className="rounded-md bg-amber-800 text-amber-50 border border-amber-600/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
              <Layers className="h-3 w-3" /> Combo Deal
            </span>
          )}
          {badge && (
            <span className={cn("rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider shadow-sm", badge.cls)}>
              {badge.label}
            </span>
          )}
          {lowStock && (
            <span className="rounded-md bg-amber-500 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
              Only {effectiveStock} left
            </span>
          )}
          {outOfStock && (
            <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
              Out of stock
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className="absolute right-2 top-2 sm:right-2.5 sm:top-2.5 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm transition hover:bg-background hover:scale-110 active:scale-95 z-10"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={cn("h-4 w-4 transition-colors", isWishlisted && "fill-red-500 text-red-500")} />
        </button>

        {/* Quick actions for desktop hover */}
        <div className="absolute inset-x-2 bottom-2 sm:inset-x-2.5 sm:bottom-2.5 hidden md:flex translate-y-2 gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 z-10">
          <button
            onClick={handleQuickAdd}
            disabled={outOfStock}
            className={cn(
              "flex h-9 sm:h-10 flex-1 items-center justify-center gap-1.5 rounded-lg text-xs font-semibold transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 shadow-md",
              justAdded
                ? "bg-emerald-600 text-white"
                : "bg-charcoal text-ivory hover:bg-champagne hover:text-charcoal"
            )}
          >
            {justAdded ? (
              <>
                <Check className="h-4 w-4" /> Added ✓
              </>
            ) : (
              <>
                <ShoppingBag className="h-3.5 w-3.5" /> Quick Add
              </>
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate("product", { id: product.id });
            }}
            className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-background/95 text-charcoal transition-all hover:bg-champagne hover:text-charcoal hover:scale-105 active:scale-95 shadow-md"
            aria-label="Quick view"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className={cn("mt-2.5 sm:mt-3 flex flex-col", compact && "mt-1.5")}>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">
          {product.collection}
        </p>
        <button
          onClick={() => navigate("product", { id: product.id })}
          className="mt-0.5 line-clamp-2 min-h-[2.35rem] sm:min-h-[2.5rem] text-left text-xs sm:text-sm font-medium text-foreground hover:text-charcoal leading-snug"
        >
          {product.name}
        </button>
        <div className="mt-1 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-0.5 text-xs text-foreground">
            <Star className="h-3 w-3 fill-champagne text-champagne" />
            {product.rating.toFixed(1)}
          </span>
          <span className="text-[11px] sm:text-xs text-muted-foreground">({product.reviewCount})</span>
        </div>
        <div className="mt-1 flex items-baseline gap-1.5 flex-wrap">
          <span className="text-xs sm:text-sm font-semibold text-foreground">{formatINR(product.price)}</span>
          {product.mrp > product.price && (
            <span className="text-[11px] sm:text-xs text-muted-foreground line-through">{formatINR(product.mrp)}</span>
          )}
          {pct > 0 && <span className="text-[10px] sm:text-xs font-semibold text-emerald-700">{pct}% off</span>}
        </div>
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="aspect-[4/5] rounded-lg shimmer" />
      <div className="mt-3 space-y-2">
        <div className="h-3 w-1/3 rounded shimmer" />
        <div className="h-4 w-3/4 rounded shimmer" />
        <div className="h-4 w-1/2 rounded shimmer" />
      </div>
    </div>
  );
}
