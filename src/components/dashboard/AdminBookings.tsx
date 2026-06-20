import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {  MapPin, Calendar, Check, X, CreditCard, Download, Search } from "lucide-react";
import { TravelLoader, TravelDots } from "@/components/ui/TravelLoader";
import { toast } from "sonner";
import api from "@/lib/api";
import type { Booking, Trip } from "@/lib/types";

const formatINR = (n: number) => `₹${(n ?? 0).toLocaleString("en-IN")}`;

const statusStyles: Record<string, string> = {
  pending: "bg-amber-400/20 text-amber-300",
  confirmed: "bg-emerald-400/20 text-emerald-300",
  completed: "bg-sky-400/20 text-sky-300",
  cancelled: "bg-red-400/20 text-red-300",
};

export function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPayment, setFilterPayment] = useState("");
  const [filterTrip, setFilterTrip] = useState("");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // Build the active filter params (shared by load + export).
  const buildParams = () => {
    const params: Record<string, string> = {};
    if (filterStatus) params.status = filterStatus;
    if (filterPayment) params.paymentStatus = filterPayment;
    if (filterTrip) params.trip = filterTrip;
    if (search.trim()) params.search = search.trim();
    return params;
  };

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.getAllBookings(buildParams());
      if (res.success) setBookings((res.data as Booking[]) ?? []);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  // Load trips once for the trip-wise filter dropdown.
  useEffect(() => {
    api.getAdminTrips({ limit: "200" })
      .then((res) => { if (res.success) setTrips((res.data as Trip[]) ?? []); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, filterPayment, filterTrip]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await api.exportBookings(buildParams());
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bookings-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Bookings exported");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(false);
    }
  };

  const setStatus = async (id: string, status: string) => {
    setBusy(id);
    try {
      await api.updateBookingStatus(id, status);
      toast.success(`Booking ${status}`);
      setBookings((prev) => prev.map((b) => (b._id === id ? { ...b, status: status as Booking["status"] } : b)));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(null);
    }
  };

  const markPaid = async (id: string) => {
    setBusy(id);
    try {
      await api.updatePaymentStatus(id, { status: "completed", method: "cash" });
      toast.success("Payment marked as completed");
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status: "confirmed", payment: { ...b.payment, status: "completed" } } : b)),
      );
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl glass p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Bookings</h2>
            <p className="mt-1 text-sm text-muted-foreground">Confirm, complete, cancel, or export bookings</p>
          </div>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex items-center justify-center gap-2 rounded-2xl gradient-sunset px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:scale-[1.02] disabled:opacity-50"
          >
            {exporting ? <TravelDots /> : <Download className="h-4 w-4" />}
            Export CSV
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <form
            onSubmit={(e) => { e.preventDefault(); load(); }}
            className="relative sm:col-span-2 lg:col-span-1"
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search booking ID…"
              className="w-full rounded-2xl bg-white/5 py-2 pl-9 pr-3 text-sm outline-none transition focus:bg-white/10"
            />
          </form>
          <select
            value={filterTrip}
            onChange={(e) => setFilterTrip(e.target.value)}
            className="rounded-2xl bg-white/5 px-4 py-2 text-sm outline-none transition focus:bg-white/10"
          >
            <option value="">All Trips</option>
            {trips.map((t) => (
              <option key={t._id} value={t._id}>{t.title}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-2xl bg-white/5 px-4 py-2 text-sm outline-none transition focus:bg-white/10"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            className="rounded-2xl bg-white/5 px-4 py-2 text-sm outline-none transition focus:bg-white/10"
          >
            <option value="">All Payments</option>
            <option value="pending">Payment Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center rounded-3xl glass p-12">
          <TravelLoader />
        </div>
      ) : bookings.length === 0 ? (
        <div className="rounded-3xl glass p-12 text-center text-sm text-muted-foreground">No bookings found.</div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => {
            const trip = typeof b.trip === "string" ? null : b.trip;
            const user = typeof b.user === "string" ? null : b.user;
            const travelers = (b.travelers?.adults ?? 0) + (b.travelers?.children ?? 0) + (b.travelers?.infants ?? 0);
            return (
              <motion.div
                key={b._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col gap-3 rounded-2xl glass p-4 lg:flex-row lg:items-center"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{trip?.title ?? "Trip"}</p>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusStyles[b.status]}`}>
                      {b.status}
                    </span>
                    {b.payment?.status === "completed" && (
                      <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-xs text-emerald-300">paid</span>
                    )}
                  </div>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span>#{b.bookingId}</span>
                    {user && <span>{user.name} · {user.email}</span>}
                    {trip?.destination && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{trip.destination}</span>}
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(b.departureDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                    <span>{travelers} traveler{travelers !== 1 ? "s" : ""}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{formatINR(b.pricing?.totalAmount)}</span>
                  {b.status === "pending" && (
                    <button onClick={() => setStatus(b._id, "confirmed")} disabled={busy === b._id} title="Confirm" className="rounded-lg bg-emerald-500/10 p-2 text-emerald-300 transition hover:bg-emerald-500/20 disabled:opacity-50">
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  {(b.status === "pending" || b.status === "confirmed") && (
                    <button onClick={() => markPaid(b._id)} disabled={busy === b._id} title="Mark paid" className="rounded-lg bg-sky-500/10 p-2 text-sky-300 transition hover:bg-sky-500/20 disabled:opacity-50">
                      <CreditCard className="h-4 w-4" />
                    </button>
                  )}
                  {b.status === "confirmed" && (
                    <button onClick={() => setStatus(b._id, "completed")} disabled={busy === b._id} title="Mark completed" className="rounded-lg bg-white/10 p-2 transition hover:bg-white/20 disabled:opacity-50">
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  {b.status !== "cancelled" && b.status !== "completed" && (
                    <button onClick={() => setStatus(b._id, "cancelled")} disabled={busy === b._id} title="Cancel" className="rounded-lg bg-red-500/10 p-2 text-red-400 transition hover:bg-red-500/20 disabled:opacity-50">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
