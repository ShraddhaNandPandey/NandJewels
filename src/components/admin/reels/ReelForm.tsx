"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import type { Reel, ReelMediaType } from "@/lib/types";
import { products as allProducts } from "@/data/products";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Search,
  Check,
  AlertCircle,
  Sparkles,
  Video,
  Instagram,
  Upload,
  Link as LinkIcon,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ReelFormProps {
  open?: boolean;
  isOpen?: boolean;
  reelToEdit?: Reel | null;
  reel?: Reel | null;
  nextOrder?: number;
  existingReelsCount?: number;
  onClose: () => void;
  onSave: (reelData: Omit<Reel, "id" | "createdAt" | "updatedAt">) => void;
}

export function ReelForm({
  open,
  isOpen,
  reelToEdit,
  reel,
  nextOrder = 1,
  existingReelsCount,
  onClose,
  onSave,
}: ReelFormProps) {
  const isDialogOpen = open ?? isOpen ?? false;
  const targetReel = reelToEdit ?? reel ?? null;
  const initialNextOrder = nextOrder ?? ((existingReelsCount ?? 0) + 1);

  // Form states
  const [mediaType, setMediaType] = useState<ReelMediaType>("instagram");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Festive");
  const [caption, setCaption] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [order, setOrder] = useState<number>(initialNextOrder);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const [productSearch, setProductSearch] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (targetReel) {
      setMediaType(targetReel.mediaType || (targetReel.videoUrl ? "hosted" : "instagram"));
      setTitle(targetReel.title || "");
      setCategory(targetReel.category || "Festive");
      setCaption(targetReel.caption || "");
      setInstagramUrl(targetReel.instagramUrl || "");
      setVideoUrl(targetReel.videoUrl || "");
      setPosterUrl(targetReel.posterUrl || "");
      setOrder(targetReel.order || 1);
      setIsActive(targetReel.isActive ?? true);
      setSelectedProductIds(targetReel.productIds || []);
    } else {
      setMediaType("instagram");
      setTitle("");
      setCategory("Festive");
      setCaption("");
      setInstagramUrl("");
      setVideoUrl("");
      setPosterUrl("");
      setOrder(initialNextOrder);
      setIsActive(true);
      setSelectedProductIds([]);
    }
    setErrors({});
    setShowUrlInput(false);
  }, [targetReel, initialNextOrder, isDialogOpen]);

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, posterUrl: "Please select a valid image file (JPG, PNG, WebP)." }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64 = uploadEvent.target?.result as string;
      if (base64) {
        setPosterUrl(base64);
        setErrors((prev) => {
          const rest = { ...prev };
          delete rest.posterUrl;
          return rest;
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "Reel title is required.";
    }

    if (mediaType === "instagram") {
      // Instagram Mode: ONLY require instagramUrl
      if (!instagramUrl.trim()) {
        newErrors.instagramUrl = "Instagram Reel URL is required.";
      } else if (!validateUrl(instagramUrl)) {
        newErrors.instagramUrl = "Please enter a valid Instagram URL (e.g. https://www.instagram.com/reel/Desq3jFqXFn/).";
      }

      // Poster URL is strictly optional for Instagram reels!
      if (posterUrl.trim() && !posterUrl.startsWith("data:") && !validateUrl(posterUrl)) {
        newErrors.posterUrl = "Please enter a valid image URL or clear it to use the VRUNDORA fallback cover.";
      }
    } else {
      // Hosted Video Mode: Video URL is required, poster is required/recommended
      if (!videoUrl.trim()) {
        newErrors.videoUrl = "Video URL (.mp4) is required for hosted videos.";
      } else if (!validateUrl(videoUrl)) {
        newErrors.videoUrl = "Please enter a valid hosted video URL (e.g. https://.../reel.mp4).";
      }

      if (!posterUrl.trim()) {
        newErrors.posterUrl = "Poster cover image is required for hosted video playback.";
      } else if (!posterUrl.startsWith("data:") && !validateUrl(posterUrl)) {
        newErrors.posterUrl = "Please enter a valid poster image URL.";
      }

      if (instagramUrl.trim() && !validateUrl(instagramUrl)) {
        newErrors.instagramUrl = "Please enter a valid Instagram URL.";
      }
    }

    if (isNaN(order) || order < 1) {
      newErrors.order = "Order must be a positive number.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSave({
      title: title.trim(),
      category: category.trim(),
      caption: caption.trim() || undefined,
      mediaType,
      instagramUrl: instagramUrl.trim() || undefined,
      videoUrl: mediaType === "hosted" ? videoUrl.trim() : undefined,
      posterUrl: posterUrl.trim() || undefined,
      productIds: selectedProductIds,
      order: Number(order),
      isActive,
    });
    onClose();
  };

  const toggleProduct = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const filteredProducts = allProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.collection.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <Dialog open={isDialogOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto scroll-area-custom">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-champagne" />
            <span className="text-xs uppercase tracking-widest text-champagne font-semibold">
              Instagram Reel CMS
            </span>
          </div>
          <DialogTitle className="font-serif text-xl sm:text-2xl font-bold">
            {targetReel ? "Edit Instagram Reel" : "Add New Instagram Reel"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {targetReel
              ? `Editing "${targetReel.title}". Update any details below to fix mistakes, then click Save Changes.`
              : "Create an Instagram Reel showcase for VRUNDORA. You only need the Instagram Reel URL."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* MEDIA SOURCE Selection */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-foreground">
              Media Source
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                onClick={() => setMediaType("instagram")}
                className={cn(
                  "flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all select-none",
                  mediaType === "instagram"
                    ? "border-amber-600 bg-amber-500/10 text-stone-900 shadow-xs"
                    : "border-border bg-card text-muted-foreground hover:border-stone-400"
                )}
              >
                <input
                  type="radio"
                  name="mediaType"
                  value="instagram"
                  checked={mediaType === "instagram"}
                  onChange={() => setMediaType("instagram")}
                  className="accent-amber-600 h-4 w-4 cursor-pointer"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold flex items-center gap-1.5 text-stone-900">
                    <Instagram className="w-4 h-4 text-pink-600 shrink-0" />
                    <span>Instagram Reel</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                    Paste Instagram link only (No MP4 needed)
                  </p>
                </div>
              </label>

              <label
                onClick={() => setMediaType("hosted")}
                className={cn(
                  "flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all select-none",
                  mediaType === "hosted"
                    ? "border-amber-600 bg-amber-500/10 text-stone-900 shadow-xs"
                    : "border-border bg-card text-muted-foreground hover:border-stone-400"
                )}
              >
                <input
                  type="radio"
                  name="mediaType"
                  value="hosted"
                  checked={mediaType === "hosted"}
                  onChange={() => setMediaType("hosted")}
                  className="accent-amber-600 h-4 w-4 cursor-pointer"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold flex items-center gap-1.5 text-stone-900">
                    <Video className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Self-hosted / CDN Video</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                    Direct hosted .mp4 video file
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Conditional Media Fields */}
          {mediaType === "instagram" ? (
            /* =================== INSTAGRAM REEL MODE =================== */
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-4">
              {/* Instagram Reel URL - REQUIRED */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-stone-900">
                    Instagram Reel URL <span className="text-red-500">*</span>
                  </Label>
                  <span className="text-[10px] text-muted-foreground">Required</span>
                </div>
                <Input
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://www.instagram.com/reel/Desq3jFqXFn/"
                  className={cn(errors.instagramUrl ? "border-red-500" : "")}
                />
                {errors.instagramUrl ? (
                  <p className="text-[11px] text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errors.instagramUrl}
                  </p>
                ) : (
                  <p className="text-[11px] text-muted-foreground font-light">
                    Accepts links with or without query parameters (e.g. <code>?obrf=...</code>).
                  </p>
                )}
              </div>

              {/* Reel Cover Image - OPTIONAL */}
              <div className="space-y-2 pt-2 border-t border-amber-500/20">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-stone-900 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-amber-700" />
                    <span>Reel Cover Image</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-normal bg-stone-100 text-stone-600">
                      Optional
                    </span>
                  </Label>
                  {posterUrl && (
                    <button
                      type="button"
                      onClick={() => setPosterUrl("")}
                      className="text-[11px] text-rose-600 hover:underline flex items-center gap-1"
                    >
                      <X className="w-3 h-3" /> Remove Cover
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed font-light">
                  Optional — upload a custom cover if you want to control how this Reel appears on the VRUNDORA website. Otherwise the system will use the configured fallback/preview behavior.
                </p>

                {/* Upload or URL Buttons */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />

                {posterUrl ? (
                  <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-border shadow-xs">
                    <div className="relative w-12 h-16 rounded-lg overflow-hidden bg-stone-900 flex-shrink-0">
                      <Image
                        src={posterUrl}
                        alt="Reel Cover Preview"
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-stone-900 truncate">Cover Image Attached</p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {posterUrl.startsWith("data:") ? "Uploaded local image" : posterUrl}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs h-8"
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs h-8 bg-white gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5 text-stone-600" />
                        <span>Upload Cover</span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowUrlInput(!showUrlInput)}
                        className="text-xs h-8 text-stone-600 gap-1.5"
                      >
                        <LinkIcon className="w-3.5 h-3.5 text-stone-500" />
                        <span>{showUrlInput ? "Hide URL Input" : "Paste image URL"}</span>
                      </Button>
                    </div>

                    {showUrlInput && (
                      <div className="space-y-1 animate-in fade-in duration-200">
                        <Input
                          value={posterUrl}
                          onChange={(e) => setPosterUrl(e.target.value)}
                          placeholder="https://example.com/cover.webp"
                          className={errors.posterUrl ? "border-red-500" : ""}
                        />
                      </div>
                    )}
                  </div>
                )}

                {errors.posterUrl && (
                  <p className="text-[11px] text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errors.posterUrl}
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* =================== SELF-HOSTED VIDEO MODE =================== */
            <div className="rounded-2xl border border-border bg-accent/30 p-4 space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-border">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <Video className="h-3.5 w-3.5 text-amber-700" /> Hosted Video Configuration
                </span>
                <span className="text-[10px] text-muted-foreground">Direct .mp4 Video</span>
              </div>

              {/* Video URL - REQUIRED */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  Video URL (.mp4) <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://cdn.example.com/reels/festive-glow.mp4"
                  className={errors.videoUrl ? "border-red-500" : ""}
                />
                {errors.videoUrl && (
                  <p className="text-[11px] text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errors.videoUrl}
                  </p>
                )}
              </div>

              {/* Poster Image - REQUIRED/RECOMMENDED */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  Poster Image URL <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={posterUrl}
                  onChange={(e) => setPosterUrl(e.target.value)}
                  placeholder="https://cdn.example.com/posters/festive-glow.webp"
                  className={errors.posterUrl ? "border-red-500" : ""}
                />
                {errors.posterUrl ? (
                  <p className="text-[11px] text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errors.posterUrl}
                  </p>
                ) : (
                  <p className="text-[11px] text-muted-foreground">
                    Required for hosted videos to ensure instantaneous poster-first homepage loading.
                  </p>
                )}
              </div>

              {/* Optional Instagram Link for Hosted Video */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  Instagram Link <span className="text-[11px] font-normal text-muted-foreground">(Optional)</span>
                </Label>
                <Input
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://www.instagram.com/reel/..."
                />
              </div>
            </div>
          )}

          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <Label className="text-xs font-semibold">
                Reel Title <span className="text-red-500">*</span>
              </Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Festive Glow"
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-[11px] text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.title}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Category</Label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Festive, Bridal, Daily"
              />
            </div>
          </div>

          {/* Caption */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Caption / Story Description</Label>
            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="A little sparkle for every celebration..."
              rows={2}
            />
          </div>

          {/* Order and Active Switch */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center rounded-xl border border-border p-3.5 bg-accent/20">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                Display Order <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                min={1}
                value={order}
                onChange={(e) => setOrder(parseInt(e.target.value) || 1)}
                className="w-28"
              />
              {errors.order && (
                <p className="text-[11px] text-red-500">{errors.order}</p>
              )}
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0">
              <div className="space-y-0.5 text-right sm:text-left">
                <Label className="text-xs font-semibold">Active Status</Label>
                <p className="text-[11px] text-muted-foreground">
                  {isActive ? "Visible on storefront" : "Hidden / Inactive"}
                </p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </div>

          {/* Linked Products Section */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-semibold">
                  Shop This Look — Linked Products ({selectedProductIds.length})
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Select existing VRUNDORA jewellery featured in this Reel.
                </p>
              </div>
              {selectedProductIds.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedProductIds([])}
                  className="text-xs text-muted-foreground h-7 px-2"
                >
                  Clear all
                </Button>
              )}
            </div>

            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search jewellery by name, category, collection..."
                className="pl-9 text-xs h-9"
              />
            </div>

            <div className="max-h-48 overflow-y-auto border border-border rounded-xl divide-y divide-border/60 bg-card">
              {filteredProducts.map((p) => {
                const isSelected = selectedProductIds.includes(p.id);
                return (
                  <div
                    key={p.id}
                    onClick={() => toggleProduct(p.id)}
                    className={cn(
                      "flex items-center justify-between p-2.5 cursor-pointer transition text-xs",
                      isSelected ? "bg-amber-500/10" : "hover:bg-accent/40"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative h-10 w-10 rounded-md overflow-hidden bg-accent shrink-0">
                        <Image
                          src={p.images[0] || "/placeholder.jpg"}
                          alt={p.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                      <div className="truncate">
                        <p className="font-medium text-foreground truncate">{p.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {p.category} • ₹{p.price.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>

                    <div
                      className={cn(
                        "h-5 w-5 rounded border flex items-center justify-center shrink-0 transition",
                        isSelected
                          ? "bg-amber-600 border-amber-600 text-white"
                          : "border-muted-foreground/40 bg-card"
                      )}
                    >
                      {isSelected && <Check className="h-3.5 w-3.5 stroke-[2.5]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-charcoal text-ivory hover:bg-charcoal/90">
              {targetReel ? "Save Changes" : "Create Reel"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ReelForm;
