import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Calendar, ShieldCheck, LogIn, CreditCard } from "lucide-react";
import { TravelDots } from "@/components/ui/TravelLoader";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import api from "@/lib/api";
import { payForBooking } from "@/lib/razorpay";
import { useAuth } from "@/lib/auth-context";
import { useAuthModal } from "@/lib/auth-modal";
import type { Trip } from "@/lib/types";

const formatINR = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

function Stepper({
  label,
  hint,
  value,
  min = 0,
  max = 20,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="grid h-8 w-8 place-items-center rounded-full bg-white/10 transition hover:bg-white/20 disabled:opacity-40"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-6 text-center font-semibold">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="grid h-8 w-8 place-items-center rounded-full bg-white/10 transition hover:bg-white/20 disabled:opacity-40"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function BookingModal({
  trip,
  open,
  onClose,
}: {
  trip: Trip;
  open: boolean;
  onClose: () => void;
}) {
  const { isAuthenticated, user } = useAuth();
  const { openAuth } = useAuthModal();
  const navigate = useNavigate();

  const [departureDate, setDepartureDate] = useState(trip.departureDate?.[0] ?? "");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [specialRequests, setSpecialRequests] = useState("");
  const [submitting, setSubmitting] = useState<"pay" | "request" | null>(null);

  const totalTravelers = adults + children + infants;
  const basePrice = trip.price.amount * adults + trip.price.amount * 0.7 * children;
  const tax = basePrice * 0.1;
  const total = basePrice + tax - (trip.price.discount || 0);

  // Creates the booking, returns its id — shared by both flows.
  const createPendingBooking = async (): Promise<string | null> => {
    const res = await api.createBooking({
      trip: trip._id,
      departureDate,
      travelers: { adults, children, infants },
      travelerDetails: [],
      specialRequests,
    });
    const booking = res.data as { _id: string } | undefined;
    return res.success && booking ? booking._id : null;
  };

  const validate = (): boolean => {
    if (!departureDate) {
      toast.error("Please choose a departure date");
      return false;
    }
    if (totalTravelers > trip.availableSeats) {
      toast.error(`Only ${trip.availableSeats} seats left on this trip`);
      return false;
    }
    return true;
  };

  // Flow 1: Pay upfront → Razorpay → booking confirmed on success.
  const handlePayNow = async () => {
    if (!validate()) return;
    setSubmitting("pay");
    try {
      const bookingId = await createPendingBooking();
      if (!bookingId) throw new Error("Could not create booking");

      const result = await payForBooking({
        bookingId,
        tripTitle: trip.title,
        prefill: { name: user?.name, email: user?.email, contact: user?.phone },
      });

      if (result.status === "success") {
        toast.success("Payment successful — your booking is confirmed! 🎉");
        onClose();
        navigate({ to: "/dashboard" });
      } else if (result.status === "dismissed") {
        toast.info("Payment cancelled. Your booking is saved as pending — pay anytime from your dashboard.");
        onClose();
        navigate({ to: "/dashboard" });
      } else {
        toast.error(result.message);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not start payment");
    } finally {
      setSubmitting(null);
    }
  };

  // Flow 2: Request to book → stays pending for admin approval.
  const handleRequest = async () => {
    if (!validate()) return;
    setSubmitting("request");
    try {
      const bookingId = await createPendingBooking();
      if (!bookingId) throw new Error("Could not submit booking request");
      toast.success("Booking request submitted! We'll confirm shortly. 🎉");
      onClose();
      navigate({ to: "/dashboard" });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not submit booking request");
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] grid place-items-center p-4"
        >
          <div className="absolute inset-0 bg-foreground/50 backdrop-blur-md" onClick={onClose} />
          <motion.div
            initial={{ scale: 0.92, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 30, opacity: 0 }}
            transition={{ type: "spring", damping: 24 }}
            className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[2rem] bg-card p-6 shadow-float"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-white/10 transition hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </button>

            <h2 className="text-2xl font-bold">Request to book</h2>
            <p className="mt-1 text-sm text-muted-foreground">{trip.title}</p>

            {!isAuthenticated ? (
              <div className="mt-6 rounded-2xl bg-white/5 p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Please sign in to request this trip. No payment is taken now — we'll confirm
                  availability and reach out with next steps.
                </p>
                <button
                  onClick={() => {
                    onClose();
                    openAuth();
                  }}
                  className="mt-4 inline-flex items-center gap-2 rounded-full gradient-sunset px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition hover:scale-[1.02]"
                >
                  <LogIn className="h-4 w-4" /> Sign in to continue
                </button>
              </div>
            ) : (
              <>
                <div className="mt-6 space-y-4">
                  {trip.departureDate?.length > 0 && (
                    <div>
                      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" /> Departure date
                      </label>
                      <select
                        value={departureDate}
                        onChange={(e) => setDepartureDate(e.target.value)}
                        className="w-full rounded-2xl bg-white/5 px-4 py-2.5 text-sm outline-none transition focus:bg-white/10"
                      >
                        {trip.departureDate.map((d) => (
                          <option key={d} value={d}>
                            {new Date(d).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <Stepper label="Adults" hint="Age 12+" value={adults} min={1} onChange={setAdults} />
                  <Stepper label="Children" hint="Age 2–11 (30% off)" value={children} onChange={setChildren} />
                  <Stepper label="Infants" hint="Under 2" value={infants} onChange={setInfants} />

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                      Special requests (optional)
                    </label>
                    <textarea
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      rows={2}
                      placeholder="Dietary needs, accessibility, celebrations…"
                      className="w-full rounded-2xl bg-white/5 px-4 py-2.5 text-sm outline-none transition focus:bg-white/10"
                    />
                  </div>
                </div>

                {/* Price estimate */}
                <div className="mt-5 space-y-1.5 rounded-2xl bg-white/5 p-4 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Base ({adults} adult{adults !== 1 ? "s" : ""}{children ? `, ${children} child` : ""})</span>
                    <span>{formatINR(basePrice)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Taxes & fees (10%)</span>
                    <span>{formatINR(tax)}</span>
                  </div>
                  {trip.price.discount ? (
                    <div className="flex justify-between text-emerald-400">
                      <span>Discount</span>
                      <span>−{formatINR(trip.price.discount)}</span>
                    </div>
                  ) : null}
                  <div className="mt-1 flex justify-between border-t border-white/10 pt-2 text-base font-bold">
                    <span>Estimated total</span>
                    <span>{formatINR(total)}</span>
                  </div>
                </div>

                <button
                  onClick={handlePayNow}
                  disabled={submitting !== null}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-full gradient-sunset py-3 text-sm font-bold text-white shadow-glow transition hover:scale-[1.02] disabled:opacity-50"
                >
                  {submitting === "pay" ? <TravelDots /> : <CreditCard className="h-4 w-4" />}
                  {submitting === "pay" ? "Opening payment…" : `Pay & confirm · ${formatINR(total)}`}
                </button>
                <button
                  onClick={handleRequest}
                  disabled={submitting !== null}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 py-3 text-sm font-semibold transition hover:bg-white/10 disabled:opacity-50"
                >
                  {submitting === "request" ? <TravelDots /> : <ShieldCheck className="h-4 w-4" />}
                  {submitting === "request" ? "Submitting…" : "Request to book (pay later)"}
                </button>
                <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
                  Signed in as {user?.email}
                </p>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
