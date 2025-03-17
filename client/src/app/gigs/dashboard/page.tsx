"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Header from "@/components/global/Header";
import GigsSidebar from "@/components/gigs/GigsSidebar";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Loader2,
  AlertCircle,
  DollarSign,
  User,
  Search,
  Calendar,
  BarChart3,
  TrendingUp,
  Clock,
  Package,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Filter,
  RefreshCw,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// -----------------------------------------------------------------------------
// Define Order type
type Order = {
  id: string;
  buyer?: {
    id: string;
    username: string;
  };
  status: string;
  createdAt: string;
  finalPrice?: number;
  totalPrice?: number;
  gig: {
    title: string;
  };
};
// -----------------------------------------------------------------------------
// Define order statuses to use in the tabs
const ORDER_STATUSES = ["PENDING", "IN_PROGRESS", "DELIVERED", "REJECTED", "COMPLETED"];

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
  const [sortBy, setSortBy] = useState("newest");

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
        const transformedData = data.map(order => ({
          ...order,
          price: order.totalPrice || order.finalPrice || 0
        }));
        setOrders(transformedData);
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
  .reduce((sum, order) => sum + (order.totalPrice || order.finalPrice || 0), 0);

  // Count orders by each status for the summary breakdown
  const countByStatus: { [key: string]: number } = {};
  ORDER_STATUSES.forEach((status) => {
    countByStatus[status] = orders.filter((order) => order.status === status).length;
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

  // Sort orders based on selected sort option
  const sortOrders = (a: Order, b: Order) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "highest":
        return (b.totalPrice || 0) - (a.totalPrice || 0);
      case "lowest":
        return (a.totalPrice || 0) - (b.totalPrice || 0);
      default:
        return 0;
    }
  };

  const completedOrders = orders.filter(order => order.status === "COMPLETED");
