import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Users, Check, ChevronLeft, ChevronRight, Flame, Loader2, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { SectionHeader } from "./Section";
import api from "@/lib/api";
import type { Trip } from "@/lib/types";

export function FeaturedTrips() {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const response = await api.getFeaturedTrips();
      if (response.success && response.data) {
        setTrips(response.data as Trip[]);
      }
    } catch (error) {
      console.error("Failed to fetch featured trips:", error);
    } finally {
      setLoading(false);
    }
  };

  const scroll = (dir: 1 | -1) => {
    if (!ref.current) return;
    ref.current.scrollBy({ left: dir * 380, behavior: "smooth" });
  };

  const onScroll = () => {
    if (!ref.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = ref.current;
    setProgress(scrollLeft / (scrollWidth - clientWidth));
  };

  return (
    <section id="trips" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              <Flame className="h-3 w-3" /> Featured trips
            </div>
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Adventures, <span className="italic text-gradient-ocean">all-inclusive</span>
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll(-1)}
              className="grid h-12 w-12 place-items-center rounded-full glass shadow-soft transition hover:scale-105"
              aria-label="Previous"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll(1)}
              className="grid h-12 w-12 place-items-center rounded-full gradient-sunset text-primary-foreground shadow-glow transition hover:scale-105"
              aria-label="Next"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : trips.length === 0 ? (
          <div className="flex h-64 items-center justify-center rounded-3xl glass">
            <p className="text-muted-foreground">No featured trips available yet.</p>
          </div>
        ) : (
          <div
            ref={ref}
            onScroll={onScroll}
            className="scrollbar-hide mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4"
          >
            {trips.map((t, i) => (
              <Link
                key={t._id}
                to="/trips/$slug"
                params={{ slug: t.slug }}
                className="group relative block w-[320px] shrink-0 snap-start overflow-hidden rounded-[2rem] bg-card shadow-soft sm:w-[360px]"
              >
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: i * 0.05 }}
                >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={t.images && t.images[0] ? t.images[0].url : "/placeholder.jpg"}
                    alt={t.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                  {t.badge && (
                    <motion.span
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ delay: 0.3 + i * 0.05, type: "spring" }}
                      className="absolute left-4 top-4 rounded-full gradient-sunset px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-glow"
                    >
                      {t.badge}
                    </motion.span>
                  )}
                  <div className="absolute right-4 top-4 rounded-full glass px-3 py-1 text-xs font-semibold">
                    Only {t.availableSeats} left
                  </div>
                  {/* Description hover overlay */}
                  <motion.div
                    initial={false}
                    className="absolute inset-0 flex flex-col justify-end bg-black/60 p-5 backdrop-blur-[2px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  >
                    <p className="line-clamp-4 text-sm leading-relaxed text-white/90">
                      {t.description}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-white/70">
                      View details <ArrowRight className="h-3 w-3" />
                    </span>
                  </motion.div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold tracking-tight">{t.title}</h3>
                  <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {t.duration.days} days
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      Max {t.maxGroupSize}
                    </span>
                  </div>

                  <ul className="mt-4 space-y-1.5">
                    {t.includes.slice(0, 4).map((inc, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-foreground/80">
                        <Check className="h-3.5 w-3.5 text-tropic" />
                        {inc}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-5 flex items-end justify-between border-t border-border pt-4">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        From
                      </div>
                      <div className="text-2xl font-bold">₹{t.price.amount.toLocaleString("en-IN")}</div>
                    </div>
                    <button className="rounded-full gradient-sunset px-4 py-2 text-xs font-semibold text-primary-foreground shadow-glow transition hover:scale-105">
                      Book now
                    </button>
                  </div>
                </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full gradient-sunset"
            style={{ width: `${Math.max(15, progress * 100)}%` }}
          />
        </div>
      </div>
    </section>
  );
}
