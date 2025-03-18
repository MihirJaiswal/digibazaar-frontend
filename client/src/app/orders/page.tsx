"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import Image from "next/image";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Package, Calendar, CreditCard, Truck, MapPin, ShoppingBag, AlertCircle, ChevronRight } from 'lucide-react';
import Header from "@/components/global/Header";

// Define interfaces for the API response data
interface ShippingAddress {
  city: string;
  state: string;
  address: string;
  country: string;
  fullName: string;
  postalCode: string;
}

interface Product {
  mainImage: string;
  title: string;
}

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  product: Product;
}

interface Order {
  id: string;
  createdAt: string;
  items: OrderItem[];
  totalPrice: number;
  paymentStatus: string;
  shippingAddress: ShippingAddress;
  trackingNumber?: string | null;
  status: string;
  store: {
    id: string;
    name: string;
    logo: string;
    description: string;
  };
  paymentIntent: string;
  shipment: any;
  shippingMethod?: any;
  shippingMethodId?: string;
  updatedAt: string;
  userId: string;
}

export default function UserOrders() {
  const { token } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!token) return;

    const fetchOrders = async () => {
      try {
        const response = await fetch("http://localhost:8800/api/orders/user/orders", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch orders");
        }
        const data: Order[] = await response.json();
        console.log("API response:", data);
        setOrders(data);
      } catch (err: any) {
        console.error("Error fetching orders:", err);
        setError(err.message || "Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  // Format date
  const formatDate = (dateString: string): string =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  // Format price in INR
  const formatPrice = (price: number): string =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price);

  // Return badge variant based on order status
  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "PENDING":
        return "secondary";
      case "IN_PROGRESS":
        return "default";
      case "COMPLETED":
        return "outline";
      case "CANCELLED":
        return "destructive";
      default:
        return "outline";
    }
  };

  const handleOpenModal = (order: Order) => {
    setSelectedOrder(order);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader className="flex flex-row items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Error Loading Orders</h2>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
              Try Again
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <>
      <Header/>
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>
        <Card className="text-center p-8">
          <CardContent className="pt-6 pb-8 flex flex-col items-center gap-4">
            <ShoppingBag className="h-16 w-16 text-muted-foreground" />
            <h2 className="text-xl font-semibold">No Orders Yet</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              You haven't placed any orders yet. Start shopping to see your orders here.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/store">
              <Button size="lg" className="px-8">
                Start Shopping
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
      </>
    );
  }

  return (
   <div className="min-h-screen bg-white dark:bg-zinc-900">
   <Header/>
   <div className="container mx-auto px-4 py-12 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>
      
      <div className="space-y-6">
        {orders.map((order) => (
          <Card key={order.id} className="overflow-hidden">
            <CardHeader className="bg-muted/50 px-6 py-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Order #{order.id.substring(0, 8)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</span>
                  </div>
                </div>
                <Badge variant={getStatusVariant(order.status)}>
                  {order.status}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex gap-4 flex-1">
                  <div className="h-20 w-20 relative rounded-md overflow-hidden bg-muted flex-shrink-0">
                    {order.items[0]?.product.mainImage ? (
                      <Image
                        src={order.items[0].product.mainImage || "/placeholder.svg"}
                        alt={order.items[0].product.title}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full w-full text-muted-foreground">
                        No Image
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col justify-center">
                    <h3 className="font-medium line-clamp-1">{order.items[0]?.product.title || "Product"}</h3>
                    <p className="text-sm text-muted-foreground">
                      {order.items.length > 1 
                        ? `+ ${order.items.length - 1} more item${order.items.length > 2 ? 's' : ''}` 
                        : ''}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{order.paymentStatus}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col md:items-end justify-center gap-2">
                  <p className="font-medium">{formatPrice(order.totalPrice)}</p>
                  <Button 
                    onClick={() => handleOpenModal(order)}
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    View Details
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Order Details Dialog */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={(open) => { if (!open) handleCloseModal(); }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">Order Details</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Order Header Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="font-medium">{selectedOrder.id.substring(0, 8)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Order Date</p>
                  <p className="font-medium">{formatDate(selectedOrder.createdAt)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={getStatusVariant(selectedOrder.status)}>
                    {selectedOrder.status}
                  </Badge>
                </div>
              </div>
              
              <Separator />
              
              {/* Store Info */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 relative rounded-full overflow-hidden bg-muted">
                  {selectedOrder.store.logo ? (
                    <Image
                      src={selectedOrder.store.logo || "/placeholder.svg"}
                      alt={selectedOrder.store.name}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full w-full text-muted-foreground">
                      S
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-medium">{selectedOrder.store.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">{selectedOrder.store.description}</p>
                </div>
              </div>
              
              <Separator />
              
              {/* Order Items */}
              <div>
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  Order Items
                </h3>
                <div className="space-y-4">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex gap-4 p-3 rounded-lg border">
                      <div className="h-20 w-20 relative rounded-md overflow-hidden bg-muted flex-shrink-0">
                        {item.product.mainImage ? (
                          <Image
                            src={item.product.mainImage || "/placeholder.svg"}
                            alt={item.product.title}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full w-full text-muted-foreground">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col justify-center flex-1">
                        <h4 className="font-medium">{item.product.title}</h4>
                        <div className="flex justify-between mt-1">
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                          <p className="font-medium">{formatPrice(item.unitPrice)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              {/* Order Summary */}
              <div>
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Payment Details
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <p className="text-muted-foreground">Subtotal</p>
                    <p>{formatPrice(selectedOrder.totalPrice)}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-muted-foreground">Payment Status</p>
                    <p>{selectedOrder.paymentStatus}</p>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium">
                    <p>Total</p>
                    <p>{formatPrice(selectedOrder.totalPrice)}</p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Shipping Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Shipping Address
                  </h3>
                  <div className="p-4 rounded-lg border">
                    <p className="font-medium">{selectedOrder.shippingAddress.fullName}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedOrder.shippingAddress.address}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedOrder.shippingAddress.country} - {selectedOrder.shippingAddress.postalCode}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Shipping Details
                  </h3>
                  <div className="p-4 rounded-lg border">
                    {selectedOrder.trackingNumber ? (
                      <>
                        <p className="text-sm text-muted-foreground">Tracking Number</p>
                        <p className="font-medium">{selectedOrder.trackingNumber}</p>
                      </>
                    ) : (
                      <p className="text-muted-foreground">No tracking information available yet</p>
                    )}
                    
                    {selectedOrder.shippingMethod && (
                      <div className="mt-2">
                        <p className="text-sm text-muted-foreground">Shipping Method</p>
                        <p className="font-medium">{selectedOrder.shippingMethod}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseModal}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
   </div>
  );
}
