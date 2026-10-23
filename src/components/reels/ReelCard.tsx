"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import type { Reel } from "@/lib/types";
import { Play, Volume2, VolumeX, ShoppingBag, Instagram, Sparkles, Video, ExternalLink } from "lucide-react";
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

  const hasVideo = Boolean(reel.videoUrl && reel.videoUrl.trim().length > 0);
  const hasCover = Boolean(reel.posterUrl && reel.posterUrl.trim().length > 0);

  // Instant Autoplay when this card is in the center position
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hasVideo) return;

    // Strict muted setup to satisfy modern browser autoplay policies (Chrome, Safari, iOS, Brave)
    video.defaultMuted = true;
    video.muted = isMuted;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("autoplay", "");

    if (isCenter) {
      const playVideo = () => {
        const promise = video.play();
        if (promise !== undefined) {
          promise
            .then(() => {
              setIsPlaying(true);
              setVideoLoaded(true);
            })
            .catch(() => {
              // Browser requires user interaction before unmuting or playing
              setIsPlaying(false);

              // Auto-retry on first touch/scroll/click gesture
              const retryAutoplay = () => {
                video.muted = true;
                video.play().then(() => {
                  setIsPlaying(true);
                  setVideoLoaded(true);
                }).catch(() => {});

                window.removeEventListener("scroll", retryAutoplay);
                window.removeEventListener("touchstart", retryAutoplay);
                window.removeEventListener("click", retryAutoplay);
              };

              window.addEventListener("scroll", retryAutoplay, { once: true, passive: true });
              window.addEventListener("touchstart", retryAutoplay, { once: true, passive: true });
              window.addEventListener("click", retryAutoplay, { once: true });
            });
        }
      };

      if (video.readyState >= 2) {
        playVideo();
      } else {
        video.addEventListener("canplay", playVideo, { once: true });
        video.addEventListener("loadeddata", playVideo, { once: true });
      }
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [isCenter, isMuted, hasVideo, reel.videoUrl]);

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
        "group relative aspect-[9/16] w-full max-w-[280px] sm:max-w-[300px] cursor-pointer overflow-hidden rounded-2xl border bg-stone-950 shadow-lg transition-all duration-500 select-none",
        isCenter
          ? "border-champagne/80 ring-2 ring-champagne/40 scale-100 sm:scale-105 z-10 shadow-2xl"
          : "border-border/60 opacity-80 sm:opacity-60 scale-95 hover:opacity-95 hover:scale-100 hover:border-champagne/40"
      )}
    >
      {/* 1. Cover Image OR Elegant VRUNDORA Fallback Card */}
      {hasCover ? (
        <img
          src={reel.posterUrl}
          alt={reel.title}
          loading="lazy"
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105",
            hasVideo && isCenter && videoLoaded && isPlaying ? "opacity-0 pointer-events-none" : "opacity-100"
          )}
        />
      ) : (
        /* Elegant VRUNDORA Fallback Card (When no cover photo is uploaded) */
        <div className="absolute inset-0 flex flex-col justify-between p-6 bg-gradient-to-b from-stone-900 via-stone-950 to-black text-ivory text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(201,169,106,0.18),transparent_70%)] pointer-events-none" />

          {/* Top Branding */}
          <div className="relative z-10 pt-4 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-champagne/15 border border-champagne/30 flex items-center justify-center mb-2 shadow-inner">
              <Sparkles className="w-5 h-5 text-champagne" />
            </div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-champagne font-bold">
              VRUNDORA
            </p>
            <p className="text-[9px] uppercase tracking-wider text-ivory/60 mt-0.5">
              @VRUNDORA.JEWELLERY
            </p>
          </div>

          {/* Center Title & Tagline */}
          <div className="relative z-10 px-2 my-auto">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider bg-champagne/20 text-champagne border border-champagne/30 mb-2 font-semibold">
              {reel.category || "Stories In Every Sparkle"}
            </span>
            <h4 className="font-serif text-lg sm:text-xl font-bold text-ivory leading-tight drop-shadow-md">
              {reel.title}
            </h4>
            <p className="text-[10px] text-ivory/70 mt-1 italic font-light">
              Stories In Every Sparkle
            </p>
          </div>

          {/* Bottom Instagram Badge */}
          <div className="relative z-10 pb-1 flex items-center justify-center gap-1.5 text-[11px] text-champagne/90 font-medium">
            <Instagram className="w-4 h-4 text-pink-500" />
            <span>Instagram Reel</span>
          </div>
        </div>
      )}

      {/* 2. Video Player: Rendered and actively played when centered */}
      {hasVideo && isCenter && (
        <video
          ref={videoRef}
          src={reel.videoUrl}
          poster={reel.posterUrl}
          playsInline
          loop
          autoPlay
          muted={isMuted}
          onLoadedData={() => setVideoLoaded(true)}
          onCanPlay={() => setVideoLoaded(true)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-300",
            videoLoaded && isPlaying ? "opacity-100" : "opacity-0"
          )}
        />
      )}

      {/* Top Badges Bar */}
      <div className="absolute inset-x-0 top-0 p-3 flex items-center justify-between z-20 bg-gradient-to-b from-black/80 via-black/30 to-transparent">
        {/* Category Pill */}
        <span className="inline-flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase text-ivory border border-white/20">
          <Sparkles className="h-3 w-3 text-champagne shrink-0" />
          {reel.category || "VRUNDORA"}
        </span>

        <div className="flex items-center gap-1.5">
          {/* Sound Toggle (Only visible if video is active) */}
          {hasVideo && isCenter && (
            <button
              onClick={toggleMute}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-black/60 backdrop-blur-md text-ivory/90 hover:text-champagne transition border border-white/20 cursor-pointer"
              aria-label={isMuted ? "Unmute audio" : "Mute audio"}
            >
              {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            </button>
          )}

          {/* Instagram link badge */}
          {reel.instagramUrl && (
            <a
              href={reel.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-black/60 backdrop-blur-md text-pink-400 hover:text-pink-300 transition border border-pink-500/30 shadow-xs"
              aria-label="View on Instagram"
              title="Open Instagram Reel"
            >
              <Instagram className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Center Play Indicator on inactive card or before video starts playing */}
      {(!isCenter || !isPlaying) && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-charcoal/80 text-champagne backdrop-blur-md border border-champagne/40 transition-transform duration-300 group-hover:scale-110 shadow-lg">
            {hasVideo ? (
              <Play className="h-5 w-5 fill-champagne ml-0.5" />
            ) : (
              <Instagram className="h-5 w-5 text-pink-400" />
            )}
          </div>
        </div>
      )}

      {/* Bottom Content Gradient Overlay */}
      <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-4 z-20 bg-gradient-to-t from-black/95 via-black/75 to-transparent flex flex-col justify-end text-ivory">
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
              className="inline-flex items-center gap-1.5 rounded-full bg-champagne text-charcoal px-3 py-1 text-[10px] sm:text-xs font-semibold transition hover:brightness-105 active:scale-95 shadow-sm cursor-pointer"
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

          <span className="text-[10px] text-ivory/70 uppercase tracking-wider font-medium flex items-center gap-1 group-hover:text-champagne transition-colors">
            {hasVideo ? "Watch ↗" : "View Reel ↗"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default ReelCard;
