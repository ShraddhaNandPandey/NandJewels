"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ExternalLink,
  Sparkles,
  Tag,
  ShoppingBag,
  Edit2,
  Trash2,
  Instagram,
  Video,
} from "lucide-react";
import { Reel } from "@/lib/types";
import { useStore } from "@/store/useStore";

interface ReelPreviewModalProps {
  reel: Reel | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (reel: Reel) => void;
  onDelete?: (reel: Reel) => void;
}

export default function ReelPreviewModal({
  reel,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: ReelPreviewModalProps) {
  const products = useStore((s) => s.products);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const hasVideo = Boolean(reel?.videoUrl && reel.videoUrl.trim().length > 0);
  const hasCover = Boolean(reel?.posterUrl && reel.posterUrl.trim().length > 0);

  useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false);
      setVideoError(false);
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    } else {
      setIsPlaying(true);
      setVideoError(false);
    }
  }, [isOpen, reel]);

  if (!isOpen || !reel) return null;

  const linkedProducts = (reel.productIds || [])
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean);

  const togglePlay = () => {
    if (!videoRef.current || !hasVideo) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => setVideoError(true));
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current || !hasVideo) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-stone-800/80 text-stone-200 hover:text-white hover:bg-stone-700 flex items-center justify-center transition-all cursor-pointer"
          title="Close Preview"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Video / Visual Preview Side */}
        <div className="relative w-full md:w-[420px] aspect-[9/16] bg-black flex-shrink-0 flex items-center justify-center overflow-hidden">
          {hasVideo && !videoError ? (
            /* MP4 Video */
            <>
              <video
                ref={videoRef}
                src={reel.videoUrl}
                poster={reel.posterUrl}
                autoPlay
                playsInline
                loop
                muted={isMuted}
                className="w-full h-full object-cover"
                onError={() => setVideoError(true)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />

              {/* Play/Pause & Mute Buttons */}
              <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 flex items-center justify-center hover:bg-black/80 transition-all cursor-pointer"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={togglePlay}
                  className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 flex items-center justify-center hover:bg-black/80 transition-all cursor-pointer"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                </button>
              </div>
            </>
          ) : hasCover ? (
            /* Custom Cover Image (Instagram or fallback) */
            <div className="relative w-full h-full">
              <Image
                src={reel.posterUrl!}
                alt={reel.title}
                fill
                sizes="420px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-pink-400">
                  <Instagram className="w-6 h-6" />
                </div>
              </div>
            </div>
          ) : (
            /* Elegant VRUNDORA Fallback Preview */
            <div className="relative w-full h-full flex flex-col justify-between p-6 bg-gradient-to-b from-stone-900 via-stone-950 to-black text-white text-center">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(201,169,106,0.2),transparent_70%)] pointer-events-none" />

              <div className="relative z-10 pt-4 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-400/30 flex items-center justify-center mb-2 shadow-inner">
                  <Sparkles className="w-6 h-6 text-amber-300" />
                </div>
                <p className="text-[11px] uppercase tracking-[0.25em] text-amber-300 font-bold">
                  VRUNDORA
                </p>
                <p className="text-[10px] uppercase tracking-wider text-stone-400 mt-0.5">
                  @VRUNDORA.JEWELLERY
                </p>
              </div>

              <div className="relative z-10 px-2 my-auto">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30 mb-2 font-medium">
                  {reel.category || "Stories In Every Sparkle"}
                </span>
                <h3 className="font-serif text-xl font-bold text-white leading-tight">
                  {reel.title}
                </h3>
                <p className="text-xs text-stone-300 mt-1.5 italic font-light">
                  Stories In Every Sparkle
                </p>
              </div>

              <div className="relative z-10 pb-2 flex items-center justify-center gap-1.5 text-xs text-pink-400 font-medium">
                <Instagram className="w-4 h-4" />
                <span>Instagram Reel</span>
              </div>
            </div>
          )}

          {/* Top category badge */}
          <div className="absolute top-4 left-4 z-10">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wider uppercase bg-black/60 backdrop-blur-md text-amber-200 border border-amber-400/30">
              {reel.mediaType === "instagram" ? (
                <Instagram className="w-3.5 h-3.5 text-pink-400" />
              ) : (
                <Video className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>{reel.category || "VRUNDORA"}</span>
            </span>
          </div>
        </div>

        {/* Info & Products Side */}
        <div className="flex-1 p-6 md:p-8 flex flex-col overflow-y-auto">
          <div className="mb-4">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span
                className={`px-2.5 py-0.5 text-[10px] uppercase font-semibold tracking-wider rounded-full ${
                  reel.isActive
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-stone-700 text-stone-400"
                }`}
              >
                {reel.isActive ? "● Active on Store" : "○ Inactive / Hidden"}
              </span>

              <span className="px-2 py-0.5 text-[10px] uppercase font-semibold tracking-wider rounded-full bg-stone-800 text-stone-300 border border-stone-700">
                {reel.mediaType === "instagram" ? "Instagram Reel" : "Hosted Video"}
              </span>

              <span className="text-xs text-stone-500">Order #{reel.order}</span>
            </div>

            <h2 className="text-2xl font-serif text-white mb-2">{reel.title}</h2>
            {reel.caption && (
              <p className="text-sm text-stone-300 leading-relaxed font-light whitespace-pre-line">
                {reel.caption}
              </p>
            )}
          </div>

          {/* Instagram Link CTA */}
          {reel.instagramUrl && (
            <div className="mb-6">
              <a
                href={reel.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-pink-600/20 to-purple-600/20 border border-pink-500/30 text-pink-300 hover:text-white hover:bg-pink-600/30 text-xs font-medium transition-all"
              >
                <Instagram className="w-4 h-4 text-pink-400" />
                <span>View on Instagram</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Linked Products Section */}
          <div className="mt-auto pt-6 border-t border-stone-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm font-medium text-stone-200">
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span>Shop This Look ({linkedProducts.length})</span>
              </div>
            </div>

            {linkedProducts.length === 0 ? (
              <div className="p-4 rounded-xl bg-stone-800/40 border border-stone-800 text-center text-xs text-stone-400">
                No products linked to this reel yet. Edit the reel to link jewelry pieces.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
                {linkedProducts.map((product) => {
                  if (!product) return null;
                  return (
                    <div
                      key={product.id}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-stone-800/60 border border-stone-700/60 hover:border-amber-400/40 transition-all"
                    >
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-stone-800 flex-shrink-0">
                        <Image
                          src={product.images?.[0] || "/placeholder.jpg"}
                          alt={product.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate">{product.name}</p>
                        <p className="text-[11px] text-amber-300">
                          ₹{product.price.toLocaleString("en-IN")}
                        </p>
                      </div>
                      <span className="text-[10px] text-stone-400 flex items-center gap-1 bg-stone-900/80 px-2 py-1 rounded">
                        <Tag className="w-3 h-3 text-stone-500" />
                        {product.category}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Edit / Delete Toolbar */}
          {(onEdit || onDelete) && (
            <div className="flex items-center gap-2 pt-4 mt-4 border-t border-stone-800">
              {onEdit && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEdit(reel);
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit Reel Details</span>
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onDelete(reel);
                  }}
                  className="py-2.5 px-4 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Reel</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
