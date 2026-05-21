import { motion } from "framer-motion";
import { SectionHeader } from "./Section";
import safari from "@/assets/gal-safari.jpg";
import cappadocia from "@/assets/gal-cappadocia.jpg";
import machu from "@/assets/gal-machu.jpg";
import paris from "@/assets/gal-paris.jpg";
import bali from "@/assets/hero-bali.jpg";
import iceland from "@/assets/dest-iceland.jpg";
import santorini from "@/assets/dest-santorini.jpg";
import maldives from "@/assets/dest-maldives.jpg";

const items = [
  { src: cappadocia, label: "Cappadocia", span: "row-span-2" },
  { src: paris, label: "Paris in bloom", span: "" },
  { src: bali, label: "Bali sunset", span: "col-span-2" },
  { src: machu, label: "Machu Picchu", span: "" },
  { src: safari, label: "Kenya safari", span: "row-span-2" },
  { src: santorini, label: "Santorini", span: "" },
  { src: iceland, label: "Aurora", span: "" },
  { src: maldives, label: "Maldives", span: "col-span-2" },
];

export function Gallery() {
  return (
    <section id="gallery" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader
          eyebrow="Memories in motion"
          title={
            <>
              Postcards from <span className="italic text-gradient-ocean">our travelers</span>
            </>
          }
        />

        <div className="mt-16 grid auto-rows-[180px] grid-cols-2 gap-3 sm:auto-rows-[220px] sm:grid-cols-4 sm:gap-4">
          {items.map((it, i) => (
            <motion.figure
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: (i % 4) * 0.08 }}
              whileHover={{ scale: 1.02 }}
              className={`group relative overflow-hidden rounded-3xl shadow-soft ${it.span}`}
            >
              <img
                src={it.src}
                alt={it.label}
                loading="lazy"
                className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 transition group-hover:opacity-100" />
              <figcaption className="absolute inset-x-0 bottom-0 translate-y-2 p-4 text-sm font-semibold text-white opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
                {it.label}
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
