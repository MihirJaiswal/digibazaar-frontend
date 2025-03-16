"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, ArrowLeft, Clock, CheckCircle2, Package, Star, Calendar, MessageSquare, RefreshCw, Truck } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import Header from "@/components/global/Header";

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

type OrderUpdate = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  expectedDeliveryDate?: string;
};

export default function OrderTrackingPage() {
  const { token } = useAuthStore();
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id;
  const [order, setOrder] = useState<Order | null>(null);
  const [updates, setUpdates] = useState<OrderUpdate[]>([]);
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

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "PENDING":
        return {
          icon: <Clock className="h-5 w-5" />,
          color: "bg-blue-50 text-blue-700 border-blue-200",
          progress: 25,
          progressColor: "bg-blue-500"
        };
      case "IN_PROGRESS":
        return {
          icon: <RefreshCw className="h-5 w-5" />,
          color: "bg-yellow-50 text-yellow-700 border-yellow-200",
          progress: 50,
          progressColor: "bg-yellow-500"
        };
      case "DELIVERED":
        return {
          icon: <Truck className="h-5 w-5" />,
          color: "bg-purple-50 text-purple-700 border-purple-200",
          progress: 75,
          progressColor: "bg-purple-500"
        };
      case "COMPLETED":
        return {
          icon: <CheckCircle2 className="h-5 w-5" />,
          color: "bg-green-50 text-green-700 border-green-200",
          progress: 100,
          progressColor: "bg-green-500"
        };
      case "REJECTED":
        return {
          icon: <AlertCircle className="h-5 w-5" />,
          color: "bg-red-50 text-red-700 border-red-200",
          progress: 0,
          progressColor: "bg-red-500"
        };
      default:
        return {
          icon: <Clock className="h-5 w-5" />,
          color: "bg-gray-50 text-gray-700 border-gray-200",
          progress: 0,
          progressColor: "bg-gray-500"
        };
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loadingOrder) {
    return (
      <div className="flex items-center justify-center h-64 p-6">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-6">
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || "Order not found"}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status);

  return (
   <>
   <Header/>
   <div className="p-6 lg:p-8 bg-white dark:bg-zinc-900">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => router.back()} 
          className="mb-6 group hover:bg-gray-100 dark:hover:bg-zinc-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Orders
        </Button>
        
        <Card className="overflow-hidden bg-white dark:bg-zinc-950 shadow-md rounded-lg border-gray-200 dark:border-gray-700 mb-8">
          <CardHeader className="order-b border-gray-200 p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <CardTitle className="text-2xl font-bold ">
                  Order #{order.id.slice(0, 8)}
                </CardTitle>
                <CardDescription className="text-sm text-gray-500 dark:text-gray-300 mt-1">
                  Placed on {formatDate(order.createdAt)}
                </CardDescription>
              </div>
              <Badge 
                variant="outline" 
                className={`px-3 py-1.5 text-sm font-medium flex items-center gap-1.5 ${statusInfo.color}`}
              >
                {statusInfo.icon}
                {order.status.replace("_", " ")}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="p-6 space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Order Progress
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 rounded-lg border border-gray-100 dark:border-gray-700 ">
                  <div className="flex justify-between mb-2 text-sm font-medium">
                    <span>Order Placed</span>
                    <span>In Progress</span>
                    <span>Delivered</span>
                    <span>Completed</span>
                  </div>
                  <Progress value={statusInfo.progress} className={statusInfo.progressColor} />
                </div>
                
                <div className="p-5 rounded-lg border border-gray-200 dark:border-gray-700 ">
                  <h4 className="text-lg font-medium mb-2">Current Status</h4>
                  <p className="text-gray-700 dark:text-gray-300">{order.status.replace("_", " ")}</p>
                  
                  {order.status === "DELIVERED" && (
                    <div className="mt-6">
                      <Button
                        variant="default"
                        onClick={() => router.push(`/gigs/orders/review/${order.id}`)}
                        className="gap-2"
                      >
                        <Star className="h-4 w-4" />
                        Collect Product
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Order Updates
              </h3>
              
              {loadingUpdates ? (
                <div className="flex items-center justify-center h-32 rounded-lg">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2 text-gray-500">Loading updates...</span>
                </div>
              ) : updates.length > 0 ? (
                <div className="space-y-4">
                  {updates.map((update) => (
                    <Card key={update.id} className="overflow-hidden">
                      <div className="px-4 py-3 border-b">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <h4 className="font-semibold ">{update.title}</h4>
                          <div className="text-xs text-gray-500 dark:text-gray-300 flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(update.createdAt)}
                          </div>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <p className="text-gray-700 whitespace-pre-line">{update.content}</p>
                        {update.expectedDeliveryDate && (
                          <div className="mt-3 flex items-center">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:border-gray-700 ">
                              <Calendar className="h-3 w-3 mr-1" />
                              Expected: {formatDate(update.expectedDeliveryDate)}
                            </Badge>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className=" p-6 rounded-lg border border-gray-200 text-center">
                  <p className="text-gray-500">No updates available yet.</p>
                  <p className="text-sm text-gray-400 mt-1">
                    The seller will post updates about your order here.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter className=" border-t p-6">
            <div className="w-full flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300">Order Total</h4>
                <p className="text-2xl font-bold">₹{(order.price || 0).toLocaleString()}</p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => router.push(`/gigs/orders/${order.id}`)}
                className="sm:self-end"
              >
                View Full Order Details
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
   </>
  );
}