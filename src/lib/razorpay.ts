import api from "./api";

const RAZORPAY_SRC = "https://checkout.razorpay.com/v1/checkout.js";

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  handler: (response: RazorpaySuccess) => void;
  modal?: { ondismiss?: () => void };
}

interface RazorpaySuccess {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

// Loads the Razorpay checkout script once and caches the promise.
let scriptPromise: Promise<boolean> | null = null;
function loadRazorpayScript(): Promise<boolean> {
  if (window.Razorpay) return Promise.resolve(true);
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = RAZORPAY_SRC;
    script.onload = () => resolve(true);
    script.onerror = () => {
      scriptPromise = null;
      resolve(false);
    };
    document.body.appendChild(script);
  });
  return scriptPromise;
}

export interface PayForBookingArgs {
  bookingId: string;
  tripTitle: string;
  prefill?: { name?: string; email?: string; contact?: string };
}

export type PayResult =
  | { status: "success"; bookingRef?: string }
  | { status: "dismissed" }
  | { status: "error"; message: string };

// Full payment flow: create order → open checkout → verify on success.
export async function payForBooking({ bookingId, tripTitle, prefill }: PayForBookingArgs): Promise<PayResult> {
  const ok = await loadRazorpayScript();
  if (!ok || !window.Razorpay) {
    return { status: "error", message: "Could not load the payment gateway. Check your connection." };
  }

  let order;
  try {
    const res = await api.createPaymentOrder(bookingId);
    if (!res.success || !res.data) {
      return { status: "error", message: res.message || "Could not start payment" };
    }
    order = res.data;
  } catch (err) {
    return { status: "error", message: err instanceof Error ? err.message : "Could not start payment" };
  }

  return new Promise<PayResult>((resolve) => {
    const rzp = new window.Razorpay!({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      name: "Dharavu Journeys",
      description: tripTitle,
      order_id: order.orderId,
      prefill,
      theme: { color: "#f97316" },
      handler: async (response) => {
        try {
          const verify = await api.verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            bookingId,
          });
          if (verify.success) {
            resolve({ status: "success", bookingRef: order.bookingRef });
          } else {
            resolve({ status: "error", message: verify.message || "Payment verification failed" });
          }
        } catch (err) {
          resolve({ status: "error", message: err instanceof Error ? err.message : "Verification failed" });
        }
      },
      modal: {
        ondismiss: () => {
          api.markPaymentFailed(bookingId).catch(() => {});
          resolve({ status: "dismissed" });
        },
      },
    });
    rzp.open();
  });
}
