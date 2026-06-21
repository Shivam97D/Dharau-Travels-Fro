import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import api from "@/lib/api";

const LOCAL_FALLBACK = [
  "/videos/hero1.mp4",
  "/videos/hero2.mp4",
  "/videos/hero3.mp4",
  "/videos/hero4.mp4",
  "/videos/hero5.mp4",
  "/videos/hero6.mp4",
].filter(Boolean);

const CYCLE_MS = 4000;

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const [videos, setVideos] = useState<string[]>(LOCAL_FALLBACK);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    api.getSiteConfig()
      .then((res: any) => {
        const urls = res.data?.heroVideos?.map((v: any) => v.url).filter(Boolean) ?? [];
        if (urls.length > 0) setVideos(urls);
      })
      .catch(() => {});
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    if (videos.length === 0) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % videos.length);
    }, CYCLE_MS);
    return () => clearInterval(timer);
  }, [videos]);

  useEffect(() => {
    const vid = videoRefs.current[current];
    if (vid) {
      vid.currentTime = 0;
      vid.play().catch(() => {});
    }
  }, [current]);

  return (
    <section ref={ref} className="relative min-h-[100svh] w-full overflow-hidden">
      {/* Parallax video background */}
      <motion.div style={{ y, scale }} className="absolute inset-0 -z-10">
        <div className="relative h-full w-full">
          {videos.map((src, i) => (
            <motion.video
              key={src}
              ref={(el) => { videoRefs.current[i] = el; }}
              src={src}
              muted
              playsInline
              loop
              autoPlay={i === 0}
              preload={i < 2 ? "auto" : "none"}
              className="absolute inset-0 h-full w-full object-cover"
              initial={false}
              animate={{ opacity: i === current ? 1 : 0 }}
              transition={{ duration: 1.4, ease: "easeInOut" }}
            />
          ))}
        </div>

        {/* Top: just enough dark for nav text to read */}
        <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/40 to-transparent" />
        {/* Bottom: dark-mode only fade into page background */}
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-transparent to-transparent dark:from-background" />
      </motion.div>

      <motion.div
        style={{ opacity }}
        className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col items-center justify-center px-4 pt-32 pb-24 sm:px-6"
      >
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
      </motion.div>
    </section>
  );
}
