"use client";

import { useState, useEffect, useRef } from "react";
import { useStore } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Droplets,
  Heart,
  ShoppingBag,
  Pause,
  Play,
  Flame,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSlide {
  id: string;
  chapter: string;
  tagline: string;
  titlePrimary: string;
  titleItalic: string;
  description: string;
  collectionSlug: string;
  badge: string;
  image: string;
  mobileImage: string;
  accentColor: string;
  featuredProduct: {
    id: string;
    name: string;
    tagline: string;
    price: number;
    mrp: number;
    image: string;
    badgeText: string;
  };
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: "celeste",
    chapter: "CHAPTER 01 / CELESTE",
    tagline: "AUTUMN / FESTIVE '26 EDITORIAL",
    titlePrimary: "The Fine Art of",
    titleItalic: "Demi-Fine Radiance",
    description:
      "Handcrafted in 18K gold vermeil and luminous freshwater pearls. Designed to move effortlessly from morning rituals to moonlit celebrations.",
    collectionSlug: "celeste",
    badge: "18K Gold Plated • Waterproof",
    image:
      "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=2000&q=85",
    mobileImage:
      "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=1100&q=85",
    accentColor: "#c9a96a",
    featuredProduct: {
      id: "p1",
      name: "Aurora Pearl Drop Earrings",
      tagline: "Lustrous Faux Pearls & Cubic Zirconia",
      price: 1299,
      mrp: 2199,
      image:
        "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?auto=format&fit=crop&w=400&q=80",
      badgeText: "Bestseller",
    },
  },
  {
    id: "noir",
    chapter: "CHAPTER 02 / NOIR",
    tagline: "AFTER-DARK STATEMENT EDIT",
    titlePrimary: "Unapologetic Opulence,",
    titleItalic: "Sculpted in Gold",
    description:
      "Intricately set kundan, faceted crystals, and antique gold finishes. Majestic heritage motifs re-imagined for the contemporary tastemaker.",
    collectionSlug: "noir",
    badge: "Hand-Finished Heritage • Anti-Tarnish",
    image:
      "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?auto=format&fit=crop&w=2000&q=85",
    mobileImage:
      "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?auto=format&fit=crop&w=1100&q=85",
    accentColor: "#d4af37",
    featuredProduct: {
      id: "p4",
      name: "Royal Kundan Choker Set",
      tagline: "Bridal Antique Gold with Pearls",
      price: 2999,
      mrp: 4999,
      image:
        "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=400&q=80",
      badgeText: "Festive Pick",
    },
  },
  {
    id: "lumiere",
    chapter: "CHAPTER 03 / LUMIÈRE",
    tagline: "NEW LIGHT REFRACTED",
    titlePrimary: "Everyday Crystals,",
    titleItalic: "Modern Architecture",
    description:
      "Precision-cut crystals paired with fluid, everyday contours. Minimalist tennis chokers, signet rings, and sculpted cuffs crafted to layer.",
    collectionSlug: "lumiere",
    badge: "Hypoallergenic • Skin-Safe Comfort",
    image:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=2000&q=85",
    mobileImage:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1100&q=85",
    accentColor: "#e6c987",
    featuredProduct: {
      id: "p2",
      name: "Luna Crystal Hoop Earrings",
      tagline: "Comfort-Fit Latch Back with Crystals",
      price: 999,
      mrp: 1799,
      image:
        "https://images.unsplash.com/photo-1630012642933-07c3e2d35d6b?auto=format&fit=crop&w=400&q=80",
      badgeText: "Trending",
    },
  },
];

const PROMO_COLLECTIONS = [
  {
    id: "celeste-pearls",
    name: "Celeste Pearl Edit",
    subtitle: "Organic drops & chokers",
    priceTag: "From ₹1,299",
    tag: "Trending",
    collection: "celeste",
    image:
      "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "waterproof-gold",
    name: "Waterproof Everyday",
    subtitle: "Sweatproof 18k PVD coating",
    priceTag: "From ₹799",
    tag: "Waterproof",
    collection: "lumiere",
    image:
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "noir-festive",
    name: "Noir Grandeur",
    subtitle: "Kundan & statement pieces",
    priceTag: "Flat 20% Off",
    tag: "Festive",
    collection: "noir",
    image:
      "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "stackable-rings",
    name: "Stackable Bands",
    subtitle: "Solitaires & textured bands",
    priceTag: "From ₹899",
    tag: "Must-Have",
    category: "rings",
    image:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "statement-hoops",
    name: "Sculpted Huggies & Hoops",
    subtitle: "Featherlight all-day wear",
    priceTag: "From ₹999",
    tag: "Bestseller",
    category: "earrings",
    image:
      "https://images.unsplash.com/photo-1630012642933-07c3e2d35d6b?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "tennis-cuffs",
    name: "Tennis & Charm Bracelets",
    subtitle: "Precision-set brilliance",
    priceTag: "From ₹1,199",
    tag: "New In",
    category: "bracelets",
    image:
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=300&q=80",
  },
];

