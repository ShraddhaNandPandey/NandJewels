"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import {
  Video,
  Plus,
  Play,
  Edit2,
  Copy,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  ExternalLink,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Film,
  Sparkles,
  ShoppingBag,
  Instagram,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { Reel } from "@/lib/types";
import ReelForm from "./ReelForm";

// Dynamically import ReelPreviewModal to keep initial admin load lightweight
const ReelPreviewModal = dynamic(() => import("./ReelPreviewModal"), {
  ssr: false,
  loading: () => null,
});

export default function ReelManagement() {
  const reels = useStore((s) => s.reels);
  const products = useStore((s) => s.products);
  const addReel = useStore((s) => s.addReel);
  const updateReel = useStore((s) => s.updateReel);
  const deleteReel = useStore((s) => s.deleteReel);
  const duplicateReel = useStore((s) => s.duplicateReel);
  const toggleReelActive = useStore((s) => s.toggleReelActive);
  const reorderReel = useStore((s) => s.reorderReel);

  // Local state for modals & search
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReel, setEditingReel] = useState<Reel | null>(null);
  const [previewingReel, setPreviewingReel] = useState<Reel | null>(null);
  const [deletingReel, setDeletingReel] = useState<Reel | null>(null);

  // Sorted reels by order
  const sortedReels = [...reels].sort((a, b) => a.order - b.order);

  // Filtered reels for display
  const filteredReels = sortedReels.filter((reel) => {
    const matchesSearch =
      reel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (reel.category && reel.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (reel.caption && reel.caption.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      categoryFilter === "all" ||
      (reel.category && reel.category.toLowerCase() === categoryFilter.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(
    new Set(reels.map((r) => r.category).filter(Boolean))
  ) as string[];

  // Stats calculation
  const totalReels = reels.length;
  const activeReels = reels.filter((r) => r.isActive).length;
  const inactiveReels = totalReels - activeReels;

  const handleOpenAdd = () => {
    setEditingReel(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (reel: Reel) => {
    setEditingReel(reel);
    setIsFormOpen(true);
  };

  const handleSaveReel = (reelData: Partial<Reel>) => {
    if (editingReel) {
      updateReel(editingReel.id, reelData);
    } else {
      addReel(reelData as Omit<Reel, "id" | "createdAt" | "updatedAt">);
    }
    setIsFormOpen(false);
    setEditingReel(null);
  };

  const handleConfirmDelete = () => {
    if (deletingReel) {
      deleteReel(deletingReel.id);
      setDeletingReel(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-700">
              <Film className="w-5 h-5" />
            </span>
            <span className="text-xs uppercase tracking-wider font-semibold text-stone-500">
              Marketing & Social
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif text-stone-900 tracking-tight">
            Instagram Reels
          </h1>
          <p className="text-sm text-stone-500 mt-1 max-w-xl">
            Manage the Instagram Reels displayed in the customer storefront. Control order, linked products, and active visibility.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 text-white hover:bg-amber-700 transition-all shadow-sm font-medium text-sm self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add Reel</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">Total Reels</p>
            <p className="text-2xl font-serif text-stone-900 mt-1">{totalReels}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600">
            <Film className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Active on Store</p>
            <p className="text-2xl font-serif text-emerald-700 mt-1">{activeReels}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-stone-400 uppercase tracking-wider">Inactive / Draft</p>
            <p className="text-2xl font-serif text-stone-600 mt-1">{inactiveReels}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-400">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2 bg-white rounded-2xl border border-stone-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search reels by title, category, caption..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-transparent rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-400 placeholder:text-stone-400 text-stone-800"
          />
        </div>

        {categories.length > 0 && (
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 px-2 sm:px-0">
            <button
              onClick={() => setCategoryFilter("all")}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all whitespace-nowrap ${
                categoryFilter === "all"
                  ? "bg-stone-900 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all whitespace-nowrap ${
                  categoryFilter === cat
                    ? "bg-stone-900 text-white"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Reels Table / Empty State */}
      {filteredReels.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-stone-200 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-4">
            <Film className="w-8 h-8 stroke-[1.5]" />
          </div>
          <h3 className="text-lg font-serif text-stone-900 mb-1">
            {reels.length === 0 ? "No Instagram Reels yet" : "No matching reels found"}
          </h3>
          <p className="text-sm text-stone-500 max-w-sm mx-auto mb-6">
            {reels.length === 0
              ? "Add your first Reel to showcase VRUNDORA styles with zero-lag video."
              : "Try adjusting your search terms or category filter to find what you're looking for."}
          </p>
          {reels.length === 0 && (
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 text-white hover:bg-amber-700 transition-all font-medium text-sm shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Reel</span>
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/70 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                  <th className="py-4 px-4 w-16 text-center">Order</th>
                  <th className="py-4 px-4 w-24">Preview</th>
                  <th className="py-4 px-4">Title & Caption</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4">Linked Products</th>
                  <th className="py-4 px-4 text-center">Status</th>
                  <th className="py-4 px-4 text-center">Instagram</th>
                  <th className="py-4 px-4 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-sm">
                {filteredReels.map((reel, index) => {
                  const linkedCount = reel.productIds?.length || 0;
                  const isFirst = index === 0;
                  const isLast = index === filteredReels.length - 1;

                  return (
                    <tr
                      key={reel.id}
                      className="hover:bg-amber-50/20 transition-colors group"
                    >
                      {/* Order & Reordering buttons */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-mono text-xs font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
                            #{reel.order}
                          </span>
                          <div className="flex items-center gap-0.5">
                            <button
                              onClick={() => reorderReel(reel.id, "up")}
                              disabled={isFirst}
                              className={`p-1 rounded hover:bg-stone-200 transition-colors ${
                                isFirst ? "opacity-30 cursor-not-allowed text-stone-400" : "text-stone-600"
                              }`}
                              title="Move Up"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => reorderReel(reel.id, "down")}
                              disabled={isLast}
                              className={`p-1 rounded hover:bg-stone-200 transition-colors ${
                                isLast ? "opacity-30 cursor-not-allowed text-stone-400" : "text-stone-600"
                              }`}
                              title="Move Down"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Poster Thumbnail */}
                      <td className="py-3 px-4">
                        <div
                          onClick={() => setPreviewingReel(reel)}
                          className="relative w-14 h-20 rounded-xl overflow-hidden bg-stone-900 border border-stone-200 shadow-sm cursor-pointer group/thumb flex items-center justify-center"
                        >
                          {reel.posterUrl ? (
                            <Image
                              src={reel.posterUrl}
                              alt={reel.title}
                              fill
                              sizes="56px"
                              className="object-cover group-hover/thumb:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-1 text-center bg-stone-950">
                              <Sparkles className="w-3.5 h-3.5 text-amber-400 mb-0.5" />
                              <span className="text-[8px] font-bold tracking-widest text-amber-200 uppercase">VRUNDORA</span>
                              {reel.mediaType === "instagram" ? (
                                <Instagram className="w-3 h-3 text-pink-400 mt-1" />
                              ) : (
                                <Video className="w-3 h-3 text-amber-400 mt-1" />
                              )}
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/20 group-hover/thumb:bg-black/40 transition-colors flex items-center justify-center">
                            {reel.mediaType === "instagram" ? (
                              <Instagram className="w-4 h-4 text-pink-400 opacity-90 group-hover/thumb:scale-110 transition-transform" />
                            ) : (
                              <Play className="w-4 h-4 fill-white text-white opacity-90 group-hover/thumb:scale-110 transition-transform" />
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Title & Caption */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                            reel.mediaType === "instagram"
                              ? "bg-pink-50 text-pink-700 border border-pink-200"
                              : "bg-amber-50 text-amber-800 border border-amber-200"
                          }`}>
                            {reel.mediaType === "instagram" ? (
                              <Instagram className="w-2.5 h-2.5 text-pink-600" />
                            ) : (
                              <Video className="w-2.5 h-2.5 text-amber-600" />
                            )}
                            <span>{reel.mediaType === "instagram" ? "Instagram" : "Hosted Video"}</span>
                          </span>
                        </div>
                        <div className="font-serif font-medium text-stone-900 truncate">
                          {reel.title}
                        </div>
                        {reel.caption && (
                          <div className="text-xs text-stone-500 truncate mt-0.5 font-light">
                            {reel.caption}
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200/50">
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          {reel.category || "General"}
                        </span>
                      </td>

                      {/* Linked Products */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-stone-100 text-stone-700">
                            <ShoppingBag className="w-3 h-3 text-stone-500" />
                            {linkedCount} {linkedCount === 1 ? "product" : "products"}
                          </span>
                        </div>
                      </td>

                      {/* Status / Active Toggle */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => toggleReelActive(reel.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                            reel.isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                              : "bg-stone-100 text-stone-500 border border-stone-200 hover:bg-stone-200"
                          }`}
                          title={reel.isActive ? "Click to deactivate" : "Click to activate"}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              reel.isActive ? "bg-emerald-500 animate-pulse" : "bg-stone-400"
                            }`}
                          />
                          <span>{reel.isActive ? "Active" : "Inactive"}</span>
                        </button>
                      </td>

                      {/* Instagram link */}
                      <td className="py-3 px-4 text-center">
                        {reel.instagramUrl ? (
                          <a
                            href={reel.instagramUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-stone-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            title="Open Instagram Link"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        ) : (
                          <span className="text-xs text-stone-300">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right pr-6">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => setPreviewingReel(reel)}
                            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                            title="Preview Reel"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(reel)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs font-semibold border border-stone-300 transition-all shadow-xs cursor-pointer"
                            title="Edit Reel Details"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-amber-700" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => duplicateReel(reel.id)}
                            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                            title="Duplicate Reel"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingReel(reel)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 transition-all shadow-xs cursor-pointer"
                            title="Delete Reel"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="block lg:hidden space-y-4">
            {filteredReels.map((reel, index) => {
              const linkedCount = reel.productIds?.length || 0;
              const isFirst = index === 0;
              const isLast = index === filteredReels.length - 1;

              return (
                <div
                  key={reel.id}
                  className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col gap-3"
                >
                  <div className="flex items-start gap-3">
                    {/* Thumbnail */}
                    <div
                      onClick={() => setPreviewingReel(reel)}
                      className="relative w-16 h-24 rounded-xl overflow-hidden bg-stone-900 border border-stone-200 flex-shrink-0 cursor-pointer"
                    >
                      {reel.posterUrl ? (
                        <Image
                          src={reel.posterUrl}
                          alt={reel.title}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-1 text-center bg-stone-950">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400 mb-0.5" />
                          <span className="text-[7px] font-bold tracking-widest text-amber-200 uppercase">VRUNDORA</span>
                          {reel.mediaType === "instagram" ? (
                            <Instagram className="w-3 h-3 text-pink-400 mt-1" />
                          ) : (
                            <Video className="w-3 h-3 text-amber-400 mt-1" />
                          )}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        {reel.mediaType === "instagram" ? (
                          <Instagram className="w-4 h-4 text-pink-400 opacity-90" />
                        ) : (
                          <Play className="w-4 h-4 fill-white text-white opacity-90" />
                        )}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
                            #{reel.order}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${
                            reel.mediaType === "instagram"
                              ? "bg-pink-50 text-pink-700 border border-pink-200"
                              : "bg-amber-50 text-amber-800 border border-amber-200"
                          }`}>
                            {reel.mediaType === "instagram" ? "Instagram" : "Hosted"}
                          </span>
                        </div>
                        <button
                          onClick={() => toggleReelActive(reel.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                            reel.isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-stone-100 text-stone-500 border border-stone-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              reel.isActive ? "bg-emerald-500" : "bg-stone-400"
                            }`}
                          />
                          <span>{reel.isActive ? "Active" : "Inactive"}</span>
                        </button>
                      </div>

                      <h4 className="font-serif font-medium text-stone-900 truncate">
                        {reel.title}
                      </h4>
                      {reel.caption && (
                        <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">
                          {reel.caption}
                        </p>
                      )}

                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[11px] px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200/50">
                          {reel.category || "General"}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                          {linkedCount} items
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Actions Toolbar */}
                  <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => reorderReel(reel.id, "up")}
                        disabled={isFirst}
                        className={`p-1.5 rounded-lg border border-stone-200 ${
                          isFirst ? "opacity-30 text-stone-400" : "text-stone-700 hover:bg-stone-100"
                        }`}
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => reorderReel(reel.id, "down")}
                        disabled={isLast}
                        className={`p-1.5 rounded-lg border border-stone-200 ${
                          isLast ? "opacity-30 text-stone-400" : "text-stone-700 hover:bg-stone-100"
                        }`}
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setPreviewingReel(reel)}
                        className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-100 border border-stone-200"
                        title="Preview"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(reel)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs font-semibold border border-stone-300"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-amber-700" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => duplicateReel(reel.id)}
                        className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-100 border border-stone-200"
                        title="Duplicate"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingReel(reel)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Delete Confirmation Safety Dialog */}
      {deletingReel && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setDeletingReel(null)}
        >
          <div
            className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-stone-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-serif text-stone-900 mb-2">Delete Reel?</h3>
            <p className="text-sm text-stone-600 mb-6 leading-relaxed">
              Are you sure you want to delete <strong className="text-stone-900 font-semibold">&ldquo;{deletingReel.title}&rdquo;</strong>?
              This will permanently remove it from both the storefront and admin panel.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingReel(null)}
                className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 text-sm font-medium bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-all shadow-sm"
              >
                Delete Reel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Form Modal */}
      <ReelForm
        isOpen={isFormOpen}
        reel={editingReel}
        existingReelsCount={reels.length}
        onClose={() => {
          setIsFormOpen(false);
          setEditingReel(null);
        }}
        onSave={handleSaveReel}
      />

      {/* Dynamic Preview Modal */}
      <ReelPreviewModal
        reel={previewingReel}
        isOpen={!!previewingReel}
        onClose={() => setPreviewingReel(null)}
        onEdit={(reel) => {
          setPreviewingReel(null);
          handleOpenEdit(reel);
        }}
        onDelete={(reel) => {
          setPreviewingReel(null);
          setDeletingReel(reel);
        }}
      />
    </div>
  );
}
