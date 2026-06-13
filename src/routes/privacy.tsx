import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="June 2026"
      sections={[
        {
          heading: "Overview",
          body: [
            "Dharavu Journeys (\"we\", \"us\") respects your privacy. This policy explains what personal information we collect when you use our website, why we collect it, and how we handle it.",
          ],
        },
        {
          heading: "Information we collect",
          body: [
            "Account details you provide: name, email, phone, and address.",
            "Booking and inquiry details: trips you request, travel dates, traveler counts, and any messages you send us.",
            "Newsletter subscriptions: your email address when you opt in.",
            "Technical data: basic logs (such as IP address and request times) used to keep the service secure and reliable.",
          ],
        },
        {
          heading: "How we use your information",
          body: [
            "To create and manage your account, process booking requests, respond to inquiries, and send service-related messages.",
            "To send newsletter updates, only if you have subscribed. You can unsubscribe at any time.",
            "To protect the platform against abuse and to improve our services.",
          ],
        },
        {
          heading: "Sharing",
          body: [
            "We do not sell your personal information. We share it only with service providers that help us operate (such as hosting and database providers) and where required by law.",
          ],
        },
        {
          heading: "Data retention & security",
          body: [
            "We keep your information for as long as your account is active or as needed to provide our services. We use industry-standard measures to protect it, though no method of transmission or storage is completely secure.",
          ],
        },
        {
          heading: "Your rights",
          body: [
            "You can access, update, or delete your account information, and unsubscribe from marketing emails. To make a request, contact us using the details on our site.",
          ],
        },
        {
          heading: "Cookies",
          body: [
            "We use only essential storage needed to keep you signed in and to operate the site. We do not use third-party advertising trackers.",
          ],
        },
        {
          heading: "Contact",
          body: [
            "Questions about this policy? Reach us through the contact options in the site footer.",
          ],
        },
      ]}
    />
  );
}
