import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail, Phone, MapPin, Send, Loader2, CheckCircle2, Instagram,
  Clock, MessageSquare, Globe,
} from "lucide-react";
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

const contactCards = [
  {
    icon: Mail,
    title: "Email us",
    value: "dharavujourney@gmail.com",
    sub: "We reply within 24 hours on weekdays",
    href: "mailto:dharavujourney@gmail.com",
    color: "from-violet-500/20 to-purple-500/10",
  },
  {
    icon: Phone,
    title: "Call us",
    value: "+91 95792 65920",
    sub: "+91 93568 01338",
    href: "tel:+919579265920",
    color: "from-emerald-500/20 to-teal-500/10",
  },
  {
    icon: MapPin,
    title: "Our office",
    value: "Siddhi Apartment, Polyhub",
    sub: "Vadgaon, Pune — 411041",
    href: "https://maps.app.goo.gl/8tAmJd67CAo74kMe9",
    color: "from-orange-500/20 to-amber-500/10",
  },
  {
    icon: Instagram,
    title: "Instagram",
    value: "@dharavu_journey",
    sub: "Stories, reels & trip updates",
    href: "https://www.instagram.com/dharavu_journey?igsh=MTl6emJlMWJkdDE4cw==",
    color: "from-pink-500/20 to-rose-500/10",
  },
];

function ContactPage() {
  const [form, setForm] = useState({
    name: "", email: "", type: "general", subject: "", message: "",
    destination: "", travelers: "", preferredDates: "",
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
        type: form.type,
        name: form.name,
        email: form.email,
        subject: form.subject || `${inquiryTypes.find((t) => t.value === form.type)?.label} — ${form.name}`,
        message: form.message,
        ...(form.type === "custom_trip" || form.type === "group_booking"
          ? { customTripDetails: { destination: form.destination || undefined, travelers: form.travelers ? Number(form.travelers) : undefined, preferredDates: form.preferredDates || undefined } }
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

      {/* Hero */}
      <section className="relative overflow-hidden pt-28 pb-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 right-1/4 h-72 w-72 rounded-full gradient-aurora opacity-15 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 h-56 w-56 rounded-full gradient-sunset opacity-10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-3"
          >
            <img
              src="/Screenshot_2026-05-26_180910-removebg-preview.png"
              alt="Dharavu Journeys"
              className="h-20 w-20 object-contain drop-shadow-xl"
            />
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">DHARAVU JOURNEYS</h1>
              <p className="mt-1 text-sm font-medium text-muted-foreground tracking-widest uppercase">Curated Travel Experiences</p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-6 inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs font-semibold text-muted-foreground"
          >
            <MessageSquare className="h-3.5 w-3.5 text-primary" />
            We'd love to hear from you
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-lg text-muted-foreground"
          >
            Whether you have a wild trip idea, a question, or just want to talk travel
            — our team is here and genuinely happy to chat.
          </motion.p>
        </div>
      </section>

      {/* Contact cards */}
      <section className="mx-auto max-w-5xl px-4 pb-14 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {contactCards.map((card, i) => (
            <motion.a
              key={card.title}
              href={card.href}
              target={card.href.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={`group flex flex-col gap-3 rounded-3xl bg-gradient-to-br ${card.color} border border-border p-5 transition hover:scale-[1.02] hover:shadow-soft`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                <card.icon className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{card.title}</div>
                <div className="mt-1 break-all font-semibold text-foreground group-hover:text-primary transition">{card.value}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{card.sub}</div>
              </div>
            </motion.a>
          ))}
        </div>
      </section>

      {/* Business info strip */}
      <section className="mx-auto max-w-5xl px-4 pb-14 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap items-center justify-between gap-5 rounded-3xl glass px-8 py-6"
        >
          <div className="flex items-center gap-4">
            <img
              src="/Screenshot_2026-05-26_180910-removebg-preview.png"
              alt="Dharavu Journeys"
              className="h-12 w-12 object-contain"
            />
            <div>
              <div className="font-bold text-foreground">Dharavu Journeys</div>
              <div className="text-xs text-muted-foreground">CIN / Registered travel operator · Pune, Maharashtra</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-5 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              <span>dharau.netlify.app</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span>Mon – Sat, 9 AM – 7 PM IST</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span>Vadgaon, Pune 411041</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Inquiry form */}
      <section className="mx-auto max-w-3xl px-4 pb-24 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl glass p-6 sm:p-10"
        >
          {done ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <CheckCircle2 className="h-14 w-14 text-emerald-500" />
              <h2 className="text-2xl font-bold">Message received!</h2>
              <p className="max-w-xs text-muted-foreground">
                Thanks for writing in. We'll get back to you within 24 hours.
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
            <>
              <h2 className="mb-6 text-2xl font-bold">Send us a message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Your name *</label>
                    <input
                      required
                      value={form.name}
                      onChange={set("name")}
                      placeholder="Full name"
                      className="w-full rounded-2xl border border-border bg-white/5 px-4 py-2.5 text-sm outline-none transition focus:border-primary/40 focus:bg-white/10"
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
                      className="w-full rounded-2xl border border-border bg-white/5 px-4 py-2.5 text-sm outline-none transition focus:border-primary/40 focus:bg-white/10"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Type of enquiry</label>
                  <select
                    value={form.type}
                    onChange={set("type")}
                    className="w-full rounded-2xl border border-border bg-white/5 px-4 py-2.5 text-sm outline-none transition focus:border-primary/40 focus:bg-white/10"
                  >
                    {inquiryTypes.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                {isTrip && (
                  <div className="grid gap-4 rounded-2xl bg-primary/5 p-4 sm:grid-cols-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Destination</label>
                      <input
                        value={form.destination}
                        onChange={set("destination")}
                        placeholder="e.g. Spiti Valley"
                        className="w-full rounded-xl border border-border bg-white/5 px-3 py-2 text-sm outline-none transition focus:bg-white/10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">No. of travelers</label>
                      <input
                        type="number"
                        min="1"
                        value={form.travelers}
                        onChange={set("travelers")}
                        placeholder="e.g. 4"
                        className="w-full rounded-xl border border-border bg-white/5 px-3 py-2 text-sm outline-none transition focus:bg-white/10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Preferred dates</label>
                      <input
                        value={form.preferredDates}
                        onChange={set("preferredDates")}
                        placeholder="e.g. Sep 10–17"
                        className="w-full rounded-xl border border-border bg-white/5 px-3 py-2 text-sm outline-none transition focus:bg-white/10"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Subject</label>
                  <input
                    value={form.subject}
                    onChange={set("subject")}
                    placeholder="One-line summary"
                    className="w-full rounded-2xl border border-border bg-white/5 px-4 py-2.5 text-sm outline-none transition focus:border-primary/40 focus:bg-white/10"
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
                    className="w-full resize-none rounded-2xl border border-border bg-white/5 px-4 py-2.5 text-sm outline-none transition focus:border-primary/40 focus:bg-white/10"
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
            </>
          )}
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
