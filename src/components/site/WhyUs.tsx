import { motion } from "framer-motion";
import { Wallet, Users2, MapPin, UserCheck, ShieldCheck, Route } from "lucide-react";
import { SectionHeader } from "./Section";

const features = [
  {
    icon: Wallet,
    title: "Budget-friendly trips",
    desc: "Real adventures that don't drain your wallet. We negotiate hard so you don't have to.",
    color: "gradient-sunset",
  },
  {
    icon: Users2,
    title: "Meet new friends",
    desc: "Travel solo, leave with a squad. Our group tours are designed to forge real connections.",
    color: "gradient-ocean",
  },
  {
    icon: MapPin,
    title: "Native management",
    desc: "Every destination is managed by locals who grew up there — no tourist-trap itineraries.",
    color: "gradient-tropic",
  },
  {
    icon: UserCheck,
    title: "Trained guides",
    desc: "Certified, experienced guides who know the terrain, the culture, and how to keep you safe.",
    color: "gradient-aurora",
  },
  {
    icon: ShieldCheck,
    title: "Safe & trusted",
    desc: "Vetted stays, emergency support, and a team reachable 24/7 — because peace of mind matters.",
    color: "gradient-sunset",
  },
  {
    icon: Route,
    title: "Custom routes",
    desc: "Tell us your dream. We'll map the route, handle the logistics, and make it happen.",
    color: "gradient-ocean",
  },
];

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
          subtitle="Six things we obsess over so you can switch off and just be there."
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
      </div>
    </section>
  );
}
