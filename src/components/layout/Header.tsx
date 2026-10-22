"use client";

import { useState } from "react";
import { useStore, useCartCount, useWishlistCount, useUnreadNotifications } from "@/store/useStore";
import { categories } from "@/data/categories";
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  Bell,
  Sparkles,
  ChevronDown,
  Copy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { label: "Shop", view: "shop" as const, params: {} },
  { label: "New Arrivals", view: "shop" as const, params: { filter: "new" } },
  { label: "Bestsellers", view: "shop" as const, params: { filter: "best" } },
  { label: "Collections", view: "shop" as const, params: { filter: "collections" } },
];

export function Header() {
  const navigate = useStore((s) => s.navigate);
  const view = useStore((s) => s.view);
  const setSearchOpen = useStore((s) => s.setSearchOpen);
  const mobileMenuOpen = useStore((s) => s.mobileMenuOpen);
  const setMobileMenuOpen = useStore((s) => s.setMobileMenuOpen);
  const user = useStore((s) => s.user);
  const logout = useStore((s) => s.logout);
  const cartCount = useCartCount();
  const wishlistCount = useWishlistCount();
  const unread = useUnreadNotifications();
  const pushToast = useStore((s) => s.pushToast);
  const [showCats, setShowCats] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Announcement bar with interactive working buttons */}
      <div className="bg-charcoal text-ivory text-[11px] sm:text-xs overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee py-1.5">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex shrink-0 items-center">
              <button
                onClick={() => navigate("support", { category: "Shipping" })}
                className="mx-6 inline-flex items-center gap-1.5 hover:text-champagne transition-colors cursor-pointer"
              >
                <Sparkles className="h-3 w-3 text-champagne" /> Free shipping on orders above ₹999
              </button>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText("WELCOME10");
                  pushToast({
                    title: "Coupon WELCOME10 Copied!",
                    description: "10% off code copied to clipboard. Apply at checkout.",
                    variant: "success",
                  });
                }}
                className="mx-6 inline-flex items-center gap-1.5 group hover:text-champagne transition-colors cursor-pointer"
              >
                Use code <strong className="text-champagne underline decoration-dotted">WELCOME10</strong> for 10% off
                <Copy className="h-3 w-3 opacity-60 group-hover:opacity-100" />
              </button>
              <button
                onClick={() => navigate("shop", { collection: "noir" })}
                className="mx-6 inline-flex items-center gap-1.5 hover:text-champagne transition-colors cursor-pointer"
              >
                Festive Edit live — up to 30% off
              </button>
              <button
                onClick={() => navigate("support", { category: "Returns" })}
                className="mx-6 inline-flex items-center gap-1.5 hover:text-champagne transition-colors cursor-pointer"
              >
                Easy 7-day hassle-free returns
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main header */}
      <div className="border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 sm:gap-4 px-3 sm:px-6 lg:px-8">
          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 -ml-1 text-foreground flex items-center justify-center min-h-[44px] min-w-[44px] rounded-lg hover:bg-accent/60 transition"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Brand logo */}
          <button
            onClick={() => navigate("home")}
            className="flex items-center gap-2 sm:gap-3 shrink-0 group text-left min-w-0"
            aria-label="श्रद्धानंद (Shraddhanand) home"
          >
            <img
              src="/logo.svg"
              alt="श्रद्धानंद"
              aria-hidden="true"
              className="h-8 w-8 sm:h-10 sm:w-10 object-contain transition-transform duration-300 group-hover:scale-105 shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <span className="font-serif text-lg sm:text-2xl font-bold tracking-tight text-foreground leading-none truncate">
                श्रद्धानंद
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.18em] sm:tracking-[0.25em] text-champagne font-medium mt-0.5 whitespace-nowrap">
                Shraddhanand <span className="hidden min-[420px]:inline text-[9px] text-muted-foreground font-normal tracking-[0.15em]">Jewellery</span>
              </span>
            </div>
          </button>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-7 ml-4 xl:ml-6 text-sm">
            <button
              onClick={() => setShowCats((prev) => !prev)}
              className="inline-flex items-center gap-1 link-underline text-foreground/80 hover:text-foreground font-medium whitespace-nowrap"
              onMouseEnter={() => setShowCats(true)}
            >
              Categories
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", showCats && "rotate-180 text-champagne")} />
            </button>
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => navigate(item.view, item.params)}
                className={cn(
                  "link-underline transition whitespace-nowrap",
                  view === item.view ? "text-foreground font-medium" : "text-foreground/70 hover:text-foreground"
                )}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => navigate("admin")}
              className="link-underline text-foreground/40 hover:text-foreground text-xs uppercase tracking-wider whitespace-nowrap"
            >
              Admin
            </button>
          </nav>

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-0.5 sm:gap-1.5 shrink-0">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full text-foreground/80 hover:text-foreground hover:bg-accent/60 transition"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            <button
              onClick={() => navigate("notifications")}
              className="relative hidden sm:flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full text-foreground/80 hover:text-foreground hover:bg-accent/60 transition"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unread > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-champagne px-1 text-[10px] font-semibold text-charcoal">
                  {unread}
                </span>
              )}
            </button>

            <button
              onClick={() => navigate("wishlist")}
              className="relative hidden min-[360px]:flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full text-foreground/80 hover:text-foreground hover:bg-accent/60 transition"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-charcoal px-1 text-[10px] font-semibold text-ivory">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Account dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full text-foreground/80 hover:text-foreground hover:bg-accent/60 transition"
                  aria-label="Account"
                >
                  <User className="h-5 w-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {user ? (
                  <>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {user.firstName} {user.lastName}
                        </span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("account")}>My Account</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("orders")}>My Orders</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("wishlist")}>Wishlist</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("addresses")}>Addresses</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("notifications")}>Notifications</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("support")}>Support</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-red-600">Logout</DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuLabel>Account</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => navigate("login")}>Login</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("register")}>Create account</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("orders")}>Track order</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("support")}>Help & support</DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              onClick={() => navigate("cart")}
              className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full text-foreground/80 hover:text-foreground hover:bg-accent/60 transition"
              aria-label="Cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-champagne px-1 text-[10px] font-semibold text-charcoal">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Categories mega strip (desktop hover / toggle) */}
        {showCats && (
          <div
            onMouseEnter={() => setShowCats(true)}
            onMouseLeave={() => setShowCats(false)}
            className="absolute inset-x-0 top-full hidden lg:block border-b border-border bg-background/95 backdrop-blur-xl shadow-xl animate-fade-up z-50 border-t-2 border-t-champagne/70"
          >
            <div className="mx-auto max-w-7xl px-6 py-6">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
                <p className="text-xs uppercase tracking-[0.25em] text-champagne font-semibold">
                  Curated Jewellery Categories
                </p>
                <button
                  onClick={() => {
                    navigate("shop");
                    setShowCats(false);
                  }}
                  className="text-xs text-foreground/70 hover:text-champagne font-medium transition-colors"
                >
                  View All Products →
                </button>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      navigate("shop", { category: c.slug });
                      setShowCats(false);
                    }}
                    className="group flex items-center gap-3 rounded-xl p-2.5 text-left transition-all duration-200 hover:bg-accent border border-transparent hover:border-champagne/30 hover:shadow-sm"
                  >
                    <img
                      src={c.image}
                      alt={c.name}
                      className="h-14 w-14 rounded-lg object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div>
                      <p className="text-sm font-semibold text-foreground group-hover:text-charcoal transition-colors">
                        {c.name}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{c.tagline}</p>
                      <span className="text-[10px] text-champagne font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Explore →
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile menu drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-[85%] max-w-sm bg-background shadow-xl flex flex-col animate-fade-up">
            <div className="flex items-center justify-between border-b border-border px-4 py-4">
              <span className="font-serif text-xl font-semibold">Menu</span>
              <button onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto scroll-area-custom p-4">
              <nav className="flex flex-col gap-1">
                <button
                  onClick={() => navigate("home")}
                  className="rounded-md px-3 py-2.5 text-left text-sm font-medium hover:bg-accent"
                >
                  Home
                </button>
                <button
                  onClick={() => navigate("shop")}
                  className="rounded-md px-3 py-2.5 text-left text-sm font-medium hover:bg-accent"
                >
                  Shop All
                </button>
                <button
                  onClick={() => navigate("shop", { filter: "new" })}
                  className="rounded-md px-3 py-2.5 text-left text-sm font-medium hover:bg-accent"
                >
                  New Arrivals
                </button>
                <button
                  onClick={() => navigate("shop", { filter: "best" })}
                  className="rounded-md px-3 py-2.5 text-left text-sm font-medium hover:bg-accent"
                >
                  Bestsellers
                </button>
              </nav>
              <p className="mt-6 mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Categories
              </p>
              <nav className="flex flex-col gap-1">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => navigate("shop", { category: c.slug })}
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-accent"
                  >
                    <img src={c.image} alt={c.name} className="h-9 w-9 rounded object-cover" loading="lazy" />
                    {c.name}
                  </button>
                ))}
              </nav>
              <p className="mt-6 mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Account
              </p>
              <nav className="flex flex-col gap-1">
                <button onClick={() => navigate("account")} className="rounded-md px-3 py-2.5 text-left text-sm hover:bg-accent">My Account</button>
                <button onClick={() => navigate("orders")} className="rounded-md px-3 py-2.5 text-left text-sm hover:bg-accent">My Orders</button>
                <button onClick={() => navigate("addresses")} className="rounded-md px-3 py-2.5 text-left text-sm hover:bg-accent">Addresses</button>
                <button onClick={() => navigate("notifications")} className="rounded-md px-3 py-2.5 text-left text-sm hover:bg-accent">Notifications</button>
                <button onClick={() => navigate("support")} className="rounded-md px-3 py-2.5 text-left text-sm hover:bg-accent">Support</button>
                <button onClick={() => navigate("admin")} className="rounded-md px-3 py-2.5 text-left text-sm text-champagne hover:bg-accent">Admin Panel</button>
                {user ? (
                  <button onClick={() => useStore.getState().logout()} className="rounded-md px-3 py-2.5 text-left text-sm text-red-600 hover:bg-accent">Logout</button>
                ) : (
                  <button onClick={() => navigate("login")} className="rounded-md px-3 py-2.5 text-left text-sm font-medium text-charcoal hover:bg-accent">Login / Register</button>
                )}
              </nav>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
