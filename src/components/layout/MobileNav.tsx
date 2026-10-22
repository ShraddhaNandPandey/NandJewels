"use client";

import { useStore, useCartCount } from "@/store/useStore";
import { Home, Compass, Search, Heart, User, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { label: "Home", view: "home" as const, icon: Home },
  { label: "Shop", view: "shop" as const, icon: Compass },
  { label: "Wishlist", view: "wishlist" as const, icon: Heart, badge: "wishlist" as const },
  { label: "Cart", view: "cart" as const, icon: ShoppingBag, badge: "cart" as const },
  { label: "Account", view: "account" as const, icon: User },
];

export function MobileNav() {
  const navigate = useStore((s) => s.navigate);
  const view = useStore((s) => s.view);
  const cartCount = useCartCount();
  const wishlistCount = useStore((s) => s.wishlist.length);

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85 pb-[env(safe-area-inset-bottom,0.25rem)]">
      <div className="grid grid-cols-5 h-14 items-center">
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.view && view === item.view;
          const count = item.badge === "cart" ? cartCount : item.badge === "wishlist" ? wishlistCount : 0;

          return (
            <button
              key={item.label}
              onClick={() => {
                if (item.view) navigate(item.view);
              }}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 py-1 text-[10px] font-medium transition min-h-[44px]",
                active ? "text-charcoal font-semibold" : "text-muted-foreground hover:text-foreground active:text-charcoal"
              )}
            >
              <div className="relative">
                <Icon className={cn("h-5 w-5", active && "text-charcoal stroke-[2.2]")} />
                {count > 0 && (
                  <span className={cn(
                    "absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold",
                    item.badge === "cart" ? "bg-champagne text-charcoal" : "bg-charcoal text-ivory"
                  )}>
                    {count}
                  </span>
                )}
              </div>
              <span className="leading-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
