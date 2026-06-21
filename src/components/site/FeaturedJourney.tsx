import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { MapPin, Clock, Users, Star, Mountain, Plane, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import api from "@/lib/api";
import type { Trip } from "@/lib/types";

export function FeaturedJourney() {
  const [trip, setTrip] = useState<Trip | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["-5%", "15%"]);

  useEffect(() => {
    api
      .getTrips({ limit: "1" })
      .then((res: any) => {
        const list: Trip[] = res.data?.data ?? res.data ?? [];
        if (list.length > 0) setTrip(list[0]);
      })
      .catch(() => {});
  }, []);

  if (!trip) return null;

  const img =
    trip.images?.find((i: any) => i.isPrimary)?.url ?? trip.images?.[0]?.url;
  const price = trip.price?.amount
    ? `₹${trip.price.amount.toLocaleString("en-IN")}`
    : null;

  return (
    <section
      ref={sectionRef}
      className="relative h-[72vh] min-h-[520px] overflow-hidden"
    >
      {/* Parallax background */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 scale-[1.25]"
      >
        {img ? (
          <img
            src={img}
            alt={trip.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full gradient-aurora" />
        )}
      </motion.div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-grain opacity-30" />

      {/* Content */}
      <div className="relative flex h-full items-center">
        <div className="mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-16">
          <div className="flex items-center justify-between gap-8">
            {/* Left: text */}
            <div className="max-w-xl">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-sm"
              >
                <Plane className="h-3.5 w-3.5 -rotate-45 text-orange-400" />
                <span className="text-xs font-bold uppercase tracking-[0.15em] text-white/90">
                  Featured Trek
                </span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl"
              >
                {trip.title}
              </motion.h2>

              {trip.description && (
                <motion.p
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="mt-4 line-clamp-2 text-sm leading-relaxed text-white/70 sm:text-base"
                >
                  {trip.description}
                </motion.p>
              )}

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2"
              >
                {trip.destination && (
                  <span className="flex items-center gap-1.5 text-sm text-white/80">
                    <MapPin className="h-4 w-4 shrink-0 text-orange-400" />
                    {trip.destination}
                  </span>
                )}
                {trip.duration?.days && (
                  <span className="flex items-center gap-1.5 text-sm text-white/80">
                    <Clock className="h-4 w-4 shrink-0 text-pink-400" />
                    {trip.duration.days}D / {trip.duration.nights}N
                  </span>
                )}
                {trip.difficulty && (
                  <span className="flex items-center gap-1.5 text-sm text-white/80">
                    <Mountain className="h-4 w-4 shrink-0 text-emerald-400" />
                    <span className="capitalize">{trip.difficulty}</span>
                  </span>
                )}
                {trip.maxGroupSize && (
                  <span className="flex items-center gap-1.5 text-sm text-white/80">
                    <Users className="h-4 w-4 shrink-0 text-sky-400" />
                    Max {trip.maxGroupSize}
                  </span>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                viewport={{ once: true }}
                className="mt-8 flex flex-wrap items-center gap-4"
              >
                {price && (
                  <div>
                    <span className="text-3xl font-extrabold text-white">
                      {price}
                    </span>
                    <span className="ml-1.5 text-sm text-white/55">/ person</span>
                  </div>
                )}
                <Link
                  to="/trips/$slug"
                  params={{ slug: trip.slug }}
                  className="group flex items-center gap-2 rounded-full gradient-sunset px-6 py-3 text-sm font-bold text-white shadow-glow transition hover:scale-105 active:scale-100"
                >
                  Explore This Trek
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
            </div>

            {/* Right: floating info card — desktop only */}
            <motion.div
              initial={{ opacity: 0, x: 32 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.65, delay: 0.45 }}
              viewport={{ once: true }}
              className="hidden shrink-0 lg:block"
            >
              <div className="relative w-52 overflow-hidden rounded-3xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl">
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full gradient-sunset opacity-25 blur-2xl" />
                {trip.difficulty && (
                  <>
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-white/50">
                      Difficulty
                    </p>
                    <p className="text-2xl font-extrabold capitalize text-white">
                      {trip.difficulty}
                    </p>
                  </>
                )}
                {(trip.rating as any)?.average > 0 && (
                  <div className="mt-4 flex items-center gap-2">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="text-base font-bold text-white">
                      {(trip.rating as any).average.toFixed(1)}
                    </span>
                    {(trip.rating as any).count > 0 && (
                      <span className="text-xs text-white/40">
                        ({(trip.rating as any).count})
                      </span>
                    )}
                  </div>
                )}
                {trip.categories?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {trip.categories.slice(0, 3).map((c: string) => (
                      <span
                        key={c}
                        className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold capitalize text-white/70"
                      >
                        {c.replace("-", " ")}
                      </span>
                    ))}
                  </div>
                )}
                {trip.availableSeats > 0 && (
                  <div className="mt-4 rounded-xl bg-white/5 px-3 py-2">
                    <p className="text-[10px] text-white/50">Available seats</p>
                    <p className="text-sm font-bold text-white">
                      {trip.availableSeats} left
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
