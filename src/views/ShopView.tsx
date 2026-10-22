"use client";

import { useMemo, useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { products as allProducts } from "@/data/products";
import { categories, getCategory } from "@/data/categories";
import { collections } from "@/data/products";
import { ProductCard } from "@/components/product/ProductCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SlidersHorizontal, X, Star, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const allColors = [
  { id: "gold", name: "Gold-tone", hex: "#c9a96a" },
  { id: "silver", name: "Silver-tone", hex: "#c7c9cc" },
  { id: "rose", name: "Rose-gold", hex: "#d8a9a0" },
  { id: "pearl", name: "Pearl White", hex: "#f3ece4" },
];

const sortOptions = [
  { value: "recommended", label: "Recommended" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Customer Rating" },
  { value: "popular", label: "Most Popular" },
];

const PRICE_MAX = 7000;

export function ShopView() {
  const params = useStore((s) => s.params);
  const navigate = useStore((s) => s.navigate);

  const initialCategory = params.category || "";
  const filterParam = params.filter || "";
  const collectionParam = params.collection || "";
  const queryParam = params.q || "";

  const [selectedCats, setSelectedCats] = useState<string[]>(initialCategory ? [initialCategory] : []);
  const [priceRange, setPriceRange] = useState<number[]>([0, PRICE_MAX]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [onlyNew, setOnlyNew] = useState(filterParam === "new");
  const [onlyBest, setOnlyBest] = useState(filterParam === "best");
  const [onlyDiscount, setOnlyDiscount] = useState(false);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<string>(
    collectionParam ? collectionParam.charAt(0).toUpperCase() + collectionParam.slice(1) : ""
  );
  const [sort, setSort] = useState("recommended");
  const [showCollections, setShowCollections] = useState(filterParam === "collections");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sync when navigating into shop with new params
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedCats(params.category ? [params.category] : []);
    setOnlyNew(params.filter === "new");
    setOnlyBest(params.filter === "best");
    setShowCollections(params.filter === "collections");
    if (params.collection) {
      setSelectedCollection(params.collection.charAt(0).toUpperCase() + params.collection.slice(1));
      setShowCollections(true);
    } else if (params.filter !== "collections") {
      setSelectedCollection("");
    }
  }, [params.category, params.filter, params.collection, params.q]);

  const storeProducts = useStore((s) => s.products || allProducts);

  const filtered = useMemo(() => {
    let list = [...storeProducts];

    if (queryParam) {
      const q = queryParam.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.tags.some((t) => t.includes(q)) ||
          p.collection.toLowerCase().includes(q) ||
          p.category.includes(q) ||
          (p.productType && p.productType.includes(q))
      );
    }
    if (selectedCats.length) list = list.filter((p) => selectedCats.includes(p.category));
    if (selectedCollection) list = list.filter((p) => p.collection === selectedCollection);
    list = list.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);
    if (selectedColors.length)
      list = list.filter((p) => p.colors.some((c) => selectedColors.includes(c.id)));
    if (minRating > 0) list = list.filter((p) => p.rating >= minRating);
    if (onlyNew) list = list.filter((p) => p.newArrival);
    if (onlyBest) list = list.filter((p) => p.bestseller);
    if (onlyDiscount) list = list.filter((p) => p.mrp > p.price);
    if (onlyInStock) list = list.filter((p) => (p.productType === "combo" ? p.stock > 0 : p.stock > 0));

    switch (sort) {
      case "newest":
        list.sort((a, b) => Number(b.newArrival) - Number(a.newArrival));
        break;
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      case "popular":
        list.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
    }
    return list;
  }, [selectedCats, selectedCollection, priceRange, selectedColors, minRating, onlyNew, onlyBest, onlyDiscount, onlyInStock, sort, queryParam]);

  const activeFiltersCount =
    selectedCats.length +
    selectedColors.length +
    (minRating > 0 ? 1 : 0) +
    (onlyNew ? 1 : 0) +
    (onlyBest ? 1 : 0) +
    (onlyDiscount ? 1 : 0) +
    (onlyInStock ? 1 : 0) +
    (selectedCollection ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < PRICE_MAX ? 1 : 0);

  const clearAll = () => {
    setSelectedCats([]);
    setPriceRange([0, PRICE_MAX]);
    setSelectedColors([]);
    setMinRating(0);
    setOnlyNew(false);
    setOnlyBest(false);
    setOnlyDiscount(false);
    setOnlyInStock(false);
    setSelectedCollection("");
    navigate("shop", {});
  };

  const title = queryParam
    ? `Search: "${queryParam}"`
    : selectedCats.length === 1
    ? getCategory(selectedCats[0])?.name || "Shop"
    : selectedCollection
    ? `${selectedCollection} Collection`
    : filterParam === "new"
    ? "New Arrivals"
    : filterParam === "best"
    ? "Bestsellers"
    : filterParam === "collections"
    ? "Collections"
    : "Shop All Jewellery";

  const FilterPanel = (
    <div className="space-y-7">
      {/* Collections */}
      <FilterGroup title="Collection">
        {collections.map((c) => (
          <label key={c.id} className="flex cursor-pointer items-center gap-2 text-sm">
            <Checkbox
              checked={selectedCollection === c.name}
              onCheckedChange={(v) => setSelectedCollection(v ? c.name : "")}
            />
            <span className="capitalize">{c.name}</span>
          </label>
        ))}
      </FilterGroup>

      {/* Categories */}
      <FilterGroup title="Category">
        {categories.map((c) => (
          <label key={c.id} className="flex cursor-pointer items-center gap-2 text-sm">
            <Checkbox
              checked={selectedCats.includes(c.slug)}
              onCheckedChange={(v) =>
                setSelectedCats((prev) =>
                  v ? [...prev, c.slug] : prev.filter((s) => s !== c.slug)
                )
              }
            />
            <span>{c.name}</span>
          </label>
        ))}
      </FilterGroup>

      {/* Price */}
      <FilterGroup title="Price">
        <div className="px-1">
          <Slider
            min={0}
            max={PRICE_MAX}
            step={100}
            value={priceRange}
            onValueChange={setPriceRange}
            className="mt-2"
          />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>₹{priceRange[0].toLocaleString("en-IN")}</span>
            <span>₹{priceRange[1].toLocaleString("en-IN")}</span>
          </div>
        </div>
      </FilterGroup>

      {/* Color */}
      <FilterGroup title="Colour">
        <div className="flex flex-wrap gap-2">
          {allColors.map((c) => {
            const active = selectedColors.includes(c.id);
            return (
              <button
                key={c.id}
                onClick={() =>
                  setSelectedColors((prev) =>
                    active ? prev.filter((x) => x !== c.id) : [...prev, c.id]
                  )
                }
                className={cn(
                  "flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs transition",
                  active ? "border-charcoal bg-charcoal text-ivory" : "border-border hover:border-charcoal"
                )}
              >
                <span className="h-3 w-3 rounded-full border border-black/10" style={{ background: c.hex }} />
                {c.name}
              </button>
            );
          })}
        </div>
      </FilterGroup>

      {/* Rating */}
      <FilterGroup title="Rating">
        {[4, 3, 2].map((r) => (
          <label key={r} className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="radio"
              name="rating"
              checked={minRating === r}
              onChange={() => setMinRating(r)}
              className="accent-charcoal"
            />
            <span className="inline-flex items-center gap-1">
              {r}★ <Star className="h-3 w-3 fill-champagne text-champagne" /> & up
            </span>
          </label>
        ))}
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input type="radio" name="rating" checked={minRating === 0} onChange={() => setMinRating(0)} className="accent-charcoal" />
          All ratings
        </label>
      </FilterGroup>

      {/* Toggles */}
      <FilterGroup title="Availability & tags">
        <Toggle label="New arrivals" checked={onlyNew} onChange={setOnlyNew} />
        <Toggle label="Bestsellers" checked={onlyBest} onChange={setOnlyBest} />
        <Toggle label="On sale" checked={onlyDiscount} onChange={setOnlyDiscount} />
        <Toggle label="In stock only" checked={onlyInStock} onChange={setOnlyInStock} />
      </FilterGroup>

      <Button variant="outline" className="w-full" onClick={clearAll}>
        Clear all filters
      </Button>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 animate-fade-up">
      <Breadcrumbs
        items={[
          { label: "Shop", view: "shop" },
          ...(queryParam ? [{ label: `Search: "${queryParam}"` }] : []),
          ...(selectedCats.length === 1
            ? [{ label: getCategory(selectedCats[0])?.name || "" }]
            : []),
          ...(selectedCollection ? [{ label: `${selectedCollection} Collection` }] : []),
        ]}
      />

      <div className="mt-4 flex flex-col gap-1">
        <h1 className="font-serif text-3xl sm:text-4xl">{title}</h1>
        <p className="text-sm text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? "piece" : "pieces"}
          {queryParam && " found"}
        </p>
      </div>

      <div className="mt-6 flex flex-col lg:flex-row gap-8">
        {/* Desktop filters */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-32 max-h-[calc(100vh-9rem)] overflow-y-auto scroll-area-custom pr-2">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-wider">Filters</p>
              {activeFiltersCount > 0 && (
                <button onClick={clearAll} className="text-xs text-charcoal underline underline-offset-2">
                  Clear ({activeFiltersCount})
                </button>
              )}
            </div>
            {FilterPanel}
          </div>
        </aside>

        {/* Products */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="mb-4 sm:mb-5 flex items-center justify-between gap-2 sm:gap-3 flex-wrap">
            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden h-9 text-xs sm:text-sm gap-1.5 shrink-0">
                  <SlidersHorizontal className="h-4 w-4" /> Filters
                  {activeFiltersCount > 0 && (
                    <span className="ml-1 rounded-full bg-charcoal px-1.5 py-0.2 text-[10px] text-ivory font-bold">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[85vw] max-w-sm overflow-y-auto scroll-area-custom p-4 sm:p-6">
                <SheetHeader>
                  <SheetTitle className="font-serif text-lg">Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-4 pb-8">{FilterPanel}</div>
              </SheetContent>
            </Sheet>

            <div className="hidden lg:flex flex-wrap items-center gap-1.5">
              {selectedCats.map((c) => (
                <ActiveChip key={c} label={getCategory(c)?.name || c} onRemove={() => setSelectedCats((p) => p.filter((x) => x !== c))} />
              ))}
              {selectedCollection && (
                <ActiveChip label={selectedCollection} onRemove={() => setSelectedCollection("")} />
              )}
              {selectedColors.map((c) => (
                <ActiveChip key={c} label={allColors.find((x) => x.id === c)?.name || c} onRemove={() => setSelectedColors((p) => p.filter((x) => x !== c))} />
              ))}
              {onlyNew && <ActiveChip label="New" onRemove={() => setOnlyNew(false)} />}
              {onlyBest && <ActiveChip label="Bestseller" onRemove={() => setOnlyBest(false)} />}
              {onlyDiscount && <ActiveChip label="On sale" onRemove={() => setOnlyDiscount(false)} />}
              {onlyInStock && <ActiveChip label="In stock" onRemove={() => setOnlyInStock(false)} />}
            </div>

            <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
              <span className="hidden sm:inline text-xs text-muted-foreground whitespace-nowrap">Sort by</span>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="h-9 w-36 sm:w-44 text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value} className="text-xs sm:text-sm">
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Mobile active filter chips */}
          {activeFiltersCount > 0 && (
            <div className="lg:hidden flex flex-wrap items-center gap-1.5 mb-4 pb-2 border-b border-border/60">
              {selectedCats.map((c) => (
                <ActiveChip key={c} label={getCategory(c)?.name || c} onRemove={() => setSelectedCats((p) => p.filter((x) => x !== c))} />
              ))}
              {selectedCollection && (
                <ActiveChip label={selectedCollection} onRemove={() => setSelectedCollection("")} />
              )}
              {selectedColors.map((c) => (
                <ActiveChip key={c} label={allColors.find((x) => x.id === c)?.name || c} onRemove={() => setSelectedColors((p) => p.filter((x) => x !== c))} />
              ))}
              {onlyNew && <ActiveChip label="New" onRemove={() => setOnlyNew(false)} />}
              {onlyBest && <ActiveChip label="Bestseller" onRemove={() => setOnlyBest(false)} />}
              {onlyDiscount && <ActiveChip label="On sale" onRemove={() => setOnlyDiscount(false)} />}
              {onlyInStock && <ActiveChip label="In stock" onRemove={() => setOnlyInStock(false)} />}
              <button onClick={clearAll} className="text-xs text-muted-foreground underline ml-1">
                Clear all
              </button>
            </div>
          )}

          {/* Grid */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 sm:py-20 text-center px-4">
              <p className="font-serif text-2xl">No pieces found</p>
              <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                Try adjusting your filters, price range, or search keywords.
              </p>
              <Button onClick={clearAll} className="mt-4 bg-charcoal text-ivory hover:bg-charcoal/90">
                Reset filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <Checkbox checked={checked} onCheckedChange={(v) => onChange(!!v)} />
      <span>{label}</span>
      {checked && <Check className="ml-auto h-3.5 w-3.5 text-charcoal" />}
    </label>
  );
}

function ActiveChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs">
      {label}
      <button onClick={onRemove} className="text-muted-foreground hover:text-foreground">
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
