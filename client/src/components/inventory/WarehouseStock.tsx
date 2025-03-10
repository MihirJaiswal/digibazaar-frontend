"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, Search, AlertTriangle, ArrowUpDown, Tag, DollarSign, Percent, Clock, ShoppingCart, Filter, RefreshCw } from 'lucide-react';
import dynamic from "next/dynamic";
import { useAuthStore } from "@/store/authStore";
import Image from "next/image";

// Dynamically import chart components to avoid SSR issues
const StockDistributionChart = dynamic(() => import("@/components/inventory/stock-distribution-chart"), { ssr: false });
const StockValueChart = dynamic(() => import("@/components/inventory/stock-value-chart"), { ssr: false });

interface Product {
  id: string;
  storeId: string;
  title: string;
  description: string;
  price: number;
  sku: string;
  mainImage: string;
  stock: number;
  costPerItem: number;
  profit: number;
  margin: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface StockItem {
  id: string;
  warehouseId: string;
  productId: string;
  quantity: number;
  reorderLevel: number;
  lastReorder: string | null;
  createdAt: string;
  updatedAt: string;
  product: Product;
}

interface Props {
  warehouseId: string;
}

export default function WarehouseStock({ warehouseId }: Props) {
  const [stockData, setStockData] = useState<StockItem[]>([]);
  const [filteredData, setFilteredData] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { token } = useAuthStore();
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Product | "quantity";
    direction: "ascending" | "descending";
  } | null>(null);
  const [stockStats, setStockStats] = useState({
    totalItems: 0,
    totalValue: 0,
    lowStockItems: 0,
    averageMargin: 0
  });

