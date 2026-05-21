import { motion } from "framer-motion";
import { Mountain, Crown, Heart, User, Users2, Globe2, Sparkles, CalendarDays } from "lucide-react";
import { SectionHeader } from "./Section";

const cats = [
  { icon: Mountain, name: "Adventure", count: 86, gradient: "gradient-sunset" },
  { icon: Crown, name: "Luxury", count: 54, gradient: "gradient-aurora" },
  { icon: Heart, name: "Honeymoon", count: 41, gradient: "gradient-sunset" },
  { icon: User, name: "Solo trips", count: 67, gradient: "gradient-ocean" },
  { icon: Users2, name: "Group tours", count: 73, gradient: "gradient-tropic" },
  { icon: Globe2, name: "International", count: 120, gradient: "gradient-ocean" },
  { icon: Sparkles, name: "Spiritual", count: 28, gradient: "gradient-aurora" },
  { icon: CalendarDays, name: "Weekend", count: 95, gradient: "gradient-tropic" },
];

export function Categories() {
  return (
    <section id="categories" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader
          eyebrow="Travel categories"
          title={
            <>
              Pick your <span className="italic text-gradient-ocean">flavor</span> of escape
            </>
          }
        />
        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {cats.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.button
                key={c.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                whileHover={{ y: -6, rotate: -1 }}
                className="group relative overflow-hidden rounded-3xl border border-border bg-card p-6 text-left shadow-soft transition"
              >
                <div
                  className={`absolute inset-0 -z-10 ${c.gradient} opacity-0 transition group-hover:opacity-100`}
                />
                <div
                  className={`mb-5 grid h-14 w-14 place-items-center rounded-2xl ${c.gradient} text-primary-foreground shadow-glow transition group-hover:scale-110`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div className="text-lg font-bold transition group-hover:text-primary-foreground">
                  {c.name}
                </div>
                <div className="mt-1 text-xs font-medium text-muted-foreground transition group-hover:text-primary-foreground/80">
                  {c.count} trips
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
