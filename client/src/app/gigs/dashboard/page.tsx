"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle, DollarSign, User } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/global/Header";
import GigsSidebar from "@/components/gigs/GigsSidebar";
import { useAuthStore } from "@/store/authStore";

// -----------------------------------------------------------------------------
// Define Order type (adjust properties as needed)
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

// -----------------------------------------------------------------------------
// Define order statuses to use in the tabs
const ORDER_STATUSES = [
  "PENDING",
  "IN_PROGRESS",
  "DELIVERED",
  "REJECTED",
  "COMPLETED",
];

// -----------------------------------------------------------------------------
// Utility: Get color for order status badge
const getStatusColor = (status: string) => {
  switch (status) {
    case "PENDING":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "IN_PROGRESS":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "DELIVERED":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "REJECTED":
      return "bg-red-100 text-red-800 border-red-200";
    case "COMPLETED":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

// -----------------------------------------------------------------------------
// OrdersDashboard Component
export default function OrdersDashboard() {
  const { token, user } = useAuthStore();
  const router = useRouter();

  // State to store orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for filtering orders
  const [searchQuery, setSearchQuery] = useState("");

  // ---------------------------------------------------------------------------
  // Fetch orders from the seller endpoint
  useEffect(() => {
    if (!token || !user?.id) return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const endpoint = `http://localhost:8800/api/gig-orders/seller/${user.id}`;
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
      } catch (err: any) {
        console.error("Error fetching orders:", err);
        setError("Failed to load orders. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token, user?.id]);

  // ---------------------------------------------------------------------------
  // Calculate total earnings from COMPLETED orders
  const totalEarnings = orders
    .filter((order) => order.status === "COMPLETED")
    .reduce((sum, order) => sum + order.price, 0);

  // Count orders by each status for the summary breakdown
  const countByStatus: { [key: string]: number } = {};
  ORDER_STATUSES.forEach((status) => {
    countByStatus[status] = orders.filter((order) => order.status === status)
      .length;
  });

  // ---------------------------------------------------------------------------
  // Filter orders based on search query (by order id or gig title)
  const filterOrders = (order: Order) => {
    if (!searchQuery) return true;
    const lowerQuery = searchQuery.toLowerCase();
    return (
      order.id.toLowerCase().includes(lowerQuery) ||
      order.gig.title.toLowerCase().includes(lowerQuery)
    );
  };

  // ---------------------------------------------------------------------------
  // Main render
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>Please login to view your dashboard.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      <div className="flex">
        {/* Sidebar */}
        <GigsSidebar />

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Dashboard Title */}
            <h1 className="text-3xl font-bold mb-4">Dashboard</h1>

            {/* Summary Section */}
            <section className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Earnings Card */}
                <Card className="p-4 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold">
                      Total Earnings
                    </CardTitle>
                    <CardDescription className="text-gray-500">
                      Earnings from Completed Orders
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">
                      ₹{totalEarnings}
                    </p>
                  </CardContent>
                </Card>

                {/* Total Orders Card */}
                <Card className="p-4 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold">
                      Total Orders
                    </CardTitle>
                    <CardDescription className="text-gray-500">
                      All orders received
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{orders.length}</p>
                  </CardContent>
                </Card>

                {/* Order Breakdown Card */}
                <Card className="p-4 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold">
                      Order Breakdown
                    </CardTitle>
                    <CardDescription className="text-gray-500">
                      Orders by Status
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {ORDER_STATUSES.map((status) => (
                        <li
                          key={status}
                          className="flex justify-between border-b pb-1"
                        >
                          <span>{status.replace("_", " ")}</span>
                          <span>{countByStatus[status] || 0}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Search / Filter Section */}
            <section className="mb-8">
              <input
                type="text"
                placeholder="Search orders by ID or gig title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border p-2 rounded w-full md:w-1/2"
              />
            </section>

            {/* Orders Tabs Section */}
            <section className="mb-10">
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
              ) : (
                <Tabs defaultValue="PENDING">
                  <TabsList className="mb-4 border-b pb-2">
                    {ORDER_STATUSES.map((status) => (
                      <TabsTrigger key={status} value={status}>
                        {status.replace("_", " ")}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {ORDER_STATUSES.map((status) => (
                    <TabsContent key={status} value={status}>
                      {orders.filter(
                        (order) =>
                          order.status === status && filterOrders(order)
                      ).length === 0 ? (
                        <p className="text-gray-600">
                          No orders found for {status.replace("_", " ")}.
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {orders
                            .filter(
                              (order) =>
                                order.status === status && filterOrders(order)
                            )
                            .map((order) => (
                              <Card
                                key={order.id}
                                className="shadow-sm hover:shadow-lg transition-shadow duration-200"
                              >
                                <CardHeader className="bg-gray-50 px-4 py-2 border-b">
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <CardTitle className="text-lg font-semibold">
                                        Order #{order.id.slice(0, 8)}
                                      </CardTitle>
                                      <CardDescription className="text-sm text-gray-500">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                      </CardDescription>
                                    </div>
                                    <div>
                                      <span
                                        className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(
                                          order.status
                                        )}`}
                                      >
                                        {order.status.replace("_", " ")}
                                      </span>
                                    </div>
                                  </div>
                                </CardHeader>
                                <CardContent className="p-4 flex justify-between items-center">
                                  <div>
                                    <p className="text-sm font-medium">
                                      {order.gig.title}
                                    </p>
                                    <p className="text-sm text-gray-600 flex items-center">
                                      <User className="h-4 w-4 mr-1" /> Buyer:{" "}
                                      {order.buyer?.username || "Unknown"}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <p className="text-sm font-medium flex items-center">
                                      <DollarSign className="h-4 w-4 mr-1 text-gray-400" />₹
                                      {order.price}
                                    </p>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => router.push(`/gigs/orders/${order.id}`)}
                                    >
                                      View Details
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                        </div>
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </section>

            {/* Additional Dashboard Widgets Section */}
            <section className="mt-10">
              <h2 className="text-2xl font-bold mb-4">Additional Insights</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recent Orders Widget */}
                <Card className="p-4 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold">
                      Recent Orders
                    </CardTitle>
                    <CardDescription className="text-gray-500">
                      Latest orders received
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 max-h-64 overflow-y-auto">
                      {orders.slice(0, 5).map((order) => (
                        <li
                          key={order.id}
                          className="flex justify-between border-b pb-1"
                        >
                          <span>#{order.id.slice(0, 6)}</span>
                          <span>{order.gig.title}</span>
                          <span className="text-sm text-gray-600">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Order Statistics Chart Widget (Placeholder) */}
                <Card className="p-4 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold">
                      Order Statistics
                    </CardTitle>
                    <CardDescription className="text-gray-500">
                      Graphical overview (Coming Soon)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48 bg-gray-100 flex items-center justify-center text-gray-500">
                      Chart Placeholder
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* End of Dashboard Content */}
          </div>
        </main>
      </div>
    </div>
  );
}
