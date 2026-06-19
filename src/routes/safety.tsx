import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/safety")({
  component: SafetyPage,
});

function SafetyPage() {
  return (
    <LegalPage
      title="Safety at Dharavu"
      updated="June 2026"
      sections={[
        {
          heading: "Our safety philosophy",
          body: [
            "We believe that adventure and safety are not opposites — they are partners. Every Dharavu itinerary is designed to be challenging in the right ways and safe in every way that matters.",
            "Our team does a risk assessment on every route before it goes live on the platform. We update those assessments seasonally and after any incident in the region.",
          ],
        },
        {
          heading: "Guide qualifications",
          body: [
            "Every Dharavu guide is personally vetted by our team. For trek and adventure trips, guides hold relevant certifications (such as IMF Basic Mountaineering Course or wilderness first-aid training) appropriate to the terrain.",
            "All guides carry a first-aid kit, emergency communication device, and a route-specific emergency action plan.",
          ],
        },
        {
          heading: "Pre-trip briefing",
          body: [
            "You will receive a detailed pre-trip briefing at least 48 hours before departure. This covers the route, weather conditions, what to pack, fitness requirements, and emergency protocols.",
            "Please read it fully. It is written to keep you safe, not to fill a checkbox.",
          ],
        },
        {
          heading: "Medical fitness",
          body: [
            "Some trips — particularly high-altitude treks and physically demanding adventures — require a basic level of fitness. Fitness requirements are clearly listed on each trip page.",
            "We ask you to be honest about any medical conditions when booking. This information is confidential and only shared with your guide to help them support you better.",
            "Travellers with serious heart conditions, uncontrolled blood pressure, or other conditions that may be aggravated by altitude or exertion should consult a doctor before joining such trips.",
          ],
        },
        {
          heading: "Emergency procedures",
          body: [
            "In the event of a medical emergency, your guide will activate the emergency action plan for the route. This includes evacuation procedures, nearest medical facility, and emergency contacts.",
            "For all trips, you will be asked to provide an emergency contact before departure. Please ensure this person can be reached at short notice.",
            "Our operations team is reachable 24/7 during active trips at +91 93568 01338.",
          ],
        },
        {
          heading: "Solo and female travellers",
          body: [
            "We actively design and vet our trips to be safe for solo travellers, including women travelling alone. Our guides are briefed on this and we take safety concerns from solo travellers very seriously.",
            "If you have any specific concerns, contact us before booking — we are happy to discuss them candidly.",
          ],
        },
        {
          heading: "Weather and natural events",
          body: [
            "We monitor weather forecasts actively for all ongoing trips. If conditions become unsafe, we will alter the route or evacuate as needed. Traveller safety always takes precedence over itinerary.",
            "For destinations prone to seasonal disruption (floods, snow closure, high winds), we will notify you in advance and offer alternatives or refunds where appropriate.",
          ],
        },
        {
          heading: "Report a concern",
          body: [
            "If you have a safety concern — before, during, or after a trip — contact us immediately at dharavujourney@gmail.com or call +91 95792 65920. We take every report seriously and act on it.",
          ],
        },
      ]}
    />
  );
}
