import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Briefcase, Bell, Mail } from "lucide-react";

export const Route = createFileRoute("/careers")({
  component: CareersPage,
});

function CareersPage() {
  return (
    <div className="relative min-h-screen bg-background">
      <Navbar />

      <div className="relative flex min-h-[calc(100vh-200px)] flex-col items-center justify-center px-4 pt-28 pb-20 text-center sm:px-6">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/4 left-1/3 h-72 w-72 rounded-full gradient-aurora opacity-10 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/3 h-56 w-56 rounded-full gradient-sunset opacity-10 blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="relative mx-auto max-w-2xl"
        >
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl gradient-aurora shadow-float">
            <Briefcase className="h-9 w-9 text-white" />
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Careers at Dharavu
          </h1>

          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-500/15 px-4 py-2 text-sm font-semibold text-amber-500">
            <Bell className="h-4 w-4" />
            No openings right now — stay tuned
          </div>

          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            We're a small team and we hire slowly — but we hire for passion, not just skill.
            If you love travel, care about doing things right, and want your work to actually
            matter, you'd probably fit right in.
          </p>

          <p className="mt-4 text-base text-muted-foreground">
            We don't have any open positions listed today, but we're always growing. The best way
            to get on our radar is to introduce yourself before a role opens.
          </p>

          <div className="mt-10 rounded-3xl glass p-6 text-left">
            <h2 className="font-bold text-lg">Who we look for</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              {[
                "People who travel — not just those who want to work in travel.",
                "Ground coordinators and local experts who know their region inside out.",
                "Experience designers who turn rough ideas into itineraries that actually work.",
                "Customer-first communicators who make planning feel exciting, not stressful.",
                "Builders — developers, designers, or operators who want to shape how a young company grows.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 flex flex-col items-center gap-2">
            <p className="text-sm text-muted-foreground">
              Interested? Send a short note about yourself to:
            </p>
            <a
              href="mailto:dharavujourney@gmail.com?subject=Careers — Introducing myself"
              className="inline-flex items-center gap-2 rounded-full gradient-sunset px-6 py-3 text-sm font-bold text-white shadow-glow transition hover:scale-105"
            >
              <Mail className="h-4 w-4" />
              dharavujourney@gmail.com
            </a>
            <p className="text-xs text-muted-foreground mt-1">Subject: Careers — [your name]</p>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
