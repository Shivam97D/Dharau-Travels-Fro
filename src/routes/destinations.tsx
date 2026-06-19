import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { MapPin, Waves, Mountain, Trees, Sunset, Building2, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/destinations")({
  component: DestinationsPage,
});

const regions = [
  {
    name: "Konkan Coast",
    tagline: "Where the Western Ghats meet the Arabian Sea",
    icon: Waves,
    color: "from-sky-500/25 to-blue-500/10",
    iconColor: "text-sky-400",
    description:
      "Maharashtra's best-kept secret. Dramatic sea forts, hidden beaches, cashew and kokum trails, and some of the most authentic coastal food you'll find anywhere. We run trips across Sindhudurg, Ratnagiri, and the lesser-visited villages tucked between the two.",
    highlights: ["Sindhudurg Fort", "Tarkarli Beach", "Ratnagiri", "Ganpatipule", "Amboli Ghats", "Malvan"],
    vibe: "Beaches · Forts · Seafood · Sunsets",
  },
  {
    name: "Pune & Sahyadris",
    tagline: "The city at the foot of the mountains",
    icon: Mountain,
    color: "from-emerald-500/25 to-green-500/10",
    iconColor: "text-emerald-400",
    description:
      "Pune is our home, and the Sahyadri ranges surrounding it are some of the most rewarding trekking terrain in India. Ancient Maratha forts crown almost every ridge. We organise day and overnight treks to Rajgad, Torna, Harishchandragad and more — suited for beginners and experienced trekkers alike.",
    highlights: ["Rajgad Fort", "Torna Fort", "Harishchandragad", "Bhimashankar", "Tamhini Ghat", "Lonavala–Khandala"],
    vibe: "Treks · Forts · Monsoon magic · Waterfalls",
  },
  {
    name: "Mumbai & Surrounds",
    tagline: "The city that never sleeps — and the escapes that let you",
    icon: Building2,
    color: "from-orange-500/25 to-amber-500/10",
    iconColor: "text-orange-400",
    description:
      "Mumbai is the gateway for many of our travellers. We run weekend escapes from the city — into the Sahyadris, down the Konkan coast, or up to the heritage villages of the Deccan plateau. We also run curated city walks for those who want to see Mumbai beyond Bandra and Marine Drive.",
    highlights: ["Matheran", "Karnala Fort", "Alibaug", "Kashid Beach", "Kamshet (paragliding)", "Elephanta Caves"],
    vibe: "Getaways · Day trips · Heritage walks · Adventure",
  },
  {
    name: "Goa",
    tagline: "Beyond the beach — into the heart of Goa",
    icon: Sunset,
    color: "from-pink-500/25 to-rose-500/10",
    iconColor: "text-pink-400",
    description:
      "We believe Goa has more to offer than sun loungers. Our Goa trips take you into the spice plantations of Ponda, the Portuguese-era mansions of Fontainhas, the wildlife corridors of the Western Ghats, and the quieter northern beaches that most tourists fly past.",
    highlights: ["Fontainhas, Panaji", "Dudhsagar Falls", "Bhagwan Mahavir Wildlife Sanctuary", "Divar Island", "Cabo de Rama", "Agonda Beach"],
    vibe: "Culture · Nature · Food · Off-season calm",
  },
  {
    name: "Western Ghats & Forests",
    tagline: "Biodiversity so rich it was made a UNESCO World Heritage Site",
    icon: Trees,
    color: "from-lime-500/25 to-green-500/10",
    iconColor: "text-lime-400",
    description:
      "The Western Ghats stretch 1,600 km — and we explore the Maharashtra and Karnataka sections most travellers skip. Coorg, Agumbe, Amboli, and Dandeli offer dense forests, endemic wildlife, and some of the best birdwatching and river camping in the country.",
    highlights: ["Coorg (Kodagu)", "Agumbe Rainforest", "Dandeli Wildlife Sanctuary", "Amboli", "Radhanagari", "Phansad"],
    vibe: "Wildlife · Birdwatching · River camping · Rainforests",
  },
];

function DestinationsPage() {
  return (
    <div className="relative min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-28 pb-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 left-1/4 h-80 w-80 rounded-full gradient-aurora opacity-15 blur-3xl" />
          <div className="absolute bottom-0 right-1/3 h-64 w-64 rounded-full gradient-sunset opacity-10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs font-semibold text-muted-foreground"
          >
            <MapPin className="h-3.5 w-3.5 text-primary" />
            Where we operate
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="mt-5 text-5xl font-bold leading-tight tracking-tight sm:text-6xl"
          >
            Places we call{" "}
            <em className="not-italic gradient-text">home ground</em>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-5 text-lg text-muted-foreground"
          >
            Every destination we offer has been scouted on foot by our team. We don't list
            a place until someone from Dharavu has eaten there, slept there, and argued
            about whether the route is worth it. It always is.
          </motion.p>
        </div>
      </section>

      {/* Region cards */}
      <section className="mx-auto max-w-5xl px-4 pb-10 sm:px-6">
        <div className="space-y-6">
          {regions.map((r, i) => (
            <motion.div
              key={r.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className={`rounded-3xl bg-gradient-to-br ${r.color} border border-border p-6 sm:p-8`}
            >
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                  <r.icon className={`h-7 w-7 ${r.iconColor}`} />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
                    <h2 className="text-2xl font-bold">{r.name}</h2>
                    <span className="text-sm text-muted-foreground">{r.tagline}</span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{r.description}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {r.highlights.map((h) => (
                      <span key={h} className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-foreground">
                        {h}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{r.vibe}</span>
                    <a
                      href="/#trips"
                      className="flex items-center gap-1.5 text-xs font-semibold text-primary transition hover:gap-2.5"
                    >
                      See trips <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Coming soon strip */}
      <section className="mx-auto max-w-5xl px-4 pb-24 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl gradient-aurora p-8 text-center"
        >
          <h2 className="text-2xl font-bold text-white">More regions coming soon</h2>
          <p className="mt-2 text-white/75 text-sm max-w-xl mx-auto">
            We're actively scouting Rajasthan, Northeast India, and Sri Lanka. Got a destination you'd love to see us cover? Tell us.
          </p>
          <a
            href="/contact"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-bold text-foreground shadow transition hover:scale-105"
          >
            Suggest a destination
          </a>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
