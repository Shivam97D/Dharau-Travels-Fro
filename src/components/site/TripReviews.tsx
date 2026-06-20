import { useEffect, useState } from "react";
import { Star,  ThumbsUp, Send } from "lucide-react";
import { TravelLoader, TravelDots } from "@/components/ui/TravelLoader";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useAuthModal } from "@/lib/auth-modal";
import type { Review, Booking } from "@/lib/types";

function Stars({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type={onChange ? "button" : undefined}
          disabled={!onChange}
          onClick={onChange ? () => onChange(n) : undefined}
          className={onChange ? "transition hover:scale-110" : "cursor-default"}
        >
          <Star
            className={`h-4 w-4 ${n <= value ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}`}
          />
        </button>
      ))}
    </div>
  );
}

export function TripReviews({ tripId }: { tripId: string }) {
  const { isAuthenticated } = useAuth();
  const { openAuth } = useAuthModal();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [eligibleBooking, setEligibleBooking] = useState<Booking | null>(null);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadReviews = async () => {
    try {
      const res = await api.getTripReviews(tripId);
      if (res.success && res.data) setReviews(res.data as Review[]);
    } catch {
      /* non-fatal */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [tripId]);

  // Determine review eligibility: must have a booking for this trip and not have reviewed yet.
  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      try {
        const res = await api.getMyBookings();
        const bookings = ((res.data as Booking[]) ?? []).filter(
          (b) => (typeof b.trip === "string" ? b.trip : b.trip?._id) === tripId,
        );
        const eligible = bookings.find((b) => b.status === "confirmed" || b.status === "completed");
        setEligibleBooking(eligible ?? null);
      } catch {
        /* ignore */
      }
    })();
  }, [isAuthenticated, tripId]);

  const handleSubmit = async () => {
    if (!eligibleBooking) return;
    if (!title.trim() || !comment.trim()) {
      toast.error("Please add a title and a comment");
      return;
    }
    setSubmitting(true);
    try {
      await api.createReview({
        trip: tripId,
        booking: eligibleBooking._id,
        rating,
        title,
        comment,
      });
      toast.success("Thanks! Your review is awaiting approval. 🌟");
      setAlreadyReviewed(true);
      setTitle("");
      setComment("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpful = async (id: string) => {
    if (!isAuthenticated) return openAuth();
    try {
      await api.markReviewHelpful(id);
      setReviews((prev) =>
        prev.map((r) => (r._id === id ? { ...r, helpful: { count: (r.helpful?.count ?? 0) + 1 } } : r)),
      );
    } catch {
      /* ignore */
    }
  };

  return (
    <section>
      <h2 className="text-2xl font-bold">Traveler reviews</h2>

      {/* Write a review (only for eligible bookers) */}
      {isAuthenticated && eligibleBooking && !alreadyReviewed && (
        <div className="mt-4 rounded-3xl glass p-5">
          <p className="text-sm font-semibold">Share your experience</p>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Your rating</span>
            <Stars value={rating} onChange={setRating} />
          </div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Review title"
            className="mt-3 w-full rounded-2xl bg-white/5 px-4 py-2.5 text-sm outline-none transition focus:bg-white/10"
          />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Tell other travelers about your trip…"
            className="mt-3 w-full rounded-2xl bg-white/5 px-4 py-2.5 text-sm outline-none transition focus:bg-white/10"
          />
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="mt-3 flex items-center gap-2 rounded-full gradient-sunset px-5 py-2 text-sm font-semibold text-white shadow-glow transition hover:scale-[1.02] disabled:opacity-50"
          >
            {submitting ? <TravelDots /> : <Send className="h-4 w-4" />}
            Submit review
          </button>
        </div>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="mt-6 flex justify-center">
          <TravelLoader size="sm" />
        </div>
      ) : reviews.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          No reviews yet — be the first to share your journey.
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          {reviews.map((r) => (
            <div key={r._id} className="rounded-3xl bg-white/5 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-full gradient-sunset text-sm font-semibold text-white">
                    {r.user?.name?.charAt(0).toUpperCase() ?? "?"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{r.user?.name ?? "Traveler"}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(r.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <Stars value={r.rating} />
              </div>
              <p className="mt-3 font-semibold">{r.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{r.comment}</p>
              <button
                onClick={() => handleHelpful(r._id)}
                className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition hover:text-foreground"
              >
                <ThumbsUp className="h-3.5 w-3.5" /> Helpful ({r.helpful?.count ?? 0})
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
