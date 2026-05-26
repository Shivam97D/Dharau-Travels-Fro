import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
// import { Destinations } from "@/components/site/Destinations";
import { FeaturedTrips } from "@/components/site/FeaturedTrips";
import { WhyUs } from "@/components/site/WhyUs";
import { Categories } from "@/components/site/Categories";
// import { Testimonials } from "@/components/site/Testimonials";
import { Gallery } from "@/components/site/Gallery";
import { PlannerCTA } from "@/components/site/PlannerCTA";
import { Footer } from "@/components/site/Footer";
import { CursorGlow } from "@/components/site/CursorGlow";
import { ScrollProgress } from "@/components/site/ScrollProgress";
import { FloatingButtons } from "@/components/site/FloatingButtons";
import { AuthModal } from "@/components/site/AuthModal";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [authOpen, setAuthOpen] = useState(false);
  return (
    <div className="relative">
      <CursorGlow />
      <ScrollProgress />
      <Navbar onLogin={() => setAuthOpen(true)} />
      <main>
        <Hero />
        {/* <Destinations /> */}
        <FeaturedTrips />
        <WhyUs />
        <Categories />
        {/* <Testimonials /> */}
        <Gallery />
        <PlannerCTA />
      </main>
      <Footer />
      <FloatingButtons />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
