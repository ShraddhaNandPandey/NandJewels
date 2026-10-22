"use client";

import { useStore } from "@/store/useStore";
import { CheckCircle2, Info, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function ToastHost() {
  const toasts = useStore((s) => s.toasts);
  const dismiss = useStore((s) => s.dismissToast);

  return (
    <div className="fixed bottom-6 left-1/2 z-[100] flex -translate-x-1/2 flex-col items-center gap-2 px-4 sm:bottom-8">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "flex w-full max-w-sm items-start gap-3 rounded-lg border bg-card px-4 py-3 shadow-lg animate-fade-up",
            t.variant === "success" && "border-emerald-200 bg-emerald-50",
            t.variant === "destructive" && "border-red-200 bg-red-50",
            (!t.variant || t.variant === "default") && "border-border"
          )}
        >
          <span className="mt-0.5">
            {t.variant === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            ) : t.variant === "destructive" ? (
              <AlertCircle className="h-5 w-5 text-red-600" />
            ) : (
              <Info className="h-5 w-5 text-muted-foreground" />
            )}
          </span>
          <div className="flex-1">
            <p className="text-sm font-medium leading-tight">{t.title}</p>
            {t.description && (
              <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{t.description}</p>
            )}
          </div>
          <button
            onClick={() => dismiss(t.id)}
            className="text-muted-foreground transition hover:text-foreground"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
