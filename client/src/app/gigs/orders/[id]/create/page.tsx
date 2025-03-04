"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";

export default function SellerDeliveryUpload() {
  const router = useRouter();
  // Log the params to check the returned object
  const params = useParams();
  console.log("Route params:", params);
  // If your dynamic segment is named "gigOrderId" in your folder, this works:
  const { id: gigOrderId } = params || {};

  // If it's named "id" instead, you can do:
  // const { id: gigOrderId } = params || {};
  
  const [fileUrl, setFileUrl] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { token } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // If gigOrderId is undefined, alert the user and exit.
    if (!gigOrderId) {
      setError("Gig Order ID is missing in URL parameters.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:8800/api/gig-deliveries/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ gigOrderId, fileUrl, message }),
        credentials: "include",
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to upload delivery");
      }
      const data = await res.json();
      alert("Delivery uploaded successfully!");
      router.push("/seller/orders");
    } catch (err: any) {
      console.error("Error uploading delivery:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8 bg-white shadow rounded-lg mt-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Upload Gig Delivery</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Display gigOrderId automatically */}
        <div className="hidden">
          <label className="block font-medium mb-1">Gig Order ID</label>
          <input
            type="text"
            value={gigOrderId || ""}
            readOnly
            className="w-full border rounded p-2 bg-gray-100"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">File URL</label>
          <input
            type="url"
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            placeholder="Enter URL of the delivered work"
            className="w-full border rounded p-2"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Message (Optional)</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Any additional details"
            className="w-full border rounded p-2"
            rows={4}
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Uploading..." : "Submit Delivery"}
        </Button>
      </form>
    </div>
  );
}
