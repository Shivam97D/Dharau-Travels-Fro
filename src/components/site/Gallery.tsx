import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { SectionHeader } from "./Section";
import api from "@/lib/api";

// Span pattern cycles so the grid always looks dynamic regardless of count
const SPAN_PATTERN = ["row-span-2", "", "col-span-2", "", "row-span-2", "", "", "col-span-2"];

const isVideo = (url: string) =>
  /\/video\/upload\//i.test(url) || /\.(mp4|webm|mov|ogg)(\?|$)/i.test(url);

interface GalleryItem { src: string; label: string; span: string; video: boolean; }

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
            video: isVideo(img.url),
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
              {it.video ? (
                <video
                  src={it.src}
                  muted
                  autoPlay
                  loop
                  playsInline
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                />
              ) : (
                <img
                  src={it.src}
                  alt={it.label}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                />
              )}
              {it.video && (
                <div className="absolute right-2.5 top-2.5 rounded-full bg-black/50 p-1.5 backdrop-blur-sm">
                  <Play className="h-3 w-3 fill-white text-white" />
                </div>
              )}
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
