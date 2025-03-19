"use client"

import { useState, useMemo } from "react"
import { DashboardLayout } from "@/components/inventory/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, ClipboardList, Eye, Filter, MoreHorizontal, Package, RefreshCw, Search, X } from "lucide-react"
import { formatCurrency, formatDate } from "@/app/inventory/lib/utils"
import { toast } from "sonner"
import { useOrderStore } from "@/app/inventory/store/OrderStore"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import Header from "@/components/global/Header"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuthStore } from "@/store/authStore"
import { useQuery, useMutation, useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Status options and color maps (moved outside component to prevent recreation)
const statusOptions = ["PENDING", "PROCESSING", "COMPLETED", "DELIVERED", "CANCELLED"]

const statusColorMap = {
  PENDING: {
    button: "bg-amber-500 hover:bg-amber-600 text-white",
    badge: "bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200"
  },
  PROCESSING: {
    button: "bg-blue-500 hover:bg-blue-600 text-white",
    badge: "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200"
  },
  SHIPPED: {
    button: "bg-indigo-500 hover:bg-indigo-600 text-white",
    badge: "bg-indigo-100 text-indigo-800 hover:bg-indigo-200 border-indigo-200"
  },
  DELIVERED: {
    button: "bg-emerald-500 hover:bg-emerald-600 text-white",
    badge: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200"
  },
  CANCELLED: {
    button: "bg-rose-500 hover:bg-rose-600 text-white",
    badge: "bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-200"
  },
  REJECTED: {
    button: "bg-rose-500 hover:bg-rose-600 text-white",
    badge: "bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-200"
  },
  ACCEPTED: {
    button: "bg-green-500 hover:bg-green-600 text-white",
    badge: "bg-green-100 text-green-800 hover:bg-green-200 border-green-200"
  },
  IN_PROGRESS: {
    button: "bg-violet-500 hover:bg-violet-600 text-white",
    badge: "bg-violet-100 text-violet-800 hover:bg-violet-200 border-violet-200"
  },
  REFUNDED: {
    button: "bg-slate-500 hover:bg-slate-600 text-white",
    badge: "bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-200"
  }
}

// Default status style for fallback
const defaultStatusStyle = {
  button: "bg-gray-500 hover:bg-gray-600 text-white",
  badge: "bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200"
}

// Type definition for Order
type Order = {
  id: string
  totalPrice: number
  status: string
  createdAt: string
  userId: string
  shippingAddress: {
    phone: string
    address: string
  }
  items: {
    id: string
    productId: string
    quantity: number
    unitPrice: number
    totalPrice: number
    product?: {
      title: string
    }
  }[]
}

// Create a client wrapper to handle React Query Provider setup
function OrdersPageWithQueryClient() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <OrdersPage />
    </QueryClientProvider>
  );
}

