"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);

export default function StripeProvider({ children }: { children: React.ReactNode }) {
  if (!stripePromise) {
    return <p>Loading Stripe...</p>; // ✅ Prevents null errors
  }

  return <Elements stripe={stripePromise}>{children}</Elements>;
}
