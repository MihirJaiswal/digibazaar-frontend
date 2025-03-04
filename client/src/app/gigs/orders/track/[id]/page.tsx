"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";

type Order = {
  id: string;
  gigId: string;
  buyerId: string;
  sellerId: string;
  price: number;
  status: string;
  requirement: string;
  paymentIntent: string;
  createdAt: string;
  updatedAt: string;
  gig: {
    id: string;
    title: string;
    desc: string;
    cover: string;
  };
  buyer?: {
    id: string;
    username: string;
  };
  seller?: {
    id: string;
    username: string;
  };
};

export default function OrderTrackingPage() {
  const { token } = useAuthStore();
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id;
  const [order, setOrder] = useState<Order | null>(null);
  const [updates, setUpdates] = useState<any[]>([]);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [loadingUpdates, setLoadingUpdates] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch order details
  useEffect(() => {
    if (!token || !orderId) {
      setLoadingOrder(false);
      return;
    }
    const fetchOrder = async () => {
      try {
        const res = await fetch(`http://localhost:8800/api/gig-orders/${orderId}`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error("Failed to fetch order details");
        }
        const data = await res.json();
        setOrder(data);
      } catch (err: any) {
        console.error("Error fetching order:", err);
        setError(err.message || "Failed to load order details");
      } finally {
        setLoadingOrder(false);
      }
    };
    fetchOrder();
  }, [token, orderId]);

  // Fetch order updates
  useEffect(() => {
    if (!token || !orderId) {
      setLoadingUpdates(false);
      return;
    }
    const fetchUpdates = async () => {
      try {
        const res = await fetch(`http://localhost:8800/api/gig-order-updates/${orderId}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error("Failed to fetch order updates");
        }
        const data = await res.json();
        setUpdates(data);
      } catch (err: any) {
        console.error("Error fetching updates:", err);
      } finally {
        setLoadingUpdates(false);
      }
    };
    fetchUpdates();
  }, [token, orderId]);

  if (loadingOrder) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error || "Order not found"}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <Button variant="outline" onClick={() => router.back()} className="mb-4">
        Back
      </Button>
      <Card className="overflow-hidden bg-white shadow-lg rounded-lg border-gray-200">
        <CardHeader className="bg-gray-50 border-b border-gray-200 p-6">
          <CardTitle className="text-2xl font-bold">
            Order #{order.id.slice(0, 8)}
          </CardTitle>
          <CardDescription className="text-sm text-gray-500">
            Placed on {new Date(order.createdAt).toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-4">
            <h3 className="text-xl font-semibold">Order Status</h3>
            <p className="text-lg">{order.status.replace("_", " ")}</p>
          </div>
          <Separator />
          <div className="mt-4">
            <h3 className="text-xl font-semibold mb-2">Order Updates</h3>
            {loadingUpdates ? (
              <p>Loading updates...</p>
            ) : updates.length > 0 ? (
              <ul className="space-y-2">
                {updates.map((upd) => (
                  <li key={upd.id} className="border p-2 rounded">
                    <p className="font-bold">{upd.title}</p>
                    <p>{upd.content}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(upd.createdAt).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No updates available.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
