import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Sparkles, X, Send } from "lucide-react";

export function FloatingButtons() {
  const [aiOpen, setAiOpen] = useState(false);

  return (
    <>
      {/* WhatsApp */}
      <motion.a
        href="https://wa.me/919579265920"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.5, type: "spring" }}
        whileHover={{ scale: 1.1 }}
        className="fixed bottom-6 left-6 z-40 grid h-14 w-14 place-items-center rounded-full bg-[oklch(0.7_0.18_150)] text-white shadow-glow"
        aria-label="WhatsApp"
      >
        <MessageCircle className="h-6 w-6" />
        <span className="absolute -right-1 -top-1 h-3 w-3 animate-ping rounded-full bg-tropic" />
        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-tropic" />
      </motion.a>

      {/* AI Assistant */}
      <motion.button
        onClick={() => setAiOpen(true)}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.7, type: "spring" }}
        whileHover={{ scale: 1.1 }}
        className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full gradient-sunset px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow"
      >
        <Sparkles className="h-4 w-4" />
        <span className="hidden sm:inline">AI Travel Assistant</span>
      </motion.button>

      <AnimatePresence>
        {aiOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:items-center sm:justify-center sm:p-6"
          >
            <div
              className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
              onClick={() => setAiOpen(false)}
            />
            <motion.div
              initial={{ y: 40, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-3xl bg-card p-6 shadow-float"
            >
              <button
                onClick={() => setAiOpen(false)}
                className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-muted hover:bg-border"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="grid h-12 w-12 place-items-center rounded-2xl gradient-aurora text-primary-foreground shadow-glow">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-2xl font-bold">Your AI travel concierge</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Tell me your dream and I'll draft an itinerary in seconds.
              </p>
              <div className="mt-5 space-y-2">
                {[
                  "Beach + jungle, 7 days, mid budget",
                  "Aurora trip in March, 2 people",
                  "Solo Japan, food-focused",
                ].map((p) => (
                  <button
                    key={p}
                    className="w-full rounded-2xl border border-border bg-muted/40 px-4 py-3 text-left text-sm transition hover:border-primary hover:bg-primary/5"
                  >
                    {p}
                  </button>
                ))}
              </div>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="mt-5 flex items-center gap-2 rounded-2xl bg-muted p-1.5"
              >
                <input
                  className="flex-1 bg-transparent px-3 py-2 text-sm outline-none"
                  placeholder="Where shall we go?"
                />
                <button className="grid h-9 w-9 place-items-center rounded-xl gradient-sunset text-primary-foreground shadow-glow">
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
