"use client";

import { useStore, formatINR } from "@/store/useStore";
import { getProduct } from "@/data/products";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";

export function WishlistView() {
  const navigate = useStore((s) => s.navigate);
  const wishlist = useStore((s) => s.wishlist);
  const toggleWishlist = useStore((s) => s.toggleWishlist);
  const addToCart = useStore((s) => s.addToCart);

  const items = wishlist.map((id) => getProduct(id)).filter(Boolean);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center animate-fade-up">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-accent">
          <Heart className="h-9 w-9 text-muted-foreground" />
        </div>
        <h1 className="mt-6 font-serif text-3xl">Your wishlist is empty</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tap the heart on any product to save it here for later.
        </p>
        <Button onClick={() => navigate("shop")} className="mt-6 bg-charcoal text-ivory hover:bg-charcoal/90">
          Discover jewellery <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 animate-fade-up">
      <Breadcrumbs items={[{ label: "Wishlist" }]} />
      <div className="mt-4 flex items-center justify-between">
        <h1 className="font-serif text-3xl sm:text-4xl">My Wishlist</h1>
        <span className="text-sm text-muted-foreground">{items.length} saved</span>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => {
          if (!p) return null;
          const outOfStock = p.stock <= 0;
          return (
            <div key={p.id} className="flex gap-3 sm:gap-4 rounded-lg border border-border p-3 sm:p-4 bg-card">
              <button onClick={() => navigate("product", { id: p.id })} className="shrink-0">
                <img src={p.images[0]} alt={p.name} className="h-24 w-20 sm:h-28 sm:w-24 rounded-md object-cover border border-border" />
              </button>
              <div className="flex flex-1 min-w-0 flex-col">
                <button onClick={() => navigate("product", { id: p.id })} className="text-left text-sm font-medium hover:text-charcoal truncate">
                  {p.name}
                </button>
                <p className="text-xs text-muted-foreground">{p.collection}</p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="text-sm font-semibold">{formatINR(p.price)}</span>
                  {p.mrp > p.price && (
                    <span className="text-xs text-muted-foreground line-through">{formatINR(p.mrp)}</span>
                  )}
                </div>
                {outOfStock ? (
                  <p className="mt-1 text-xs text-red-600">Out of stock</p>
                ) : (
                  <p className="mt-1 text-xs text-emerald-700">In stock</p>
                )}
                <div className="mt-auto flex flex-wrap sm:flex-nowrap gap-2 pt-3">
                  <Button
                    size="sm"
                    disabled={outOfStock}
                    onClick={() => addToCart(p.id, 1, p.colors[0]?.id, p.sizes[0])}
                    className="flex-1 sm:flex-initial bg-charcoal text-ivory hover:bg-charcoal/90 disabled:opacity-40 text-xs h-8"
                  >
                    <ShoppingBag className="mr-1 h-3.5 w-3.5" /> Add to cart
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toggleWishlist(p.id)} aria-label="Remove" className="h-8 px-2.5">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
