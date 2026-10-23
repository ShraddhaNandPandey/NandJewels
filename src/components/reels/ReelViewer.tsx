"use client";

import { useState, useRef, useEffect } from "react";
import type { Reel, Product } from "@/lib/types";
import { products as allProducts } from "@/data/products";
import {
  X,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ShoppingBag,
  Instagram,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ReelViewerProps {
  reel: Reel;
  initialShowProducts?: boolean;
  onClose: () => void;
  onNavigateProduct: (productId: string) => void;
}

export function ReelViewer({
  reel,
  initialShowProducts = false,
  onClose,
  onNavigateProduct,
}: ReelViewerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(initialShowProducts);

  // Retrieve linked products from existing product catalog
  const linkedProducts: Product[] = (reel.productIds || [])
    .map((id) => allProducts.find((p) => p.id === id || p.slug === id))
    .filter((p): p is Product => Boolean(p));

  // Auto-play on mount and handle keyboard escape
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = isMuted;
      video.play().catch(() => setIsPlaying(false));
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    // Prevent background scrolling while modal is open
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      if (video) {
        video.pause();
        video.removeAttribute("src");
        video.load();
      }
    };
  }, [onClose, isMuted]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (video) {
      video.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4 md:p-6 animate-fade-up">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-charcoal/80 text-ivory hover:text-champagne border border-white/20 transition-all cursor-pointer shadow-lg active:scale-95"
        aria-label="Close reel viewer"
      >
        <X className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>

      {/* Main Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 flex flex-col lg:flex-row h-full max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-charcoal shadow-2xl"
      >
        {/* Left Side: 9:16 Video Stage */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[50vh] lg:min-h-0">
          <video
            ref={videoRef}
            src={reel.videoUrl}
            poster={reel.posterUrl}
            playsInline
            loop
            onClick={togglePlay}
            onTimeUpdate={handleTimeUpdate}
            className="h-full w-full object-contain cursor-pointer"
          />

          {/* Top Info Bar inside video */}
          <div className="absolute inset-x-0 top-0 p-4 flex items-center justify-between z-30 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ivory border border-white/20">
              <Sparkles className="h-3.5 w-3.5 text-champagne shrink-0" />
              {reel.category || "VRUNDORA"}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-black/60 backdrop-blur-md text-ivory hover:text-champagne border border-white/20 transition"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>

              {reel.instagramUrl && (
                <a
                  href={reel.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-black/60 backdrop-blur-md text-ivory hover:text-champagne border border-white/20 transition"
                  title="View original on Instagram"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          {/* Play/Pause Overlay indicator when paused */}
          {!isPlaying && (
            <div
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center z-20 cursor-pointer bg-black/30"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-charcoal/80 text-champagne border border-champagne/40 shadow-2xl backdrop-blur-sm">
                <Play className="h-8 w-8 fill-champagne ml-1" />
              </div>
            </div>
          )}

          {/* Bottom Video Progress Bar */}
          <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 z-30">
            <div
              className="h-full bg-champagne transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Mobile Bottom Bar for Shop This Look toggle */}
          {linkedProducts.length > 0 && (
            <div className="lg:hidden absolute bottom-4 inset-x-4 z-30 flex justify-center">
              <button
                onClick={() => setSheetOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-full bg-champagne text-charcoal px-4 py-2 text-xs font-bold shadow-xl border border-charcoal/20 transition hover:brightness-105 active:scale-95 cursor-pointer"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Shop This Look ({linkedProducts.length})</span>
                {sheetOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
              </button>
            </div>
          )}
        </div>

        {/* Right Side on Desktop / Bottom Sheet on Mobile: "Shop This Look" & Details */}
        <div
          className={cn(
            "flex flex-col bg-card border-t lg:border-t-0 lg:border-l border-border transition-all duration-300 z-40 overflow-hidden",
            "lg:w-[380px] lg:h-full",
            // Mobile bottom sheet styles
            sheetOpen
              ? "max-h-[60vh] p-4 sm:p-5"
              : "hidden lg:flex p-5"
          )}
        >
          {/* Reel Header & Caption */}
          <div className="border-b border-border pb-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-champagne">
                VRUNDORA Reel
              </span>
              {reel.instagramUrl && (
                <a
                  href={reel.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-foreground/70 hover:text-champagne transition"
                >
                  <Instagram className="h-3.5 w-3.5" />
                  <span>Instagram</span>
                </a>
              )}
            </div>
            <h2 className="mt-1 font-serif text-lg sm:text-xl font-bold text-foreground">
              {reel.title}
            </h2>
            {reel.caption && (
              <p className="mt-1.5 text-xs text-foreground/80 leading-relaxed line-clamp-3">
                {reel.caption}
              </p>
            )}
          </div>

          {/* Products List */}
          <div className="flex-1 overflow-y-auto scroll-area-custom py-4 space-y-3">
            <div className="flex items-center gap-2 pb-1">
              <ShoppingBag className="h-4 w-4 text-champagne" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Featured Jewellery ({linkedProducts.length})
              </h3>
            </div>

            {linkedProducts.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No products linked to this look.
              </div>
            ) : (
              linkedProducts.map((p) => {
                const discount = p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;
                return (
                  <div
                    key={p.id}
                    onClick={() => onNavigateProduct(p.id)}
                    className="group flex items-center gap-3 rounded-xl border border-border p-2.5 bg-background hover:border-champagne/50 hover:shadow-md transition-all cursor-pointer"
                  >
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="h-16 w-16 rounded-lg object-cover border border-border shrink-0 transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate group-hover:text-charcoal transition-colors">
                        {p.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                        {p.collection} Collection
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground">₹{p.price.toLocaleString("en-IN")}</span>
                        {p.mrp > p.price && (
                          <span className="text-[10px] text-muted-foreground line-through">
                            ₹{p.mrp.toLocaleString("en-IN")}
                          </span>
                        )}
                        {discount > 0 && (
                          <span className="rounded bg-champagne/20 text-charcoal px-1.5 py-0.2 text-[9px] font-semibold">
                            {discount}% OFF
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateProduct(p.id);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-foreground group-hover:bg-champagne group-hover:text-charcoal transition shrink-0"
                      title="View product"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Actions */}
          <div className="border-t border-border pt-3">
            <button
              onClick={onClose}
              className="w-full rounded-md border border-border py-2 text-xs font-semibold hover:bg-accent transition"
            >
              Continue Browsing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
