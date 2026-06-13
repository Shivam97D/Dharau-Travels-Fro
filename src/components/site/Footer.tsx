import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Instagram, Twitter, Youtube, Facebook, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

const sections = [
  { title: "Explore", links: ["Destinations", "Featured trips", "Categories", "Gallery"] },
  { title: "Company", links: ["About us", "Careers", "Press", "Sustainability"] },
  { title: "Support", links: ["Help center", "Contact", "Booking policy", "Safety"] },
];

const partners = ["Airbnb", "Hilton", "Emirates", "Qatar", "TripAdvisor", "Lonely Planet"];

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribing(true);
    try {
      const res = await api.subscribeNewsletter(email.trim());
      toast.success(res.message || "Subscribed! 🌍");
      setEmail("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not subscribe");
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer id="contact" className="relative overflow-hidden border-t border-border bg-card">
      <div className="absolute -top-40 left-1/2 h-80 w-[60%] -translate-x-1/2 rounded-full gradient-sunset opacity-15 blur-3xl" />

      {/* Partner marquee */}
      <div className="border-b border-border py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Trusted travel partners
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 opacity-70">
            {partners.map((p) => (
              <span key={p} className="font-display text-xl font-bold text-foreground/60">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr_1.4fr]">
          <div>
            <a href="#" className="inline-flex items-center gap-2 font-display text-xl font-bold">
              <img 
                src="/Screenshot_2026-05-26_180910-removebg-preview.png" 
                alt="DHARAVU JOURNEYS" 
                className="h-10 w-10 object-contain"
              />
              DHARAVU JOURNEYS
            </a>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Curated journeys for the wildly curious. Designed by humans, powered by wonder.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {[Instagram, Twitter, Youtube, Facebook].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="grid h-10 w-10 place-items-center rounded-full glass transition hover:scale-105 hover:bg-primary hover:text-primary-foreground"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {sections.map((s) => (
              <div key={s.title}>
                <div className="text-sm font-bold">{s.title}</div>
                <ul className="mt-4 space-y-2.5">
                  {s.links.map((l) => (
                    <li key={l}>
                      <a
                        href="#"
                        className="text-sm text-muted-foreground transition hover:text-foreground"
                      >
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="rounded-3xl glass p-6 shadow-soft">
            <div className="text-sm font-bold">Travel letters, every Friday</div>
            <p className="mt-2 text-xs text-muted-foreground">
              One destination, one story, zero spam.
            </p>
            <form
              onSubmit={handleSubscribe}
              className="mt-4 flex items-center gap-2 rounded-full bg-white/70 p-1.5"
            >
              <Mail className="ml-3 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="flex-1 bg-transparent px-2 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                disabled={subscribing}
                className="flex items-center gap-1.5 rounded-full gradient-sunset px-4 py-2 text-xs font-semibold text-primary-foreground shadow-glow transition hover:scale-105 disabled:opacity-50"
              >
                {subscribing && <Loader2 className="h-3 w-3 animate-spin" />}
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <div>© {new Date().getFullYear()} DHARAVU JOURNEYS Travel Co. Made with sunshine.</div>
          <div className="flex gap-5">
            <Link to="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-foreground">
              Terms
            </Link>
            <Link to="/privacy" hash="cookies" className="hover:text-foreground">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