// Order status counters component for better performance
const OrderCounters = ({ orders, activeTab, setActiveTab, isLoading }) => {
  // Memoized counts calculation
  const counts = useMemo(() => {
    const total = orders.length
    const pending = orders.filter((order) => order.status === "PENDING").length
    const processing = orders.filter((order) => order.status === "PROCESSING").length
    const completed = orders.filter((order) => order.status === "COMPLETED").length
    const delivered = orders.filter((order) => order.status === "DELIVERED").length
    const cancelled = orders.filter((order) => order.status === "CANCELLED").length

    return { total, pending, processing, completed, delivered, cancelled }
  }, [orders])

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200 shadow-sm  dark:bg-gradient-to-br dark:from-slate-300 dark:to-slate-400 dark:border-slate-500">
        <CardHeader className="pb-2">
          <CardDescription  className="text-gray-700 dark:text-gray-600">Total Orders</CardDescription>
          <CardTitle className="text-2xl text-gray-800">
            {isLoading ? <Skeleton className="h-8 w-16" /> : counts.total}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card
        className={cn(
          "cursor-pointer transition-all duration-200",
          activeTab === "pending"
            ? "ring-2 ring-amber-500 ring-offset-2"
            : "bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 dark:bg-gradient-to-br dark:from-amber-300 dark:to-amber-400 dark:border-amber-500",
        )}
        onClick={() => setActiveTab(activeTab === "pending" ? "all" : "pending")}
      >
        <CardHeader className="pb-2">
          <CardDescription className="text-gray-700 dark:text-gray-500">Pending</CardDescription>
          <CardTitle className="text-2xl text-yellow-800">
            {isLoading ? <Skeleton className="h-8 w-16" /> : counts.pending}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card
        className={cn(
          "cursor-pointer transition-all duration-200",
          activeTab === "processing"
            ? "ring-2 ring-blue-500 ring-offset-2"
            : "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200  dark:bg-gradient-to-br dark:from-blue-300 dark:to-blue-400 dark:border-blue-500",
        )}
        onClick={() => setActiveTab(activeTab === "processing" ? "all" : "processing")}
      >
        <CardHeader className="pb-2">
          <CardDescription className="text-gray-700 dark:text-gray-600">Processing</CardDescription>
          <CardTitle className="text-2xl text-blue-800">
            {isLoading ? <Skeleton className="h-8 w-16" /> : counts.processing}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card
        className={cn(
          "cursor-pointer transition-all duration-200",
          activeTab === "completed"
            ? "ring-2 ring-indigo-500 ring-offset-2"
            : "bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 dark:bg-gradient-to-br dark:from-indigo-300 dark:to-indigo-400 dark:border-indigo-500",
        )}
        onClick={() => setActiveTab(activeTab === "completed" ? "all" : "completed")}
      >
        <CardHeader className="pb-2">
          <CardDescription className="text-gray-700 dark:text-gray-600" >Completed</CardDescription>
          <CardTitle className="text-2xl text-purple-800">
            {isLoading ? <Skeleton className="h-8 w-16" /> : counts.completed}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card
        className={cn(
          "cursor-pointer transition-all duration-200",
          activeTab === "delivered"
            ? "ring-2 ring-emerald-500 ring-offset-2"
            : "bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 dark:bg-gradient-to-br dark:from-emerald-300 dark:to-emerald-400 dark:border-emerald-500",
        )}
        onClick={() => setActiveTab(activeTab === "delivered" ? "all" : "delivered")}
      >
        <CardHeader className="pb-2">
          <CardDescription className="text-gray-700 dark:text-gray-600" >Delivered</CardDescription>
          <CardTitle className="text-2xl text-green-800">
            {isLoading ? <Skeleton className="h-8 w-16" /> : counts.delivered}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card
        className={cn(
          "cursor-pointer transition-all duration-200",
          activeTab === "cancelled"
            ? "ring-2 ring-rose-500 ring-offset-2"
            : "bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200 dark:bg-gradient-to-br dark:from-rose-300 dark:to-rose-400 dark:border-rose-500",
        )}
        onClick={() => setActiveTab(activeTab === "cancelled" ? "all" : "cancelled")}
      >
        <CardHeader className="pb-2">
          <CardDescription className="text-gray-700 dark:text-gray-600">Cancelled</CardDescription>
          <CardTitle className="text-2xl text-red-800">
            {isLoading ? <Skeleton className="h-8 w-16" /> : counts.cancelled}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  )
}

