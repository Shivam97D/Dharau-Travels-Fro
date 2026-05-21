import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Search, Sparkles, MapPin, Calendar, Users, Star } from "lucide-react";
import heroImg from "@/assets/hero-bali.jpg";
import maldivesImg from "@/assets/dest-maldives.jpg";
import santoriniImg from "@/assets/dest-santorini.jpg";
import swissImg from "@/assets/dest-swiss.jpg";

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-[100svh] w-full overflow-hidden">
      {/* Parallax background */}
      <motion.div style={{ y, scale }} className="absolute inset-0 -z-10">
        <img
          src={heroImg}
          alt="Tropical Bali sunset paradise"
          className="h-full w-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-background" />
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 via-transparent to-secondary/20 mix-blend-overlay" />
      </motion.div>

      {/* Floating blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 top-1/3 h-72 w-72 rounded-full gradient-sunset opacity-30 blur-3xl animate-blob" />
        <div
          className="absolute right-0 top-20 h-80 w-80 rounded-full gradient-ocean opacity-30 blur-3xl animate-blob"
          style={{ animationDelay: "4s" }}
        />
      </div>

      <motion.div
        style={{ opacity }}
        className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col items-center justify-center px-4 pt-32 pb-24 sm:px-6"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="inline-flex items-center gap-2 rounded-full glass-dark px-4 py-1.5 text-xs font-medium text-white"
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-glow" />
          Curated journeys for the wildly curious
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 text-center text-5xl font-bold leading-[0.95] tracking-tight text-white sm:text-7xl md:text-8xl lg:text-[8.5rem]"
        >
          Explore the
          <br />
          <span className="relative inline-block">
            <span className="text-gradient-sunset">world</span>
            <motion.svg
              viewBox="0 0 300 20"
              className="absolute -bottom-2 left-0 w-full"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 1.2, duration: 1.5 }}
            >
              <motion.path
                d="M5 12 Q 100 2 200 10 T 295 8"
                stroke="url(#g)"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="g">
                  <stop offset="0%" stopColor="oklch(0.78 0.18 60)" />
                  <stop offset="100%" stopColor="oklch(0.55 0.22 340)" />
                </linearGradient>
              </defs>
            </motion.svg>
          </span>{" "}
          <span className="italic font-light">your way</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-8 max-w-xl text-center text-base text-white/85 sm:text-lg"
        >
          Hand-crafted trips to 120+ destinations. Smart itineraries, verified stays, and 24/7
          humans on the other end of every message.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="mt-8 flex flex-wrap justify-center gap-3"
        >
          <a
            href="#trips"
            className="group inline-flex items-center gap-2 rounded-full gradient-sunset px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition hover:scale-105"
          >
            Explore trips
            <span className="transition group-hover:translate-x-1">→</span>
          </a>
          <a
            href="#planner"
            className="inline-flex items-center gap-2 rounded-full glass-dark px-7 py-3.5 text-sm font-semibold text-white transition hover:scale-105"
          >
            <Sparkles className="h-4 w-4" />
            Plan custom trip
          </a>
        </motion.div>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="mt-12 w-full max-w-3xl"
        >
          <div className="glass rounded-3xl p-2 shadow-float">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1.4fr_1fr_1fr_auto]">
              <SearchField
                icon={<MapPin className="h-4 w-4" />}
                label="Where to"
                placeholder="Bali, Maldives…"
              />
              <SearchField
                icon={<Calendar className="h-4 w-4" />}
                label="When"
                placeholder="Add dates"
              />
              <SearchField
                icon={<Users className="h-4 w-4" />}
                label="Travelers"
                placeholder="2 adults"
              />
              <button className="grid place-items-center rounded-2xl gradient-sunset p-4 text-primary-foreground shadow-glow transition hover:scale-105">
                <Search className="h-5 w-5" />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Floating destination cards */}
      <FloatingCard
        img={maldivesImg}
        name="Maldives"
        rating="4.9"
        className="left-4 top-1/4 hidden w-44 lg:block"
        delay={1}
      />
      <FloatingCard
        img={santoriniImg}
        name="Santorini"
        rating="4.8"
        className="right-6 top-[28%] hidden w-48 xl:block"
        delay={1.3}
        rotate={6}
      />
      <FloatingCard
        img={swissImg}
        name="Swiss Alps"
        rating="4.9"
        className="right-10 bottom-32 hidden w-44 lg:block"
        delay={1.6}
        rotate={-4}
      />
    </section>
  );
}

function SearchField({
  icon,
  label,
  placeholder,
}: {
  icon: React.ReactNode;
  label: string;
  placeholder: string;
}) {
  return (
    <label className="flex items-center gap-3 rounded-2xl bg-white/60 px-4 py-3 transition hover:bg-white/80">
      <span className="grid h-9 w-9 place-items-center rounded-xl gradient-tropic text-white">
        {icon}
      </span>
      <div className="flex-1 text-left">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-foreground/60">
          {label}
        </div>
        <input
          className="w-full bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-foreground/40"
          placeholder={placeholder}
        />
      </div>
    </label>
  );
}

function FloatingCard({
  img,
  name,
  rating,
  className,
  delay,
  rotate = 4,
}: {
  img: string;
  name: string;
  rating: string;
  className?: string;
  delay: number;
  rotate?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotate: 0 }}
      animate={{ opacity: 1, y: 0, rotate }}
      transition={{ delay, duration: 1, ease: "easeOut" }}
      whileHover={{ scale: 1.06, rotate: 0 }}
      className={`absolute z-10 ${className}`}
    >
      <div className="animate-float-slow glass rounded-3xl p-2 shadow-float">
        <div className="overflow-hidden rounded-2xl">
          <img src={img} alt={name} className="h-32 w-full object-cover" loading="lazy" />
        </div>
        <div className="flex items-center justify-between px-2 py-2">
          <span className="text-sm font-semibold text-foreground">{name}</span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground">
            <Star className="h-3 w-3 fill-amber-glow text-amber-glow" />
            {rating}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
