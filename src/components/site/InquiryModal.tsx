import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

export function InquiryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    destination: "",
    preferredDates: "",
    travelers: "",
    budget: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createInquiry({
        type: "custom_trip",
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        subject: `Custom trip request${form.destination ? ` — ${form.destination}` : ""}`,
        message: form.message || "Custom trip request",
        customTripDetails: {
          destination: form.destination || undefined,
          travelers: form.travelers ? Number(form.travelers) : undefined,
          budget: form.budget || undefined,
          preferredDates: form.preferredDates || undefined,
        },
      });
      toast.success("Request sent! We'll craft your itinerary and reach out within 24 hours. ✨");
      onClose();
      setForm({ name: "", email: "", phone: "", destination: "", preferredDates: "", travelers: "", budget: "", message: "" });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not send your request");
    } finally {
      setSubmitting(false);
    }
  };

  const field =
    "w-full rounded-2xl bg-white/5 px-4 py-2.5 text-sm outline-none transition focus:bg-white/10";

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
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[2rem] bg-card p-6 shadow-float"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-white/10 transition hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Tailored in 24 hours
            </div>
            <h2 className="mt-3 text-2xl font-bold">Plan your dream journey</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Tell us your vibe and we'll build a custom itinerary you can tweak and approve.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <input required placeholder="Full name" value={form.name} onChange={set("name")} className={field} />
                <input required type="email" placeholder="Email" value={form.email} onChange={set("email")} className={field} />
                <input placeholder="Phone (optional)" value={form.phone} onChange={set("phone")} className={field} />
                <input placeholder="Destination(s)" value={form.destination} onChange={set("destination")} className={field} />
                <input placeholder="Preferred dates" value={form.preferredDates} onChange={set("preferredDates")} className={field} />
                <input type="number" min="1" placeholder="Travelers" value={form.travelers} onChange={set("travelers")} className={field} />
              </div>
              <input placeholder="Budget per person (e.g. ₹50,000)" value={form.budget} onChange={set("budget")} className={field} />
              <textarea
                rows={3}
                placeholder="Tell us about your dream trip…"
                value={form.message}
                onChange={set("message")}
                className={field}
              />
              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-full gradient-sunset py-3 text-sm font-bold text-white shadow-glow transition hover:scale-[1.02] disabled:opacity-50"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {submitting ? "Sending…" : "Send my request"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
