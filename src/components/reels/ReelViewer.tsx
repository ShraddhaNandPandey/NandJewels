"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
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
  ExternalLink,
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
  // A reel has video ONLY if a non-empty videoUrl is provided
  const hasVideo = Boolean(reel.videoUrl && reel.videoUrl.trim().length > 0);
  const hasCover = Boolean(reel.posterUrl && reel.posterUrl.trim().length > 0);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Requirement #11: Initialize isPlaying to false and isMuted to true (must start muted for autoplay-safe launch)
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoReady, setVideoReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(initialShowProducts);

  // Retrieve linked products from existing catalog
  const linkedProducts: Product[] = (reel.productIds || [])
    .map((id) => allProducts.find((p) => p.id === id || p.slug === id))
    .filter((p): p is Product => Boolean(p));

  // Requirement #12 & #22: Initial playback lifecycle is completely independent of isMuted and onClose
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hasVideo) return;

    // Explicitly configure video before playback
    video.defaultMuted = true;
    video.muted = true;
    video.playsInline = true;

    let isMounted = true;

    const startPlay = () => {
      if (!isMounted) return;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            if (isMounted) {
              setIsPlaying(true);
              setVideoReady(true);
            }
          })
          .catch(() => {
            if (isMounted) {
              setIsPlaying(false);
            }
          });
      }
    };

    if (video.readyState >= 2) {
      startPlay();
    } else {
      video.addEventListener("canplay", startPlay, { once: true });
      video.addEventListener("loadeddata", startPlay, { once: true });
    }

    // Keyboard ESC listener
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    // Prevent background scrolling while modal is open
    document.body.style.overflow = "hidden";

    return () => {
      isMounted = false;
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      video.removeEventListener("canplay", startPlay);
      video.removeEventListener("loadeddata", startPlay);
      // Clean pause on close without tearing down the src during normal interaction
      video.pause();
    };
  }, [hasVideo, reel.videoUrl, onClose]);

  // Requirement #15: Separate mute toggle from playback lifecycle — no reload or restart
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (video) {
      const nextMuted = !isMuted;
      video.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  };

  // Requirement #16: Play/Pause button synchronized with actual video state
  const handleTogglePlay = () => {
    const video = videoRef.current;
    if (!video || !hasVideo) return;

    if (video.paused) {
      const promise = video.play();
      if (promise !== undefined) {
        promise
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Visual condition: video is visible only when it is actually playing and ready
  const isVideoVisible = hasVideo && videoReady && isPlaying;

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
        {/* Left Side: 9:16 Video / Cover Stage */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[50vh] lg:min-h-0">
          {/* Requirement #13: Poster/Fallback is ALWAYS rendered underneath so user never sees a black/dark rectangle */}
          {hasCover ? (
            <img
              src={reel.posterUrl}
              alt={reel.title}
              className={cn(
                "absolute inset-0 h-full w-full object-contain transition-opacity duration-300",
                isVideoVisible ? "opacity-0 pointer-events-none" : "opacity-100"
              )}
            />
          ) : (
            <div
              className={cn(
                "absolute inset-0 w-full h-full flex flex-col justify-between p-8 bg-gradient-to-b from-stone-900 via-stone-950 to-black text-ivory text-center",
                isVideoVisible ? "opacity-0 pointer-events-none" : "opacity-100"
              )}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(201,169,106,0.22),transparent_70%)] pointer-events-none" />

              <div className="relative z-10 pt-8 flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-champagne/20 border border-champagne/40 flex items-center justify-center mb-3 shadow-lg">
                  <Sparkles className="w-7 h-7 text-champagne" />
                </div>
                <p className="text-xs uppercase tracking-[0.3em] text-champagne font-bold">
                  VRUNDORA
                </p>
                <p className="text-[11px] uppercase tracking-wider text-ivory/60 mt-1">
                  @VRUNDORA.JEWELLERY
                </p>
              </div>

              <div className="relative z-10 px-4 my-auto">
                <span className="inline-block px-3 py-1 rounded-full text-[10px] uppercase tracking-wider bg-champagne/20 text-champagne border border-champagne/40 mb-3 font-semibold">
                  {reel.category || "Stories In Every Sparkle"}
                </span>
                <h3 className="font-serif text-2xl font-bold text-ivory leading-tight drop-shadow-md">
                  {reel.title}
                </h3>
                {reel.caption && (
                  <p className="text-xs text-ivory/80 mt-2 font-light line-clamp-3 leading-relaxed">
                    {reel.caption}
                  </p>
                )}
              </div>

              <div className="relative z-10 pb-4">
                {reel.instagramUrl && !hasVideo && (
                  <a
                    href={reel.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-3 px-5 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-semibold hover:brightness-110 transition shadow-lg"
                  >
                    <Instagram className="w-4 h-4" />
                    <span>Watch on Instagram</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* HTML5 Video element — only rendered when valid videoUrl exists */}
          {hasVideo && (
            <video
              ref={videoRef}
              src={reel.videoUrl}
              poster={reel.posterUrl}
              playsInline
              autoPlay
              muted={isMuted}
              loop
              onClick={handleTogglePlay}
              onTimeUpdate={handleTimeUpdate}
              onLoadedData={() => setVideoReady(true)}
              onCanPlay={() => setVideoReady(true)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              className={cn(
                "h-full w-full object-contain cursor-pointer transition-opacity duration-300",
                isVideoVisible ? "opacity-100" : "opacity-0 pointer-events-none"
              )}
            />
          )}

          {/* Requirement #14: Play/Pause Overlay indicator when paused or autoplay blocked */}
          {hasVideo && !isPlaying && (
            <div
              onClick={handleTogglePlay}
              className="absolute inset-0 flex items-center justify-center z-20 cursor-pointer bg-black/40 backdrop-blur-[2px] transition-all"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-charcoal/90 text-champagne border border-champagne/50 shadow-2xl transition-transform hover:scale-110 active:scale-95">
                <Play className="h-8 w-8 fill-champagne ml-1" />
              </div>
            </div>
          )}

          {/* Bottom Video Progress Bar */}
          {hasVideo && (
            <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 z-30 pointer-events-none">
              <div
                className="h-full bg-champagne transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Instagram Floating CTA if no video but cover exists */}
          {!hasVideo && reel.instagramUrl && (
            <div className="absolute bottom-16 inset-x-6 z-30 flex justify-center">
              <a
                href={reel.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 text-white px-5 py-2.5 text-xs font-bold shadow-2xl hover:scale-105 transition-all"
              >
                <Instagram className="w-4 h-4" />
                <span>Watch Full Reel on Instagram</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Top Info Bar inside viewer */}
          <div className="absolute inset-x-0 top-0 p-4 flex items-center justify-between z-30 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ivory border border-white/20">
              <Sparkles className="h-3.5 w-3.5 text-champagne shrink-0" />
              {reel.category || "VRUNDORA"}
            </span>

            <div className="flex items-center gap-2">
              {/* Mute Button */}
              {hasVideo && (
                <button
                  onClick={toggleMute}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-black/60 backdrop-blur-md text-ivory hover:text-champagne border border-white/20 transition cursor-pointer"
                  aria-label={isMuted ? "Unmute audio" : "Mute audio"}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
              )}

              {/* Instagram Link Badge */}
              {reel.instagramUrl && (
                <a
                  href={reel.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-black/60 backdrop-blur-md text-pink-400 hover:text-pink-300 border border-pink-500/30 transition shadow-xs cursor-pointer"
                  title="View original on Instagram"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              )}
            </div>
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
            sheetOpen
              ? "max-h-[60vh] p-4 sm:p-5"
              : "hidden lg:flex p-5"
          )}
        >
          {/* Reel Header & Caption */}
          <div className="border-b border-border pb-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-champagne">
                {reel.mediaType === "instagram" ? "Instagram Reel" : "VRUNDORA Reel"}
              </span>
              {reel.instagramUrl && (
                <a
                  href={reel.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-pink-600 hover:text-pink-700 transition"
                >
                  <Instagram className="h-3.5 w-3.5" />
                  <span>Open Instagram ↗</span>
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
                Shop Featured Jewellery ({linkedProducts.length})
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
          <div className="border-t border-border pt-3 space-y-2">
            {reel.instagramUrl && (
              <a
                href={reel.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white py-2.5 text-xs font-bold hover:brightness-105 transition shadow-sm"
              >
                <Instagram className="w-4 h-4" />
                <span>Watch on Instagram</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <button
              onClick={onClose}
              className="w-full rounded-xl border border-border py-2 text-xs font-semibold hover:bg-accent transition cursor-pointer"
            >
              Back to Store
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReelViewer;
