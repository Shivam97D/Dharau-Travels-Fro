import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, XCircle, Clock, Eye, RefreshCw,
  User, MapPin, IndianRupee, Calendar, ImageIcon,
} from "lucide-react";
import { TravelDots, TravelLoader } from "@/components/ui/TravelLoader";
import { toast } from "sonner";
import api from "@/lib/api";
import type { Booking } from "@/lib/types";

const formatINR = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

function StatusBadge({ booking }: { booking: Booking }) {
  const hasProof = !!booking.paymentProof?.url;
  const isVerified = !!booking.paymentProof?.verifiedAt;
  const isRejected = !!booking.paymentProof?.rejectedAt;

  if (isVerified) return <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-400">Verified</span>;
  if (isRejected) return <span className="rounded-full bg-red-500/15 px-2.5 py-1 text-xs font-semibold text-red-400">Rejected</span>;
  if (hasProof) return <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-400 animate-pulse">Pending Review</span>;
  return null;
}

// ─── Detail drawer ────────────────────────────────────────────────────────────
function PaymentDetail({
  booking,
  onClose,
  onVerified,
}: {
  booking: Booking;
  onClose: () => void;
  onVerified: () => void;
}) {
  const [action, setAction] = useState<"confirm" | "reject" | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [imgExpanded, setImgExpanded] = useState(false);

  const handle = async (a: "confirm" | "reject") => {
    if (a === "reject" && !note.trim()) {
      toast.error("Please add a rejection note for the customer");
      return;
    }
    setSubmitting(true);
    try {
      await api.adminVerifyPayment(booking._id, a, note);
      toast.success(a === "confirm" ? "Payment confirmed! Customer notified." : "Payment rejected. Customer notified.");
      onVerified();
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    } finally {
      setSubmitting(false);
    }
  };

  const trip = booking.trip as any;
  const user = booking.user as any;
  const alreadyActioned = !!(booking.paymentProof?.verifiedAt || booking.paymentProof?.rejectedAt);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl glass p-6 space-y-5"
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold">Payment Verification</h3>
            <p className="text-xs text-muted-foreground font-mono">{booking.bookingId}</p>
          </div>
          <StatusBadge booking={booking} />
        </div>

        {/* Booking info */}
        <div className="rounded-2xl bg-white/5 p-4 space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-4 w-4 shrink-0" />
            <span className="font-semibold text-foreground">{user?.name}</span>
            <span>·</span>
            <span>{user?.email}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="text-foreground">{trip?.title}</span>
            <span>·</span>
            <span>{trip?.destination}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <IndianRupee className="h-4 w-4 shrink-0" />
            <span className="text-lg font-bold text-foreground">{formatINR(booking.pricing?.totalAmount ?? 0)}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>Proof uploaded: {booking.paymentProof?.uploadedAt ? new Date(booking.paymentProof.uploadedAt).toLocaleString("en-IN") : "—"}</span>
          </div>
        </div>

        {/* Screenshot */}
        {booking.paymentProof?.url ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Payment Screenshot</p>
            <div
              className="relative cursor-zoom-in overflow-hidden rounded-2xl bg-black/30"
              onClick={() => setImgExpanded(true)}
            >
              <img
                src={booking.paymentProof.url}
                alt="Payment proof"
                className="w-full max-h-72 object-contain"
              />
              <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs text-white/70">
                <Eye className="h-3 w-3" /> Click to expand
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-2xl bg-white/5 p-8 text-muted-foreground">
            <ImageIcon className="h-8 w-8 opacity-40" />
            <p className="text-sm">No screenshot uploaded yet</p>
          </div>
        )}

        {/* Rejection note from previous rejection */}
        {booking.paymentProof?.rejectedAt && booking.paymentProof?.rejectionNote && (
          <div className="rounded-2xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-300">
            <p className="font-semibold mb-1">Rejection note sent to customer:</p>
            <p>{booking.paymentProof.rejectionNote}</p>
          </div>
        )}

        {/* Actions */}
        {!alreadyActioned && booking.paymentProof?.url && (
          <div className="space-y-3">
            {action === "reject" && (
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Rejection note (sent to customer) *</label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Screenshot is unclear, please re-upload · or · Amount mismatch ₹X paid vs ₹Y expected"
                  className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm outline-none transition focus:border-red-500/50 focus:bg-white/10"
                />
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => action === "confirm" ? handle("confirm") : setAction("confirm")}
                disabled={submitting}
                className={`flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-sm font-bold transition ${
                  action === "confirm"
                    ? "bg-emerald-600 text-white hover:bg-emerald-500"
                    : "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                } disabled:opacity-50`}
              >
                {submitting && action === "confirm" ? <TravelDots /> : <CheckCircle2 className="h-4 w-4" />}
                {action === "confirm" ? "Confirm & Notify" : "Confirm Payment"}
              </button>
              <button
                onClick={() => action === "reject" ? handle("reject") : setAction("reject")}
                disabled={submitting}
                className={`flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-sm font-bold transition ${
                  action === "reject"
                    ? "bg-red-600 text-white hover:bg-red-500"
                    : "bg-red-500/15 text-red-400 hover:bg-red-500/25"
                } disabled:opacity-50`}
              >
                {submitting && action === "reject" ? <TravelDots /> : <XCircle className="h-4 w-4" />}
                {action === "reject" ? "Send Rejection" : "Reject"}
              </button>
            </div>
            {action && (
              <button onClick={() => setAction(null)} className="w-full text-xs text-muted-foreground hover:text-foreground transition">
                Cancel
              </button>
            )}
          </div>
        )}
      </motion.div>

      {/* Full-screen image viewer */}
      <AnimatePresence>
        {imgExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
            onClick={() => setImgExpanded(false)}
          >
            <img
              src={booking.paymentProof?.url}
              alt="Payment proof full"
              className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function PendingPayments() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Booking | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "verified" | "rejected">("pending");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getPendingPayments() as any;
      if (res.success) setBookings(res.data ?? []);
    } catch {
      toast.error("Failed to load payment queue");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = bookings.filter((b) => {
    if (filter === "pending") return !b.paymentProof?.verifiedAt && !b.paymentProof?.rejectedAt;
    if (filter === "verified") return !!b.paymentProof?.verifiedAt;
    if (filter === "rejected") return !!b.paymentProof?.rejectedAt;
    return true;
  });

  const pendingCount = bookings.filter((b) => !b.paymentProof?.verifiedAt && !b.paymentProof?.rejectedAt).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            Payment Verification Queue
            {pendingCount > 0 && (
              <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-sm font-bold text-amber-400 animate-pulse">
                {pendingCount} pending
              </span>
            )}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">Review UPI payment screenshots submitted by customers</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 rounded-full glass px-4 py-2 text-sm transition hover:bg-white/10">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {([
          ["pending", "Awaiting Review"],
          ["verified", "Confirmed"],
          ["rejected", "Rejected"],
          ["all", "All"],
        ] as const).map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              filter === val ? "gradient-sunset text-white shadow-glow" : "glass hover:bg-white/10"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><TravelLoader size="sm" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl glass py-16 text-center">
          <Clock className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-muted-foreground">
            {filter === "pending" ? "No payments awaiting review" : "No entries in this category"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((booking) => {
            const trip = booking.trip as any;
            const user = booking.user as any;
            const isPending = !booking.paymentProof?.verifiedAt && !booking.paymentProof?.rejectedAt;

            return (
              <motion.div
                key={booking._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-4 rounded-2xl p-4 transition cursor-pointer hover:bg-white/10 ${
                  isPending ? "bg-amber-500/5 border border-amber-500/15" : "bg-white/5"
                }`}
                onClick={() => setSelected(booking)}
              >
                {/* Screenshot thumb */}
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-black/30">
                  {booking.paymentProof?.url ? (
                    <img src={booking.paymentProof.url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-white/20" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold truncate">{user?.name}</p>
                    <span className="text-muted-foreground">·</span>
                    <p className="text-sm text-muted-foreground truncate">{trip?.title}</p>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground flex-wrap">
                    <span className="font-mono">{booking.bookingId}</span>
                    <span className="font-semibold text-foreground">{formatINR(booking.pricing?.totalAmount ?? 0)}</span>
                    {booking.paymentProof?.uploadedAt && (
                      <span>{new Date(booking.paymentProof.uploadedAt).toLocaleDateString("en-IN")}</span>
                    )}
                  </div>
                </div>

                <StatusBadge booking={booking} />
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {selected && (
          <PaymentDetail
            booking={selected}
            onClose={() => setSelected(null)}
            onVerified={load}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
