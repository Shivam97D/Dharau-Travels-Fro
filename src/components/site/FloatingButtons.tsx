import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, ChevronLeft, ChevronRight } from "lucide-react";
import { ChatPanel } from "./ChatSupport";

export function FloatingButtons() {
  const [visible, setVisible] = useState(true);   // mobile scroll visibility
  const [waDismissed, setWaDismissed] = useState(false);   // desktop WA dismissed
  const [chatDismissed, setChatDismissed] = useState(false); // desktop chat dismissed
  const [chatOpen, setChatOpen] = useState(false);
  const [isMd, setIsMd] = useState(false); // >=768px = desktop
  const lastYRef = useRef(0);

  // Detect screen size
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsMd(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsMd(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Mobile scroll visibility: show at top, hide scrolling down, show at bottom or scrolling up
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const atTop = y < 120;
      const atBottom = y + window.innerHeight >= document.documentElement.scrollHeight - 180;
      const goingUp = y < lastYRef.current;
      lastYRef.current = y;
      setVisible(atTop || atBottom || goingUp);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // On mobile: slide down when not visible (y: 0 → 120)
  // On desktop: slide left/right when manually dismissed
  const waAnimate = isMd
    ? { x: waDismissed ? -160 : 0, y: 0, opacity: 1 }
    : { x: 0, y: visible ? 0 : 120, opacity: visible ? 1 : 0 };

  const chatAnimate = isMd
    ? { x: chatDismissed ? 200 : 0, y: 0, opacity: 1 }
    : { x: 0, y: visible ? 0 : 120, opacity: visible ? 1 : 0 };

  const spring = { type: "spring" as const, stiffness: 280, damping: 28 };

  return (
    <>
      {/* ── WhatsApp ─────────────────────────────────────────────────── */}
      <motion.div
        className="fixed bottom-6 left-6 z-40"
        animate={waAnimate}
        transition={spring}
      >
        <div className="relative">
          <a
            href="https://wa.me/919579265920"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="relative grid h-14 w-14 place-items-center rounded-full shadow-glow"
          >
            <img
              src="/whatsapp-icon.png"
              alt="WhatsApp"
              className="h-14 w-14 rounded-full object-cover"
            />
            <span className="absolute -right-1 -top-1 h-3 w-3 animate-ping rounded-full bg-green-400" />
            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-green-400" />
          </a>

          {/* Desktop dismiss button */}
          {isMd && !waDismissed && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={() => setWaDismissed(true)}
              aria-label="Hide WhatsApp"
              className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition hover:bg-muted"
            >
              <X className="h-2.5 w-2.5" />
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* WhatsApp edge tab — appears on desktop when dismissed */}
      <AnimatePresence>
        {isMd && waDismissed && (
          <motion.button
            initial={{ x: -32 }}
            animate={{ x: 0 }}
            exit={{ x: -32 }}
            transition={spring}
            onClick={() => setWaDismissed(false)}
            aria-label="Show WhatsApp"
            className="fixed bottom-8 left-0 z-40 flex h-12 w-7 items-center justify-center rounded-r-2xl bg-green-500 text-white shadow-lg transition-[width] hover:w-9"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Travel Assistant (Chat) ───────────────────────────────────── */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        animate={chatAnimate}
        transition={spring}
      >
        <div className="relative">
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
            onClick={() => {
              setChatOpen((o) => !o);
              if (chatDismissed) setChatDismissed(false);
            }}
            aria-label="Open travel assistant"
            className="inline-flex items-center gap-2 rounded-full gradient-sunset px-5 py-3.5 text-sm font-semibold text-white shadow-glow transition hover:scale-105"
          >
            <AnimatePresence mode="wait" initial={false}>
              {chatOpen ? (
                <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                  <X className="h-4 w-4" />
                </motion.span>
              ) : (
                <motion.span key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                  <Sparkles className="h-4 w-4" />
                </motion.span>
              )}
            </AnimatePresence>
            <span className="hidden sm:inline">{chatOpen ? "Close" : "Travel Assistant"}</span>
          </motion.button>

          {/* Desktop dismiss button — only when chat is closed */}
          {isMd && !chatDismissed && !chatOpen && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={() => setChatDismissed(true)}
              aria-label="Hide chat assistant"
              className="absolute -left-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition hover:bg-muted"
            >
              <X className="h-2.5 w-2.5" />
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Chat edge tab — appears on desktop when dismissed */}
      <AnimatePresence>
        {isMd && chatDismissed && !chatOpen && (
          <motion.button
            initial={{ x: 32 }}
            animate={{ x: 0 }}
            exit={{ x: 32 }}
            transition={spring}
            onClick={() => setChatDismissed(false)}
            aria-label="Show chat assistant"
            className="fixed bottom-8 right-0 z-50 flex h-12 w-7 items-center justify-center rounded-l-2xl gradient-sunset text-white shadow-glow transition-[width] hover:w-9"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Chat panel ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {chatOpen && <ChatPanel onClose={() => setChatOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
