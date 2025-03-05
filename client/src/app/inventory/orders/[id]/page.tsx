"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/app/inventory/lib/utils";

interface Warehouse {
  id: string;
  name: string;
  location: string;
}

interface InventoryItem {
  id: string;
  productId: string;
  quantity: number;
}

interface SelectedItem {
  productId: string;
  quantity: number;
}

interface Product {
  id: string;
  title: string;
  mainImage: string;
  price: number;
}

interface Order {
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
    product?: Product;
  }[];
}

export default function AssignInventoryPage() {
  const { id: orderId } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [filteredWarehouses, setFilteredWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

  // Fetch order details along with product info
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const res = await fetch(`http://localhost:8800/api/orders/${orderId}`);
        const orderData: Order = await res.json();

        // Fetch product details for each item
        const productPromises = orderData.items.map(async (item) => {
          const productRes = await fetch(`http://localhost:8800/api/products/${item.productId}`);
          const productData: Product = await productRes.json();
          return { ...item, product: productData };
        });

        const updatedItems = await Promise.all(productPromises);
        setOrder({ ...orderData, items: updatedItems });
      } catch (error) {
        console.error("Error fetching order details:", error);
        toast.error("Failed to load order details");
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  // Fetch all warehouses
  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const res = await fetch("http://localhost:8800/api/warehouses");
        const data = await res.json();
        setWarehouses(data);
      } catch (error) {
        console.error("Error fetching warehouses:", error);
        toast.error("Failed to load warehouses");
      }
    };
    fetchWarehouses();
  }, []);

  // Filter warehouses that contain at least one of the ordered products
  useEffect(() => {
    const filterWarehousesWithStock = async () => {
      if (!order) return;

      const validWarehouses: Warehouse[] = [];
      for (const warehouse of warehouses) {
        const res = await fetch(
          `http://localhost:8800/api/warehouses/${warehouse.id}/stock`
        );
        const stockData: InventoryItem[] = await res.json();

        // Check if warehouse has at least one of the ordered products
        const hasOrderedProduct = stockData.some((item) =>
          order.items.some((orderedItem) => orderedItem.productId === item.productId)
        );
        if (hasOrderedProduct) validWarehouses.push(warehouse);
      }
      setFilteredWarehouses(validWarehouses);
    };

    filterWarehousesWithStock();
  }, [warehouses, order]);

  // Fetch inventory when warehouse is selected
// Fetch inventory when warehouse is selected
const handleWarehouseSelect = async (warehouseId: string) => {
    console.log("🏢 Selected Warehouse ID:", warehouseId); // Debug log
    setSelectedWarehouse(warehouseId);
  
    try {
      const res = await fetch(`http://localhost:8800/api/warehouses/${warehouseId}/stock`);
      const data: InventoryItem[] = await res.json();
  
      // Filter inventory to only show ordered products
      const filteredInventory = data.filter((item) =>
        order?.items.some((o) => o.productId === item.productId)
      );
  
      console.log("📦 Fetched Inventory:", filteredInventory); // Debug log
      setInventory(filteredInventory);
  
      // Automatically select all matching items
      const autoSelectedItems = filteredInventory.map((item) => ({
        productId: item.productId,
        quantity: order?.items.find((o) => o.productId === item.productId)?.quantity || 0,
      }));
  
      console.log("✅ Auto-selected Items:", autoSelectedItems); // Debug log
      setSelectedItems(autoSelectedItems);
    } catch (error) {
      console.error("❌ Error fetching warehouse stock:", error);
      toast.error("Failed to load inventory");
    }
  };
  
  // Assign inventory to order
  const handleAssignInventory = async () => {
    console.log("🚀 Attempting to assign inventory...");
    console.log("🏢 Selected Warehouse ID:", selectedWarehouse);
    console.log("📦 Selected Items:", selectedItems);
  
    if (!selectedWarehouse) {
      toast.error("Please select a warehouse");
      console.log("❌ Error: No warehouse selected.");
      return;
    }
  
    if (selectedItems.length === 0) {
      toast.error("Please select at least one product to assign");
      console.log("❌ Error: No products selected.");
      return;
    }
  
    // ✅ Add warehouseId to each item before sending
    const itemsWithWarehouse = selectedItems.map(item => ({
      ...item,
      warehouseId: selectedWarehouse // Add warehouse ID inside each item
    }));
  
    console.log("📤 Final API Payload:", {
      orderId,
      items: itemsWithWarehouse
    });
  
    try {
      const res = await fetch(`http://localhost:8800/api/orders/${orderId}/assign-stock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          items: itemsWithWarehouse
        }),
      });
  
      if (!res.ok) throw new Error("Failed to assign inventory");
  
      toast.success("Inventory assigned successfully!");
      console.log("✅ Inventory assigned successfully!");
  
      router.push(`/inventory/orders`);
    } catch (error) {
      console.error("❌ Error assigning inventory:", error);
      toast.error("Error assigning inventory");
    }
  };
  
  

  if (!order) return <p className="text-center">Loading order details...</p>;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>📦 Order Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <p><strong>Order ID:</strong> {order.id}</p>
          <p><strong>Date:</strong> {formatDate(order.createdAt)}</p>
          <p><strong>Phone:</strong> {order.shippingAddress.phone}</p>
          <p><strong>Address:</strong> {order.shippingAddress.address}</p>
          <div><strong>Status:</strong>  
            <Badge className="bg-green-500">{order.status}</Badge>
          </div>
          <p><strong>Total Price:</strong> {formatCurrency(order.totalPrice)}</p>
        </CardContent>
      </Card>

      {/* Ordered Products */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>📋 Ordered Products</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.productId}>
                  <TableCell>
                    <img src={item.product?.mainImage || './placeholder.png'} alt={item.product?.title || ''} className="h-10 w-10 object-cover" />
                  </TableCell>
                  <TableCell>{item.product?.title || ''}</TableCell>
                  <TableCell>{item.quantity || 0}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Warehouse Selection */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Select Warehouse</CardTitle>
        </CardHeader>
        <CardContent>
          <Select onValueChange={handleWarehouseSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Select a warehouse" />
            </SelectTrigger>
            <SelectContent>
              {filteredWarehouses.length > 0 ? (
                filteredWarehouses.map((warehouse) => (
                  <SelectItem key={warehouse.id} value={warehouse.id}>
                    {warehouse.name} - {warehouse.location}
                  </SelectItem>
                ))
              ) : (
                <p className="p-2 text-gray-500 text-sm">No warehouse has this product</p>
              )}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedWarehouse && (
        <Button onClick={handleAssignInventory} className="mt-4">
          ✅ Confirm Inventory Assignment
        </Button>
      )}
    </div>
  );
}
