import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Send } from "lucide-react";
import { TravelLoader, TravelDots } from "@/components/ui/TravelLoader";
import { toast } from "sonner";
import api from "@/lib/api";

const field =
  "w-full rounded-xl bg-white/10 px-3 py-2 text-sm text-white outline-none transition placeholder:text-white/50 focus:bg-white/20";

export function PlannerCTA() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    destination: "",
    dates: "",
    travelers: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createInquiry({
        type: "custom_trip",
        name: form.name,
        email: form.email,
        subject: `Custom trip${form.destination ? ` — ${form.destination}` : ""}`,
        message: form.message || "Custom trip request",
        customTripDetails: {
          destination: form.destination || undefined,
          travelers: form.travelers ? Number(form.travelers) : undefined,
          preferredDates: form.dates || undefined,
        },
      });
      setDone(true);
      toast.success("Request sent! We'll craft your itinerary within 24 hours. ✨");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not send your request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="planner" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[2.5rem] gradient-aurora p-8 shadow-float sm:p-12">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-amber-glow/40 blur-3xl animate-blob" />
            <div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-tropic/40 blur-3xl animate-blob" style={{ animationDelay: "3s" }} />
          </div>

          <div className="relative grid gap-10 lg:grid-cols-2 lg:items-start">
            {/* Left — copy */}
            <div className="lg:pt-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 rounded-full glass-dark px-3 py-1.5 text-xs font-semibold text-white"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-glow" />
                Tailored in 24 hours
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="mt-5 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl"
              >
                Plan your{" "}
                <em className="not-italic text-amber-glow">dream</em>{" "}
                journey
              </motion.h2>
              <p className="mt-5 max-w-md text-base text-white/85 sm:text-lg">
                Tell us your vibe, your dates, and your dream. We'll send back
                a fully built itinerary you can tweak, approve, and live.
              </p>
            </div>

            {/* Right — inline form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="rounded-3xl glass-dark p-6"
            >
              {done ? (
                <div className="flex flex-col items-center gap-3 py-8 text-center text-white">
                  <Sparkles className="h-10 w-10 text-amber-glow" />
                  <p className="text-lg font-bold">Request received!</p>
                  <p className="text-sm text-white/70">
                    We'll craft your custom itinerary and reach out within 24 hours.
                  </p>
                  <button
                    onClick={() => { setDone(false); setForm({ name: "", email: "", destination: "", dates: "", travelers: "", message: "" }); }}
                    className="mt-2 rounded-full bg-white/10 px-5 py-2 text-sm font-semibold hover:bg-white/20 transition"
                  >
                    Send another request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-2.5">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/60">
                    Quick brief
                  </p>
                  <div className="grid grid-cols-2 gap-2.5">
                    <input required placeholder="Your name" value={form.name} onChange={set("name")} className={field} />
                    <input required type="email" placeholder="Email" value={form.email} onChange={set("email")} className={field} />
                    <input placeholder="Destination" value={form.destination} onChange={set("destination")} className={field} />
                    <input placeholder="Dates (e.g. Mar 15–22)" value={form.dates} onChange={set("dates")} className={field} />
                  </div>
                  <input
                    type="number"
                    min="1"
                    placeholder="Number of travelers"
                    value={form.travelers}
                    onChange={set("travelers")}
                    className={field}
                  />
                  <textarea
                    rows={2}
                    placeholder="Tell us your vibe — beach, trek, culture, budget…"
                    value={form.message}
                    onChange={set("message")}
                    className={field}
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-1 flex w-full items-center justify-center gap-2 rounded-full bg-white py-3 text-sm font-bold text-zinc-900 shadow-glow transition hover:scale-[1.02] disabled:opacity-50"
                  >
                    {submitting ? <TravelDots /> : <Send className="h-4 w-4" />}
                    {submitting ? "Sending…" : "Send my request"}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
