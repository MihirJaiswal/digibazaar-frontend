"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import Header from "@/components/global/Header";
import GigsSidebar from "@/components/gigs/GigsSidebar";
import { Loader2, AlertCircle, DollarSign, User } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Define your Order type
type Order = {
  id: string;
  buyer?: {
    id: string;
    username: string;
  };
  status: string;
  createdAt: string;
  price: number;
  gig: {
    title: string;
  };
};

export default function OrdersPage() {
  const { token, user } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !user?.id) return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const endpoint = `http://localhost:8800/api/gig-orders/buyer/${user.id}`;

        const res = await fetch(endpoint, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch orders");
        }

        const data = await res.json();
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError("Failed to load orders. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token, user?.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200";
      case "DELIVERED":
        return "bg-cyan-100 text-cyan-800 border-cyan-200";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>Please login to view your orders.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="flex">
        <GigsSidebar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold mb-6">My Orders</h2>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : orders.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Orders Found</AlertTitle>
                <AlertDescription>You haven&apos;t placed any orders yet.</AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <Card key={order.id} className="overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                    <CardHeader className="bg-gray-50 border-b border-gray-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="text-lg font-semibold text-gray-900">
                            Order #{order.id.slice(0, 8)}
                          </CardTitle>
                          <CardDescription className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <Badge className={`px-2 py-1 text-xs font-medium capitalize ${getStatusColor(order.status)}`}>
                          {order.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-700">{order.gig.title}</p>
                          <p className="flex items-center text-sm text-gray-600">
                            <User className="h-4 w-4 mr-1" />
                            Buyer: {order.buyer?.username || "Unknown"}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="flex items-center text-sm font-medium text-gray-900">
                            <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                            ₹{order.price}
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/gigs/orders/${order.id}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
