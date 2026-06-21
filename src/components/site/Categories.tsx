import { motion, AnimatePresence } from "framer-motion";
import { Users2, User, Mountain, Tent, Zap, MapPin, Clock, Star, Play } from "lucide-react";
import { isMediaVideo } from "@/lib/utils";
import { TravelLoader } from "@/components/ui/TravelLoader";
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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      layout
      className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition hover:shadow-float"
    >
      <Link to="/trips/$slug" params={{ slug: trip.slug }} className="flex flex-1 flex-col">
        <div className="relative h-40 overflow-hidden bg-muted">
          {img ? (
            isMediaVideo(img.url) ? (
              <>
                <video src={img.url} muted autoPlay loop playsInline className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute right-2 top-2 rounded-full bg-black/50 p-1 backdrop-blur-sm"><Play className="h-3 w-3 fill-white text-white" /></div>
              </>
            ) : (
              <img src={img.url} alt={trip.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
            )
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
        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-bold leading-snug">{trip.title}</h3>
            {trip.rating?.average > 0 && (
              <div className="flex shrink-0 items-center gap-1 text-xs font-semibold text-amber-400">
                <Star className="h-3.5 w-3.5 fill-current" />
                {trip.rating.average.toFixed(1)}
              </div>
            )}
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" /> {trip.destination}
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" /> {trip.duration?.days} days
          </div>
          <div className="mt-auto flex items-end justify-between pt-3">
            <div>
              <span className="text-base font-bold">{formatINR(trip.price?.amount)}</span>
              <span className="text-xs text-muted-foreground"> / person</span>
            </div>
            <span className="rounded-full gradient-sunset px-3 py-1 text-xs font-semibold text-white shadow-glow">
              View →
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-3xl glass text-center">
      <p className="font-semibold">No trips in this category yet</p>
      <p className="text-sm text-muted-foreground">
        Check back soon — we're always adding new adventures.
      </p>
    </div>
  );
}

export function Categories() {
  const [active, setActive] = useState<string | null>("adventure");
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .getTrips({ ...(active ? { category: active } : {}), limit: "9" })
      .then((res: any) => {
        if (!cancelled)
          setTrips(((res.data?.data ?? res.data) as Trip[]) ?? []);
      })
      .catch(() => {
        if (!cancelled) setTrips([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [active]);

  const tripGrid = (cols: string) =>
    loading ? (
      <motion.div
        key="loading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex h-48 items-center justify-center"
      >
        <TravelLoader />
      </motion.div>
    ) : trips.length === 0 ? (
      <motion.div
        key="empty"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
      >
        <EmptyState />
      </motion.div>
    ) : (
      <motion.div
        key={active}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className={`grid gap-4 pb-4 ${cols}`}
      >
        {trips.map((trip) => (
          <TripCard key={trip._id} trip={trip} />
        ))}
      </motion.div>
    );

  return (
    <section id="categories" className="relative">
      <div className="absolute inset-0 -z-10 bg-grain opacity-40" />

      {/* ── Mobile layout: h-dvh, compact chips ───────────────────── */}
      <div className="flex h-[100dvh] min-h-[600px] flex-col overflow-hidden py-8 md:hidden">
        <div className="mx-auto flex h-full w-full max-w-7xl flex-col px-4">
          {/* Compact header */}
          <div className="shrink-0 text-center">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Travel categories
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              Pick your{" "}
              <span className="italic text-gradient-ocean">flavour</span> of
              escape
            </h2>
          </div>

          {/* Category chips 2-per-row + trip results */}
          <div className="mt-5 flex flex-1 flex-col gap-4 overflow-hidden">
            <div className="grid shrink-0 grid-cols-2 gap-2 content-start">
              {cats.map((c, i) => {
                const Icon = c.icon;
                const isActive = active === c.value;
                return (
                  <motion.button
                    key={c.value}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: i * 0.06,
                      type: "spring",
                      stiffness: 260,
                      damping: 24,
                    }}
                    onClick={() => setActive(c.value)}
                    className={`relative flex items-center gap-2.5 overflow-hidden rounded-2xl border p-3 text-left transition ${
                      isActive
                        ? "border-transparent ring-2 ring-primary shadow-glow"
                        : "border-border bg-card hover:border-primary/30 hover:shadow-soft"
                    }`}
                  >
                    {isActive && (
                      <div className={`absolute inset-0 ${c.gradient}`} />
                    )}
                    <div
                      className={`relative grid h-9 w-9 shrink-0 place-items-center rounded-xl ${c.gradient} text-primary-foreground shadow-glow`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="relative min-w-0">
                      <div
                        className={`truncate text-sm font-bold ${isActive ? "text-primary-foreground" : ""}`}
                      >
                        {c.name}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <div className="flex-1 overflow-y-auto [scrollbar-width:thin]">
              <AnimatePresence mode="wait">{tripGrid("sm:grid-cols-2")}</AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* ── Desktop layout: original big card grid ─────────────────── */}
      <div className="hidden py-24 md:block lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Header */}
          <div className="text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Travel categories
            </div>
            <h2 className="text-4xl font-bold tracking-tight lg:text-5xl">
              Pick your{" "}
              <span className="italic text-gradient-ocean">flavour</span> of
              escape
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              From adrenaline-fuelled treks to serene solo getaways — find what
              moves you.
            </p>
          </div>

          {/* Big card grid */}
          <div className="mt-14 grid grid-cols-3 gap-5 md:grid-cols-4 lg:grid-cols-5">
            {cats.map((c, i) => {
              const Icon = c.icon;
              const isActive = active === c.value;
              return (
                <motion.button
                  key={c.value}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: i * 0.08,
                    type: "spring",
                    stiffness: 220,
                    damping: 22,
                  }}
                  viewport={{ once: true }}
                  onClick={() =>
                    setActive((prev) => (prev === c.value ? null : c.value))
                  }
                  className={`group relative overflow-hidden rounded-3xl p-6 text-left transition hover:scale-[1.03] ${
                    isActive
                      ? `${c.gradient} text-white shadow-float`
                      : "glass border border-border hover:shadow-float"
                  }`}
                >
                  {!isActive && (
                    <div
                      className={`absolute inset-0 ${c.gradient} opacity-0 transition group-hover:opacity-10`}
                    />
                  )}
                  <div
                    className={`relative mb-4 grid h-14 w-14 place-items-center rounded-2xl ${c.gradient} text-white shadow-glow`}
                  >
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3
                    className={`relative text-base font-bold ${isActive ? "text-white" : ""}`}
                  >
                    {c.name}
                  </h3>
                  <p
                    className={`relative mt-1 text-sm ${isActive ? "text-white/80" : "text-muted-foreground"}`}
                  >
                    {c.desc}
                  </p>
                </motion.button>
              );
            })}
          </div>

          {/* Results below */}
          <AnimatePresence mode="wait">
            {active && (
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.35 }}
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
                <AnimatePresence mode="wait">
                  {tripGrid("sm:grid-cols-2 lg:grid-cols-3")}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
