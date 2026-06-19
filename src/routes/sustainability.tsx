import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/sustainability")({
  component: SustainabilityPage,
});

function SustainabilityPage() {
  return (
    <LegalPage
      title="Our commitment to responsible travel"
      updated="June 2026"
      sections={[
        {
          heading: "Why this matters to us",
          body: [
            "We started Dharavu because we love the world — its mountains, forests, coastlines, and the communities that call them home. That love comes with responsibility.",
            "We believe that travel done right can be a force for good: it creates income for local families, builds bridges between cultures, and gives travellers a stake in protecting the places they visit.",
            "Travel done carelessly does the opposite. We choose to do it right.",
          ],
        },
        {
          heading: "Local-first economics",
          body: [
            "We work exclusively with local accommodation providers, guides, and transport operators wherever we operate. At least 70% of every trip's operational spend stays within the destination community.",
            "Our local guides are paid above market rate and treated as partners — not contractors. Many of them helped design the very routes they lead.",
            "We do not book international hotel chains or use large tour bus operators that redirect profits away from local economies.",
          ],
        },
        {
          heading: "Low-impact travel design",
          body: [
            "We design our routes to spread tourist footfall across a region rather than concentrating it at a single Instagram-famous spot.",
            "Group sizes are capped. Smaller groups mean less impact on trails, accommodation, and ecosystems — and a better experience for travellers.",
            "We favour train and bus travel over air travel for domestic legs wherever journey time is reasonable.",
          ],
        },
        {
          heading: "Waste and environment",
          body: [
            "We brief every traveller on a zero-plastic, leave-no-trace policy before departure. Single-use plastics are not permitted on any Dharavu trek or camping trip.",
            "We work with accommodation partners who have active waste-management and water-conservation practices.",
            "In ecologically sensitive zones such as national parks and high-altitude areas, we follow all government guidelines and permit conditions — and advocate for stricter limits when we believe they are needed.",
          ],
        },
        {
          heading: "Cultural respect",
          body: [
            "We brief travellers on local customs, dress codes, and etiquette before they arrive. Respectful travel is non-negotiable.",
            "We support community-based tourism initiatives — homestays, village walks, craft workshops — that let travellers engage with local culture meaningfully, not as spectators.",
          ],
        },
        {
          heading: "Our ongoing commitment",
          body: [
            "We are a small company and we are honest: we are still learning and improving. We do not claim perfection. We do commit to transparency, to listening to the communities we work with, and to raising our standards year by year.",
            "If you have suggestions or feedback on how we can do better, write to us at dharavujourney@gmail.com. We read every message.",
          ],
        },
      ]}
    />
  );
}
