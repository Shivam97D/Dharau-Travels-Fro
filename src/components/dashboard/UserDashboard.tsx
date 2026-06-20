import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Plane,
  Calendar,
  Heart,
  MapPin,
  
  ArrowRight,
  Clock,
  XCircle,
  Settings,
  CreditCard,
} from "lucide-react";
import { TravelLoader, TravelDots } from "@/components/ui/TravelLoader";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import api from "@/lib/api";
import { payForBooking } from "@/lib/razorpay";
import { useAuth } from "@/lib/auth-context";
import type { Booking, Trip } from "@/lib/types";

const formatINR = (n: number) => `₹${(n ?? 0).toLocaleString("en-IN")}`;

const statusStyles: Record<string, string> = {
  pending: "bg-amber-400/20 text-amber-300",
  confirmed: "bg-emerald-400/20 text-emerald-300",
  completed: "bg-sky-400/20 text-sky-300",
  cancelled: "bg-red-400/20 text-red-300",
};

export function UserDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [saved, setSaved] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [paying, setPaying] = useState<string | null>(null);
  const [unsaving, setUnsaving] = useState<string | null>(null);
  const { user } = useAuth();

  const load = async () => {
    try {
      setLoading(true);
      const [bRes, sRes] = await Promise.all([api.getMyBookings(), api.getSavedTrips()]);
      if (bRes.success) setBookings((bRes.data as Booking[]) ?? []);
      if (sRes.success) setSaved((sRes.data as Trip[]) ?? []);
    } catch {
      /* handled by empty states */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCancel = async (b: Booking) => {
    if (!confirm("Cancel this booking request?")) return;
    setCancelling(b._id);
    try {
      await api.cancelBooking(b._id, "Cancelled by user");
      toast.success("Booking cancelled");
      setBookings((prev) => prev.map((x) => (x._id === b._id ? { ...x, status: "cancelled" } : x)));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not cancel booking");
    } finally {
      setCancelling(null);
    }
  };

  const handlePay = async (b: Booking) => {
    const trip = typeof b.trip === "string" ? null : b.trip;
    setPaying(b._id);
    try {
      const result = await payForBooking({
        bookingId: b._id,
        tripTitle: trip?.title ?? "Trip",
        prefill: { name: user?.name, email: user?.email, contact: user?.phone },
      });
      if (result.status === "success") {
        toast.success("Payment successful — booking confirmed! 🎉");
        setBookings((prev) =>
          prev.map((x) =>
            x._id === b._id ? { ...x, status: "confirmed", payment: { ...x.payment, status: "completed" } } : x,
          ),
        );
      } else if (result.status === "error") {
        toast.error(result.message);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not start payment");
    } finally {
      setPaying(null);
    }
  };

  const handleUnsave = async (tripId: string) => {
    setUnsaving(tripId);
    try {
      await api.saveTrip(tripId); // toggles: removes since it's already saved
      setSaved((prev) => prev.filter((t) => t._id !== tripId));
      toast.success("Removed from saved trips");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not remove trip");
    } finally {
      setUnsaving(null);
    }
  };

  const activeBookings = bookings.filter((b) => b.status !== "cancelled");

  const stats = [
    { label: "Bookings", value: activeBookings.length, icon: <Calendar className="h-6 w-6 text-white" />, gradient: "gradient-aurora" },
    { label: "Confirmed Trips", value: bookings.filter((b) => b.status === "confirmed").length, icon: <Plane className="h-6 w-6 text-white" />, gradient: "gradient-sunset" },
    { label: "Saved Trips", value: saved.length, icon: <Heart className="h-6 w-6 text-white" />, gradient: "bg-gradient-to-br from-purple-500 to-pink-500" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">My Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Manage your trips, bookings, and account</p>
        </div>
        <Link
          to="/profile"
          className="flex items-center gap-2 rounded-full glass px-5 py-2.5 text-sm font-medium transition hover:bg-white/10"
        >
          <Settings className="h-4 w-4" /> Account Settings
        </Link>
      </motion.div>

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-3xl glass">
          <TravelDots />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid gap-6 sm:grid-cols-3">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-3xl glass p-6"
              >
                <div className={`grid h-12 w-12 place-items-center rounded-2xl ${s.gradient}`}>{s.icon}</div>
                <h3 className="mt-4 text-3xl font-bold">{s.value}</h3>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Bookings */}
          <div className="mt-8 rounded-3xl glass p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">My Bookings</h2>
              <Link to="/" className="flex items-center gap-1 text-sm text-primary hover:underline">
                Browse trips <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {bookings.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <Plane className="h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No bookings yet.</p>
                <Link to="/" className="rounded-full gradient-sunset px-5 py-2 text-sm font-semibold text-white shadow-glow">
                  Explore trips
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((b) => {
                  const trip = typeof b.trip === "string" ? null : b.trip;
                  return (
                    <div key={b._id} className="flex flex-col gap-3 rounded-2xl bg-white/5 p-4 sm:flex-row sm:items-center">
                      {trip?.images?.[0] && (
                        <img src={trip.images[0].url} alt={trip.title} className="h-16 w-24 shrink-0 rounded-xl object-cover" />
                      )}
                      <div className="flex-1">
                        <p className="font-semibold">{trip?.title ?? "Trip"}</p>
                        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          {trip?.destination && (
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{trip.destination}</span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(b.departureDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                          <span>#{b.bookingId}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-bold">{formatINR(b.pricing?.totalAmount)}</p>
                          <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusStyles[b.status] ?? "bg-white/10"}`}>
                            {b.status}
                          </span>
                        </div>
                        {b.payment?.status !== "completed" && b.status !== "cancelled" && b.status !== "completed" ? (
                          <button
                            onClick={() => handlePay(b)}
                            disabled={paying === b._id}
                            title="Pay now"
                            className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20 disabled:opacity-50"
                          >
                            {paying === b._id ? <TravelDots /> : <CreditCard className="h-4 w-4" />}
                            Pay now
                          </button>
                        ) : null}
                        {b.status === "pending" || b.status === "confirmed" ? (
                          <button
                            onClick={() => handleCancel(b)}
                            disabled={cancelling === b._id}
                            title="Cancel booking"
                            className="rounded-lg bg-red-500/10 p-2 text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
                          >
                            {cancelling === b._id ? <TravelDots /> : <XCircle className="h-4 w-4" />}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Saved trips */}
          <div className="mt-8 rounded-3xl glass p-6">
            <h2 className="mb-4 text-xl font-bold">Saved Trips</h2>
            {saved.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                You haven't saved any trips yet. Tap the heart on a trip to save it here.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {saved.map((t) => (
                  <div key={t._id} className="group relative overflow-hidden rounded-2xl bg-white/5 transition hover:bg-white/10">
                    <Link
                      to="/trips/$slug"
                      params={{ slug: t.slug }}
                      className="block"
                    >
                      {t.images?.[0] && (
                        <img src={t.images[0].url} alt={t.title} className="h-32 w-full object-cover transition group-hover:scale-105" />
                      )}
                      <div className="p-4">
                        <p className="font-semibold">{t.title}</p>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" /> {t.destination}
                        </p>
                        <p className="mt-2 font-bold">{formatINR(t.price?.amount)}</p>
                      </div>
                    </Link>
                    <button
                      onClick={() => handleUnsave(t._id)}
                      disabled={unsaving === t._id}
                      title="Remove from saved"
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-red-500/70 disabled:opacity-50"
                    >
                      {unsaving === t._id
                        ? <TravelDots />
                        : <XCircle className="h-4 w-4" />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
