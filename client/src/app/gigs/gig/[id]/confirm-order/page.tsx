"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/store/authStore";
import type { Gig } from "@/app/gigs/types/gig";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import StripeProvider from "@/components/gigs/StripeProvider"; // ✅ Make sure path is correct

function ConfirmOrderContent() {
  const router = useRouter();
  const params = useParams();
  const { token } = useAuthStore();
  const [gig, setGig] = useState<Gig | null>(null);
  const [requirement, setRequirement] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Move useStripe() & useElements() to the top level
  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    if (!params?.id) return;

    fetch(`http://localhost:8800/api/gigs/${params.id}`)
      .then((res) => res.json())
      .then((data) => setGig(data))
      .catch((err) => console.error("❌ Error fetching gig:", err));
  }, [params?.id, token, router]);

  if (!gig) return <p className="text-center text-lg font-semibold">Loading...</p>;

  const handlePlaceOrder = async () => {
    if (!requirement.trim()) {
      alert("❌ Please enter your requirement.");
      return;
    }

    if (!stripe || !elements) {
      console.error("❌ Stripe.js has not loaded properly.");
      alert("Stripe failed to load. Please refresh and try again.");
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      console.error("❌ CardElement is not available.");
      alert("Payment method not found. Please refresh and try again.");
      return;
    }

    setLoading(true);

    try {
      console.log("📌 Step 1: Requesting Payment Intent...");
      const paymentIntentRes = await fetch("http://localhost:8800/api/gig-orders/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ gigId: gig.id }),
      });

      if (!paymentIntentRes.ok) throw new Error("❌ Failed to create payment intent");

      const { clientSecret, paymentIntentId } = await paymentIntentRes.json();
      console.log("✅ Step 1: Received Payment Intent:", { clientSecret, paymentIntentId });

      console.log("📌 Step 2: Confirming Payment with Stripe...");
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement },
      });

      if (error) {
        console.error("❌ Payment Error:", error);
        alert(`Payment failed: ${error.message}`);
        setLoading(false);
        return;
      }

      console.log("✅ Payment successful:", paymentIntent);

      console.log("📌 Step 3: Confirming Order with Backend...");
      const confirmOrderRes = await fetch("http://localhost:8800/api/gig-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          gigId: gig.id,
          paymentIntentId,
          requirement,
        }),
      });

      if (!confirmOrderRes.ok) throw new Error("❌ Failed to confirm order");

      console.log("✅ Order confirmed! Redirecting to dashboard...");
      router.push("/dashboard/orders");
    } catch (error: any) {
      console.error("❌ Error placing order:", error);
      alert(`❌ Failed to place order: ${error.message || "Unknown error"}`);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <Card className="border border-gray-200 shadow-lg">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Confirm Your Order</h2>
          <div className="border-b pb-4 mb-4">
            <p className="text-lg font-medium text-gray-700">{gig.title}</p>
            <p className="text-md text-gray-500">
              Price: <span className="font-semibold">${gig.price}</span>
            </p>
          </div>

          <label className="block text-gray-700 font-semibold mb-2">Your Requirements:</label>
          <Textarea
            className="w-full border-gray-300 focus:ring-2 focus:ring-blue-500 rounded-lg p-3"
            rows={5}
            placeholder="Describe your requirements in detail..."
            value={requirement}
            onChange={(e) => setRequirement(e.target.value)}
          />

          <label className="block text-gray-700 font-semibold mt-4">Payment Details:</label>
          <div className="border border-gray-300 rounded-lg p-4 my-3">
            <CardElement />
          </div>

          <div className="flex justify-end mt-6 space-x-3">
            <Button variant="outline" className="px-6 py-2 text-gray-700 border-gray-300 hover:bg-gray-100" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button className="px-6 py-2 bg-blue-600 text-white font-semibold hover:bg-blue-700" onClick={handlePlaceOrder} disabled={loading}>
              {loading ? "Processing..." : "Pay & Place Order"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ✅ Wrap the component inside StripeProvider
export default function WrappedConfirmOrder() {
  return (
    <StripeProvider>
      <ConfirmOrderContent />
    </StripeProvider>
  );
}
