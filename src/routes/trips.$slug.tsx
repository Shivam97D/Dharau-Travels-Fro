import { createFileRoute } from "@tanstack/react-router";
import { TripDetail } from "@/components/site/TripDetail";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/trips/$slug")({
  component: TripDetailPage,
});

function TripDetailPage() {
  const { slug } = Route.useParams();
  return (
    <div className="relative min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        <TripDetail slug={slug} />
      </main>
      <Footer />
    </div>
  );
}
