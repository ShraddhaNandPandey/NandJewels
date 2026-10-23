"use client";

import { useState, useRef, useEffect } from "react";
import type { Reel } from "@/lib/types";
import { Play, Volume2, VolumeX, ShoppingBag, Instagram, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReelCardProps {
  reel: Reel;
  isCenter: boolean;
  onOpenViewer: (reel: Reel) => void;
  onShopLook: (reel: Reel, e: React.MouseEvent) => void;
}

export function ReelCard({ reel, isCenter, onOpenViewer, onShopLook }: ReelCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Play video ONLY when this card is the emphasized center card
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isCenter) {
      video.muted = isMuted;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => {
            // Autoplay blocked by browser policy without user gesture
            setIsPlaying(false);
          });
      }
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [isCenter, isMuted]);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const productCount = reel.productIds?.length || 0;

  return (
    <div
      onClick={() => onOpenViewer(reel)}
      className={cn(
        "group relative aspect-[9/16] w-full max-w-[280px] sm:max-w-[300px] cursor-pointer overflow-hidden rounded-2xl border bg-black shadow-lg transition-all duration-500 select-none",
        isCenter
          ? "border-champagne/80 ring-2 ring-champagne/40 scale-100 sm:scale-105 z-10 shadow-2xl"
          : "border-border/60 opacity-80 sm:opacity-60 scale-95 hover:opacity-90 hover:scale-100 hover:border-champagne/40"
      )}
    >
      {/* 1. Poster Image (Always rendered first for instant zero-lag loading) */}
      <img
        src={reel.posterUrl}
        alt={reel.title}
        loading="lazy"
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105",
          isCenter && videoLoaded ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
      />

      {/* 2. Video Player: Rendered ONLY when this reel is active/centered to prevent unnecessary bandwidth consumption */}
      {isCenter && (
        <video
          ref={videoRef}
          src={reel.videoUrl}
          poster={reel.posterUrl}
          playsInline
          loop
          muted={isMuted}
          onLoadedData={() => setVideoLoaded(true)}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
            videoLoaded ? "opacity-100" : "opacity-0"
          )}
        />
      )}

      {/* Top badges & controls */}
      <div className="absolute inset-x-0 top-0 p-3 flex items-center justify-between z-20 bg-gradient-to-b from-black/70 via-black/30 to-transparent">
        {/* Category Pill */}
        <span className="inline-flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase text-ivory border border-white/20">
          <Sparkles className="h-3 w-3 text-champagne shrink-0" />
          {reel.category || "VRUNDORA"}
        </span>

        <div className="flex items-center gap-1.5">
          {/* Sound Toggle (Only visible if video is active) */}
          {isCenter && videoLoaded && (
            <button
              onClick={toggleMute}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-black/60 backdrop-blur-md text-ivory/90 hover:text-champagne transition border border-white/20"
              aria-label={isMuted ? "Unmute audio" : "Mute audio"}
            >
              {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            </button>
          )}

          {/* Instagram link badge if present */}
          {reel.instagramUrl && (
            <a
              href={reel.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-black/60 backdrop-blur-md text-ivory/90 hover:text-champagne transition border border-white/20"
              aria-label="View on Instagram"
              title="Open Instagram Reel"
            >
              <Instagram className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Center Play Indicator on inactive or hovered cards */}
      {(!isCenter || !isPlaying) && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-charcoal/80 text-champagne backdrop-blur-md border border-champagne/40 transition-transform duration-300 group-hover:scale-110 shadow-lg">
            <Play className="h-5 w-5 fill-champagne ml-0.5" />
          </div>
        </div>
      )}

      {/* Bottom Content Gradient Overlay */}
      <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-4 z-20 bg-gradient-to-t from-black/95 via-black/70 to-transparent flex flex-col justify-end text-ivory">
        <h3 className="font-serif text-sm sm:text-base font-bold tracking-tight text-ivory line-clamp-1 drop-shadow-sm">
          {reel.title}
        </h3>
        {reel.caption && (
          <p className="mt-1 text-[11px] text-ivory/80 line-clamp-2 leading-relaxed">
            {reel.caption}
          </p>
        )}

        {/* Action strip */}
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/15 pt-2.5">
          {productCount > 0 ? (
            <button
              onClick={(e) => onShopLook(reel, e)}
              className="inline-flex items-center gap-1.5 rounded-full bg-champagne text-charcoal px-3 py-1 text-[10px] sm:text-xs font-semibold transition hover:brightness-105 active:scale-95 shadow-sm"
            >
              <ShoppingBag className="h-3 w-3" />
              <span>Shop Look</span>
              <span className="rounded-full bg-charcoal/15 px-1 py-0.2 text-[9px] font-bold">
                {productCount}
              </span>
            </button>
          ) : (
            <span className="text-[10px] text-champagne uppercase tracking-wider font-semibold">
              VRUNDORA Style
            </span>
          )}

          <span className="text-[10px] text-ivory/60 uppercase tracking-widest font-medium">
            Watch Full ↗
          </span>
        </div>
      </div>
    </div>
  );
}
