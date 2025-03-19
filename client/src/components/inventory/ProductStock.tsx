"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Package, BarChart2, AlertTriangle } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import dynamic from "next/dynamic";
import { useAuthStore } from "@/store/authStore";

// Dynamically import the map component to avoid SSR issues
const WarehouseMap = dynamic(() => import("./warehouse-map"), { ssr: false });

interface Warehouse {
  id: string;
  name: string;
  location: string;
  capacity: number;
  contactInfo: { phone: string };
  coordinates: { latitude: number; longitude: number };
  availableCapacity: number;
  usedCapacity: number;
  totalStock: number;
}

interface StockData {
  id: string;
  warehouseId: string;
  productId: string;
  quantity: number;
  reorderLevel: number;
  lastReorder: string | null;
  createdAt: string;
  updatedAt: string;
  warehouse: Warehouse;
}

interface Props {
  productId: string;
}

export default function ProductStock({ productId }: Props) {
  const [stock, setStock] = useState<StockData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(null);
  const { token } = useAuthStore()


  useEffect(() => {
    async function fetchStock() {
        try {
          console.log('ye hai ', token)
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stock/product/${productId}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (!response.ok) throw new Error("Failed to fetch stock data");

        const data: StockData[] = await response.json();
        setStock(data);
        if (data.length > 0) {
          setSelectedWarehouse(data[0].warehouseId);
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchStock();
  }, [productId]);

  if (loading) return (
    <Card className="w-full">
      <CardContent className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading stock data...</p>
        </div>
      </CardContent>
    </Card>
  );
  
  if (error) return (
    <Card className="w-full border-red-200">
      <CardContent className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-2 text-red-500">
          <AlertTriangle className="h-8 w-8" />
          <p>Error: {error}</p>
        </div>
      </CardContent>
    </Card>
  );
  
  if (!stock || stock.length === 0) return (
    <Card className="w-full">
      <CardContent className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Package className="h-8 w-8" />
          <p>No stock available for this product.</p>
        </div>
      </CardContent>
    </Card>
  );

  const selectedStockItem = stock.find(item => item.warehouseId === selectedWarehouse) || stock[0];
  const warehouseData = selectedStockItem.warehouse;
  const capacityPercentage = (warehouseData.usedCapacity / warehouseData.capacity) * 100;
  const isLowStock = selectedStockItem.quantity <= selectedStockItem.reorderLevel;

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Package className="h-5 w-5 text-primary" />
          Stock Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2 mb-4">
              {stock.map((item) => (
                <Badge 
                  key={item.warehouseId}
                  variant={item.warehouseId === selectedWarehouse ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/90 transition-colors"
                  onClick={() => setSelectedWarehouse(item.warehouseId)}
                >
                  {item.warehouse.name}
                </Badge>
              ))}
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Current Stock</h3>
                {isLowStock && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Low Stock
                  </Badge>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-muted/40 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-primary">{selectedStockItem.quantity}</div>
                  <div className="text-sm text-muted-foreground">Current Quantity</div>
                </div>
                
                <div className="bg-muted/40 p-4 rounded-lg">
                  <div className="text-3xl font-bold">{selectedStockItem.reorderLevel}</div>
                  <div className="text-sm text-muted-foreground">Reorder Level</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Last Reorder</span>
                  <span className="font-medium">
                    {selectedStockItem.lastReorder 
                      ? new Date(selectedStockItem.lastReorder).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })
                      : "N/A"}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Last Updated</span>
                  <span className="font-medium">
                    {new Date(selectedStockItem.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-primary" />
                Warehouse Capacity
              </h3>
              <Progress value={capacityPercentage} className="h-2" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Used: {warehouseData.usedCapacity}</span>
                <span className="text-muted-foreground">Available: {warehouseData.capacity - warehouseData.usedCapacity}</span>
                <span className="font-medium">Total: {warehouseData.capacity}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-muted/40 p-4 rounded-lg space-y-3">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Warehouse Information
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">{warehouseData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium">{warehouseData.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contact</span>
                  <span className="font-medium flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {warehouseData.contactInfo.phone}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Products</span>
                  <span className="font-medium">{warehouseData.totalStock}</span>
                </div>
              </div>
            </div>
            
            <div className="h-[200px] rounded-lg overflow-hidden border">
              <WarehouseMap 
                latitude={warehouseData.coordinates.latitude} 
                longitude={warehouseData.coordinates.longitude} 
                name={warehouseData.name}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
