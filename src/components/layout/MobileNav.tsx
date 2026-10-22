"use client";

import { useStore, useCartCount } from "@/store/useStore";
import { Home, Compass, Search, Heart, User, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { label: "Home", view: "home" as const, icon: Home },
  { label: "Shop", view: "shop" as const, icon: Compass },
  { label: "Search", view: null, icon: Search, action: "search" },
  { label: "Wishlist", view: "wishlist" as const, icon: Heart },
  { label: "Account", view: "account" as const, icon: User },
];

export function MobileNav() {
  const navigate = useStore((s) => s.navigate);
  const view = useStore((s) => s.view);
  const setSearchOpen = useStore((s) => s.setSearchOpen);
  const cartCount = useCartCount();

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="grid grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.view && view === item.view;
          return (
            <button
              key={item.label}
              onClick={() => {
                if (item.action === "search") setSearchOpen(true);
                else if (item.view) navigate(item.view);
              }}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium transition",
                active ? "text-charcoal font-semibold" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "text-charcoal stroke-[2.2]")} />
              {item.label}
            </button>
          );
        })}
      </div>
      {/* Floating cart with active count badge */}
      <button
        onClick={() => navigate("cart")}
        className="absolute -top-6 right-4 flex h-13 w-13 items-center justify-center rounded-full bg-champagne text-charcoal shadow-[0_8px_20px_rgba(201,169,106,0.4)] transition active:scale-95 border-2 border-background"
        aria-label="Cart"
      >
        <ShoppingBag className="h-5 w-5" />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-charcoal text-[10px] font-bold text-ivory ring-2 ring-background px-1">
            {cartCount}
          </span>
        )}
      </button>
    </nav>
  );
}
