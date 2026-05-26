import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { SectionHeader } from "./Section";

const reviews = [
  {
    name: "Aanya Sharma",
    trip: "Bali Soul Escape",
    rating: 5,
    text: "DHARAVU read my mind. Every detail — from the volcano sunrise to the random beach bonfire — felt curated for me.",
    avatar: "AS",
    color: "gradient-sunset",
  },
  {
    name: "Marco Rossi",
    trip: "Iceland Aurora Quest",
    rating: 5,
    text: "I've used 6 travel companies. None come close. The aurora night was a religious experience.",
    avatar: "MR",
    color: "gradient-ocean",
  },
  {
    name: "Sora Tanaka",
    trip: "Maldives Overwater",
    rating: 5,
    text: "Honeymoon of dreams. The overwater villa, the private chef dinner — pure cinema.",
    avatar: "ST",
    color: "gradient-tropic",
  },
  {
    name: "Liam Walker",
    trip: "Swiss Alps Escape",
    rating: 5,
    text: "Glacier Express + Jungfrau + a chalet I'd never have found alone. Worth every cent.",
    avatar: "LW",
    color: "gradient-aurora",
  },
  {
    name: "Priya Mehta",
    trip: "Tokyo Neon Nights",
    rating: 5,
    text: "Felt like I was inside a movie. The local guides knew streets Google doesn't.",
    avatar: "PM",
    color: "gradient-sunset",
  },
  {
    name: "Nora Ahmed",
    trip: "Dubai Skylines",
    rating: 5,
    text: "Luxury without the awkwardness. They got my vibe and built around it.",
    avatar: "NA",
    color: "gradient-ocean",
  },
];

// export function Testimonials() {
//   const row = [...reviews, ...reviews];
//   return (
//     <section className="relative overflow-hidden py-24 sm:py-32">
//       <div className="mx-auto max-w-7xl px-4 sm:px-6">
//         <SectionHeader
//           eyebrow="Travelers say"
//           title={
//             <>
//               50,000+ memories, <span className="italic text-gradient-sunset">made</span>
//             </>
//           }
//         />
//       </div>

//       <div className="mt-16 [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
//         <div className="flex w-max gap-5 animate-marquee">
//           {row.map((r, i) => (
//             <motion.figure
//               key={i}
//               whileHover={{ y: -4 }}
//               className="w-[360px] flex-shrink-0 rounded-3xl border border-border bg-card p-6 shadow-soft"
//             >
//               <div className="flex items-center gap-1 text-amber-glow">
//                 {Array.from({ length: r.rating }).map((_, k) => (
//                   <Star key={k} className="h-4 w-4 fill-current" />
//                 ))}
//               </div>
//               <blockquote className="mt-4 text-sm leading-relaxed text-foreground/90">
//                 "{r.text}"
//               </blockquote>
//               <figcaption className="mt-5 flex items-center gap-3 border-t border-border pt-4">
//                 <div
//                   className={`grid h-11 w-11 place-items-center rounded-full ${r.color} text-sm font-bold text-primary-foreground`}
//                 >
//                   {r.avatar}
//                 </div>
//                 <div>
//                   <div className="text-sm font-bold">{r.name}</div>
//                   <div className="text-xs text-muted-foreground">{r.trip}</div>
//                 </div>
//               </figcaption>
//             </motion.figure>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }
