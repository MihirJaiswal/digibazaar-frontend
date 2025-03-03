"use client"

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/store/authStore";
import type { Gig } from "@/app/gigs/types/gig";

export default function ConfirmOrder() {
  const router = useRouter();
  const params = useParams();
  const { token } = useAuthStore();
  const [gig, setGig] = useState<Gig | null>(null);
  const [requirement, setRequirement] = useState("");

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    if (!params?.id) return;

    fetch(`http://localhost:8800/api/gigs/${params.id}`)
      .then((res) => res.json())
      .then((data) => setGig(data))
      .catch((err) => console.error("Error fetching gig:", err));
  }, [params?.id, token, router]);

  if (!gig) return <p className="text-center text-lg font-semibold">Loading...</p>;

  const handlePlaceOrder = async () => {
    if (!requirement.trim()) {
      alert("Please enter your requirement.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8800/api/gig-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          gigId: gig.id,
          price: gig.price,
          requirement: requirement,
          paymentIntent: "random-string",
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to create order");
      }

      router.push("/dashboard/orders");
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order. Please try again.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <Card className="border border-gray-200 shadow-lg">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Confirm Your Order</h2>
          <div className="border-b pb-4 mb-4">
            <p className="text-lg font-medium text-gray-700">{gig.title}</p>
            <p className="text-md text-gray-500">Price: <span className="font-semibold">${gig.price}</span></p>
          </div>

          <label className="block text-gray-700 font-semibold mb-2">Your Requirements:</label>
          <Textarea
            className="w-full border-gray-300 focus:ring-2 focus:ring-blue-500 rounded-lg p-3"
            rows={5}
            placeholder="Describe your requirements in detail..."
            value={requirement}
            onChange={(e) => setRequirement(e.target.value)}
          />

          <div className="flex justify-end mt-6 space-x-3">
            <Button variant="outline" className="px-6 py-2 text-gray-700 border-gray-300 hover:bg-gray-100" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button className="px-6 py-2 bg-blue-600 text-white font-semibold hover:bg-blue-700" onClick={handlePlaceOrder}>
              Place Order
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
