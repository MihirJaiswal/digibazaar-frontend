"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/inventory/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, ClipboardList, Eye, MoreHorizontal, Plus, Search, Truck } from "lucide-react";
import { formatCurrency, formatDate, getStatusColor } from "@/app/inventory/lib/utils";
import { toast } from "sonner";
import { useOrderStore } from "@/app/inventory/store/OrderStore";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import Header from "@/components/global/Header";
import { useRouter } from "next/navigation";

// Order status options
const statusOptions = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

// Type definition for Order
type Order = {
  id: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  userId: string;
  shippingAddress: {
    phone: string;
    address: string;
  };
  items: {
    id: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    product?: {
      title: string;
    };
  }[];
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { filters, setFilters, resetFilters } = useOrderStore();

  // Fetch orders from API
  useEffect(() => {
    const fetchOrdersWithProducts = async () => {
      try {
        const res = await fetch("http://localhost:8800/api/orders");
        const ordersData = await res.json();
  
        // Fetch product details for each item in every order
        const enrichedOrders = await Promise.all(
          ordersData.map(async (order: Order) => {
            const productPromises = order.items.map(async (item) => {
              try {
                // ✅ Fetch product using productId instead of item.id
                const productRes = await fetch(`http://localhost:8800/api/products/${item.productId}`);
                const productData = await productRes.json();
                return { ...item, product: productData }; // Attach product data to the item
              } catch (error) {
                console.error(`Error fetching product ${item.productId}:`, error);
                return { ...item, product: { title: "Unknown Product" } }; // Fallback if API fails
              }
            });
  
            const updatedItems = await Promise.all(productPromises);
            return { ...order, items: updatedItems };
          })
        );
  
        setOrders(enrichedOrders);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Failed to load orders");
        setIsLoading(false);
      }
    };
  
    fetchOrdersWithProducts();
  }, []);
  
  

  // Filter orders based on search, status, and date range
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(filters.search.toLowerCase()) ||
      order.shippingAddress.phone.includes(filters.search)

    const matchesStatus = !filters.status || order.status === filters.status;

    let matchesDateRange = true;
    if (filters.dateRange[0] && filters.dateRange[1]) {
      const orderDate = new Date(order.createdAt);
      const startDate = filters.dateRange[0];
      const endDate = filters.dateRange[1];
      matchesDateRange = orderDate >= startDate && orderDate <= endDate;
    }

    return matchesSearch && matchesStatus && matchesDateRange;
  });

  // Handle status change
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`http://localhost:8800/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update order");

      setOrders((prevOrders) =>
        prevOrders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order))
      );

      toast.success(`Order ${orderId} status changed to ${newStatus}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update order.");
    }
  };

   const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500 text-white"; // Yellow for Pending
      case "ACCEPTED":
        return "bg-green-500 text-white"; // Green for Accepted
      case "REJECTED":
      case "CANCELLED":
        return "bg-red-500 text-white"; // Red for Rejected & Cancelled
      case "IN_PROGRESS":
        return "bg-blue-500 text-white"; // Blue for In Progress
      case "DELIVERED":
        return "bg-purple-500 text-white"; // Purple for Delivered
      case "REFUNDED":
        return "bg-gray-500 text-white"; // Gray for Refunded
      default:
        return "bg-gray-300 text-black"; // Default fallback color
    }
  };
  

  return (
    <>
      <Header />
      <DashboardLayout>
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Orders</h1>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders by ID or phone..."
                className="pl-8"
                value={filters.search}
                onChange={(e) => setFilters({ search: e.target.value })}
              />
            </div>
            <Select value={filters.status || "PENDING"} onValueChange={(value) => setFilters({ status: value })}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">All Statuses</SelectItem>
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

          {/* Orders Table */}
          <div className="border rounded-lg overflow-hidden">
          <Table>
  <TableHeader>
    <TableRow>
      <TableHead>Order ID</TableHead>
      <TableHead>Product</TableHead>
      <TableHead>Phone</TableHead>
      <TableHead>Address</TableHead>
      <TableHead>Date</TableHead>
      <TableHead>Status</TableHead>
      <TableHead className="text-right">Total</TableHead>
      <TableHead className="text-right">Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {filteredOrders.length === 0 ? (
      <TableRow>
        <TableCell colSpan={8} className="text-center py-8">
          <div className="flex flex-col items-center justify-center">
            <ClipboardList className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No orders found</p>
          </div>
        </TableCell>
      </TableRow>
    ) : (
      filteredOrders.map((order) => (
        <TableRow key={order.id}>
          {/* Shortened Order ID */}
          <TableCell className="font-medium">{order.id.slice(0, 4)}...</TableCell>

          {/* Product Name (Fetching from API) */}
          <TableCell>{order.items[0]?.product?.title || "Unknown Product"}</TableCell>

          <TableCell>{order.shippingAddress.phone}</TableCell>
          <TableCell>{order.shippingAddress.address}</TableCell>
          <TableCell>{formatDate(order.createdAt)}</TableCell>
          <TableCell>
            <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
          </TableCell>
          <TableCell className="text-right">{formatCurrency(order.totalPrice)}</TableCell>
          <TableCell className="text-right">
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
                    setSelectedOrder(order);
                    setIsViewDialogOpen(true);
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
          </TableCell>
        </TableRow>
      ))
    )}
  </TableBody>
</Table>


          </div>

          {/* View Order Dialog */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Order Details</DialogTitle>
                <DialogDescription>
                  {selectedOrder && `Order ${selectedOrder.id} - ${formatDate(selectedOrder.createdAt)}`}
                </DialogDescription>
              </DialogHeader>
              {selectedOrder && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Phone</h3>
                      <p className="font-medium">{selectedOrder.shippingAddress.phone}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                      <Badge className={cn("text-xs", getStatusColor(selectedOrder.status))}>
                        {selectedOrder.status}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Shipping Address</h3>
                    <p>{selectedOrder.shippingAddress.address}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Order Items</h3>
                    <div className="border rounded-md overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Item ID</TableHead>
                            <TableHead className="text-right">Quantity</TableHead>
                            <TableHead className="text-right">Unit Price</TableHead>
                            <TableHead className="text-right">Subtotal</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedOrder.items.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.id}</TableCell>
                              <TableCell className="text-right">{item.quantity}</TableCell>
                              <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(item.totalPrice)}</TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell colSpan={3} className="text-right font-medium">
                              Total
                            </TableCell>
                            <TableCell className="text-right font-bold">{formatCurrency(selectedOrder.totalPrice)}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Order Timeline</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <p className="text-sm">Order Created - {formatDate(selectedOrder.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter>
  {/* Close Button */}
  <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
    Close
  </Button>

  {/* If order is PENDING, show Accept/Reject buttons */}
  {selectedOrder?.status === "PENDING" && (
    <>
      <Button
        variant="default"
        className="bg-green-600 hover:bg-green-700"
        onClick={() => updateOrderStatus(selectedOrder.id, "ACCEPTED")}
      >
        ✅ Accept Order
      </Button>
      <Button
        variant="destructive"
        onClick={() => updateOrderStatus(selectedOrder.id, "REJECTED")}
      >
        ❌ Reject Order
      </Button>
    </>
  )}

  {/* If order is ACCEPTED, show Assign Inventory button */}
  {selectedOrder?.status === "ACCEPTED" && (
    <Button
      onClick={() => router.push(`/inventory/orders/${selectedOrder.id}`)}
    >
      📦 Assign Inventory
    </Button>
  )}
</DialogFooter>

            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>
    </>
  );
}