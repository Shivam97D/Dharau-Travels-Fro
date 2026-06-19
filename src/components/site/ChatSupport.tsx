import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, Bot, User, ChevronRight } from "lucide-react";

type Message = { role: "bot" | "user"; text: string };

const FAQ: { q: string; a: string }[] = [
  {
    q: "How do I book a trip?",
    a: "Browse our trips, open the one you like, and click 'Book Now'. You can pay immediately via UPI, card, or net banking — or choose 'Request to book' and pay later once our team confirms your spot.",
  },
  {
    q: "What is the cancellation policy?",
    a: "You can cancel anytime from your dashboard. Refunds are: 90% if you cancel 30+ days before departure, 50% at 15–30 days, 25% at 7–14 days, and no refund within 7 days. Full details are on our Booking Policy page.",
  },
  {
    q: "Are trips suitable for solo travellers?",
    a: "Absolutely — many of our travellers come alone and leave with friends. Our group sizes are small and our guides are briefed to make solo travellers feel at home. Women travelling alone are very welcome and we take their safety seriously.",
  },
  {
    q: "What is included in the trip price?",
    a: "Each trip page lists exactly what's included. Typically: accommodation, guide, transport within the route, and meals where specified. Flights to the starting point and travel insurance are usually not included — we'll flag this clearly.",
  },
  {
    q: "How do group bookings work?",
    a: "For groups of 6 or more, write to us at dharavujourney@gmail.com or use the Contact page and select 'Group booking'. We offer customised group rates and can adjust the itinerary to suit your group.",
  },
  {
    q: "Do I need travel insurance?",
    a: "We strongly recommend it — especially for trek and adventure trips. We are not liable for medical emergencies or trip interruptions. A basic policy covering medical + cancellation is usually under ₹500 for a domestic trip.",
  },
  {
    q: "Are trips suitable for beginners?",
    a: "We have trips for every fitness level. Each trip page clearly lists the fitness requirement (Easy / Moderate / Challenging). If you're unsure, write to us and we'll recommend the right one for you.",
  },
  {
    q: "How do I pay?",
    a: "We accept UPI, credit and debit cards, and net banking — all processed securely through Razorpay. For group or custom trips, a payment plan can be arranged with our team.",
  },
  {
    q: "Can I customise a trip?",
    a: "Yes! Fill out the 'Plan your dream journey' form on the home page or visit our Contact page. Tell us your destination, dates, group size, and vibe — and we'll send back a fully built itinerary within 24 hours.",
  },
  {
    q: "How do I reach you?",
    a: "Email: dharavujourney@gmail.com\nPhone: +91 95792 65920 / 93568 01338\nInstagram: @dharavu_journey\nOffice: Siddhi Apartment, Polyhub, Vadgaon, Pune — 411041",
  },
];

function findAnswer(query: string): string | null {
  const q = query.toLowerCase();
  for (const faq of FAQ) {
    const keywords = faq.q.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
    const matches = keywords.filter((kw) => q.includes(kw)).length;
    if (matches >= 2) return faq.a;
  }
  // Soft fallback keyword matching
  if (q.includes("book") || q.includes("reserv")) return FAQ[0].a;
  if (q.includes("cancel") || q.includes("refund")) return FAQ[1].a;
  if (q.includes("solo") || q.includes("alone") || q.includes("women") || q.includes("female")) return FAQ[2].a;
  if (q.includes("includ") || q.includes("price") || q.includes("cost") || q.includes("what do")) return FAQ[3].a;
  if (q.includes("group")) return FAQ[4].a;
  if (q.includes("insur")) return FAQ[5].a;
  if (q.includes("beginner") || q.includes("fit") || q.includes("difficult") || q.includes("easy")) return FAQ[6].a;
  if (q.includes("pay") || q.includes("upi") || q.includes("card")) return FAQ[7].a;
  if (q.includes("custom") || q.includes("plan") || q.includes("own") || q.includes("dream")) return FAQ[8].a;
  if (q.includes("contact") || q.includes("reach") || q.includes("email") || q.includes("phone") || q.includes("call")) return FAQ[9].a;
  return null;
}

export function ChatSupport() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "Hi! I'm Dharavu's travel assistant 👋\nAsk me anything about our trips, bookings, or policies — or pick a question below.",
    },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: "user", text: text.trim() };
    const answer = findAnswer(text);
    const botMsg: Message = {
      role: "bot",
      text:
        answer ??
        "I don't have an answer for that yet — but our team does! Reach us at dharavujourney@gmail.com or call +91 95792 65920 and we'll help you out.",
    };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  };

  const showSuggestions = messages.length <= 1;

  return (
    <>
      {/* Floating button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.7, type: "spring", stiffness: 200 }}
        onClick={() => setOpen((o) => !o)}
        aria-label="Open travel assistant"
        className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full gradient-sunset px-5 py-3.5 text-sm font-semibold text-white shadow-glow transition hover:scale-105"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="h-4 w-4" />
            </motion.span>
          ) : (
            <motion.span key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <Sparkles className="h-4 w-4" />
            </motion.span>
          )}
        </AnimatePresence>
        <span className="hidden sm:inline">{open ? "Close" : "Travel Assistant"}</span>
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-24 right-6 z-50 flex w-[calc(100vw-3rem)] max-w-sm flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-float"
          >
            {/* Header */}
            <div className="gradient-aurora px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Dharavu Assistant</div>
                  <div className="flex items-center gap-1.5 text-xs text-white/70">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                    Online now
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex flex-col gap-3 overflow-y-auto px-4 py-4" style={{ maxHeight: "320px" }}>
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white ${m.role === "bot" ? "gradient-aurora" : "gradient-sunset"}`}>
                    {m.role === "bot" ? <Bot className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                  </div>
                  <div
                    className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-line ${
                      m.role === "bot"
                        ? "bg-muted text-foreground rounded-tl-sm"
                        : "gradient-aurora text-white rounded-tr-sm"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}

              {/* Suggested questions — only shown initially */}
              {showSuggestions && (
                <div className="mt-1 space-y-1.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Quick questions</p>
                  {FAQ.slice(0, 5).map((faq) => (
                    <button
                      key={faq.q}
                      onClick={() => send(faq.q)}
                      className="flex w-full items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-left text-xs text-muted-foreground transition hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
                    >
                      <ChevronRight className="h-3 w-3 shrink-0 text-primary" />
                      {faq.q}
                    </button>
                  ))}
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="border-t border-border px-3 py-3">
              <form
                onSubmit={(e) => { e.preventDefault(); send(input); }}
                className="flex items-center gap-2 rounded-2xl bg-muted px-3 py-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your question…"
                  className="flex-1 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="flex h-7 w-7 items-center justify-center rounded-full gradient-aurora text-white transition hover:scale-110 disabled:opacity-40"
                >
                  <Send className="h-3 w-3" />
                </button>
              </form>
              <p className="mt-1.5 text-center text-[9px] text-muted-foreground">
                AI assistant · Powered by Dharavu
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
