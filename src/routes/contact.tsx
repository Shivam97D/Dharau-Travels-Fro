import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2, Instagram } from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import api from "@/lib/api";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
});

const inquiryTypes = [
  { value: "general", label: "General question" },
  { value: "custom_trip", label: "Custom trip request" },
  { value: "group_booking", label: "Group booking" },
  { value: "complaint", label: "Complaint / feedback" },
];

function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    type: "general",
    subject: "",
    message: "",
    destination: "",
    travelers: "",
    preferredDates: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createInquiry({
        type: form.type as "general" | "custom_trip" | "group_booking" | "complaint",
        name: form.name,
        email: form.email,
        subject: form.subject || `${inquiryTypes.find((t) => t.value === form.type)?.label} — ${form.name}`,
        message: form.message,
        ...(form.type === "custom_trip" || form.type === "group_booking"
          ? {
              customTripDetails: {
                destination: form.destination || undefined,
                travelers: form.travelers ? Number(form.travelers) : undefined,
                preferredDates: form.preferredDates || undefined,
              },
            }
          : {}),
      });
      setDone(true);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not send your message");
    } finally {
      setSubmitting(false);
    }
  };

  const isTrip = form.type === "custom_trip" || form.type === "group_booking";

  return (
    <div className="relative min-h-screen bg-background">
      <Navbar />

      <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-28 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-5xl font-bold tracking-tight">Say hello</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Whether you have a question, a wild trip idea, or just want to chat about
            travel — we're listening.
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-[1fr_1.6fr]">
          {/* Contact details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div className="rounded-3xl glass p-6">
              <h2 className="font-bold">Get in touch directly</h2>
              <div className="mt-4 space-y-4 text-sm text-muted-foreground">
                <a
                  href="mailto:dharavujourney@gmail.com"
                  className="flex items-start gap-3 transition hover:text-foreground"
                >
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <div className="font-medium text-foreground">Email us</div>
                    dharavujourney@gmail.com
                  </div>
                </a>
                <a
                  href="tel:+919579265920"
                  className="flex items-start gap-3 transition hover:text-foreground"
                >
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <div className="font-medium text-foreground">Call us</div>
                    +91 95792 65920
                    <br />
                    +91 93568 01338
                  </div>
                </a>
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <div className="font-medium text-foreground">Visit us</div>
                    Siddhi Apartment, Polyhub
                    <br />
                    Vadgaon, Pune — 411041
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl glass p-6">
              <h2 className="font-bold">Follow our journey</h2>
              <a
                href="https://www.instagram.com/dharavu_journey?igsh=MTl6emJlMWJkdDE4cw=="
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center gap-3 text-sm text-muted-foreground transition hover:text-foreground"
              >
                <Instagram className="h-4 w-4 text-primary" />
                @dharavu_journey on Instagram
              </a>
            </div>

            <div className="rounded-3xl glass p-6">
              <h2 className="font-bold">Response time</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                We typically respond within <strong className="text-foreground">24 hours</strong> on
                weekdays. For urgent trip-related queries during a trip, call us directly —
                our operations line is staffed during all active departures.
              </p>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-3xl glass p-6 sm:p-8"
          >
            {done ? (
              <div className="flex flex-col items-center gap-4 py-16 text-center">
                <CheckCircle2 className="h-14 w-14 text-emerald-500" />
                <h2 className="text-2xl font-bold">Message received!</h2>
                <p className="max-w-sm text-muted-foreground">
                  Thank you for reaching out. We'll get back to you within 24 hours.
                </p>
                <button
                  onClick={() => {
                    setDone(false);
                    setForm({ name: "", email: "", type: "general", subject: "", message: "", destination: "", travelers: "", preferredDates: "" });
                  }}
                  className="mt-2 rounded-full gradient-sunset px-6 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:scale-105"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-lg font-bold">Send us a message</h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Your name *</label>
                    <input
                      required
                      value={form.name}
                      onChange={set("name")}
                      placeholder="Shivam Dahifale"
                      className="w-full rounded-2xl bg-white/5 px-4 py-2.5 text-sm outline-none transition focus:bg-white/10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Email address *</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={set("email")}
                      placeholder="you@email.com"
                      className="w-full rounded-2xl bg-white/5 px-4 py-2.5 text-sm outline-none transition focus:bg-white/10"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Type of enquiry</label>
                  <select
                    value={form.type}
                    onChange={set("type")}
                    className="w-full rounded-2xl bg-white/5 px-4 py-2.5 text-sm outline-none transition focus:bg-white/10"
                  >
                    {inquiryTypes.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                {isTrip && (
                  <div className="grid gap-4 rounded-2xl bg-white/5 p-4 sm:grid-cols-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Destination</label>
                      <input
                        value={form.destination}
                        onChange={set("destination")}
                        placeholder="e.g. Spiti Valley"
                        className="w-full rounded-xl bg-white/5 px-3 py-2 text-sm outline-none transition focus:bg-white/10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Travelers</label>
                      <input
                        type="number"
                        min="1"
                        value={form.travelers}
                        onChange={set("travelers")}
                        placeholder="e.g. 4"
                        className="w-full rounded-xl bg-white/5 px-3 py-2 text-sm outline-none transition focus:bg-white/10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Preferred dates</label>
                      <input
                        value={form.preferredDates}
                        onChange={set("preferredDates")}
                        placeholder="e.g. Sep 10–17"
                        className="w-full rounded-xl bg-white/5 px-3 py-2 text-sm outline-none transition focus:bg-white/10"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Subject</label>
                  <input
                    value={form.subject}
                    onChange={set("subject")}
                    placeholder="One-line summary of your message"
                    className="w-full rounded-2xl bg-white/5 px-4 py-2.5 text-sm outline-none transition focus:bg-white/10"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Message *</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={set("message")}
                    placeholder="Tell us what's on your mind…"
                    className="w-full rounded-2xl bg-white/5 px-4 py-2.5 text-sm outline-none transition focus:bg-white/10 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-full gradient-sunset py-3 text-sm font-bold text-white shadow-glow transition hover:scale-[1.02] disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {submitting ? "Sending…" : "Send message"}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
