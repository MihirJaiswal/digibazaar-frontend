"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import Header from "@/components/global/Header";
import GigsSidebar from "@/components/gigs/GigsSidebar";
import { Loader2, AlertCircle, CheckCircle2, Clock, DollarSign, User, FileText } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import OrderUpdateForm from "@/components/gigs/OrderUpdateForm";

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

export default function OrderDetailsPage() {
  const { token, user } = useAuthStore();
  const params = useParams();
  const orderId = params?.id;
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !user?.id || !orderId) {
      console.warn("Missing dependencies: token, user, or orderId");
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        const res = await fetch(`http://localhost:8800/api/gig-orders/${orderId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch order details: ${res.statusText}`);
        }

        const data = await res.json();
        setOrder(data);
      } catch (error) {
        console.error("Error fetching order:", error);
        setError("Failed to load order details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [token, user?.id, orderId]);

  const handleRejectOrder = async () => {
    if (!order) return;
  
    try {
      setLoading(true); // Show loading state
  
      const res = await fetch(`http://localhost:8800/api/gig-orders/${order.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "REJECTED" }),
      });
  
      // Handle non-successful responses
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to update order status: ${res.status}`);
      }
  
      const updatedOrder = await res.json();
      setOrder(updatedOrder);
      // Optional: Show success message
    } catch (error: any) {
      console.error("Error rejecting order:", error);
      setError(error.message || "Failed to reject order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <GigsSidebar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">

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
            ) : !order ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Not Found</AlertTitle>
                <AlertDescription>Order not found.</AlertDescription>
              </Alert>
            ) : (
              <Card className="overflow-hidden bg-white shadow-lg rounded-lg border-gray-200">
                <CardHeader className="bg-gray-50 border-b border-gray-200 p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-900">
                        Order #{order.id.slice(0, 8)}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-500 mt-1">
                        Placed on {new Date(order.createdAt).toLocaleString()}
                      </CardDescription>
                    </div>
                    <Badge className={`px-3 py-1 text-sm font-medium capitalize ${getStatusColor(order.status)}`}>
                      {order.status.replace("_", " ")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Gig Details</h3>
                    <p className="text-gray-700 font-medium">{order.gig?.title}</p>
                    <p className="text-gray-600 mt-1">{order.gig?.desc}</p>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Order Information</h3>
                      <div className="space-y-2">
                        <p className="flex items-center text-gray-700">
                          <Clock className="h-4 w-4 mr-2 text-gray-400" />
                          Status: <span className="font-medium ml-1">{order.status.replace("_", " ")}</span>
                        </p>
                        <p className="flex items-center text-gray-700">
                          <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                          Price: <span className="font-medium ml-1">₹{order.price}</span>
                        </p>
                        <p className="flex items-center text-gray-700">
                          <FileText className="h-4 w-4 mr-2 text-gray-400" />
                          Payment ID: <span className="font-medium ml-1">{order.paymentIntent}</span>
                        </p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Buyer & Seller</h3>
                      <div className="space-y-2">
                        <p className="flex items-center text-gray-700">
                          <User className="h-4 w-4 mr-2 text-gray-400" />
                          Buyer: <span className="font-medium ml-1">{order.buyer?.username || "Unknown"}</span>
                        </p>
                        <p className="flex items-center text-gray-700">
                          <User className="h-4 w-4 mr-2 text-gray-400" />
                          Seller: <span className="font-medium ml-1">{order.seller?.username || "Unknown"}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Requirements</h3>
                    <p className="text-gray-700">{order.requirement}</p>
                  </div>

                  {order.status === "IN_PROGRESS" && order.sellerId === user?.id && (
                    <div className="flex justify-end mt-6">
                      <Button variant="destructive" onClick={handleRejectOrder}>
                        Reject Order
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
             {order && order.sellerId === user?.id && (
              <OrderUpdateForm orderId={order.id} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
