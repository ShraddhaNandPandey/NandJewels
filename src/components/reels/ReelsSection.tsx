"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { useStore } from "@/store/useStore";
import type { Reel } from "@/lib/types";
import { initialReels } from "@/data/reels";
import { ReelCarousel } from "./ReelCarousel";
import { Instagram, Sparkles, ArrowRight } from "lucide-react";

// Lazy-load the heavy fullscreen viewer only when requested
const DynamicReelViewer = dynamic(
  () => import("./ReelViewer").then((mod) => mod.ReelViewer),
  { ssr: false }
);

export function ReelsSection() {
  const reels = useStore((s) => s.reels || initialReels);
  const navigate = useStore((s) => s.navigate);

  const [activeViewerReel, setActiveViewerReel] = useState<Reel | null>(null);
  const [initialShowProducts, setInitialShowProducts] = useState(false);

  // Filter only active reels and sort by order ascending
  const activeReels = useMemo(() => {
    return [...reels]
      .filter((r) => r.isActive)
      .sort((a, b) => a.order - b.order);
  }, [reels]);

  const handleOpenViewer = (reel: Reel) => {
    setInitialShowProducts(false);
    setActiveViewerReel(reel);
  };

  const handleShopLook = (reel: Reel, e: React.MouseEvent) => {
    e.stopPropagation();
    setInitialShowProducts(true);
    setActiveViewerReel(reel);
  };

  const handleNavigateProduct = (productId: string) => {
    setActiveViewerReel(null);
    navigate("product", { id: productId });
  };

  if (activeReels.length === 0) return null;

  return (
    <section className="relative overflow-hidden py-12 sm:py-16 md:py-20 border-b border-border bg-gradient-to-b from-background via-accent/20 to-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header as specified in requirements:
            @VRUNDORA.JEWELLERY
            STORIES IN EVERY SPARKLE
            Real moments. Real women. Real VRUNDORA.
        */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-champagne/15 border border-champagne/30 px-3 py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-charcoal">
            <Sparkles className="h-3.5 w-3.5 text-champagne shrink-0" />
            @VRUNDORA.JEWELLERY
          </div>

          <h2 className="mt-3 font-serif text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground uppercase">
            Stories in Every Sparkle
          </h2>

          <p className="mt-2 text-xs sm:text-sm text-muted-foreground font-sans tracking-wide">
            Real moments. Real women. Real VRUNDORA.
          </p>
        </div>

        {/* Carousel Component */}
        <div className="mt-8 sm:mt-10">
          <ReelCarousel
            reels={activeReels}
            onOpenViewer={handleOpenViewer}
            onShopLook={handleShopLook}
          />
        </div>

        {/* Bottom CTA: FOLLOW US ON INSTAGRAM */}
        <div className="mt-8 sm:mt-10 flex justify-center">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-charcoal/20 bg-background px-6 py-2.5 text-xs sm:text-sm font-semibold uppercase tracking-widest text-charcoal shadow-sm transition hover:bg-champagne hover:border-champagne active:scale-95 cursor-pointer"
          >
            <Instagram className="h-4 w-4" />
            <span>Follow Us on Instagram</span>
            <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
          </a>
        </div>
      </div>

      {/* Dynamic Fullscreen Viewer Modal */}
      {activeViewerReel && (
        <DynamicReelViewer
          reel={activeViewerReel}
          initialShowProducts={initialShowProducts}
          onClose={() => setActiveViewerReel(null)}
          onNavigateProduct={handleNavigateProduct}
        />
      )}
    </section>
  );
}
