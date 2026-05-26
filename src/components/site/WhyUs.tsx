import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Compass, Wallet, Headphones, ShieldCheck, BedDouble, Plane } from "lucide-react";
import { SectionHeader } from "./Section";

const features = [
  {
    icon: Compass,
    title: "Custom itineraries",
    desc: "Designed around you, not a brochure.",
    color: "gradient-sunset",
  },
  {
    icon: Wallet,
    title: "Smart budgeting",
    desc: "Transparent pricing. No hidden fees, ever.",
    color: "gradient-ocean",
  },
  {
    icon: Headphones,
    title: "24/7 humans",
    desc: "Real travel concierge — not a chatbot.",
    color: "gradient-tropic",
  },
  {
    icon: BedDouble,
    title: "Verified stays",
    desc: "Every villa, vetted in person.",
    color: "gradient-aurora",
  },
  {
    icon: ShieldCheck,
    title: "Safe travel",
    desc: "Insurance, support, and peace of mind.",
    color: "gradient-sunset",
  },
  {
    icon: Plane,
    title: "120+ countries",
    desc: "From hidden hamlets to icon cities.",
    color: "gradient-ocean",
  },
];

const stats = [
  { value: 50000, suffix: "+", label: "Happy travelers" },
  { value: 120, suffix: "+", label: "Countries" },
  { value: 4.9, label: "Average rating", decimals: 1 },
  { value: 24, suffix: "/7", label: "Concierge" },
];

function Counter({
  value,
  suffix = "",
  decimals = 0,
}: {
  value: number;
  suffix?: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start: number | null = null;
    const dur = 1500;
    const step = (t: number) => {
      if (start === null) start = t;
      const p = Math.min((t - start) / dur, 1);
      setN(value * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, value]);

  return (
    <span ref={ref}>
      {n.toFixed(decimals)}
      {suffix}
    </span>
  );
}

export function WhyUs() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="absolute inset-0 -z-10 bg-grain opacity-50" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader
          eyebrow="Why DHARAVU JOURNEYS"
          title={
            <>
              Travel that actually <span className="italic text-gradient-sunset">feels good</span>
            </>
          }
          subtitle="Six promises we obsess over so you can switch off and just be there."
        />

        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.07 }}
                whileHover={{ y: -6 }}
                className="group relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-soft transition"
              >
                <div
                  className={`absolute -right-10 -top-10 h-32 w-32 rounded-full ${f.color} opacity-20 blur-2xl transition group-hover:opacity-40`}
                />
                <div
                  className={`grid h-12 w-12 place-items-center rounded-2xl ${f.color} text-primary-foreground shadow-glow`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-xl font-bold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Stats - Hidden for preview */}
        {/* <div className="mt-16 grid grid-cols-2 gap-4 rounded-3xl glass p-6 shadow-float sm:grid-cols-4 sm:p-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-bold tracking-tight text-gradient-sunset sm:text-5xl">
                <Counter value={s.value} suffix={s.suffix} decimals={s.decimals ?? 0} />
              </div>
              <div className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {s.label}
              </div>
            </div>
          ))}
        </div> */}
      </div>
    </section>
  );
}