  useEffect(() => {
    async function fetchWarehouseStock() {
      try {
        console.log('this is our',token)
        const response = await fetch(`http://localhost:8800/api/stock/warehouse/${warehouseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch warehouse stock data");

        const result: StockItem[] = await response.json();
        setStockData(result);
        setFilteredData(result);
        
        // Calculate stock statistics
        const totalItems = result.reduce((sum, item) => sum + item.quantity, 0);
        const totalValue = result.reduce((sum, item) => sum + (item.quantity * item.product.price), 0);
        const lowStockItems = result.filter(item => item.quantity <= (item.reorderLevel || 5)).length;
        
        const totalMargin = result.reduce((sum, item) => sum + item.product.margin, 0);
        const averageMargin = result.length > 0 ? totalMargin / result.length : 0;
        
        setStockStats({
          totalItems,
          totalValue,
          lowStockItems,
          averageMargin
        });
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchWarehouseStock();
  }, [warehouseId]);

  // Handle search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredData(stockData);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = stockData.filter(item => 
        item.product.title.toLowerCase().includes(query) || 
        item.product.sku?.toLowerCase().includes(query) ||
        item.product.description?.toLowerCase().includes(query)
      );
      setFilteredData(filtered);
    }
  }, [searchQuery, stockData]);

  // Handle sorting
  const handleSort = (key: keyof Product | "quantity") => {
    let direction: "ascending" | "descending" = "ascending";
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    
    setSortConfig({ key, direction });
    
    const sortedData = [...filteredData].sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      if (key === "quantity") {
        aValue = a.quantity;
        bValue = b.quantity;
      } else {
        aValue = a.product[key];
        bValue = b.product[key];
      }
      
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      if (typeof aValue === "string") {
        const comparison = aValue.localeCompare(bValue);
        return direction === "ascending" ? comparison : -comparison;
      } else {
        return direction === "ascending" ? aValue - bValue : bValue - aValue;
      }
    });
    
    setFilteredData(sortedData);
  };

  // Prepare chart data
  const prepareDistributionData = () => {
    const productLabels = stockData.map(item => item.product.title);
    const quantities = stockData.map(item => item.quantity);
    return { labels: productLabels, data: quantities };
  };
  
  const prepareValueData = () => {
    const productLabels = stockData.map(item => item.product.title);
    const values = stockData.map(item => item.quantity * item.product.price);
    return { labels: productLabels, data: values };
  };

  if (loading) return (
    <Card className="w-full">
      <CardContent className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading warehouse stock data...</p>
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
  
  if (stockData.length === 0) return (
    <Card className="w-full">
      <CardContent className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Package className="h-8 w-8" />
          <p>No stock available in this warehouse.</p>
        </div>
      </CardContent>
    </Card>
  );

  const distributionChartData = prepareDistributionData();
  const valueChartData = prepareValueData();

  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Package className="h-5 w-5 text-primary" />
            Warehouse Stock Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="bg-muted/40">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Items</p>
                    <p className="text-2xl font-bold">{stockStats.totalItems}</p>
                  </div>
                  <Package className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-muted/40">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Value</p>
                    <p className="text-2xl font-bold text-green-600">${stockStats.totalValue.toFixed(2)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-muted/40">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Low Stock Items</p>
                    <p className="text-2xl font-bold text-amber-600">{stockStats.lowStockItems}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-amber-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-muted/40">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Margin</p>
                    <p className="text-2xl font-bold">{stockStats.averageMargin.toFixed(2)}%</p>
                  </div>
                  <Percent className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="list" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="list">Stock List</TabsTrigger>
              <TabsTrigger value="distribution">Stock Distribution</TabsTrigger>
              <TabsTrigger value="value">Stock Value</TabsTrigger>
            </TabsList>
            
            <TabsContent value="list" className="pt-4">
              <div className="flex flex-col md:flex-row gap-4 mb-4 items-center justify-between">
                <div className="relative w-full md:w-1/3">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search products..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Filter className="h-4 w-4" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </Button>
                </div>
              </div>
              
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Image</TableHead>
                      <TableHead>
                        <Button 
                          variant="ghost" 
                          className="flex items-center gap-1 p-0 h-auto font-semibold"
                          onClick={() => handleSort("title")}
                        >
                          Product
                          <ArrowUpDown className="h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button 
                          variant="ghost" 
                          className="flex items-center gap-1 p-0 h-auto font-semibold"
                          onClick={() => handleSort("quantity")}
                        >
                          Quantity
                          <ArrowUpDown className="h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button 
                          variant="ghost" 
                          className="flex items-center gap-1 p-0 h-auto font-semibold"
                          onClick={() => handleSort("price")}
                        >
                          Price
                          <ArrowUpDown className="h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button 
                          variant="ghost" 
                          className="flex items-center gap-1 p-0 h-auto font-semibold"
                          onClick={() => handleSort("margin")}
                        >
                          Margin
                          <ArrowUpDown className="h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((item) => {
                      const isLowStock = item.quantity <= (item.reorderLevel || 5);
                      const isOutOfStock = item.quantity === 0;
                      
                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            {item.product.mainImage ? (
                              <Image
                                src={item.product.mainImage || "/placeholder.svg"} 
                                alt={item.product.title} 
                                width={40}
                                height={40}
                                loading="lazy"
                                quality={100}
                                className="w-10 h-10 object-cover rounded-md"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center">
                                <Package className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{item.product.title}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Tag className="h-3 w-3" />
                              {item.product.sku || "No SKU"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className={`font-medium ${isLowStock ? 'text-amber-600' : ''} ${isOutOfStock ? 'text-red-600' : ''}`}>
                              {item.quantity}
                            </div>
                            {item.reorderLevel && (
                              <div className="text-xs text-muted-foreground">
                                Reorder at: {item.reorderLevel}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">${item.product.price.toFixed(2)}</div>
                            <div className="text-xs text-muted-foreground">
                              Cost: ${item.product.costPerItem?.toFixed(2)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{item.product.margin.toFixed(2)}%</div>
                            <div className="text-xs text-green-600">
                              ${item.product.profit.toFixed(2)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {isOutOfStock ? (
                              <Badge variant="destructive">Out of Stock</Badge>
                            ) : isLowStock ? (
                              <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50">
                                Low Stock
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50">
                                In Stock
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="distribution" className="pt-4">
              <div className="h-[400px]">
                <StockDistributionChart 
                  labels={distributionChartData.labels} 
                  data={distributionChartData.data} 
                />
              </div>
            </TabsContent>
            
            <TabsContent value="value" className="pt-4">
              <div className="h-[400px]">
                <StockValueChart 
                  labels={valueChartData.labels} 
                  data={valueChartData.data} 
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-xl">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Product Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {filteredData.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 flex items-center justify-center bg-muted/20">
                    {item.product.mainImage ? (
                      <Image
                        src={item.product.mainImage || "/placeholder.svg"} 
                        alt={item.product.title} 
                        width={100} height={100}
                        loading="lazy"
                        quality={100}
                        className="max-h-[150px] object-contain"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-muted rounded-md flex items-center justify-center">
                        <Package className="h-10 w-10 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 md:col-span-2">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-bold">{item.product.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.product.description}</p>
                      </div>
                      {item.quantity <= (item.reorderLevel || 5) && (
                        <Badge variant={item.quantity === 0 ? "destructive" : "outline"} className="ml-2">
                          {item.quantity === 0 ? "Out of Stock" : "Low Stock"}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Price</p>
                        <p className="font-semibold">${item.product.price.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Quantity</p>
                        <p className="font-semibold">{item.quantity}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">SKU</p>
                        <p className="font-semibold">{item.product.sku || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Value</p>
                        <p className="font-semibold">${(item.quantity * item.product.price).toFixed(2)}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Stock Level</span>
                        <span>{item.quantity} / {Math.max(item.quantity, item.reorderLevel || 10)}</span>
                      </div>
                      <Progress 
                        value={(item.quantity / Math.max(item.quantity, item.reorderLevel || 10)) * 100} 
                        className="h-2"
                      />
                    </div>
                    
                    <div className="flex justify-between items-center mt-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Last Reorder: {item.lastReorder ? new Date(item.lastReorder).toLocaleDateString() : "N/A"}
                        </span>
                      </div>
                      <Button variant="outline" size="sm">View Details</Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
