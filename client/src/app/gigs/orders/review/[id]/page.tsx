"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import Header from "@/components/global/Header";

type GigDelivery = {
  id: string;
  gigOrderId: string;
  sellerId: string;
  buyerId: string;
  fileUrl: string;
  message: string;
  isAccepted: boolean;
  createdAt: string;
};

export default function BuyerDeliveryReview() {
  const { token } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  // ✅ Debugging: Log useParams() and useSearchParams()
  console.log("🔍 Params from useParams():", params);
  console.log("🔍 Query Params from useSearchParams():", searchParams.toString());

  // ✅ Extract gigOrderId from URL path or query string
  const gigOrderId = params?.gigOrderId || params?.id || searchParams.get("id");

  console.log("🔄 Extracted gigOrderId:", gigOrderId);

  const [delivery, setDelivery] = useState<GigDelivery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("🔄 useEffect Triggered with gigOrderId:", gigOrderId);

    if (!token) {
      console.warn("🚨 No Auth Token - Redirecting to login");
      router.push("/login");
      return;
    }

    if (!gigOrderId) {
      console.error("❌ gigOrderId is undefined - API call will fail");
      setError("Invalid Order ID");
      setLoading(false);
      return;
    }

    const fetchDelivery = async () => {
      const apiEndpoint = `http://localhost:8800/api/gig-deliveries/order/${gigOrderId}`;
      console.log("📡 Fetching delivery from:", apiEndpoint);

      try {
        const res = await fetch(apiEndpoint, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });

        console.log("🔄 API Response Status:", res.status);

        if (!res.ok) {
          const errorText = await res.text();
          console.error("❌ Error Response:", errorText);
          throw new Error(`Failed to fetch delivery: ${res.status} - ${errorText}`);
        }

        const data: GigDelivery = await res.json();
        console.log("✅ Delivery Data Received:", data);

        if (!data || Object.keys(data).length === 0) {
          setError("No delivery found for this order.");
          return;
        }

        setDelivery(data);
      } catch (err: any) {
        console.error("❌ Fetch Error:", err);
        setError(err.message || "Failed to load delivery.");
      } finally {
        setLoading(false);
        console.log("🏁 Fetch completed");
      }
    };

    fetchDelivery();
  }, [gigOrderId, token, router]);

  const handleAcceptDelivery = async () => {
    if (!delivery) return;
    try {
      const res = await fetch(`http://localhost:8800/api/gig-deliveries/${delivery.id}/accept`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to accept delivery");
      }

      const updatedDelivery = await res.json();
      alert("✅ Delivery accepted! Order is now completed.");
      setDelivery(updatedDelivery);
      router.push("/gigs/orders");
    } catch (err: any) {
      console.error("❌ Error Accepting Delivery:", err);
      alert(err.message || "Failed to accept delivery.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-center text-2xl font-bold">⏳ Loading delivery details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-center text-xl text-red-500 mt-8">❌ {error}</p>
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-center text-2xl mt-8">🚫 No delivery found for this order.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 min-h-screen">
    <Header/>
    <div className="max-w-4xl mx-auto p-8 shadow rounded-lg mt-8">
      <Card className="shadow-lg">
        <CardHeader className="bg-gray-50 dark:bg-zinc-950 p-4 flex items-center justify-between border-b">
          <CardTitle className="text-2xl font-bold">📦 Delivery Details</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="mb-4">
            <strong>📂 File URL:</strong>{" "}
            <a href={delivery.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
              View Delivery
            </a>
          </p>
          <p className="mb-4">
            <strong>📝 Seller&apos;s Message:</strong> {delivery.message || "No message provided."}
          </p>
          <p className="mb-4 text-sm text-gray-500">
            📅 Delivered on: {new Date(delivery.createdAt).toLocaleString()}
          </p>
          <Separator className="my-4" />
          {delivery.isAccepted ? (
            <p className="text-green-600 font-semibold">✅ Delivery Approved</p>
          ) : (
            <Button onClick={handleAcceptDelivery} variant="default">
              ✅ Accept Delivery
            </Button>
          )}
        </CardContent>
      </Card>
    </div></div>
  );
}
