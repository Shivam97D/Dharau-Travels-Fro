import { motion } from "framer-motion";
import { Users2, User, Mountain, Tent, Zap } from "lucide-react";
import { SectionHeader } from "./Section";

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

export function Categories() {
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
        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {cats.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.button
                key={c.value}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.5 }}
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
                  {c.desc}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
