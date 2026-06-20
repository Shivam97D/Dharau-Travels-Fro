import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Check, CheckCheck, Trash2, ExternalLink } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useNotifications, type Notification } from "@/hooks/useNotifications";
import { timeAgo } from "@/lib/utils";

const TYPE_ICON: Record<string, string> = {
  booking_created: "🗓️",
  booking_confirmed: "✅",
  booking_cancelled: "❌",
  payment_success: "💳",
  payment_failed: "⚠️",
  inquiry_sent: "📩",
  inquiry_replied: "💬",
  review_posted: "⭐",
  review_approved: "🎉",
  new_user: "👤",
  profile_updated: "✏️",
  newsletter_subscribed: "📰",
  otp_sent: "🔐",
  trip_saved: "❤️",
  general: "🔔",
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { notifications, unreadCount, fetchAll, markRead, markAllRead, deleteOne } = useNotifications();

  // Load recent on open
  useEffect(() => {
    if (open) fetchAll(1);
  }, [open, fetchAll]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleClick = async (n: Notification) => {
    if (!n.read) await markRead(n._id);
    setOpen(false);
    if (n.link) navigate({ to: n.link as "/" });
  };

  const recent = notifications.slice(0, 5);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        className="relative grid h-9 w-9 place-items-center rounded-full glass transition hover:bg-white/15"
      >
        <Bell className="h-4 w-4" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full gradient-sunset text-[10px] font-bold text-white shadow-glow"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-2xl border border-border bg-card shadow-float"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">Notifications</span>
                {unreadCount > 0 && (
                  <span className="rounded-full gradient-sunset px-1.5 py-0.5 text-[10px] font-bold text-white">{unreadCount}</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button onClick={() => markAllRead()} title="Mark all read" className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-white/10 hover:text-foreground">
                    <CheckCheck className="h-3.5 w-3.5" />
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-white/10 hover:text-foreground">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {recent.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                  <Bell className="h-8 w-8 text-muted-foreground/40" />
                  <p className="text-xs text-muted-foreground">All caught up!</p>
                </div>
              ) : (
                recent.map((n) => (
                  <div
                    key={n._id}
                    onClick={() => handleClick(n)}
                    className={`group flex cursor-pointer items-start gap-3 border-b border-border/50 px-4 py-3 transition hover:bg-white/5 ${!n.read ? "bg-primary/5" : ""}`}
                  >
                    {!n.read && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                    {n.read && <span className="mt-1.5 h-1.5 w-1.5 shrink-0" />}
                    <span className="mt-0.5 text-base leading-none">{TYPE_ICON[n.type] ?? "🔔"}</span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-semibold leading-tight ${!n.read ? "text-foreground" : "text-muted-foreground"}`}>{n.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">{n.message}</p>
                      <p className="mt-1 text-[10px] text-muted-foreground/60">{timeAgo(n.createdAt)}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteOne(n._id); }}
                      className="shrink-0 rounded p-1 text-muted-foreground opacity-0 transition hover:text-red-400 group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-border px-4 py-2.5">
              <Link
                to="/notifications"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-1.5 text-xs font-semibold text-primary transition hover:underline"
              >
                See all notifications <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
