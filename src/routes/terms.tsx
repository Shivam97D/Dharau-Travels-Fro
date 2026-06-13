import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="June 2026"
      sections={[
        {
          heading: "Acceptance of terms",
          body: [
            "By using the Dharavu Journeys website and services, you agree to these terms. If you do not agree, please do not use the service.",
          ],
        },
        {
          heading: "Accounts",
          body: [
            "You are responsible for keeping your login credentials secure and for all activity under your account. Provide accurate information and keep it up to date.",
          ],
        },
        {
          heading: "Bookings",
          body: [
            "Submitting a booking request does not guarantee a confirmed booking. All requests are subject to availability and confirmation by our team. Prices shown are estimates and may change before final confirmation.",
            "Payment terms, cancellation, and refund details will be communicated when your booking is confirmed.",
          ],
        },
        {
          heading: "Reviews & content",
          body: [
            "Reviews and other content you submit must be truthful and lawful. We may moderate, edit, or remove content that violates these terms.",
          ],
        },
        {
          heading: "Acceptable use",
          body: [
            "Do not misuse the service, attempt to disrupt it, access it through unauthorized means, or use it for unlawful purposes.",
          ],
        },
        {
          heading: "Limitation of liability",
          body: [
            "The service is provided \"as is\" without warranties of any kind. To the extent permitted by law, we are not liable for indirect or consequential damages arising from your use of the service.",
          ],
        },
        {
          heading: "Changes",
          body: [
            "We may update these terms from time to time. Continued use of the service after changes means you accept the updated terms.",
          ],
        },
        {
          heading: "Contact",
          body: [
            "For questions about these terms, contact us through the options in the site footer.",
          ],
        },
      ]}
    />
  );
}
