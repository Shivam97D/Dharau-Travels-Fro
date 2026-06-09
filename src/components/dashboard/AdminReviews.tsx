import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Star, Check, X } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

interface ReviewRow {
  _id: string;
  rating: number;
  title: string;
  comment: string;
  status: string;
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

  const load = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (filterStatus) params.status = filterStatus;
      const res = await api.getAllReviews(params);
      if (res.success) setReviews((res.data as ReviewRow[]) ?? []);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filterStatus]);

  const moderate = async (id: string, status: string) => {
    setBusy(id);
    try {
      await api.updateReviewStatus(id, status);
      toast.success(`Review ${status}`);
      setReviews((prev) =>
        filterStatus && filterStatus !== status
          ? prev.filter((r) => r._id !== id)
          : prev.map((r) => (r._id === id ? { ...r, status } : r)),
      );
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl glass p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Review Moderation</h2>
          <p className="mt-1 text-sm text-muted-foreground">Approve or reject traveler reviews</p>
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

      {loading ? (
        <div className="flex justify-center rounded-3xl glass p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-3xl glass p-12 text-center text-sm text-muted-foreground">No reviews here.</div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <motion.div key={r._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl glass p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star key={n} className={`h-4 w-4 ${n <= r.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}`} />
                      ))}
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusStyles[r.status]}`}>{r.status}</span>
                  </div>
                  <p className="mt-2 font-semibold">{r.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{r.comment}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {r.user?.name ?? "Traveler"} on {r.trip?.title ?? "trip"} · {new Date(r.createdAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
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
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
