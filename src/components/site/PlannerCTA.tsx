import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { InquiryModal } from "./InquiryModal";

export function PlannerCTA() {
  const [inquiryOpen, setInquiryOpen] = useState(false);
  return (
    <section id="planner" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[2.5rem] gradient-aurora p-8 shadow-float sm:p-16">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-amber-glow/40 blur-3xl animate-blob" />
            <div
              className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-tropic/40 blur-3xl animate-blob"
              style={{ animationDelay: "3s" }}
            />
          </div>

          <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
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
                className="mt-5 text-4xl font-bold leading-[1] tracking-tight text-white sm:text-6xl lg:text-7xl"
              >
                Plan your <em className="not-italic text-amber-glow">dream</em> journey
              </motion.h2>
              <p className="mt-5 max-w-md text-base text-white/85 sm:text-lg">
                Tell us your vibe, your dates, and your dream. We'll send back a fully built
                itinerary you can tweak, approve, and live.
              </p>
              <motion.button
                type="button"
                onClick={() => setInquiryOpen(true)}
                whileHover={{ scale: 1.04 }}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-bold text-foreground shadow-glow"
              >
                Start planning
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="rounded-3xl glass-dark p-6"
            >
              <div className="text-xs font-semibold uppercase tracking-wider text-white/70">
                Quick brief
              </div>
              <div className="mt-4 space-y-3">
                {[
                  ["Where", "Anywhere warm with mountains"],
                  ["When", "March 18 – 27"],
                  ["Vibe", "Slow mornings, bold nights"],
                  ["Budget", "$2,000 / person"],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3 text-sm text-white"
                  >
                    <span className="text-white/70">{k}</span>
                    <span className="font-medium">{v}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-2xl bg-white/10 p-4 text-sm text-white/90">
                <span className="font-semibold text-amber-glow">AI suggests:</span> 8-day Bali +
                Lombok loop with surf, hike, and 2 luxury villa stays.
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <InquiryModal open={inquiryOpen} onClose={() => setInquiryOpen(false)} />
    </section>
  );
}