function OrdersPage() {
  const router = useRouter()
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  
  // Get from store only the values we need
  const { filters, setFilters, resetFilters } = useOrderStore()
  const { token, _hasRehydrated } = useAuthStore()
  
  // Use React Query's queryClient for cache invalidation
  const queryClient = useQueryClient()

  // Helper functions for status colors - memoized to prevent re-renders
  const getStatusColor = (status: string) => {
    return statusColorMap[status]?.button || defaultStatusStyle.button
  }

  const getStatusBadgeColor = (status: string) => {
    return statusColorMap[status]?.badge || defaultStatusStyle.badge
  }

  // Fetch orders query using React Query
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],

    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!res.ok) throw new Error("Failed to fetch orders");
      
      const ordersData = await res.json();
      
      if (Array.isArray(ordersData) && ordersData.length > 0) {
        // Batch the product fetches into a single Promise.all
        const enrichedOrders = await Promise.all(
          ordersData.map(async (order: Order) => {
            // Create an array of promises for all items in this order
            const productPromises = order.items.map(async (item) => {
              try {
                // Use React Query's queryClient to check if we already have the product data
                const cachedProduct = queryClient.getQueryData(['product', item.productId]);
                if (cachedProduct) {
                  return { ...item, product: cachedProduct };
                }
                
                const productRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${item.productId}`, {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                });
                
                if (!productRes.ok) throw new Error("Failed to fetch product");
                
                const productData = await productRes.json();
                
                // Cache the product data for future use
                queryClient.setQueryData(['product', item.productId], productData);
                
                return { ...item, product: productData };
              } catch (error) {
                console.error(`Error fetching product ${item.productId}:`, error);
                return { ...item, product: { title: "Unknown Product" } };
              }
            });

            // Wait for all product fetches for this order to complete
            const updatedItems = await Promise.all(productPromises);
            return { ...order, items: updatedItems };
          })
        );

        return enrichedOrders;
      }
      
      return [];
    },
    enabled: !!token && _hasRehydrated,
    refetchOnWindowFocus: false,
  });

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, newStatus }: { orderId: string; newStatus: string }) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update order");
      return { orderId, newStatus };
    },
    onSuccess: ({ orderId, newStatus }) => {
      // Update cache with the new status
      queryClient.setQueryData(['orders'], (old: Order[]) =>
        old.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order))
      );
      toast.success(`Order ${orderId} status changed to ${newStatus}`);
      setIsViewDialogOpen(false);
    },
    onError: () => {
      toast.error("Failed to update order.");
    },
  });

  // Memoize the filtered orders to prevent recalculation on every render
  const filteredOrders = useMemo(() => {
    return (orders || []).filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(filters.search.toLowerCase()) ||
        order.shippingAddress.phone.includes(filters.search);

      const matchesStatus = !filters.status || order.status === filters.status;

      const matchesTab =
        activeTab === "all" ||
        (activeTab === "pending" && order.status === "PENDING") ||
        (activeTab === "processing" && order.status === "PROCESSING") ||
        (activeTab === "completed" && order.status === "COMPLETED") ||
        (activeTab === "delivered" && order.status === "DELIVERED") ||
        (activeTab === "cancelled" && order.status === "CANCELLED");

      let matchesDateRange = true;
      if (filters.dateRange[0] && filters.dateRange[1]) {
        const orderDate = new Date(order.createdAt);
        const startDate = filters.dateRange[0];
        const endDate = filters.dateRange[1];
        matchesDateRange = orderDate >= startDate && orderDate <= endDate;
      }

      return matchesSearch && matchesStatus && matchesDateRange && matchesTab;
    });
  }, [orders, filters.search, filters.status, filters.dateRange, activeTab]);

  // Handle status change
  const updateOrderStatus = (orderId: string, newStatus: string) => {
    updateOrderStatusMutation.mutate({ orderId, newStatus });
  };

  // Handle refresh - simply refetch the orders query
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    toast.success("Refreshing orders...");
  };

  return (
    <>
      <Header />
      <DashboardLayout>
        <div className="container mx-auto px-4 py-6 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Orders Management</h1>
              <p className="text-muted-foreground mt-1">View and manage all customer orders</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <Filter className="h-4 w-4" />
                Filters
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={cn("h-4 w-4", { "animate-spin": isLoading })} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Dashboard Cards - Extracted to a separate component */}
          <OrderCounters 
            orders={orders || []} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            isLoading={isLoading} 
          />

          {/* Filters */}
          {isFilterOpen && (
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Filter Orders</CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => setIsFilterOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4" />
                    <Input
                      placeholder="Search orders by ID or phone..."
                      className="pl-8"
                      value={filters.search}
                      onChange={(e) => setFilters({ search: e.target.value })}
                    />
                  </div>
                  <Select value={filters.status || "all"} onValueChange={(value) => setFilters({ status: value === "all" ? "" : value })}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full md:w-[240px] justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateRange[0] && filters.dateRange[1] ? (
                          <>
                            {filters.dateRange[0].toLocaleDateString()} - {filters.dateRange[1].toLocaleDateString()}
                          </>
                        ) : (
                          <span>Select date range</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        selected={{
                          from: filters.dateRange[0] || undefined,
                          to: filters.dateRange[1] || undefined,
                        }}
                        onSelect={(range) =>
                          setFilters({
                            dateRange: [range?.from || null, range?.to || null],
                          })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Button variant="outline" onClick={resetFilters}>
                    Reset Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Orders Table */}
          <Card className="border border-slate-200 dark:border-zinc-700 shadow-sm overflow-hidden">
            <CardHeader className="pb-0">
              {/* Wrap Tabs in a horizontal scrolling container */}
              <div className="overflow-x-auto">
                <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
                  {/* Use flex on mobile, grid on larger screens */}
                  <TabsList className="flex sm:grid sm:grid-cols-6 mb-4 space-x-2 sm:space-x-0">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="pending" className="text-amber-600">
                      Pending
                    </TabsTrigger>
                    <TabsTrigger value="processing" className="text-blue-600">
                      Processing
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="text-indigo-600">
                      Completed
                    </TabsTrigger>
                    <TabsTrigger value="delivered" className="text-emerald-600">
                      Delivered
                    </TabsTrigger>
                    <TabsTrigger value="cancelled" className="text-rose-600">
                      Cancelled
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-md border-0">
                  {/* Wrap table in a scrollable container */}
                  <div className="overflow-x-auto">
                    <Table className="min-w-[800px]">
                      <TableHeader>
                        <TableRow className="bg-slate-50 hover:bg-slate-50 dark:bg-zinc-800">
                          <TableHead className="font-semibold">Order ID</TableHead>
                          <TableHead className="font-semibold">Product</TableHead>
                          <TableHead className="font-semibold">Customer</TableHead>
                          <TableHead className="font-semibold">Date</TableHead>
                          <TableHead className="font-semibold">Status</TableHead>
                          <TableHead className="font-semibold text-right">Total</TableHead>
                          <TableHead className="font-semibold text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrders.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-12">
                              <div className="flex flex-col items-center justify-center">
                                <ClipboardList className="h-12 w-12 mb-2" />
                                <p className="text-muted-foreground font-medium">No orders found</p>
                                <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
                                {activeTab !== "all" && (
                                  <Button variant="link" className="mt-2" onClick={() => setActiveTab("all")}>
                                    View all orders
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredOrders.slice(0, 30).map((order) => (
                            <TableRow key={order.id} className="group">
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <Package className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-mono">{order.id.slice(0, 8)}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="max-w-[200px] truncate font-medium">
                                  {order.items[0]?.product?.title || "Unknown Product"}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {order.items.length > 1 ? `+${order.items.length - 1} more items` : ""}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">{order.shippingAddress.phone}</div>
                                <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                                  {order.shippingAddress.address}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(order.createdAt).toLocaleTimeString()}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={cn("font-medium", getStatusBadgeColor(order.status))}>
                                  {order.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {formatCurrency(order.totalPrice)}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => {
                                      setSelectedOrder(order)
                                      setIsViewDialogOpen(true)
                                    }}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setSelectedOrder(order)
                                          setIsViewDialogOpen(true)
                                        }}
                                      >
                                        <Eye className="mr-2 h-4 w-4" />
                                        View Details
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      {order.status === "PENDING" && (
                                        <>
                                          <DropdownMenuItem onClick={() => updateOrderStatus(order.id, "ACCEPTED")}>
                                            ✅ Confirm Order
                                          </DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => updateOrderStatus(order.id, "REJECTED")}>
                                            ❌ Reject Order
                                          </DropdownMenuItem>
                                        </>
                                      )}
                                      {order.status === "ACCEPTED" && (
                                        <DropdownMenuItem onClick={() => router.push(`/inventory/orders/${order.id}`)}>
                                          📦 Assign Inventory
                                        </DropdownMenuItem>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>


          {/* View Order Dialog - Only render when open */}
          {isViewDialogOpen && selectedOrder && (
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
              <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                  <DialogTitle className="text-xl">Order Details</DialogTitle>
                  <DialogDescription>
                    <span className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-sm">{selectedOrder.id}</span>
                      <span>•</span>
                      <span>{formatDate(selectedOrder.createdAt)}</span>
                    </span>
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <Card className="border shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Customer Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div>
                            <Label className="text-xs text-muted-foreground">Phone</Label>
                            <p className="font-medium">{selectedOrder.shippingAddress.phone}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Shipping Address</Label>
                            <p className="font-medium">{selectedOrder.shippingAddress.address}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Order Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div>
                            <Label className="text-xs text-muted-foreground">Current Status</Label>
                            <div className="mt-1">
                              <Badge className={cn("text-sm px-3 py-1", getStatusBadgeColor(selectedOrder.status))}>
                                {selectedOrder.status}
                              </Badge>
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Order Timeline</Label>
                            <div className="mt-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                <p className="text-sm">Order Created - {formatDate(selectedOrder.createdAt)}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="border shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Order Items</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="font-medium">Product</TableHead>
                            <TableHead className="font-medium text-right">Quantity</TableHead>
                            <TableHead className="font-medium text-right">Unit Price</TableHead>
                            <TableHead className="font-medium text-right">Subtotal</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedOrder.items.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                <div className="font-medium">{item.product?.title || "Unknown Product"}</div>
                                <div className="text-xs text-muted-foreground font-mono">{item.id.slice(0, 8)}</div>
                              </TableCell>
                              <TableCell className="text-right">{item.quantity}</TableCell>
                              <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(item.totalPrice)}</TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell colSpan={3} className="text-right font-medium">
                              Total
                            </TableCell>
                            <TableCell className="text-right font-bold">
                              {formatCurrency(selectedOrder.totalPrice)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>

                {/* If order is PENDING, show Accept/Reject buttons */}
                {selectedOrder?.status === "PENDING" && (
                  <>
                    <Button
                      className={getStatusColor("ACCEPTED")}
                      onClick={() => updateOrderStatus(selectedOrder.id, "ACCEPTED")}
                    >
                      ✅ Accept Order
                    </Button>
                    <Button
                      className={getStatusColor("REJECTED")}
                      onClick={() => updateOrderStatus(selectedOrder.id, "REJECTED")}
                    >
                      ❌ Reject Order
                    </Button>
                  </>
                )}

                {/* If order is ACCEPTED, show Assign Inventory button */}
                {selectedOrder?.status === "" ? (
                  <Button
                    className={getStatusColor("PROCESSING")}
                    onClick={() => router.push(`/inventory/orders/${selectedOrder.id}`)}
                  >
                    📦 Assign Inventory
                  </Button>
                ) : selectedOrder?.status === "IN_PROGRESS" ? (
                  <Button
                    className={getStatusColor("SHIPPED")}
                    onClick={() => router.push(`/inventory/orders/${selectedOrder.id}/shipment/${selectedOrder.id}`)}
                  >
                    🚚 Assign Shipment
                  </Button>
                ) : null}
              </DialogFooter>
            </DialogContent>
          </Dialog>
          )}
          </div>
      </DashboardLayout>
    </>
  )
}

export default OrdersPageWithQueryClient;