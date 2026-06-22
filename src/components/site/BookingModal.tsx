import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Calendar, ShieldCheck, LogIn, CreditCard, Copy, Check, Upload, Loader2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { TravelDots } from "@/components/ui/TravelLoader";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import api from "@/lib/api";
import { payForBooking } from "@/lib/razorpay";
import { useAuth } from "@/lib/auth-context";
import { useAuthModal } from "@/lib/auth-modal";
import type { Trip } from "@/lib/types";

const formatINR = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

function Stepper({ label, hint, value, min = 0, max = 20, onChange }: {
  label: string; hint: string; value: number; min?: number; max?: number; onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}
          className="grid h-8 w-8 place-items-center rounded-full bg-white/10 transition hover:bg-white/20 disabled:opacity-40">
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-6 text-center font-semibold">{value}</span>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}
          className="grid h-8 w-8 place-items-center rounded-full bg-white/10 transition hover:bg-white/20 disabled:opacity-40">
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); }}
      className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium transition hover:bg-white/20">
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

export function BookingModal({ trip, open, onClose }: { trip: Trip; open: boolean; onClose: () => void }) {
  const { isAuthenticated, user } = useAuth();
  const { openAuth } = useAuthModal();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [departureDate, setDepartureDate] = useState(trip.departureDate?.[0] ?? "");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [specialRequests, setSpecialRequests] = useState("");
  const [submitting, setSubmitting] = useState<"pay" | "request" | null>(null);

  // UPI QR payment state
  const [paymentMode, setPaymentMode] = useState<"razorpay" | "upi_qr">("upi_qr");
  const [upiId, setUpiId] = useState("");
  const [step, setStep] = useState<"details" | "upi_payment">("details");
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    api.getSiteConfig().then((res) => {
      const d = res.data;
      if (d?.paymentMode) setPaymentMode(d.paymentMode);
      if (d?.upiId) setUpiId(d.upiId);
    }).catch(() => {});
  }, []);

  const childrenRate = (trip.price.childrenPricePercent ?? 100) / 100;
  const taxRate = (trip.price.taxPercent ?? 0) / 100;
  const basePrice = trip.price.amount * adults + trip.price.amount * childrenRate * children;
  const tax = Math.round(basePrice * taxRate * 100) / 100;
  const discount = trip.price.discount || 0;
  const total = Math.max(0, basePrice + tax - discount);
  const totalTravelers = adults + children + infants;

  const upiLink = upiId
    ? `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent("Dharavu Journeys")}&am=${total}&cu=INR&tn=${encodeURIComponent(`Booking - ${trip.title}`)}`
    : "";

  const validate = (): boolean => {
    if (!departureDate) { toast.error("Please choose a departure date"); return false; }
    if (totalTravelers > trip.availableSeats) { toast.error(`Only ${trip.availableSeats} seats left`); return false; }
    return true;
  };

  const createPendingBooking = async (): Promise<string | null> => {
    const res = await api.createBooking({
      trip: trip._id, departureDate,
      travelers: { adults, children, infants },
      travelerDetails: [], specialRequests,
    });
    const booking = res.data as { _id: string } | undefined;
    return res.success && booking ? booking._id : null;
  };

  // ── UPI QR flow ───────────────────────────────────────────────────────────
  const handleUpiProceed = async () => {
    if (!validate()) return;
    setSubmitting("pay");
    try {
      const id = await createPendingBooking();
      if (!id) throw new Error("Could not create booking");
      setBookingId(id);
      setStep("upi_payment");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not create booking");
    } finally {
      setSubmitting(null);
    }
  };

  const handleScreenshotUpload = async () => {
    if (!screenshot || !bookingId) return;
    setUploading(true);
    try {
      await api.uploadPaymentProof(bookingId, screenshot);
      toast.success("Screenshot submitted! We'll verify and confirm your booking within a few hours.");
      onClose();
      navigate({ to: "/dashboard" });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // ── Razorpay flow ─────────────────────────────────────────────────────────
  const handlePayNow = async () => {
    if (!validate()) return;
    setSubmitting("pay");
    try {
      const id = await createPendingBooking();
      if (!id) throw new Error("Could not create booking");
      const result = await payForBooking({
        bookingId: id, tripTitle: trip.title,
        prefill: { name: user?.name, email: user?.email, contact: user?.phone },
      });
      if (result.status === "success") {
        toast.success("Payment successful — your booking is confirmed!");
        onClose(); navigate({ to: "/dashboard" });
      } else if (result.status === "dismissed") {
        toast.info("Payment cancelled. Your booking is saved as pending.");
        onClose(); navigate({ to: "/dashboard" });
      } else {
        toast.error(result.message);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not start payment");
    } finally {
      setSubmitting(null);
    }
  };

  // ── Request to book (no payment) ──────────────────────────────────────────
  const handleRequest = async () => {
    if (!validate()) return;
    setSubmitting("request");
    try {
      const id = await createPendingBooking();
      if (!id) throw new Error("Could not submit booking request");
      toast.success("Booking request submitted! We'll confirm shortly.");
      onClose(); navigate({ to: "/dashboard" });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not submit booking request");
    } finally {
      setSubmitting(null);
    }
  };

  const resetToDetails = () => { setStep("details"); setBookingId(null); setScreenshot(null); };
  const handleClose = () => { resetToDetails(); onClose(); };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] grid place-items-center p-4">
          <div className="absolute inset-0 bg-foreground/50 backdrop-blur-md" onClick={handleClose} />
          <motion.div
            initial={{ scale: 0.92, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 30, opacity: 0 }}
            transition={{ type: "spring", damping: 24 }}
            className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[2rem] bg-card p-6 shadow-float"
          >
            <button onClick={handleClose}
              className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-white/10 transition hover:bg-white/20">
              <X className="h-4 w-4" />
            </button>

            {/* ── Step 1: booking details ───────────────────────────── */}
            {step === "details" && (
              <>
                <h2 className="text-2xl font-bold">Book your trip</h2>
                <p className="mt-1 text-sm text-muted-foreground">{trip.title}</p>

                {!isAuthenticated ? (
                  <div className="mt-6 rounded-2xl bg-white/5 p-6 text-center">
                    <p className="text-sm text-muted-foreground">Please sign in to book this trip.</p>
                    <button onClick={() => { onClose(); openAuth(); }}
                      className="mt-4 inline-flex items-center gap-2 rounded-full gradient-sunset px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition hover:scale-[1.02]">
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
                          <select value={departureDate} onChange={(e) => setDepartureDate(e.target.value)}
                            className="w-full rounded-2xl bg-white/5 px-4 py-2.5 text-sm outline-none transition focus:bg-white/10">
                            {trip.departureDate.map((d) => (
                              <option key={d} value={d}>
                                {new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                      <Stepper label="Adults" hint="Age 12+" value={adults} min={1} onChange={setAdults} />
                      <Stepper label="Children" hint={`Age 2–11${childrenRate < 1 ? ` (${Math.round(childrenRate * 100)}% rate)` : ""}`} value={children} onChange={setChildren} />
                      <Stepper label="Infants" hint="Under 2" value={infants} onChange={setInfants} />
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Special requests (optional)</label>
                        <textarea value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} rows={2}
                          placeholder="Dietary needs, accessibility, celebrations…"
                          className="w-full rounded-2xl bg-white/5 px-4 py-2.5 text-sm outline-none transition focus:bg-white/10" />
                      </div>
                    </div>

                    {/* Price summary */}
                    <div className="mt-5 space-y-1.5 rounded-2xl bg-white/5 p-4 text-sm">
                      <div className="flex justify-between text-muted-foreground">
                        <span>{adults} adult{adults !== 1 ? "s" : ""}{children > 0 && ` + ${children} child${children !== 1 ? "ren" : ""}`}</span>
                        <span>{formatINR(basePrice)}</span>
                      </div>
                      {tax > 0 && <div className="flex justify-between text-muted-foreground"><span>Tax ({Math.round(taxRate * 100)}%)</span><span>{formatINR(tax)}</span></div>}
                      {discount > 0 && <div className="flex justify-between text-emerald-400"><span>Discount</span><span>−{formatINR(discount)}</span></div>}
                      <div className="mt-1 flex justify-between border-t border-white/10 pt-2 text-base font-bold">
                        <span>Total</span><span>{formatINR(total)}</span>
                      </div>
                    </div>

                    {paymentMode === "upi_qr" ? (
                      <>
                        <button onClick={handleUpiProceed} disabled={submitting !== null}
                          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full gradient-sunset py-3 text-sm font-bold text-white shadow-glow transition hover:scale-[1.02] disabled:opacity-50">
                          {submitting === "pay" ? <TravelDots /> : <span className="text-base font-black">₹</span>}
                          {submitting === "pay" ? "Creating booking…" : `Pay via UPI · ${formatINR(total)}`}
                        </button>
                        <p className="mt-1.5 text-center text-xs text-muted-foreground">Zero transaction fees · UPI payment</p>
                      </>
                    ) : (
                      <button onClick={handlePayNow} disabled={submitting !== null}
                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-full gradient-sunset py-3 text-sm font-bold text-white shadow-glow transition hover:scale-[1.02] disabled:opacity-50">
                        {submitting === "pay" ? <TravelDots /> : <CreditCard className="h-4 w-4" />}
                        {submitting === "pay" ? "Opening payment…" : `Pay & confirm · ${formatINR(total)}`}
                      </button>
                    )}

                    <button onClick={handleRequest} disabled={submitting !== null}
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 py-3 text-sm font-semibold transition hover:bg-white/10 disabled:opacity-50">
                      {submitting === "request" ? <TravelDots /> : <ShieldCheck className="h-4 w-4" />}
                      {submitting === "request" ? "Submitting…" : "Request to book (pay later)"}
                    </button>
                    <p className="mt-3 text-center text-xs text-muted-foreground">Signed in as {user?.email}</p>
                  </>
                )}
              </>
            )}

            {/* ── Step 2: UPI payment ───────────────────────────────── */}
            {step === "upi_payment" && (
              <>
                <button onClick={resetToDetails} className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground transition hover:text-foreground">
                  ← Back
                </button>
                <h2 className="text-xl font-bold">Complete Payment</h2>
                <p className="mt-1 text-sm text-muted-foreground">{trip.title}</p>

                {/* Amount highlight */}
                <div className="mt-4 rounded-2xl bg-white/5 p-4 text-center">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Amount to pay</p>
                  <p className="text-4xl font-black gradient-text">{formatINR(total)}</p>
                </div>

                {/* QR code */}
                <div className="mt-4 flex flex-col items-center gap-4">
                  {trip.paymentQR?.url ? (
                    <div className="rounded-2xl bg-white p-3">
                      <img src={trip.paymentQR.url} alt="Payment QR" className="h-48 w-48 object-contain" />
                    </div>
                  ) : upiId ? (
                    <div className="rounded-2xl bg-white p-3">
                      <QRCodeSVG value={upiLink} size={192} />
                    </div>
                  ) : (
                    <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-sm text-muted-foreground">
                      QR not configured yet. Please pay using the UPI ID below.
                    </div>
                  )}

                  {upiId && (
                    <div className="flex w-full items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                      <div>
                        <p className="text-xs text-muted-foreground">UPI ID</p>
                        <p className="font-mono font-semibold">{upiId}</p>
                      </div>
                      <CopyButton text={upiId} />
                    </div>
                  )}

                  {upiLink && (
                    <a href={upiLink}
                      className="flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 py-2.5 text-sm font-semibold transition hover:bg-white/10">
                      Open UPI App
                    </a>
                  )}
                </div>

                {/* Instructions */}
                <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs text-amber-300 space-y-1">
                  <p className="font-semibold">How to pay:</p>
                  <ol className="ml-4 list-decimal space-y-0.5">
                    <li>Scan the QR code or open your UPI app and pay to the UPI ID above</li>
                    <li>Pay exactly <strong>{formatINR(total)}</strong></li>
                    <li>Take a screenshot of the success screen</li>
                    <li>Upload it below — we'll confirm your booking within a few hours</li>
                  </ol>
                </div>

                {/* Screenshot upload */}
                <div className="mt-5 space-y-3">
                  <p className="text-sm font-semibold">Upload payment screenshot</p>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => setScreenshot(e.target.files?.[0] ?? null)} />

                  {screenshot ? (
                    <div className="relative overflow-hidden rounded-2xl bg-black/30">
                      <img src={URL.createObjectURL(screenshot)} alt="Preview" className="max-h-48 w-full object-contain" />
                      <button onClick={() => setScreenshot(null)}
                        className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/60 transition hover:bg-black/80">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => fileRef.current?.click()}
                      className="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-white/15 py-8 text-sm text-muted-foreground transition hover:border-white/30 hover:bg-white/5">
                      <Upload className="h-6 w-6" />
                      Tap to upload screenshot
                    </button>
                  )}

                  <button onClick={handleScreenshotUpload} disabled={!screenshot || uploading}
                    className="flex w-full items-center justify-center gap-2 rounded-full gradient-sunset py-3 text-sm font-bold text-white shadow-glow transition hover:scale-[1.02] disabled:opacity-50">
                    {uploading ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</> : "Submit Payment Proof"}
                  </button>
                  <p className="text-center text-xs text-muted-foreground">
                    Your booking is confirmed after we verify the payment
                  </p>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
