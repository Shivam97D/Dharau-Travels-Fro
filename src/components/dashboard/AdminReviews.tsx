import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Star, Check, X, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

interface ReviewRow {
  _id: string;
  rating: number;
  title: string;
  comment: string;
  status: string;
  sortOrder: number;
  createdAt: string;
  user?: { name?: string; email?: string };
  trip?: { title?: string; destination?: string };
}

const statusStyles: Record<string, string> = {
  pending: "bg-amber-400/20 text-amber-300",
  approved: "bg-emerald-400/20 text-emerald-300",
  rejected: "bg-red-400/20 text-red-300",
};

export function AdminReviews() {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("pending");
  const [busy, setBusy] = useState<string | null>(null);

  const load = async (status = filterStatus) => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (status) params.status = status;
      const res = await api.getAllReviews(params);
      if (res.success) {
        const rows = (res.data as ReviewRow[]) ?? [];
        const seen = new Set<string>();
        const unique = rows.filter((r) => { if (seen.has(r._id)) return false; seen.add(r._id); return true; });
        setReviews(unique.sort((a, b) => a.sortOrder - b.sortOrder));
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(filterStatus); }, [filterStatus]);

  const moderate = async (id: string, status: string) => {
    setBusy(id);
    try {
      await api.updateReviewStatus(id, status);
      toast.success(`Review ${status}`);
      await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(null);
    }
  };

  const deleteReview = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    setBusy(id);
    try {
      await api.deleteReview(id);
      toast.success("Review deleted");
      await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusy(null);
    }
  };

  const moveOrder = async (index: number, dir: -1 | 1) => {
    const swapIdx = index + dir;
    if (swapIdx < 0 || swapIdx >= reviews.length) return;
    const updated = [...reviews];
    const a = updated[index];
    const b = updated[swapIdx];
    // Swap sortOrder values
    const aOrder = a.sortOrder;
    a.sortOrder = b.sortOrder;
    b.sortOrder = aOrder;
    [updated[index], updated[swapIdx]] = [updated[swapIdx], updated[index]];
    setReviews(updated);
    try {
      await Promise.all([
        api.setReviewOrder(a._id, a.sortOrder),
        api.setReviewOrder(b._id, b.sortOrder),
      ]);
    } catch {
      toast.error("Could not save order");
      load(filterStatus);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl glass p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Review Moderation</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Approve, reject, delete, or reorder which reviews appear on the homepage.
          </p>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-2xl bg-white/5 px-4 py-2 text-sm outline-none transition focus:bg-white/10"
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="">All</option>
        </select>
      </div>

      {filterStatus === "approved" && (
        <div className="rounded-2xl border border-border/50 bg-card/50 px-4 py-3 text-xs text-muted-foreground">
          Use the ↑↓ arrows to control the order reviews appear in the homepage testimonials row.
        </div>
      )}

      {loading ? (
        <div className="flex justify-center rounded-3xl glass p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-3xl glass p-12 text-center text-sm text-muted-foreground">No reviews here.</div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r, idx) => (
            <motion.div key={r._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl glass p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star key={n} className={`h-4 w-4 ${n <= r.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}`} />
                      ))}
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusStyles[r.status]}`}>
                      {r.status}
                    </span>
                    {filterStatus === "approved" && (
                      <span className="text-xs text-muted-foreground">#{idx + 1}</span>
                    )}
                  </div>
                  <p className="mt-2 font-semibold">{r.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{r.comment}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {r.user?.name ?? "Traveler"} · {r.trip?.title ?? "trip"} · {new Date(r.createdAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                  {filterStatus === "approved" && (
                    <div className="flex flex-col gap-1">
                      <button onClick={() => moveOrder(idx, -1)} disabled={idx === 0 || busy === r._id} title="Move up" className="rounded-lg bg-white/5 p-1.5 transition hover:bg-white/10 disabled:opacity-30">
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button onClick={() => moveOrder(idx, 1)} disabled={idx === reviews.length - 1 || busy === r._id} title="Move down" className="rounded-lg bg-white/5 p-1.5 transition hover:bg-white/10 disabled:opacity-30">
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  {r.status !== "approved" && (
                    <button onClick={() => moderate(r._id, "approved")} disabled={busy === r._id} title="Approve" className="rounded-lg bg-emerald-500/10 p-2 text-emerald-300 transition hover:bg-emerald-500/20 disabled:opacity-50">
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  {r.status !== "rejected" && (
                    <button onClick={() => moderate(r._id, "rejected")} disabled={busy === r._id} title="Reject" className="rounded-lg bg-red-500/10 p-2 text-red-400 transition hover:bg-red-500/20 disabled:opacity-50">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  <button onClick={() => deleteReview(r._id)} disabled={busy === r._id} title="Delete" className="rounded-lg bg-red-500/10 p-2 text-red-400 transition hover:bg-red-500/20 disabled:opacity-50">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
