"use client";

import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { Reel } from "@/lib/types";
import { ReelCard } from "./ReelCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReelCarouselProps {
  reels: Reel[];
  onOpenViewer: (reel: Reel) => void;
  onShopLook: (reel: Reel, e: React.MouseEvent) => void;
}

export function ReelCarousel({ reels, onOpenViewer, onShopLook }: ReelCarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    containScroll: false,
    loop: true,
    skipSnaps: false,
  });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  if (!reels.length) return null;

  return (
    <div className="relative w-full">
      {/* Embla Viewport */}
      <div className="overflow-hidden py-4 sm:py-6" ref={emblaRef}>
        <div className="flex -ml-3 sm:-ml-4 md:-ml-6 items-center">
          {reels.map((reel, index) => {
            const isCenter = index === selectedIndex;
            return (
              <div
                key={reel.id}
                className="pl-3 sm:pl-4 md:pl-6 shrink-0 basis-[76%] sm:basis-[48%] md:basis-[34%] lg:basis-[22%] flex justify-center"
              >
                <ReelCard
                  reel={reel}
                  isCenter={isCenter}
                  onOpenViewer={onOpenViewer}
                  onShopLook={onShopLook}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Controls: Previous / Next buttons */}
      <div className="hidden sm:flex items-center justify-between absolute inset-y-0 -inset-x-3 md:-inset-x-5 pointer-events-none z-30">
        <button
          onClick={scrollPrev}
          className="pointer-events-auto flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-background/90 text-foreground backdrop-blur-md border border-border shadow-md hover:bg-champagne hover:text-charcoal hover:border-champagne transition-all active:scale-95 cursor-pointer"
          aria-label="Previous reel"
        >
          <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>

        <button
          onClick={scrollNext}
          className="pointer-events-auto flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-background/90 text-foreground backdrop-blur-md border border-border shadow-md hover:bg-champagne hover:text-charcoal hover:border-champagne transition-all active:scale-95 cursor-pointer"
          aria-label="Next reel"
        >
          <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      </div>

      {/* Pagination Dot Indicators */}
      <div className="mt-4 sm:mt-6 flex items-center justify-center gap-1.5">
        {reels.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300 cursor-pointer",
              i === selectedIndex
                ? "w-6 bg-champagne"
                : "w-1.5 bg-border hover:bg-muted-foreground/60"
            )}
            aria-label={`Go to reel ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
