"use client";

import { useStore } from "@/store/useStore";
import { ChevronRight, Home } from "lucide-react";

export interface Crumb {
  label: string;
  view?: Parameters<ReturnType<typeof useStore.getState>["navigate"]>[0];
  params?: Record<string, string | undefined>;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const navigate = useStore((s) => s.navigate);
  return (
    <nav className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
      <button
        onClick={() => navigate("home")}
        className="inline-flex items-center gap-1 hover:text-foreground"
      >
        <Home className="h-3.5 w-3.5" /> Home
      </button>
      {items.map((item, i) => (
        <span key={i} className="inline-flex items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5" />
          {item.view ? (
            <button
              onClick={() => navigate(item.view!, item.params)}
              className="hover:text-foreground"
            >
              {item.label}
            </button>
          ) : (
            <span className="text-foreground">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
