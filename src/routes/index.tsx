import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
// import { Destinations } from "@/components/site/Destinations";
import { FeaturedTrips } from "@/components/site/FeaturedTrips";
import { WhyUs } from "@/components/site/WhyUs";
import { Categories } from "@/components/site/Categories";
import { Testimonials } from "@/components/site/Testimonials";
import { Gallery } from "@/components/site/Gallery";
import { PlannerCTA } from "@/components/site/PlannerCTA";
import { Footer } from "@/components/site/Footer";
import { CursorGlow } from "@/components/site/CursorGlow";
import { ScrollProgress } from "@/components/site/ScrollProgress";
export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="relative">
      <CursorGlow />
      <ScrollProgress />
      <Navbar />
      <main>
        <Hero />
        {/* <Destinations /> */}
        <FeaturedTrips />
        <WhyUs />
        <Testimonials />
        <Categories />
        <Gallery />
        <PlannerCTA />
      </main>
      <Footer />
    </div>
  );
}
