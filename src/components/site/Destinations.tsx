import { motion } from "framer-motion";
import { Star, MapPin } from "lucide-react";
import { SectionHeader } from "./Section";
import santorini from "@/assets/dest-santorini.jpg";
import maldives from "@/assets/dest-maldives.jpg";
import swiss from "@/assets/dest-swiss.jpg";
import tokyo from "@/assets/dest-tokyo.jpg";
import dubai from "@/assets/dest-dubai.jpg";
import iceland from "@/assets/dest-iceland.jpg";

const destinations = [
  {
    img: santorini,
    name: "Santorini",
    country: "Greece",
    rating: 4.9,
    trips: 42,
    price: 1890,
    tag: "Sunsets",
  },
  {
    img: maldives,
    name: "Maldives",
    country: "Indian Ocean",
    rating: 4.9,
    trips: 28,
    price: 2490,
    tag: "Overwater",
  },
  {
    img: swiss,
    name: "Swiss Alps",
    country: "Switzerland",
    rating: 4.8,
    trips: 36,
    price: 2150,
    tag: "Mountains",
  },
  {
    img: tokyo,
    name: "Tokyo",
    country: "Japan",
    rating: 4.8,
    trips: 51,
    price: 1750,
    tag: "Neon nights",
  },
  {
    img: dubai,
    name: "Dubai",
    country: "UAE",
    rating: 4.7,
    trips: 47,
    price: 1990,
    tag: "Skylines",
  },
  {
    img: iceland,
    name: "Iceland",
    country: "Reykjavík",
    rating: 4.9,
    trips: 19,
    price: 2390,
    tag: "Aurora",
  },
];

export function Destinations() {
  return (
    <section id="destinations" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader
          eyebrow="Popular destinations"
          title={
            <>
              Where the <span className="text-gradient-sunset italic">wandering</span> hearts go
            </>
          }
          subtitle="The most-loved corners of the world, picked by travelers who don't settle for ordinary."
        />

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((d, i) => (
            <motion.article
              key={d.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.08, ease: "easeOut" }}
              whileHover={{ y: -8 }}
              className="group relative overflow-hidden rounded-[2rem] bg-card shadow-soft transition"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <motion.img
                  src={d.img}
                  alt={`${d.name}, ${d.country}`}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full glass px-3 py-1 text-xs font-semibold text-foreground">
                  <Star className="h-3 w-3 fill-amber-glow text-amber-glow" />
                  {d.rating}
                </div>
                <div className="absolute right-4 top-4 rounded-full gradient-sunset px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                  {d.tag}
                </div>

                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <div className="flex items-center gap-1 text-xs font-medium text-white/80">
                    <MapPin className="h-3 w-3" />
                    {d.country}
                  </div>
                  <h3 className="mt-1 text-3xl font-bold tracking-tight">{d.name}</h3>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <div className="text-xs text-white/70">From</div>
                      <div className="text-2xl font-bold">
                        ${d.price}
                        <span className="text-xs font-medium text-white/70"> /person</span>
                      </div>
                    </div>
                    <div className="text-xs text-white/80">{d.trips} trips</div>
                  </div>
                </div>
              </div>

              <motion.div
                initial={{ y: 60, opacity: 0 }}
                whileHover={{ y: 0, opacity: 1 }}
                className="pointer-events-none absolute inset-x-4 bottom-4 rounded-2xl glass p-3 text-center text-sm font-semibold opacity-0 transition group-hover:pointer-events-auto group-hover:opacity-100"
              >
                Explore trips →
              </motion.div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
