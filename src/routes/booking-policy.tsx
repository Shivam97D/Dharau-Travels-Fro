import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/booking-policy")({
  component: BookingPolicyPage,
});

function BookingPolicyPage() {
  return (
    <LegalPage
      title="Booking Policy"
      updated="June 2026"
      sections={[
        {
          heading: "Making a booking",
          body: [
            "Bookings can be made online via your Dharavu account. A booking is confirmed only after full or partial payment has been received and a confirmation email has been sent to you.",
            "We reserve the right to decline any booking at our discretion, in which case a full refund will be issued.",
          ],
        },
        {
          heading: "Payment",
          body: [
            "Payments are processed securely through Razorpay. We accept UPI, credit and debit cards, and net banking.",
            "The total amount shown at checkout includes the base trip price, applicable taxes (10%), and any applicable discounts.",
            "For custom and group bookings, a payment schedule may be agreed in advance with our team.",
          ],
        },
        {
          heading: "Cancellation by traveller",
          body: [
            "More than 30 days before departure: 90% refund of the amount paid.",
            "15–30 days before departure: 50% refund.",
            "7–14 days before departure: 25% refund.",
            "Less than 7 days before departure: no refund. The full amount is forfeited.",
            "To cancel, log in to your dashboard and use the cancel option on your booking, or email us at dharavujourney@gmail.com.",
          ],
        },
        {
          heading: "Cancellation by Dharavu",
          body: [
            "We may occasionally cancel a trip due to insufficient numbers, unsafe weather conditions, force majeure, or circumstances beyond our control.",
            "In such cases, we will notify you as early as possible and offer a full refund or an equivalent alternative trip. We are not liable for any consequential costs such as flights or accommodation booked independently.",
          ],
        },
        {
          heading: "Changes to your booking",
          body: [
            "Date changes are subject to availability and must be requested at least 10 days before departure. A processing fee of ₹500 may apply.",
            "Name changes for group bookings can be made up to 7 days before departure at no charge.",
          ],
        },
        {
          heading: "Refund processing",
          body: [
            "Approved refunds are credited to the original payment method within 5–10 business days, depending on your bank.",
            "Payment gateway transaction fees (typically 2%) are non-refundable.",
          ],
        },
        {
          heading: "Travel insurance",
          body: [
            "We strongly recommend that all travellers purchase comprehensive travel insurance, including medical, trip-cancellation, and baggage cover, before departure.",
            "Dharavu Journeys is not responsible for costs arising from medical emergencies, trip interruptions, or lost luggage.",
          ],
        },
        {
          heading: "Contact",
          body: [
            "Questions about your booking? Reach our team at dharavujourney@gmail.com or call +91 95792 65920.",
          ],
        },
      ]}
    />
  );
}
