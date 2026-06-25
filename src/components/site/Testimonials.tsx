import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, ChevronDown,  ChevronLeft, ChevronRight } from "lucide-react";
import { TravelLoader, TravelDots } from "@/components/ui/TravelLoader";
import { toast } from "sonner";
import { SectionHeader } from "./Section";
import { useAuth } from "@/lib/auth-context";
import { useAuthModal } from "@/lib/auth-modal";
import api from "@/lib/api";

interface Review {
  _id: string;
  user: { name: string; avatar?: string };
  trip?: { title: string; destination: string } | null;
  tripName?: string;
  rating: number;
  title: string;
  comment: string;
  isVerified: boolean;
  createdAt: string;
}

interface TripOption { _id: string; title: string; }

function Stars({ n, size = "h-4 w-4" }: { n: number; size?: string }) {
  return (
    <div className="flex gap-0.5 text-amber-400">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`${size} ${i < n ? "fill-current" : "fill-none opacity-30"}`} />
      ))}
    </div>
  );
}

function ReviewCard({ r }: { r: Review }) {
  const initials = (r.user?.name ?? "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const gradients = ["gradient-sunset", "gradient-ocean", "gradient-tropic", "gradient-aurora"];
  const g = gradients[r._id.charCodeAt(0) % gradients.length];
  return (
    <motion.figure
      whileHover={{ y: -4 }}
      className="w-[340px] flex-shrink-0 rounded-3xl border border-border bg-card p-6 shadow-soft"
    >
      <Stars n={r.rating} />
      <blockquote className="mt-3 line-clamp-3 text-sm leading-relaxed text-foreground/90">
        "{r.comment}"
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-3 border-t border-border pt-4">
        {r.user?.avatar ? (
          <img src={r.user.avatar} alt={r.user?.name ?? "Guest"} className="h-10 w-10 rounded-full object-cover" />
        ) : (
          <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${g} text-sm font-bold text-primary-foreground`}>
            {initials}
          </div>
        )}
        <div>
          <div className="flex items-center gap-1.5 text-sm font-bold">
            {r.user?.name ?? "Guest"}
            {r.isVerified && (
              <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] text-green-600">verified</span>
            )}
          </div>
          <div className="text-xs text-muted-foreground">{r.trip?.title || r.tripName || "Dharavu Journey"}</div>
        </div>
      </figcaption>
    </motion.figure>
  );
}

function TripComboBox({
  trips,
  loadingTrips,
  onSelect,
}: {
  trips: TripOption[];
  loadingTrips: boolean;
  onSelect: (value: { id: string; name: string } | { id: null; name: string }) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null); // trip id if from list
  const ref = useRef<HTMLDivElement>(null);

  const filtered = query.trim()
    ? trips.filter((t) => t.title.toLowerCase().includes(query.toLowerCase()))
    : trips;

  const choose = (t: TripOption) => {
    setQuery(t.title);
    setSelected(t._id);
    setOpen(false);
    onSelect({ id: t._id, name: t.title });
  };

  const handleInput = (val: string) => {
    setQuery(val);
    setSelected(null);
    setOpen(true);
    onSelect({ id: null, name: val });
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => handleInput(e.target.value)}
        onFocus={() => setOpen(true)}
        placeholder="Search or type a trip name…"
        className="w-full rounded-2xl border border-border bg-muted/40 px-4 py-2.5 pr-10 text-sm outline-none transition focus:border-primary focus:bg-card"
        autoComplete="off"
      />
      <ChevronDown
        className={`pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
      />
      {/* indicator */}
      {query.trim() && (
        <p className="mt-1 text-xs text-muted-foreground">
          {selected
            ? <span className="text-emerald-500">✓ Trip selected from list</span>
            : <span className="text-amber-500">Custom name — admin will confirm the trip</span>}
        </p>
      )}
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-2xl border border-border bg-card shadow-float"
          >
            {loadingTrips ? (
              <li className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
                <TravelDots /> Loading…
              </li>
            ) : filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-muted-foreground">
                No matching trips — your typed name will be used
              </li>
            ) : (
              filtered.map((t) => (
                <li
                  key={t._id}
                  onMouseDown={() => choose(t)}
                  className="cursor-pointer px-4 py-2.5 text-sm transition hover:bg-white/10"
                >
                  {t.title}
                </li>
              ))
            )}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

function WriteReviewModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: () => void }) {
  const [trips, setTrips] = useState<TripOption[]>([]);
  const [tripId, setTripId] = useState<string | null>(null);
  const [tripName, setTripName] = useState("");
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingTrips, setLoadingTrips] = useState(true);

  useEffect(() => {
    api.getTrips({ limit: "100" })
      .then((res: any) => setTrips(res.data?.data ?? res.data ?? []))
      .catch(() => {})
      .finally(() => setLoadingTrips(false));
  }, []);

  const handleSelect = (val: { id: string; name: string } | { id: null; name: string }) => {
    setTripId(val.id);
    setTripName(val.name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripId && !tripName.trim()) { toast.error("Please select or type a trip name"); return; }
    if (!title.trim()) { toast.error("Please add a review title"); return; }
    if (!comment.trim()) { toast.error("Please write your experience"); return; }
    setLoading(true);
    try {
      await api.createReview({
        ...(tripId ? { trip: tripId } : { tripName: tripName.trim() }),
        rating, title, comment,
      });
      toast.success("Review submitted! It will appear after approval.");
      onSubmit();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md overflow-hidden rounded-[2rem] bg-card shadow-float"
      >
        <div className="relative h-20 gradient-aurora">
          <div className="absolute inset-0 bg-grain opacity-40" />
        </div>
        <button
          onClick={onClose}
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="px-6 pb-6 pt-5">
          <h2 className="text-xl font-bold">Write a review</h2>
          <p className="mt-1 text-sm text-muted-foreground">Share your Dharavu experience with future travelers.</p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Trip</label>
              <TripComboBox trips={trips} loadingTrips={loadingTrips} onSelect={handleSelect} />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" onClick={() => setRating(n)} className="transition hover:scale-110">
                    <Star className={`h-7 w-7 ${n <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Review title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                placeholder="Sum it up in one line…"
                className="w-full rounded-2xl border border-border bg-muted/40 px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:bg-card"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Your experience</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={1000}
                rows={4}
                placeholder="Tell future travelers what made this special…"
                className="w-full resize-none rounded-2xl border border-border bg-muted/40 px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:bg-card"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl gradient-sunset py-3 text-sm font-semibold text-primary-foreground shadow-glow transition hover:scale-[1.02] disabled:opacity-50"
            >
              {loading && <TravelDots />}
              Submit review
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export function Testimonials() {
  const { isAuthenticated } = useAuth();
  const { openAuth } = useAuthModal();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isPaused = useRef(false);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "right" ? 360 : -360, behavior: "smooth" });
  };

  useEffect(() => {
    if (reviews.length <= 1) return;
    const timer = setInterval(() => {
      if (isPaused.current || !scrollRef.current) return;
      const el = scrollRef.current;
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: 360, behavior: "smooth" });
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [reviews.length]);

  const fetchReviews = () => {
    setLoading(true);
    api.getHomeReviews()
      .then((res: any) => setReviews(res.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleWriteReview = () => {
    if (!isAuthenticated) { openAuth(); return; }
    setShowModal(true);
  };

  return (
    <>
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {/* Header row — Write a review on desktop only */}
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeader
              eyebrow="Travelers say"
              title={
                <>
                  Real journeys, <span className="italic text-gradient-sunset">real stories</span>
                </>
              }
            />
            <button
              onClick={handleWriteReview}
              className="hidden sm:block self-start sm:self-auto rounded-full gradient-sunset px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition hover:scale-105"
            >
              Write a review
            </button>
          </div>
        </div>

        {loading ? (
          <div className="mt-16 flex justify-center">
            <TravelLoader />
          </div>
        ) : reviews.length === 0 ? (
          <div className="mt-16 text-center">
            <p className="text-sm text-muted-foreground">No reviews yet.</p>
            <button
              onClick={handleWriteReview}
              className="mt-4 rounded-full gradient-sunset px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition hover:scale-105"
            >
              Be the first to review
            </button>
          </div>
        ) : (
          <div className="relative mt-12">
            {/* Prev/Next arrows overlaid on the scroll area */}
            <button
              onClick={() => scroll("left")}
              aria-label="Previous reviews"
              className="absolute left-1 top-1/2 z-10 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full border border-border bg-card/90 shadow-float backdrop-blur-sm transition hover:scale-110 hover:bg-card sm:left-2"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div
              ref={scrollRef}
              className="flex gap-5 overflow-x-auto scroll-smooth px-14 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              style={{ cursor: "grab" }}
              onMouseEnter={() => { isPaused.current = true; }}
              onMouseLeave={() => { isPaused.current = false; }}
              onMouseDown={(e) => {
                isPaused.current = true;
                const el = scrollRef.current;
                if (!el) return;
                el.style.cursor = "grabbing";
                const startX = e.pageX - el.offsetLeft;
                const startScroll = el.scrollLeft;
                const onMove = (ev: MouseEvent) => {
                  el.scrollLeft = startScroll - (ev.pageX - el.offsetLeft - startX);
                };
                const onUp = () => {
                  el.style.cursor = "grab";
                  isPaused.current = false;
                  window.removeEventListener("mousemove", onMove);
                  window.removeEventListener("mouseup", onUp);
                };
                window.addEventListener("mousemove", onMove);
                window.addEventListener("mouseup", onUp);
              }}
            >
              {reviews.map((r) => (
                <ReviewCard key={r._id} r={r} />
              ))}
            </div>

            <button
              onClick={() => scroll("right")}
              aria-label="Next reviews"
              className="absolute right-1 top-1/2 z-10 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full border border-border bg-card/90 shadow-float backdrop-blur-sm transition hover:scale-110 hover:bg-card sm:right-2"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Write a review — below the cards, mobile only */}
        {reviews.length > 0 && (
          <div className="mt-6 flex justify-center sm:hidden">
            <button
              onClick={handleWriteReview}
              className="rounded-full gradient-sunset px-8 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition hover:scale-105"
            >
              Write a review
            </button>
          </div>
        )}
      </section>

      <AnimatePresence>
        {showModal && (
          <WriteReviewModal
            onClose={() => setShowModal(false)}
            onSubmit={() => { setShowModal(false); fetchReviews(); }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
