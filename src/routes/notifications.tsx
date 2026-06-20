import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCheck, Trash2, X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { useNotifications, type Notification } from "@/hooks/useNotifications";
import { useAuth } from "@/lib/auth-context";
import { timeAgo } from "@/lib/utils";

export const Route = createFileRoute("/notifications")({
  component: NotificationsPage,
});

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

const TYPE_COLOR: Record<string, string> = {
  booking_created: "bg-emerald-400/15 text-emerald-300",
  booking_confirmed: "bg-emerald-400/15 text-emerald-300",
  booking_cancelled: "bg-red-400/15 text-red-300",
  payment_success: "bg-sky-400/15 text-sky-300",
  payment_failed: "bg-red-400/15 text-red-300",
  inquiry_sent: "bg-amber-400/15 text-amber-300",
  inquiry_replied: "bg-purple-400/15 text-purple-300",
  review_posted: "bg-yellow-400/15 text-yellow-300",
  review_approved: "bg-emerald-400/15 text-emerald-300",
  new_user: "bg-primary/15 text-primary",
  profile_updated: "bg-muted text-muted-foreground",
  newsletter_subscribed: "bg-amber-400/15 text-amber-300",
  otp_sent: "bg-primary/15 text-primary",
  trip_saved: "bg-pink-400/15 text-pink-300",
  general: "bg-muted text-muted-foreground",
};

function NotificationRow({ n, onRead, onDelete, onClick }: {
  n: Notification;
  onRead: () => void;
  onDelete: () => void;
  onClick: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={`group relative flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition hover:shadow-soft ${
        !n.read
          ? "border-primary/30 bg-primary/5 shadow-[0_0_0_1px_oklch(var(--primary)/0.2)]"
          : "border-border bg-card/60"
      }`}
    >
      {/* Unread dot */}
      {!n.read && (
        <span className="absolute right-4 top-4 h-2 w-2 rounded-full gradient-sunset shadow-glow" />
      )}

      {/* Icon */}
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${TYPE_COLOR[n.type] ?? "bg-muted"}`}>
        {TYPE_ICON[n.type] ?? "🔔"}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className={`font-semibold leading-snug ${!n.read ? "text-foreground" : "text-muted-foreground"}`}>
            {n.title}
          </p>
          <span className="shrink-0 text-xs text-muted-foreground/60">{timeAgo(n.createdAt)}</span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{n.message}</p>
        {n.link && (
          <span className="mt-2 inline-block text-xs font-medium text-primary hover:underline">
            View details →
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex shrink-0 flex-col gap-1 opacity-0 transition group-hover:opacity-100">
        {!n.read && (
          <button
            onClick={(e) => { e.stopPropagation(); onRead(); }}
            title="Mark as read"
            className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-white/10 hover:text-primary"
          >
            <CheckCheck className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          title="Delete"
          className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-red-500/10 hover:text-red-400"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

function NotificationsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { notifications, unreadCount, loading, fetchAll, markRead, markAllRead, deleteOne, clearAll } = useNotifications();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate({ to: "/" });
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    fetchAll(page);
  }, [page, fetchAll]);

  const handleClick = async (n: Notification) => {
    if (!n.read) await markRead(n._id);
    if (n.link) navigate({ to: n.link as "/" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-32 sm:px-6">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link to="/" className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground">
              <ChevronLeft className="h-4 w-4" /> Back
            </Link>
            <h1 className="text-3xl font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <p className="mt-1 text-sm text-muted-foreground">
                You have <span className="font-semibold text-primary">{unreadCount}</span> unread notification{unreadCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead()}
                className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold transition hover:bg-white/10"
              >
                <CheckCheck className="h-3.5 w-3.5 text-primary" /> Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={() => { if (confirm("Clear all notifications?")) clearAll(); }}
                className="flex items-center gap-2 rounded-full border border-red-400/30 bg-red-500/5 px-4 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/10"
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear all
              </button>
            )}
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4 rounded-3xl glass py-20 text-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-aurora text-3xl">🔔</div>
            <p className="text-lg font-semibold">You're all caught up!</p>
            <p className="text-sm text-muted-foreground">Notifications about bookings, payments, and more will appear here.</p>
            <Link to="/" className="mt-2 rounded-full gradient-sunset px-6 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:scale-105">
              Explore trips
            </Link>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-3">
              {notifications.map((n) => (
                <NotificationRow
                  key={n._id}
                  n={n}
                  onRead={() => markRead(n._id)}
                  onDelete={() => deleteOne(n._id)}
                  onClick={() => handleClick(n)}
                />
              ))}
            </div>
          </AnimatePresence>
        )}

        {/* Pagination */}
        {notifications.length > 0 && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-full glass px-4 py-2 text-sm font-medium transition hover:bg-white/10 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-muted-foreground">Page {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={notifications.length < 20}
              className="rounded-full glass px-4 py-2 text-sm font-medium transition hover:bg-white/10 disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
