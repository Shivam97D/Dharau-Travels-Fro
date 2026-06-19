import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { CheckCircle2, AlertCircle, Phone, Mail, Camera } from "lucide-react";

export const Route = createFileRoute("/booking-policy")({
  component: BookingPolicyPage,
});

const steps = [
  {
    n: "01",
    title: "Browse & choose your trip",
    body: "Head to our Trips section, filter by destination, duration, or budget, and open the trip that speaks to you. Each trip page lists the full itinerary, what's included, fitness requirements, and group size.",
  },
  {
    n: "02",
    title: "Create an account",
    body: "Sign up with your name, email, and phone number. We need this to send your confirmation, keep your booking safe, and reach you if anything changes.",
  },
  {
    n: "03",
    title: "Select dates and traveller details",
    body: "Choose your departure date from the available slots. Enter the number of adults, children, and infants. Add any special requests or dietary needs in the notes field.",
  },
  {
    n: "04",
    title: "Review the price breakdown",
    body: "The checkout screen shows the base price, applicable taxes (10%), and any active discount. There are no hidden charges. What you see is what you pay.",
  },
  {
    n: "05",
    title: "Pay and confirm",
    body: "Click 'Pay & Confirm' to complete payment instantly via Razorpay — supporting UPI, credit/debit cards, and net banking. Prefer to pay later? Choose 'Request to Book' and our team will reach out within 24 hours to confirm your spot.",
  },
  {
    n: "06",
    title: "Receive your confirmation",
    body: "As soon as payment is received, a booking confirmation is sent to your registered email. This includes your booking ID, trip details, departure info, and a pre-trip checklist. Save it — you'll need the booking ID if you ever contact us about your trip.",
  },
  {
    n: "07",
    title: "Prepare and travel",
    body: "At least 48 hours before departure, we send a detailed pre-trip brief: what to pack, weather conditions, pickup points, and emergency contacts. Read it fully. Then go have an incredible trip.",
  },
];

const policies = [
  {
    title: "Cancellation by you",
    body: "30+ days before departure: 90% refund. 15–30 days: 50%. 7–14 days: 25%. Under 7 days: no refund. Cancel from your dashboard or email us.",
  },
  {
    title: "Cancellation by Dharavu",
    body: "If we cancel (weather, low numbers, force majeure), you get a full refund or a free reschedule. We'll notify you as early as possible.",
  },
  {
    title: "Date changes",
    body: "Changes to departure date are allowed up to 10 days before travel, subject to availability. A ₹500 processing fee may apply.",
  },
  {
    title: "Refund timeline",
    body: "Approved refunds are processed to your original payment method within 5–10 business days. Payment gateway fees (typically 2%) are non-refundable.",
  },
];

function BookingPolicyPage() {
  return (
    <div className="relative min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-28 pb-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-10 right-1/3 h-64 w-64 rounded-full gradient-aurora opacity-12 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold tracking-tight sm:text-6xl"
          >
            Booking Policy
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-lg text-muted-foreground"
          >
            Everything you need to know about how to book a trip with us, what to expect,
            and how we handle cancellations, changes, and issues.
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-2 text-xs text-muted-foreground"
          >
            Last updated: June 2026
          </motion.p>
        </div>
      </section>

      {/* Steps to book */}
      <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 text-2xl font-bold"
        >
          How to book — step by step
        </motion.h2>
        <div className="space-y-4">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="flex gap-4 rounded-2xl glass p-5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl gradient-aurora text-sm font-bold text-white">
                {s.n}
              </div>
              <div>
                <div className="font-semibold">{s.title}</div>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{s.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Policy cards */}
      <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-6 text-2xl font-bold"
        >
          Cancellation & refund policy
        </motion.h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {policies.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl glass p-5"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <div className="font-semibold text-sm">{p.title}</div>
              </div>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{p.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Issue resolution */}
      <section className="mx-auto max-w-3xl px-4 pb-24 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl border border-amber-500/20 bg-amber-500/5 p-6 sm:p-8"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 shrink-0 text-amber-500" />
            <h2 className="text-xl font-bold">If something goes wrong</h2>
          </div>

          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            We work hard to ensure everything goes smoothly — but travel is unpredictable. If you
            face any issue before, during, or after your trip, here is how to get it resolved quickly:
          </p>

          <div className="mt-5 space-y-4">
            <div className="flex items-start gap-3 rounded-2xl bg-white/5 p-4">
              <Camera className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <div>
                <div className="text-sm font-semibold">Step 1 — Keep your proof</div>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Take screenshots of your booking confirmation, payment receipt, and any communication
                  you've had with us. If the issue happened on-trip, photograph or record evidence
                  (e.g. accommodation condition, transport delays, anything not as promised). Having
                  these ready makes resolution faster for both sides.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl bg-white/5 p-4">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <div>
                <div className="text-sm font-semibold">Step 2 — Reach us on WhatsApp</div>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  For urgent issues during a trip, WhatsApp is the fastest way to reach our team.
                  Send your screenshots, describe the issue clearly, and include your booking ID.
                </p>
                <a
                  href="https://wa.me/919579265920"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-500 hover:underline"
                >
                  WhatsApp: +91 95792 65920
                </a>
                <span className="mx-2 text-muted-foreground">·</span>
                <a
                  href="https://wa.me/919356801338"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-500 hover:underline"
                >
                  +91 93568 01338
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl bg-white/5 p-4">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <div>
                <div className="text-sm font-semibold">Step 3 — Follow up by email</div>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  After your WhatsApp message, send the same information with your screenshots
                  attached to our email. This creates a written record and ensures your case
                  is tracked properly. We aim to respond to all complaint emails within 24 hours.
                </p>
                <a
                  href="mailto:dharavujourney@gmail.com"
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-500 hover:underline"
                >
                  dharavujourney@gmail.com
                </a>
              </div>
            </div>
          </div>

          <p className="mt-5 text-xs text-muted-foreground leading-relaxed">
            We take every complaint seriously. Our team reviews all issues and gets back to
            you with a resolution — not a template. Please be patient and provide as much
            detail as you can. The more we know, the faster we can help.
          </p>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
