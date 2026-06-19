import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/careers")({
  component: CareersPage,
});

function CareersPage() {
  return (
    <LegalPage
      title="Careers at Dharavu"
      updated="June 2026"
      sections={[
        {
          heading: "Work with us",
          body: [
            "Dharavu Journeys is a small, passionate team based out of Vadgaon, Pune. We believe the best travel experiences are built by people who genuinely love travel — not just talking about it, but doing it.",
            "We're growing, and we're always on the lookout for people who share our obsession with authentic, responsible journeys.",
          ],
        },
        {
          heading: "Who we're looking for",
          body: [
            "Travel experience designers — people who can turn a vague dream into a day-by-day itinerary that actually works in the field.",
            "Local ground coordinators — if you know your region inside out and can handle logistics, permits, accommodation, and guides, we want to hear from you.",
            "Customer experience — warm, responsive communicators who make planning a trip feel exciting rather than stressful.",
            "Tech & digital — developers and designers who want to build tools that make travel better.",
          ],
        },
        {
          heading: "What it's like to work here",
          body: [
            "We're a small company, which means you'll wear multiple hats and see the impact of your work immediately. Every member of the team has a voice in how we grow.",
            "We travel. Team members are encouraged (and sometimes required) to experience the routes we sell. You will not be behind a desk all year.",
            "We're based in Pune but work across India. Remote-friendly roles are available.",
          ],
        },
        {
          heading: "Current openings",
          body: [
            "We do not have formal open positions listed right now, but we hire based on talent — not just vacancies. If you feel you belong here, we'd love to hear from you.",
          ],
        },
        {
          heading: "How to apply",
          body: [
            "Send a short note about yourself, why Dharavu, and what you'd bring to the team — to dharavujourney@gmail.com with the subject line 'Careers — [your name]'.",
            "No cover letter template required. Just be genuine.",
          ],
        },
      ]}
    />
  );
}
