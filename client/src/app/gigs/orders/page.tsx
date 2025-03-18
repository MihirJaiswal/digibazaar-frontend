"use client";

import { useRouter } from "next/navigation";
import { useQuery, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import Header from "@/components/global/Header";
import GigsSidebar from "@/components/gigs/GigsSidebar";
import { Loader2, AlertCircle, DollarSign, User, IndianRupee } from "lucide-react";
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

function OrdersPageContent() {
  const { token, user } = useAuthStore();
  const router = useRouter();

  const {
    data: orders,
    isLoading,
    error,
  } = useQuery<Order[], Error>({
    queryKey: ["orders", user?.id],
    queryFn: async () => {
      const endpoint = `http://localhost:8800/api/gig-orders/buyer/${user?.id}`;
      const res = await fetch(endpoint, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error("Failed to fetch orders");
      }
      return (await res.json()) as Order[];
    },
    enabled: !!user?.id && !!token,
    staleTime: 5 * 60 * 1000, // Cache data for 5 minutes
  });

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
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-zinc-900">
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
      <div className="flex bg-white dark:bg-zinc-900">
        <GigsSidebar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold mb-6">My Orders</h2>

            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>
            ) : orders && orders.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Orders Found</AlertTitle>
                <AlertDescription>
                  You haven&apos;t placed any orders yet.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-6">
                {orders?.map((order) => (
                  <Card
                    key={order.id}
                    className="overflow-hidden bg-white dark:bg-zinc-950 shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <CardHeader className="bg-gray-50 dark:bg-zinc-950 border-b border-gray-200 dark:border-zinc-700 p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="text-lg font-semibold ">
                            Order #{order.id.slice(0, 8)}
                          </CardTitle>
                          <CardDescription className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <Badge
                          className={`px-2 py-1 text-xs font-medium capitalize ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                       
                        <div className="flex items-center gap-4">
                          <p className="flex items-center text-sm font-medium">
                            <IndianRupee className="h-4 w-4 mr-1 text-gray-400" />
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

// Wrap the page content with QueryClientProvider so that React Query hooks work
export default function OrdersPage() {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <OrdersPageContent />
    </QueryClientProvider>
  );
}
