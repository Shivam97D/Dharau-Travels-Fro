import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, Bot, User, ChevronRight, Loader2 } from "lucide-react";
import api from "@/lib/api";

type Message = { role: "bot" | "user"; text: string };

const SUGGESTED: string[] = [
  "How do I book a trip?",
  "What is the cancellation policy?",
  "Are trips suitable for solo travellers?",
  "How do group bookings work?",
  "Can I customise a trip?",
];

export function ChatSupport() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "Hi! I'm Dharavu's travel assistant 👋\nAsk me anything about our trips, bookings, or policies — or pick a question below.",
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, thinking]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || thinking) return;

    const userMsg: Message = { role: "user", text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setThinking(true);

    try {
      // Send history (excluding the initial greeting) so Gemini has context
      const history = messages.slice(1);
      const res = await api.sendChatMessage(trimmed, history);
      const reply = (res as unknown as { reply: string }).reply ?? "I ran into a hiccup — please email dharavujourney@gmail.com or call +91 95792 65920!";
      setMessages((prev) => [...prev, { role: "bot", text: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "bot", text: "Something went wrong — email dharavujourney@gmail.com or call +91 95792 65920 and we'll help!" }]);
    } finally {
      setThinking(false);
    }
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
                    Powered by Gemini AI
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

              {thinking && (
                <div className="flex gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full gradient-aurora text-white">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-muted px-3.5 py-2.5">
                    <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Thinking…</span>
                  </div>
                </div>
              )}

              {showSuggestions && (
                <div className="mt-1 space-y-1.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Quick questions</p>
                  {SUGGESTED.map((q) => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      className="flex w-full items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-left text-xs text-muted-foreground transition hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
                    >
                      <ChevronRight className="h-3 w-3 shrink-0 text-primary" />
                      {q}
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
                  disabled={thinking}
                  className="flex-1 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || thinking}
                  className="flex h-7 w-7 items-center justify-center rounded-full gradient-aurora text-white transition hover:scale-110 disabled:opacity-40"
                >
                  <Send className="h-3 w-3" />
                </button>
              </form>
              <p className="mt-1.5 text-center text-[9px] text-muted-foreground">
                AI assistant · Powered by Gemini Flash
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
