import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Users,
  MapPin,
  Star,
  Check,
  X,
  ChevronDown,
  Utensils,
  BedDouble,
  Calendar,
  Shield,
  Loader2,
  ArrowLeft,
  IndianRupee,
  Zap,
  Heart,
} from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useAuthModal } from "@/lib/auth-modal";
import { BookingModal } from "./BookingModal";
import { TripReviews } from "./TripReviews";
import type { Trip } from "@/lib/types";

const difficultyColor: Record<string, string> = {
  easy: "bg-emerald-400/20 text-emerald-300",
  moderate: "bg-amber-400/20 text-amber-300",
  challenging: "bg-orange-400/20 text-orange-300",
  extreme: "bg-red-400/20 text-red-300",
};

function ItineraryDay({ day, isLast }: { day: Trip["itinerary"][number]; isLast: boolean }) {
  const [open, setOpen] = useState(day.day === 1);
  return (
    <div className={`relative pl-8 ${!isLast ? "pb-6" : ""}`}>
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-[11px] top-6 h-full w-0.5 bg-white/10" />
      )}
      {/* Timeline dot */}
      <div className="absolute left-0 top-1 grid h-6 w-6 place-items-center rounded-full gradient-sunset text-[10px] font-bold text-white shadow-glow">
        {day.day}
      </div>

      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-2xl bg-white/5 px-4 py-3 text-left transition hover:bg-white/10"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Day {day.day}
          </p>
          <p className="mt-0.5 font-semibold">{day.title}</p>
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-2 space-y-3 rounded-2xl bg-white/3 px-4 py-4">
              <p className="text-sm text-muted-foreground">{day.description}</p>

              {day.activities.length > 0 && (
                <ul className="space-y-1.5">
                  {day.activities.map((act, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Zap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      {act}
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex flex-wrap gap-3 pt-1">
                {day.meals.breakfast && (
                  <span className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-xs">
                    <Utensils className="h-3 w-3" /> Breakfast
                  </span>
                )}
                {day.meals.lunch && (
                  <span className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-xs">
                    <Utensils className="h-3 w-3" /> Lunch
                  </span>
                )}
                {day.meals.dinner && (
                  <span className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-xs">
                    <Utensils className="h-3 w-3" /> Dinner
                  </span>
                )}
                {day.accommodation && (
                  <span className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-xs">
                    <BedDouble className="h-3 w-3" /> {day.accommodation}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function TripDetail({ slug }: { slug: string }) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [activeImg, setActiveImg] = useState(0);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savingTrip, setSavingTrip] = useState(false);
  const [alreadyBooked, setAlreadyBooked] = useState(false);

  const { isAuthenticated, user } = useAuth();
  const { openAuth } = useAuthModal();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.savedTrips && trip) {
      const ids = (user.savedTrips as unknown[]).map((t) =>
        typeof t === "string" ? t : (t as { _id: string })._id,
      );
      setSaved(ids.includes(trip._id));
    }
  }, [user, trip]);

  // Check if the user already has an active booking for this trip
  useEffect(() => {
    if (!isAuthenticated || !trip) return;
    api.getMyBookings().then((res) => {
      if (!res.success) return;
      const bookings = (res.data as Array<{ trip: string | { _id: string }; status: string }>) ?? [];
      const hasActive = bookings.some((b) => {
        const tid = typeof b.trip === "string" ? b.trip : b.trip?._id;
        return tid === trip._id && b.status !== "cancelled";
      });
      setAlreadyBooked(hasActive);
    }).catch(() => {});
  }, [isAuthenticated, trip]);

  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      openAuth();
      return;
    }
    if (!trip) return;
    setSavingTrip(true);
    try {
      await api.saveTrip(trip._id);
      setSaved((s) => !s);
      toast.success(saved ? "Removed from saved trips" : "Saved to your trips ❤️");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not update saved trips");
    } finally {
      setSavingTrip(false);
    }
  };

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await api.getTripBySlug(slug);
        if (res.success && res.data) {
          const t = res.data as Trip;
          setTrip(t);
          if (t.departureDate?.length) setSelectedDate(t.departureDate[0]);
        } else {
          setError("Trip not found.");
        }
      } catch {
        setError("Failed to load trip details.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">{error ?? "Trip not found."}</p>
        <Link to="/" className="rounded-full gradient-sunset px-5 py-2 text-sm font-semibold text-white">
          Back to Home
        </Link>
      </div>
    );
  }

  const primaryImg = trip.images?.[activeImg]?.url ?? trip.images?.[0]?.url ?? "/placeholder.jpg";
  const formatINR = (n: number) => `₹${n.toLocaleString("en-IN")}`;
  const savings = trip.price.originalPrice
    ? trip.price.originalPrice - trip.price.amount
    : null;

  return (
    <article className="min-h-screen bg-background">
      {/* ── Hero ──────────────────────────────────────── */}
      <div className="relative h-[70vh] min-h-[420px] overflow-hidden">
        <motion.img
          key={activeImg}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          src={primaryImg}
          alt={trip.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-background via-black/30 to-transparent" />

        {/* Back button */}
        <Link
          to="/"
          className="absolute left-4 top-24 flex items-center gap-2 rounded-full bg-black/30 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-black/50 sm:left-8"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-10 sm:px-8 lg:px-16">
          <div className="mx-auto max-w-6xl">
            {trip.badge && (
              <span className="mb-3 inline-block rounded-full gradient-sunset px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-glow">
                {trip.badge}
              </span>
            )}
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              {trip.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-white/80">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {trip.destination}, {trip.country}
              </span>
              {trip.rating.count > 0 && (
                <span className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  {trip.rating.average.toFixed(1)} ({trip.rating.count} reviews)
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {trip.duration.days}D / {trip.duration.nights}N
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${difficultyColor[trip.difficulty] ?? "bg-white/10 text-white/70"}`}
              >
                {trip.difficulty}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Thumbnail strip ───────────────────────────── */}
      {trip.images.length > 1 && (
        <div className="mx-auto max-w-6xl px-4 sm:px-8 lg:px-16">
          <div className="flex gap-2 overflow-x-auto py-3 scrollbar-hide">
            {trip.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`h-16 w-24 shrink-0 overflow-hidden rounded-xl transition ${
                  i === activeImg ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "opacity-60 hover:opacity-100"
                }`}
              >
                <img src={img.url} alt={img.caption ?? ""} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Main layout ───────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8 lg:px-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">

          {/* ─ Left column ─ */}
          <div className="space-y-10">

            {/* Overview stats */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { icon: <Users className="h-5 w-5" />, label: "Group size", value: `Max ${trip.maxGroupSize}` },
                { icon: <Shield className="h-5 w-5" />, label: "Seats left", value: `${trip.availableSeats} available` },
                { icon: <MapPin className="h-5 w-5" />, label: "Departs from", value: trip.departureLocation || "TBD" },
                { icon: <Calendar className="h-5 w-5" />, label: "Duration", value: `${trip.duration.days} days` },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl glass p-4">
                  <div className="mb-1.5 text-primary">{s.icon}</div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
                  <p className="mt-0.5 text-sm font-semibold">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <section>
              <h2 className="text-2xl font-bold">About this trip</h2>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">{trip.description}</p>
            </section>

            {/* Highlights */}
            {trip.highlights.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold">Highlights</h2>
                <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  {trip.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2.5 rounded-2xl bg-white/5 px-4 py-3 text-sm">
                      <Star className="mt-0.5 h-4 w-4 shrink-0 fill-amber-400 text-amber-400" />
                      {h}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Itinerary */}
            {trip.itinerary.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold">Day-by-day itinerary</h2>
                <div className="mt-6 space-y-2">
                  {trip.itinerary.map((day, i) => (
                    <ItineraryDay key={day.day} day={day} isLast={i === trip.itinerary.length - 1} />
                  ))}
                </div>
              </section>
            )}

            {/* Includes / Excludes */}
            {(trip.includes.length > 0 || trip.excludes.length > 0) && (
              <section>
                <h2 className="text-2xl font-bold">What's included</h2>
                <div className="mt-4 grid gap-6 sm:grid-cols-2">
                  <div className="rounded-3xl bg-emerald-500/5 p-5 ring-1 ring-emerald-500/20">
                    <p className="mb-3 text-sm font-bold text-emerald-400">Included</p>
                    <ul className="space-y-2">
                      {trip.includes.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-3xl bg-red-500/5 p-5 ring-1 ring-red-500/20">
                    <p className="mb-3 text-sm font-bold text-red-400">Not included</p>
                    <ul className="space-y-2">
                      {trip.excludes.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <X className="h-4 w-4 shrink-0 text-red-400" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>
            )}

            {/* Tags */}
            {trip.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {trip.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border bg-white/5 px-3 py-1 text-xs capitalize text-muted-foreground"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Reviews */}
            <TripReviews tripId={trip._id} />
          </div>

          {/* ─ Sticky booking card ─ */}
          <aside>
            <div className="sticky top-28 rounded-3xl glass p-6 shadow-float">
              {/* Price */}
              <div className="mb-5 border-b border-white/10 pb-5">
                {savings && savings > 0 && (
                  <p className="mb-1 text-xs text-muted-foreground line-through">
                    {formatINR(trip.price.originalPrice!)}
                  </p>
                )}
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold">{formatINR(trip.price.amount)}</span>
                  <span className="mb-1 text-sm text-muted-foreground">/ person</span>
                </div>
                {savings && savings > 0 && (
                  <span className="mt-1 inline-block rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                    Save {formatINR(savings)}
                  </span>
                )}
              </div>

              {/* Seats */}
              <div className="mb-4 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Available seats</span>
                <span
                  className={`font-semibold ${trip.availableSeats <= 3 ? "text-red-400" : "text-emerald-400"}`}
                >
                  {trip.availableSeats} left
                </span>
              </div>

              {/* Date selector */}
              {trip.departureDate.length > 0 && (
                <div className="mb-4">
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    Departure date
                  </label>
                  <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full rounded-2xl bg-white/5 px-4 py-2.5 text-sm outline-none transition focus:bg-white/10"
                  >
                    {trip.departureDate.map((d) => (
                      <option key={d} value={d}>
                        {new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {alreadyBooked ? (
                <button
                  onClick={() => navigate({ to: "/dashboard" })}
                  className="flex w-full items-center justify-center gap-2 rounded-full gradient-aurora py-3 text-sm font-bold text-white shadow-glow transition hover:scale-[1.02]"
                >
                  <Check className="h-4 w-4" />
                  Go to Dashboard
                </button>
              ) : (
                <button
                  onClick={() => { if (!isAuthenticated) { openAuth(); return; } setBookingOpen(true); }}
                  disabled={trip.status === "soldout" || trip.availableSeats === 0}
                  className="flex w-full items-center justify-center gap-2 rounded-full gradient-sunset py-3 text-sm font-bold text-white shadow-glow transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <IndianRupee className="h-4 w-4" />
                  {trip.status === "soldout" ? "Sold Out" : "Book Now"}
                </button>
              )}

              <button
                onClick={handleToggleSave}
                disabled={savingTrip}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 py-2.5 text-sm font-semibold transition hover:bg-white/10 disabled:opacity-50"
              >
                <Heart className={`h-4 w-4 ${saved ? "fill-red-500 text-red-500" : ""}`} />
                {saved ? "Saved" : "Save trip"}
              </button>

              <p className="mt-3 text-center text-xs text-muted-foreground">
                No payment charged yet — confirm later
              </p>

              {/* Quick facts */}
              <div className="mt-5 space-y-2 border-t border-white/10 pt-5 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5 text-primary" />
                  Free cancellation up to 30 days before
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-primary" />
                  Instant confirmation
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-primary" />
                  Small group — max {trip.maxGroupSize} travellers
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile sticky bottom bar */}
      <div className="sticky bottom-0 z-40 border-t border-white/10 bg-background/90 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground">From</p>
            <p className="text-xl font-bold">{formatINR(trip.price.amount)}</p>
          </div>
          {alreadyBooked ? (
            <button
              onClick={() => navigate({ to: "/dashboard" })}
              className="flex-1 rounded-full gradient-aurora py-3 text-sm font-bold text-white shadow-glow transition hover:scale-[1.02]"
            >
              Go to Dashboard
            </button>
          ) : (
            <button
              onClick={() => { if (!isAuthenticated) { openAuth(); return; } setBookingOpen(true); }}
              disabled={trip.status === "soldout" || trip.availableSeats === 0}
              className="flex-1 rounded-full gradient-sunset py-3 text-sm font-bold text-white shadow-glow transition hover:scale-[1.02] disabled:opacity-50"
            >
              {trip.status === "soldout" ? "Sold Out" : "Book Now"}
            </button>
          )}
        </div>
      </div>

      <BookingModal trip={trip} open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </article>
  );
}
