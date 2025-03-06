import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InfoIcon, Clock, Phone, MapPin, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

interface Address {
  phone: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

interface OrderDetailsProps {
  id: string;
  createdAt: string;
  totalPrice: number;
  status: string;
  shippingAddress: Address;
  formatDate: (date: string) => string;
  formatCurrency: (amount: number) => string;
}

const statusColors: Record<string, string> = {
  ACCEPTED: "bg-blue-500",
  PENDING: "bg-amber-500",
  PROCESSING: "bg-purple-500",
  SHIPPED: "bg-indigo-500",
  DELIVERED: "bg-green-500",
  CANCELLED: "bg-red-500",
};

const OrderDetails: React.FC<OrderDetailsProps> = ({
  id,
  createdAt,
  totalPrice,
  status,
  shippingAddress,
  formatDate,
  formatCurrency,
}) => {
  return (
    <Card className="overflow-hidden shadow-card">
      <CardHeader className="bg-secondary/30 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl">
            <InfoIcon className="h-5 w-5 text-primary" />
            Order Information
          </CardTitle>
          <Badge className={cn("text-white", statusColors[status] || "bg-gray-500")}>
            {status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex items-start gap-3">
            <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground font-medium">Order ID</p>
              <p className="font-medium">{id}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground font-medium">Date</p>
              <p className="font-medium">{formatDate(createdAt)}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground font-medium">Phone</p>
              <p className="font-medium">{shippingAddress.phone}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground font-medium">Address</p>
              <p className="font-medium">{shippingAddress.address}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 md:col-span-2">
            <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Price</p>
              <p className="font-medium text-lg text-primary">{formatCurrency(totalPrice)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderDetails;
