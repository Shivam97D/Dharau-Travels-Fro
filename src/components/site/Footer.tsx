import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Instagram, Mail, Phone, MapPin } from "lucide-react";
import { TravelDots } from "@/components/ui/TravelLoader";
import { toast } from "sonner";
import api from "@/lib/api";

type FooterLink = { label: string; href: string };

const sections: { title: string; links: FooterLink[] }[] = [
  {
    title: "Explore",
    links: [
      { label: "Destinations", href: "/destinations" },
      { label: "Featured trips", href: "/#trips" },
      { label: "Categories", href: "/#categories" },
      { label: "Gallery", href: "/#gallery" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About us", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Sustainability", href: "/sustainability" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "Booking policy", href: "/booking-policy" },
      { label: "Safety", href: "/safety" },
    ],
  },
];

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
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[60%] -translate-x-1/2 rounded-full gradient-sunset opacity-15 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr_1.4fr]">
          {/* Brand + contact */}
          <div>
            <Link to="/" className="inline-flex items-center gap-2 font-display text-xl font-bold">
              <img
                src="/Screenshot_2026-05-26_180910-removebg-preview.png"
                alt="DHARAVU JOURNEYS"
                className="h-10 w-10 object-contain"
              />
              DHARAVU JOURNEYS
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Curated journeys for the wildly curious. Designed by humans, powered by wonder.
            </p>

            <div className="mt-5 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>Siddhi Apartment, Polyhub, Vadgaon — 411041</span>
              </div>
              <a href="tel:+919579265920" className="flex items-center gap-2 transition hover:text-foreground">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                +91 95792 65920 / 93568 01338
              </a>
              <a href="mailto:dharavujourney@gmail.com" className="flex items-center gap-2 transition hover:text-foreground">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                dharavujourney@gmail.com
              </a>
            </div>

            <div className="mt-5 flex items-center gap-2">
              <a
                href="https://www.instagram.com/dharavu_journey?igsh=MTl6emJlMWJkdDE4cw=="
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="grid h-10 w-10 place-items-center rounded-full glass transition hover:scale-105 hover:bg-primary hover:text-primary-foreground"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Nav links */}
          <div className="grid grid-cols-3 gap-6">
            {sections.map((s) => (
              <div key={s.title}>
                <div className="text-sm font-bold">{s.title}</div>
                <ul className="mt-4 space-y-2.5">
                  {s.links.map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        className="text-sm text-muted-foreground transition hover:text-foreground"
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Newsletter */}
          <div className="self-start rounded-3xl glass p-6 shadow-soft">
            <div className="text-sm font-bold">Travel letters, every Friday</div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              One destination, one story, zero spam.
            </p>
            <form
              onSubmit={handleSubscribe}
              className="mt-4 flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 shadow-[0_2px_12px_rgba(0,0,0,0.12)] backdrop-blur-sm"
            >
              <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your mail@.com"
                className="min-w-0 flex-1 bg-transparent px-1 py-1.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                disabled={subscribing}
                className="flex shrink-0 items-center gap-1.5 rounded-full gradient-sunset px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-glow transition hover:scale-105 disabled:opacity-50"
              >
                {subscribing ? <TravelDots /> : "Join"}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <div>© {new Date().getFullYear()} Dharavu — Siddhi Apartment, Polyhub, Vadgaon 411041</div>
          <div className="flex gap-5">
            <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link to="/terms" className="hover:text-foreground">Terms</Link>
            <Link to="/privacy" hash="cookies" className="hover:text-foreground">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
