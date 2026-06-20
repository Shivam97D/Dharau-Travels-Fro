import { motion, AnimatePresence } from "framer-motion";
import { Users2, User, Mountain, Tent, Zap, MapPin, Clock, Star, ChevronRight } from "lucide-react";
import { TravelLoader, TravelDots } from "@/components/ui/TravelLoader";
import { SectionHeader } from "./Section";
import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import api from "@/lib/api";
import type { Trip } from "@/lib/types";

const cats = [
  {
    icon: Users2,
    name: "Group Tour",
    value: "group-tour",
    desc: "Travel with like-minded explorers",
    gradient: "gradient-sunset",
  },
  {
    icon: User,
    name: "Solo",
    value: "solo",
    desc: "Your pace, your rules",
    gradient: "gradient-ocean",
  },
  {
    icon: Mountain,
    name: "Trekking",
    value: "trekking",
    desc: "Trails that take your breath away",
    gradient: "gradient-tropic",
  },
  {
    icon: Tent,
    name: "Camping",
    value: "camping",
    desc: "Sleep under a sky full of stars",
    gradient: "gradient-aurora",
  },
  {
    icon: Zap,
    name: "Adventure",
    value: "adventure",
    desc: "Adrenaline-packed, memory-making",
    gradient: "gradient-sunset",
  },
];

const formatINR = (n: number) => `₹${(n ?? 0).toLocaleString("en-IN")}`;

function TripCard({ trip }: { trip: Trip }) {
  const img = trip.images?.find((i) => i.isPrimary) ?? trip.images?.[0];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      layout
      className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition hover:shadow-float"
    >
      <Link to="/trips/$slug" params={{ slug: trip.slug }} className="flex flex-col flex-1">
        <div className="relative h-48 overflow-hidden bg-muted">
          {img ? (
            <img
              src={img.url}
              alt={trip.title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="h-full gradient-aurora opacity-30" />
          )}
          {trip.badge && (
            <span className="absolute left-3 top-3 rounded-full gradient-sunset px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-glow">
              {trip.badge}
            </span>
          )}
          <div className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            {trip.duration?.days}D / {trip.duration?.nights}N
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold leading-snug">{trip.title}</h3>
            {trip.rating?.average > 0 && (
              <div className="flex shrink-0 items-center gap-1 text-xs font-semibold text-amber-400">
                <Star className="h-3.5 w-3.5 fill-current" />
                {trip.rating.average.toFixed(1)}
              </div>
            )}
          </div>
          <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" /> {trip.destination}
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" /> {trip.duration?.days} days
          </div>
          <div className="mt-auto pt-4 flex items-end justify-between">
            <div>
              <span className="text-lg font-bold">{formatINR(trip.price?.amount)}</span>
              <span className="text-xs text-muted-foreground"> / person</span>
            </div>
            <span className="rounded-full gradient-sunset px-3 py-1 text-xs font-semibold text-white shadow-glow transition hover:scale-105">
              View trip →
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function Categories() {
  const [active, setActive] = useState<string | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!active) { setTrips([]); return; }
    let cancelled = false;
    setLoading(true);
    api.getTrips({ category: active, limit: "9" })
      .then((res: any) => {
        if (!cancelled) setTrips((res.data?.data ?? res.data) as Trip[] ?? []);
      })
      .catch(() => { if (!cancelled) setTrips([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [active]);

  const handleChip = (value: string) => {
    setActive((prev) => (prev === value ? null : value));
  };

  return (
    <section id="categories" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader
          eyebrow="Travel categories"
          title={
            <>
              Pick your <span className="italic text-gradient-ocean">flavour</span> of escape
            </>
          }
          subtitle="One trip can be many things — group, solo, trekking, camping, adventure, or all at once."
        />
        {/* Mobile: compact one-line chips */}
        <div className="mt-10 flex flex-col gap-2 sm:hidden">
          {cats.map((c, i) => {
            const Icon = c.icon;
            const isActive = active === c.value;
            return (
              <motion.button
                key={c.value}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                onClick={() => handleChip(c.value)}
                className={`relative flex items-center gap-3 overflow-hidden rounded-2xl border px-4 py-3 text-left transition ${
                  isActive ? "border-transparent ring-2 ring-primary" : "border-border bg-card"
                }`}
              >
                {isActive && (
                  <div className={`absolute inset-0 ${c.gradient}`} />
                )}
                <div className={`relative grid h-8 w-8 shrink-0 place-items-center rounded-xl ${c.gradient} text-primary-foreground shadow-glow`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="relative flex-1 min-w-0">
                  <span className={`font-semibold text-sm ${isActive ? "text-primary-foreground" : ""}`}>
                    {c.name}
                  </span>
                  <span className={`ml-2 text-xs ${isActive ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    {c.desc}
                  </span>
                </div>
                <ChevronRight className={`relative h-4 w-4 shrink-0 transition ${isActive ? "text-primary-foreground rotate-90" : "text-muted-foreground"}`} />
              </motion.button>
            );
          })}
        </div>

        {/* Desktop: full cards */}
        <div className="mt-14 hidden grid-cols-3 gap-4 sm:grid md:grid-cols-5">
          {cats.map((c, i) => {
            const Icon = c.icon;
            const isActive = active === c.value;
            return (
              <motion.button
                key={c.value}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.5 }}
                whileHover={{ y: -6, rotate: -1 }}
                onClick={() => handleChip(c.value)}
                className={`group relative overflow-hidden rounded-3xl border p-6 text-left shadow-soft transition ${
                  isActive
                    ? "border-transparent ring-2 ring-primary"
                    : "border-border bg-card"
                }`}
              >
                <div
                  className={`absolute inset-0 -z-10 ${c.gradient} transition ${
                    isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}
                />
                <div
                  className={`mb-5 grid h-14 w-14 place-items-center rounded-2xl ${c.gradient} text-primary-foreground shadow-glow transition group-hover:scale-110`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div className={`text-lg font-bold transition ${isActive ? "text-primary-foreground" : "group-hover:text-primary-foreground"}`}>
                  {c.name}
                </div>
                <div className={`mt-1 text-xs font-medium transition ${isActive ? "text-primary-foreground/80" : "text-muted-foreground group-hover:text-primary-foreground/80"}`}>
                  {c.desc}
                </div>
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {active && (
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-14"
            >
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-bold">
                  {cats.find((c) => c.value === active)?.name} trips
                </h3>
                <button
                  onClick={() => setActive(null)}
                  className="rounded-full glass px-4 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
                >
                  Clear filter
                </button>
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <TravelLoader />
                </div>
              ) : trips.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-3xl glass py-14 text-center">
                  <p className="font-semibold">No trips in this category yet</p>
                  <p className="text-sm text-muted-foreground">Check back soon — we're always adding new adventures.</p>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {trips.map((trip) => (
                    <TripCard key={trip._id} trip={trip} />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
