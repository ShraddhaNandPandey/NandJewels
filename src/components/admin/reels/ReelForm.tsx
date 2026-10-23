"use client";

import { useState, useEffect } from "react";
import type { Reel, Product } from "@/lib/types";
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
import { Search, Check, AlertCircle, Sparkles, Video, Image as ImageIcon } from "lucide-react";
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

  const [title, setTitle] = useState(targetReel?.title || "");
  const [category, setCategory] = useState(targetReel?.category || "Festive");
  const [caption, setCaption] = useState(targetReel?.caption || "");
  const [videoUrl, setVideoUrl] = useState(targetReel?.videoUrl || "");
  const [posterUrl, setPosterUrl] = useState(targetReel?.posterUrl || "");
  const [instagramUrl, setInstagramUrl] = useState(targetReel?.instagramUrl || "");
  const [order, setOrder] = useState<number>(targetReel ? targetReel.order : initialNextOrder);
  const [isActive, setIsActive] = useState<boolean>(targetReel ? targetReel.isActive : true);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(
    targetReel?.productIds || []
  );

  const [productSearch, setProductSearch] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (targetReel) {
      setTitle(targetReel.title);
      setCategory(targetReel.category || "Festive");
      setCaption(targetReel.caption || "");
      setVideoUrl(targetReel.videoUrl);
      setPosterUrl(targetReel.posterUrl);
      setInstagramUrl(targetReel.instagramUrl || "");
      setOrder(targetReel.order);
      setIsActive(targetReel.isActive);
      setSelectedProductIds(targetReel.productIds || []);
    } else {
      setTitle("");
      setCategory("Festive");
      setCaption("");
      setVideoUrl("");
      setPosterUrl("");
      setInstagramUrl("");
      setOrder(initialNextOrder);
      setIsActive(true);
      setSelectedProductIds([]);
    }
    setErrors({});
  }, [targetReel, initialNextOrder, isDialogOpen]);

  // Reset or initialize when opened
  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "Reel title is required.";
    }

    if (!videoUrl.trim()) {
      newErrors.videoUrl = "Video URL is required.";
    } else if (!validateUrl(videoUrl)) {
      newErrors.videoUrl = "Please enter a valid video URL (e.g. https://.../reel.mp4).";
    }

    if (!posterUrl.trim()) {
      newErrors.posterUrl = "Poster URL is required.";
    } else if (!validateUrl(posterUrl)) {
      newErrors.posterUrl = "Please enter a valid image poster URL.";
    }

    if (instagramUrl.trim() && !validateUrl(instagramUrl)) {
      newErrors.instagramUrl = "Please enter a valid Instagram URL.";
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
      videoUrl: videoUrl.trim(),
      posterUrl: posterUrl.trim(),
      instagramUrl: instagramUrl.trim() || undefined,
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
              : "Configure the video, poster, caption, and linked VRUNDORA jewellery pieces."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
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

          {/* URLs Section: Video URL & Poster URL */}
          <div className="rounded-xl border border-border bg-accent/30 p-3.5 space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-border">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Video className="h-3.5 w-3.5 text-champagne" /> Media URLs Configuration
              </span>
              <span className="text-[10px] text-muted-foreground">Self-hosted or CDN MP4</span>
            </div>

            {/* Video URL */}
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

            {/* Poster URL */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                Poster Image URL (WebP / JPG / PNG) <span className="text-red-500">*</span>
              </Label>
              <Input
                value={posterUrl}
                onChange={(e) => setPosterUrl(e.target.value)}
                placeholder="https://images.unsplash.com/... or https://cdn.example.com/poster.webp"
                className={errors.posterUrl ? "border-red-500" : ""}
              />
              {errors.posterUrl && (
                <p className="text-[11px] text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.posterUrl}
                </p>
              )}
              {posterUrl && validateUrl(posterUrl) && (
                <div className="mt-2 flex items-center gap-2 p-2 rounded-lg bg-background border border-border">
                  <img
                    src={posterUrl}
                    alt="Poster preview"
                    className="h-12 w-9 rounded object-cover border border-border shrink-0"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                  <span className="text-[11px] text-muted-foreground">Poster preview ready</span>
                </div>
              )}
            </div>

            {/* Instagram URL */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Instagram Link (Optional)</Label>
              <Input
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://instagram.com/reel/..."
                className={errors.instagramUrl ? "border-red-500" : ""}
              />
              {errors.instagramUrl && (
                <p className="text-[11px] text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.instagramUrl}
                </p>
              )}
            </div>
          </div>

          {/* Display Order & Active Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center rounded-xl border border-border p-3.5 bg-card">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Display Order</Label>
              <Input
                type="number"
                min={1}
                value={order}
                onChange={(e) => setOrder(parseInt(e.target.value) || 1)}
                className="w-28"
              />
              <p className="text-[10px] text-muted-foreground">Lower numbers appear first on storefront</p>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0">
              <div className="space-y-0.5 text-left sm:text-right">
                <Label className="text-xs font-semibold">Visibility Status</Label>
                <p className="text-[10px] text-muted-foreground">
                  {isActive ? "Visible on customer storefront" : "Hidden from customers (Draft)"}
                </p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </div>

          {/* Linked Products: Shop This Look Picker */}
          <div className="rounded-xl border border-border p-3.5 space-y-3 bg-card">
            <div className="flex items-center justify-between pb-1 border-b border-border">
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Linked Products (Shop This Look)
                </Label>
                <p className="text-[10px] text-muted-foreground">
                  {selectedProductIds.length} product(s) selected
                </p>
              </div>
              <div className="relative w-44 sm:w-52">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Filter products…"
                  className="h-8 pl-8 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto scroll-area-custom p-1">
              {filteredProducts.map((p) => {
                const isSelected = selectedProductIds.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleProduct(p.id)}
                    className={cn(
                      "flex items-center gap-2.5 p-2 rounded-lg border text-left transition text-xs cursor-pointer",
                      isSelected
                        ? "border-champagne bg-champagne/10 text-charcoal font-medium"
                        : "border-border hover:bg-accent text-foreground"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded border",
                        isSelected ? "border-champagne bg-champagne text-charcoal" : "border-border"
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="h-9 w-9 rounded object-cover border border-border shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-xs">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground">₹{p.price.toLocaleString("en-IN")}</p>
                    </div>
                  </button>
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
