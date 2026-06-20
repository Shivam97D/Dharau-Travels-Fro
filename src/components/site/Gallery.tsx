import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { SectionHeader } from "./Section";
import api from "@/lib/api";

// Span pattern cycles so the grid always looks dynamic regardless of count
const SPAN_PATTERN = ["row-span-2", "", "col-span-2", "", "row-span-2", "", "", "col-span-2"];

interface GalleryItem { src: string; label: string; span: string; }

export function Gallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [showPlaceholder, setShowPlaceholder] = useState(true);

  useEffect(() => {
    api.getSiteConfig()
      .then((res) => {
        const imgs = res.data?.galleryImages ?? [];
        if (imgs.length > 0) {
          setItems(imgs.map((img, i) => ({
            src: img.url,
            label: img.label || `Photo ${i + 1}`,
            span: SPAN_PATTERN[i % SPAN_PATTERN.length],
          })));
          setShowPlaceholder(false);
        }
      })
      .catch(() => {});
  }, []);

  if (showPlaceholder) {
    return (
      <section id="gallery" className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeader
            eyebrow="Memories in motion"
            title={<>Postcards from <span className="italic text-gradient-ocean">our travelers</span></>}
          />
          <div className="mt-16 flex flex-col items-center gap-4 rounded-3xl glass py-20 text-center">
            <p className="text-lg font-semibold text-muted-foreground">Gallery coming soon</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Upload your photos in the Admin → Media Library → Gallery folder, then select them in Site Config to display here.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="gallery" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader
          eyebrow="Memories in motion"
          title={<>Postcards from <span className="italic text-gradient-ocean">our travelers</span></>}
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
