"use client";

import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/store/useStore";
import { searchProducts } from "@/data/products";
import { categories } from "@/data/categories";
import { Search, X, TrendingUp, Clock } from "lucide-react";
import { formatINR } from "@/store/useStore";

const popularSearches = ["Earrings", "Pearl", "Necklace", "Bridal set", "Gold-tone", "Hoops"];

export function SearchModal() {
  const open = useStore((s) => s.searchOpen);
  const setOpen = useStore((s) => s.setSearchOpen);
  const navigate = useStore((s) => s.navigate);
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    const r = localStorage.getItem("vrundora-recent-searches") || localStorage.getItem("shraddhanand-recent-searches");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (r) setRecent(JSON.parse(r));
  }, []);

  useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery("");
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const results = useMemo(() => searchProducts(query).slice(0, 6), [query]);

  if (!open) return null;

  const saveRecent = (q: string) => {
    const next = [q, ...recent.filter((r) => r !== q)].slice(0, 6);
    setRecent(next);
    localStorage.setItem("vrundora-recent-searches", JSON.stringify(next));
  };

  const submit = (q: string) => {
    if (!q.trim()) return;
    saveRecent(q);
    setOpen(false);
    navigate("shop", { q });
  };

  const pickProduct = (id: string) => {
    setOpen(false);
    navigate("product", { id });
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-20 sm:pt-28">
      <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-2xl rounded-xl border border-border bg-background shadow-2xl animate-fade-up overflow-hidden">
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit(query)}
            placeholder="Search for earrings, necklaces, collections…"
            className="h-14 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <button onClick={() => setOpen(false)} aria-label="Close search" className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto scroll-area-custom p-4">
          {!query && (
            <div className="space-y-6">
              {recent.length > 0 && (
                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" /> Recent searches
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {recent.map((r) => (
                      <button
                        key={r}
                        onClick={() => submit(r)}
                        className="rounded-full border border-border px-3 py-1.5 text-xs hover:border-charcoal hover:text-charcoal"
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <TrendingUp className="h-3.5 w-3.5" /> Popular searches
                </p>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((r) => (
                    <button
                      key={r}
                      onClick={() => submit(r)}
                      className="rounded-full bg-accent px-3 py-1.5 text-xs hover:bg-accent/70"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Browse categories
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setOpen(false);
                        navigate("shop", { category: c.slug });
                      }}
                      className="flex items-center gap-2 rounded-lg border border-border p-2 text-left text-xs hover:border-charcoal"
                    >
                      <img src={c.image} alt={c.name} className="h-8 w-8 rounded object-cover" loading="lazy" />
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {query && results.length === 0 && (
            <div className="py-10 text-center">
              <p className="text-sm text-muted-foreground">No products found for "{query}"</p>
              <button
                onClick={() => submit(query)}
                className="mt-3 text-sm text-charcoal underline underline-offset-4"
              >
                View all results in shop
              </button>
            </div>
          )}

          {query && results.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Products ({results.length})
              </p>
              {results.map((p) => (
                <button
                  key={p.id}
                  onClick={() => pickProduct(p.id)}
                  className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-accent"
                >
                  <img src={p.images[0]} alt={p.name} className="h-12 w-12 rounded-md object-cover" loading="lazy" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="text-xs capitalize text-muted-foreground">{p.category} · {p.collection}</p>
                  </div>
                  <p className="text-sm font-semibold">{formatINR(p.price)}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