export function EditorialHero() {
  const navigate = useStore((s) => s.navigate);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showProductCard, setShowProductCard] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const SLIDE_DURATION = 6500; // 6.5s per slide

  const slide = HERO_SLIDES[currentSlide];

  // Auto advance slides
  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, SLIDE_DURATION);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentSlide, isPaused]);

  const goToSlide = (idx: number) => {
    setCurrentSlide(idx);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  return (
    <div
      className="relative w-full bg-[#11100f] text-ivory overflow-hidden select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Editorial Decorative Background Elements */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-champagne/15 via-transparent to-transparent opacity-60" />
      <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-champagne/10 blur-3xl" />

      {/* Main Hero Container */}
      <div className="relative min-h-[620px] lg:min-h-[720px] flex flex-col justify-between">
        {/* Background Image Carousel with Ken Burns subtle scale */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 h-full w-full"
            >
              <img
                src={slide.image}
                alt={slide.titlePrimary}
                className="hidden md:block h-full w-full object-cover object-[center_35%]"
              />
              <img
                src={slide.mobileImage}
                alt={slide.titlePrimary}
                className="block md:hidden h-full w-full object-cover object-[center_30%]"
              />
              {/* Luxury Multi-Stop Editorial Scrims */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#11100f] via-[#11100f]/60 to-[#11100f]/30 md:hidden" />
              <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-[#11100f] via-[#11100f]/85 to-transparent/20 w-3/4" />
              <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-[#11100f] via-transparent to-black/30" />
              {/* Delicate Editorial Gold Grain / Vignette */}
              <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Top Editorial Utility / Chapter Tracker */}
        <div className="relative z-20 mx-auto w-full max-w-7xl px-5 pt-8 sm:px-8 lg:px-12 flex items-center justify-between">
          <div className="inline-flex items-center gap-3">
            <span className="flex h-2 w-2 rounded-full bg-champagne animate-pulse" />
            <span className="text-[11px] font-medium uppercase tracking-[0.35em] text-champagne/90">
              {slide.chapter}
            </span>
          </div>

          {/* Pause / Play + Quick Slide Counter */}
          <div className="flex items-center gap-3 text-xs tracking-widest text-ivory/70">
            <span className="font-serif text-sm text-ivory">0{currentSlide + 1}</span>
            <span className="text-white/30">/</span>
            <span className="text-white/40">0{HERO_SLIDES.length}</span>
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="ml-2 rounded-full border border-white/20 p-1.5 text-ivory/70 transition hover:border-champagne hover:text-champagne"
              aria-label={isPaused ? "Play slideshow" : "Pause slideshow"}
            >
              {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
            </button>
          </div>
        </div>

        {/* Middle Stage: Editorial Copy (Left) + Interactive Hotspot (Right) */}
        <div className="relative z-20 mx-auto w-full max-w-7xl flex-1 px-5 py-8 sm:px-8 lg:px-12 flex items-center">
          <div className="grid w-full items-center gap-8 lg:grid-cols-12">
            {/* Left 7 Columns: Editorial Headline, Story, and Actions */}
            <div className="lg:col-span-7 xl:col-span-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={slide.id}
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                  className="max-w-2xl"
                >
                  {/* Eyebrow with gold jewel glyph */}
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-champagne/30 bg-champagne/10 px-3 py-1 text-[10px] sm:text-xs font-medium uppercase tracking-[0.25em] text-champagne backdrop-blur-md">
                      <Sparkles className="h-3 w-3 text-champagne" />
                      {slide.tagline}
                    </span>
                    <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] tracking-wider text-ivory/70">
                      <Award className="h-3 w-3 text-champagne" />
                      {slide.badge}
                    </span>
                  </div>

                  {/* Editorial Masthead Title */}
                  <h1 className="font-serif text-3xl leading-[1.12] sm:text-5xl lg:text-6xl tracking-tight text-ivory">
                    {slide.titlePrimary}{" "}
                    <span className="italic block mt-1 font-serif font-light text-champagne bg-gradient-to-r from-[#e8cf9b] via-[#f7e7c4] to-[#c9a96a] bg-clip-text text-transparent">
                      {slide.titleItalic}
                    </span>
                  </h1>

                  {/* Refined editorial narrative */}
                  <p className="mt-5 max-w-xl text-sm leading-relaxed text-ivory/75 sm:text-base md:text-lg font-light">
                    {slide.description}
                  </p>

                  {/* High-Impact "Shop Now" Primary CTA & Secondary Action */}
                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    <Button
                      onClick={() => navigate("shop", { collection: slide.collectionSlug })}
                      size="lg"
                      className="group relative overflow-hidden bg-champagne text-charcoal hover:brightness-110 font-medium px-8 py-6 text-sm tracking-widest uppercase transition-all shadow-[0_10px_30px_rgba(201,169,106,0.25)] hover:shadow-[0_15px_35px_rgba(201,169,106,0.4)] active:scale-[0.98]"
                    >
                      {/* Shimmer sweep animation */}
                      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                      <span className="relative z-10 flex items-center gap-2 font-semibold">
                        Shop Now
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </span>
                    </Button>

                    <Button
                      onClick={() => navigate("shop", { filter: "collections" })}
                      size="lg"
                      variant="outline"
                      className="border-white/25 bg-black/30 backdrop-blur-md text-ivory hover:border-champagne hover:bg-champagne/10 hover:text-champagne font-medium px-6 py-6 text-sm tracking-wider uppercase transition-all"
                    >
                      Explore Collections
                    </Button>
                  </div>

                  {/* Editorial Trust Accents */}
                  <div className="mt-10 flex flex-wrap items-center gap-y-3 gap-x-6 border-t border-white/10 pt-6 text-xs text-ivory/70">
                    <div className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-champagne" />
                      <span>100% Waterproof & Anti-Tarnish</span>
                    </div>
                    <div className="h-3 w-px bg-white/20 hidden sm:block" />
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-champagne" />
                      <span>Certified Hypoallergenic</span>
                    </div>
                    <div className="h-3 w-px bg-white/20 hidden md:block" />
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-champagne" />
                      <span>Complimentary Luxury Gift Box</span>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right 5 Columns: Floating "Shop The Look" Editorial Hotspot */}
            <div className="lg:col-span-5 xl:col-span-4 hidden md:flex flex-col justify-end items-end">
              <AnimatePresence mode="wait">
                <motion.div
                  key={slide.featuredProduct.id}
                  initial={{ opacity: 0, x: 20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -15, scale: 0.95 }}
                  transition={{ duration: 0.55, delay: 0.15 }}
                  className="relative group"
                >
                  {/* Floating Pulsing Hotspot Marker */}
                  <div className="mb-3 flex items-center justify-end gap-2 text-xs text-champagne">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-champagne opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-champagne" />
                    </span>
                    <span className="uppercase font-medium tracking-[0.2em] text-[11px] text-ivory/80">
                      Featured in this Look
                    </span>
                  </div>

                  {/* Glassmorphic Editorial Product Card */}
                  <div className="w-80 rounded-xl border border-white/15 bg-black/60 p-4 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] transition-all duration-300 hover:border-champagne/50 hover:bg-black/75">
                    <div className="flex gap-3.5">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-900 border border-white/10">
                        <img
                          src={slide.featuredProduct.image}
                          alt={slide.featuredProduct.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <span className="absolute left-1 top-1 rounded bg-champagne/90 px-1 py-0.5 text-[9px] font-semibold text-charcoal uppercase tracking-wider">
                          {slide.featuredProduct.badgeText}
                        </span>
                      </div>
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-champagne/90">
                            {slide.chapter.split("/")[1]?.trim() || "Shraddhanand Fine"}
                          </p>
                          <h2 className="font-serif text-sm font-medium text-ivory line-clamp-1 mt-0.5">
                            {slide.featuredProduct.name}
                          </h2>
                          <p className="text-[11px] text-ivory/60 line-clamp-1 mt-0.5">
                            {slide.featuredProduct.tagline}
                          </p>
                        </div>
                        <div className="flex items-baseline gap-2 mt-2">
                          <span className="font-serif text-sm font-semibold text-champagne">
                            ₹{slide.featuredProduct.price.toLocaleString("en-IN")}
                          </span>
                          <span className="text-xs text-ivory/40 line-through">
                            ₹{slide.featuredProduct.mrp.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate("product", { id: slide.featuredProduct.id })}
                      className="mt-3.5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-champagne/40 bg-champagne/10 py-2 text-xs font-medium text-champagne transition-all hover:bg-champagne hover:text-charcoal"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" />
                      View Piece & Styling Notes
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Bottom Editorial Bar: Slide Indicators & Controls */}
        <div className="relative z-20 border-t border-white/10 bg-black/40 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Slide Navigation Tabs */}
            <div className="flex w-full md:w-auto items-center justify-between sm:justify-start gap-2 sm:gap-6">
              {HERO_SLIDES.map((s, idx) => {
                const isActive = idx === currentSlide;
                return (
                  <button
                    key={s.id}
                    onClick={() => goToSlide(idx)}
                    className="group relative flex-1 sm:flex-none text-left py-1 text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-serif text-xs ${
                          isActive ? "text-champagne font-semibold" : "text-ivory/40 group-hover:text-ivory"
                        }`}
                      >
                        0{idx + 1}
                      </span>
                      <span
                        className={`tracking-wider uppercase text-[11px] ${
                          isActive
                            ? "text-ivory font-medium"
                            : "text-ivory/50 group-hover:text-ivory/80"
                        }`}
                      >
                        {s.id.charAt(0).toUpperCase() + s.id.slice(1)} Edit
                      </span>
                    </div>

                    {/* Progress countdown indicator line */}
                    <div className="mt-2 h-0.5 w-full bg-white/15 overflow-hidden rounded-full">
                      {isActive && (
                        <motion.div
                          key={`progress-${idx}-${currentSlide}`}
                          initial={{ width: "0%" }}
                          animate={{ width: isPaused ? "100%" : "100%" }}
                          transition={{
                            duration: isPaused ? 0 : SLIDE_DURATION / 1000,
                            ease: "linear",
                          }}
                          className="h-full bg-champagne"
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Manual Slide Arrow Steppers */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={prevSlide}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/5 text-ivory backdrop-blur-sm transition-all hover:border-champagne hover:bg-champagne/20 hover:text-champagne active:scale-95"
                aria-label="Previous editorial slide"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={nextSlide}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/5 text-ivory backdrop-blur-sm transition-all hover:border-champagne hover:bg-champagne/20 hover:text-champagne active:scale-95"
                aria-label="Next editorial slide"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Rotating / Scrolling Promotional Collection Ribbon */}
      <section className="relative z-20 border-y border-white/10 bg-[#161514] text-ivory py-4">
        {/* Subtle Section Kicker */}
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-champagne">
            <Flame className="h-3 w-3 text-champagne" />
            <span>Curated Promotional Edits</span>
          </div>
          <button
            onClick={() => navigate("shop", { filter: "collections" })}
            className="text-[11px] text-ivory/60 hover:text-champagne transition-colors flex items-center gap-1 group"
          >
            <span>View All Curations</span>
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Horizontal Scrolling Collection Cards Strip */}
        <div className="relative overflow-x-auto no-scrollbar px-5 sm:px-8 lg:px-12">
          <div className="flex items-center gap-3.5 pb-1">
            {PROMO_COLLECTIONS.map((promo) => (
              <button
                key={promo.id}
                onClick={() => {
                  if (promo.collection) {
                    navigate("shop", { collection: promo.collection });
                  } else if (promo.category) {
                    navigate("shop", { category: promo.category });
                  } else {
                    navigate("shop");
                  }
                }}
                className="group flex shrink-0 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-2 pr-4 backdrop-blur-md transition-all duration-300 hover:border-champagne/50 hover:bg-white/[0.08] active:scale-[0.98]"
              >
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-neutral-800 border border-white/10">
                  <img
                    src={promo.image}
                    alt={promo.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <p className="font-serif text-xs font-medium text-ivory group-hover:text-champagne transition-colors">
                      {promo.name}
                    </p>
                    <span className="rounded bg-champagne/15 px-1.5 py-0.2 text-[9px] font-medium text-champagne">
                      {promo.tag}
                    </span>
                  </div>
                  <p className="text-[10px] text-ivory/60 mt-0.5">{promo.subtitle}</p>
                  <p className="text-[11px] font-semibold text-champagne mt-0.5">
                    {promo.priceTag}
                  </p>
                </div>
                <div className="ml-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/5 text-ivory/40 transition group-hover:bg-champagne group-hover:text-charcoal">
                  <ArrowRight className="h-3 w-3" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
