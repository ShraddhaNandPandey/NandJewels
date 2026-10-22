"use client";

import { useStore } from "@/store/useStore";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Bell, CheckCheck, Trash2, Package, Sparkles, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const iconFor = (type: string) => {
  if (type === "order") return Package;
  if (type === "promo") return Sparkles;
  return Info;
};

export function NotificationsView() {
  const notifications = useStore((s) => s.notifications);
  const markRead = useStore((s) => s.markNotificationRead);
  const markAllRead = useStore((s) => s.markAllNotificationsRead);
  const remove = useStore((s) => s.deleteNotification);
  const navigate = useStore((s) => s.navigate);

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 animate-fade-up">
      <Breadcrumbs items={[{ label: "My Account", view: "account" }, { label: "Notifications" }]} />

      <div className="mt-4 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">{unread} unread of {notifications.length}</p>
        </div>
        {unread > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <CheckCheck className="mr-1.5 h-3.5 w-3.5" /> Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="mt-8 flex flex-col items-center rounded-xl border border-dashed border-border py-16 text-center">
          <Bell className="h-10 w-10 text-muted-foreground" />
          <p className="mt-3 font-serif text-xl">All caught up!</p>
          <p className="mt-1 text-sm text-muted-foreground">You have no notifications right now.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-2">
          {notifications.map((n) => {
            const Icon = iconFor(n.type);
            return (
              <div
                key={n.id}
                className={cn(
                  "flex items-start gap-3 rounded-lg border bg-card p-4 transition",
                  n.read ? "border-border" : "border-charcoal/40 bg-accent/20"
                )}
              >
                <span className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                  n.read ? "bg-accent text-muted-foreground" : "bg-charcoal text-ivory"
                )}>
                  <Icon className="h-4 w-4" />
                </span>
                <div className="flex-1 min-w-0" onClick={() => markRead(n.id)}>
                  <div className="flex items-center gap-2">
                    <p className={cn("text-sm", n.read ? "font-medium" : "font-semibold")}>{n.title}</p>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-champagne" />}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(n.date).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  {!n.read && (
                    <button onClick={() => markRead(n.id)} className="text-xs text-charcoal hover:underline">Mark read</button>
                  )}
                  {n.type === "order" && (
                    <button onClick={() => navigate("orders")} className="text-xs text-charcoal hover:underline">View orders</button>
                  )}
                  <button onClick={() => remove(n.id)} className="text-muted-foreground hover:text-red-600">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