console.log("Completed Orders:", completedOrders);
console.log("Completed Orders Count:", completedOrders.length);
console.log("Completed Orders:", completedOrders);




  // ---------------------------------------------------------------------------
  // Get status badge with appropriate styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case "IN_PROGRESS":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 gap-1">
            <RefreshCw className="h-3 w-3" />
            In Progress
          </Badge>
        );
      case "DELIVERED":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 gap-1">
            <Package className="h-3 w-3" />
            Delivered
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Completed
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 dark:border-gray-600">
            {status.replace("_", " ")}
          </Badge>
        );
    }
  };

  // ---------------------------------------------------------------------------
  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // ---------------------------------------------------------------------------
  // If the user is not logged in, show an alert
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>Please login to view your dashboard.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900">
      {/* Header */}
      <Header />
      <div className="flex flex-col md:flex-row">
          <GigsSidebar />
        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Dashboard Title */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold">Expert Dashboard</h1>
              <p className="text-gray-500 dark:text-gray-300 mt-1">Manage your orders and track your earnings</p>
            </div>

            {/* Summary Section */}
            <section className="mb-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Earnings Card */}
                <Card className="overflow-hidden shadow-md border-gray-200 dark:border-gray-600 hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 dark:bg-gradient-to-r dark:from-green-600 dark:to-cyan-700 border-b pb-3">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-700 dark:text-green-950" />
                      Total Earnings
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-50">
                      From completed orders
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="flex items-baseline">
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-200">
                        ₹{totalEarnings.toLocaleString()}
                      </p>
                      <span className="ml-2 text-sm text-gray-500 dark:text-gray-200">INR</span>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-gray-50 dark:bg-zinc-900 border-t py-2 px-4">
                    <p className="text-xs flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                      From {countByStatus["COMPLETED"] || 0} completed orders
                    </p>
                  </CardFooter>
                </Card>

                {/* Total Orders Card */}
                <Card className="overflow-hidden shadow-md border-gray-200 dark:border-gray-600 hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b dark:bg-gradient-to-r dark:from-blue-500 dark:to-blue-700 pb-3">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Package className="h-5 w-5 text-blue-600 dark:text-blue-900" />
                      Total Orders
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-100">
                      All orders received
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="flex items-baseline">
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-200">{orders.length}</p>
                      <span className="ml-2 text-sm text-gray-500 dark:text-gray-200">orders</span>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-gray-50 dark:bg-zinc-900 border-t py-2 px-4">
                    <p className="text-xs flex items-center">
                      <Clock className="h-3 w-3 mr-1 text-blue-500" />
                      {countByStatus["PENDING"] || 0} pending orders
                    </p>
                  </CardFooter>
                </Card>

                {/* Order Breakdown Card */}
                <Card className="overflow-hidden shadow-md border-gray-200 dark:border-gray-600 hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 dark:bg-gradient-to-r dark:from-pink-500 dark:to-purple-700 border-b pb-3">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-950" />
                      Order Breakdown
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-100">
                      By status
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4 pb-2">
                    <ul className="space-y-2">
                      {ORDER_STATUSES.map((status) => (
                        <li key={status} className="flex justify-between items-center text-sm">
                          <div className="flex items-center">
                            {getStatusBadge(status)}
                          </div>
                          <span className="font-medium">{countByStatus[status] || 0}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Search / Filter Section */}
            <section className="mb-8">
              <Card className="border-gray-200 dark:border-gray-600 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                      </div>
                      <Input
                        type="text"
                        placeholder="Search orders by ID or gig title..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex items-center gap-2 min-w-[200px]">
                      <Filter className="h-4 w-4 text-gray-500" />
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="newest">Newest First</SelectItem>
                          <SelectItem value="oldest">Oldest First</SelectItem>
                          <SelectItem value="highest">Highest Price</SelectItem>
                          <SelectItem value="lowest">Lowest Price</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Orders Tabs Section */}
            <section className="mb-10">
              {loading ? (
                <div className="flex items-center justify-center h-64 rounded-lg shadow-sm border">
                  <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm">Loading your orders...</p>
                </div>
              </div>
              ) : error ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : (
                <Card className="border-gray-200 dark:border-gray-600 shadow-sm overflow-hidden">
                  <Tabs defaultValue="PENDING" className="w-full">
                    <CardHeader className="pb-0 pt-4 px-4">
                      <TabsList className="w-full justify-start overflow-x-auto">
                        {ORDER_STATUSES.map((status) => (
                          <TabsTrigger
                            key={status}
                            value={status}
                            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                          >
                            {status.replace("_", " ")}
                            <span className="ml-1.5 bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded-full text-xs">
                              {countByStatus[status] || 0}
                            </span>
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </CardHeader>
                    <CardContent className="p-4">
                      {ORDER_STATUSES.map((status) => {
                        const filteredOrders = orders
                          .filter((order) => order.status === status && filterOrders(order))
                          .sort(sortOrders);
                        return (
                          <TabsContent key={status} value={status} className="mt-0 pt-4">
                            {filteredOrders.length === 0 ? (
                              <div className="p-8 rounded-lg text-center">
                                <p className="text-gray-500">
                                  No {status.toLowerCase().replace("_", " ")} orders found.
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {filteredOrders.map((order) => (
                                  <Card
                                    key={order.id}
                                    className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 border-gray-200 dark:border-gray-600"
                                  >
                                    <div className="flex flex-col sm:flex-row sm:items-center p-4 gap-4">
                                      <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                          <h4 className="font-medium text-gray-900 dark:text-gray-300">
                                            Order #{order.id.slice(0, 8)}
                                          </h4>
                                          {getStatusBadge(order.status)}
                                        </div>
                                        <p className="text-sm text-gray-700 dark:text-gray-400 line-clamp-1 mb-1">
                                          {order.gig.title}
                                        </p>
                                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-300">
                                          <span className="flex items-center">
                                            <Calendar className="h-3 w-3 mr-1" />
                                            {formatDate(order.createdAt)}
                                          </span>
                                          <span className="flex items-center">
                                            <User className="h-3 w-3 mr-1" />
                                            {order.buyer?.username || "Unknown"}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-4 self-end sm:self-center">
                                        <p className="text-lg font-medium flex items-center">
                                          <DollarSign className="h-4 w-4 text-gray-400" />
                                          ₹{(order.totalPrice || 0).toLocaleString()}
                                        </p>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => router.push(`/gigs/orders/${order.id}`)}
                                          className="whitespace-nowrap"
                                        >
                                          View Details
                                          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                                        </Button>
                                      </div>
                                    </div>
                                  </Card>
                                ))}
                              </div>
                            )}
                          </TabsContent>
                        );
                      })}
                    </CardContent>
                  </Tabs>
                </Card>
              )}
            </section>

            {/* Additional Dashboard Widgets Section */}
            <section className="mt-10 mb-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-200">Additional Insights</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recent Orders Widget */}
                <Card className="shadow-md border-gray-200 dark:border-gray-600 overflow-hidden">
                  <CardHeader className="border-b pb-3">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Recent Orders
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300">
                      Latest orders received
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="max-h-64 overflow-y-auto">
                      {orders.length > 0 ? (
                        <ul className="divide-y">
                          {orders
                            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                            .slice(0, 5)
                            .map((order) => (
                              <li key={order.id} className="p-3 transition-colors">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="font-medium text-gray-800 dark:text-gray-300">#{order.id.slice(0, 6)}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{order.gig.title}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-medium">₹{(order.totalPrice || 0).toLocaleString()}</p>
                                    <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                                  </div>
                                </div>
                              </li>
                            ))}
                        </ul>
                      ) : (
                        <div className="p-6 text-center text-gray-500 dark:text-gray-300">No orders yet</div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t p-3 flex justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                      onClick={() => router.push('/seller/orders')}
                    >
                      View All Orders
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </CardFooter>
                </Card>

                {/* Order Statistics Chart Widget */}
                <Card className="shadow-md border-gray-200 dark:border-gray-600 overflow-hidden">
                  <CardHeader className="border-b pb-3">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Order Statistics
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300">
                      Monthly performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="h-48 rounded-lg flex items-center justify-center text-gray-500 border border-dashed border-gray-300 dark:border-gray-600">
                      <div className="text-center">
                        <BarChart3 className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                        <p>Chart Visualization Coming Soon</p>
                        <p className="text-xs text-gray-400 mt-1">Track your monthly performance</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t p-3 flex justify-center">
                    <Button variant="ghost" size="sm" className="text-xs" disabled>
                      View Detailed Analytics
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}