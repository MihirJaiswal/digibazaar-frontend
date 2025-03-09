"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, ArrowUp, Building2, Package2, Loader2, History, BarChart3 } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/store/authStore";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Warehouse {
  id: string;
  name: string;
  location: string;
  capacity: number;
  availableCapacity: number;
}

interface Product {
  id: string;
  title: string;
  sku: string;
  price: number;
  stock: number;
  image?: string;
}

interface StockTransaction {
  id: string;
  type: "in" | "out";
  productId: string;
  warehouseId: string;
  quantity: number;
  createdAt: string;
  product?: Product;
  warehouse?: Warehouse;
}

const StockManagementPage = () => {
  const router = useRouter();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouseId, setWarehouseId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [activeTab, setActiveTab] = useState("stock-movement");
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<StockTransaction[]>([]);
  const [warehouseStock, setWarehouseStock] = useState<any[]>([]);
  const { token } = useAuthStore()
  const [authChecked, setAuthChecked] = useState(false)

   useEffect(() => {
    // Set a flag to indicate we've checked auth status
    // This prevents premature fetch attempts
    const checkAuth = () => {
      setAuthChecked(true);
    };
    
    // Small timeout to allow auth store to initialize if it's async
    const timer = setTimeout(checkAuth, 300);
    return () => clearTimeout(timer);
  }, []);

  // Fetch Warehouses & Products
  const fetchData = useCallback(async () => {
    setFetchingData(true);
    try {
      console.log(token)
      const [warehousesRes, productsRes] = await Promise.all([
        fetch("http://localhost:8800/api/warehouses", {
          headers: { Authorization: `Bearer ${token}` },
        }).then((res) => res.json()),
      
        fetch("http://localhost:8800/api/products", {
          headers: { Authorization: `Bearer ${token}` },
        }).then((res) => res.json()),
      ]);
      setWarehouses(warehousesRes);
      setProducts(productsRes);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data. Please try again.");
    } finally {
      setFetchingData(false);
    }
  }, [token, authChecked]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch warehouse stock when warehouse is selected
  useEffect(() => {
    const fetchWarehouseStock = async () => {
      if (!warehouseId) return;
      
      try {
        const res = await fetch(`http://localhost:8800/api/warehouses/${warehouseId}/stock`,{
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setWarehouseStock(data);
        
        // Find and set the selected warehouse
        const warehouse = warehouses.find(w => w.id === warehouseId);
        if (warehouse) setSelectedWarehouse(warehouse);
      } catch (error) {
        console.error("Error fetching warehouse stock:", error);
      }
    };
    
    fetchWarehouseStock();
  }, [warehouseId, warehouses]);

  // Update selected product when productId changes
  useEffect(() => {
    if (productId) {
      const product = products.find(p => p.id === productId);
      if (product) setSelectedProduct(product);
    } else {
      setSelectedProduct(null);
    }
  }, [productId, products]);

  // Handle Stock Update
  const handleStockUpdate = async (type: "in" | "out") => {
    if (!warehouseId || !productId || quantity <= 0) {
      toast.error("Please fill all fields correctly!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8800/api/stock/${type}`, {
        method: "POST",
        
      headers: { 
        "Content-Type": "application/json", 
        Authorization: `Bearer ${token}` 
      }, 
        body: JSON.stringify({ warehouseId, productId, quantity }),
      });

      if (!response.ok) throw new Error("Stock update failed!");

      toast.success(`Stock ${type === "in" ? "added" : "removed"} successfully!`);
      
      // Reset form and refresh data
      setQuantity(1);
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate capacity usage percentage
  const calculateCapacityUsage = (warehouse: Warehouse) => {
    if (!warehouse) return 0;
    const usedCapacity = warehouse.capacity - warehouse.availableCapacity;
    return Math.min(Math.round((usedCapacity / warehouse.capacity) * 100), 100);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Stock Management</h1>
            <p className="text-gray-600 mt-1">Manage inventory across warehouses</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => router.push('/inventory/dashboard')}
            className="mt-4 md:mt-0"
          >
            Back to Dashboard
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Stock Movement Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                <CardTitle className="flex items-center text-xl">
                  <Package2 className="mr-2 h-5 w-5" />
                  Stock Movement
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Add or remove stock from warehouses
                </CardDescription>
              </CardHeader>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="px-6 pt-6">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="stock-movement" className="flex items-center">
                      <ArrowUp className="mr-2 h-4 w-4" />
                      Stock Movement
                    </TabsTrigger>
                    <TabsTrigger value="recent-transactions" className="flex items-center">
                      <History className="mr-2 h-4 w-4" />
                      Recent Transactions
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <CardContent className="p-6">
                  <TabsContent value="stock-movement" className="mt-0 space-y-6">
                    {/* Warehouse Selection */}
                    <div className="space-y-2">
                      <Label htmlFor="warehouse" className="text-sm font-medium">Warehouse</Label>
                      <Select value={warehouseId} onValueChange={setWarehouseId}>
                        <SelectTrigger id="warehouse" className="w-full">
                          <SelectValue placeholder="Select Warehouse" />
                        </SelectTrigger>
                        <SelectContent>
                          {warehouses.map((wh) => (
                            <SelectItem key={wh.id} value={wh.id}>
                              {wh.name} ({wh.location})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Product Selection */}
                    <div className="space-y-2">
                      <Label htmlFor="product" className="text-sm font-medium">Product</Label>
                      <Select value={productId} onValueChange={setProductId}>
                        <SelectTrigger id="product" className="w-full">
                          <SelectValue placeholder="Select Product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.title} - ${product.price}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Quantity Input */}
                    <div className="space-y-2">
                      <Label htmlFor="quantity" className="text-sm font-medium">Quantity</Label>
                      <Input 
                        id="quantity" 
                        type="number" 
                        min="1"
                        value={quantity} 
                        onChange={(e) => setQuantity(Number(e.target.value))} 
                      />
                    </div>

                    {/* Current Stock Info */}
                    {selectedProduct && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium text-sm text-gray-700 mb-2">Current Stock Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Total Stock:</p>
                            <p className="font-medium">{selectedProduct.stock} units</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">In Selected Warehouse:</p>
                            <p className="font-medium">
                              {warehouseStock.find(item => item.productId === productId)?.quantity || 0} units
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <Button 
                        className="w-full" 
                        onClick={() => handleStockUpdate("in")} 
                        disabled={loading || !warehouseId || !productId || quantity <= 0}
                      >
                        {loading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <ArrowDown className="mr-2 h-4 w-4" />
                        )}
                        Stock In
                      </Button>
                      <Button 
                        className="w-full" 
                        variant="destructive" 
                        onClick={() => handleStockUpdate("out")} 
                        disabled={loading || !warehouseId || !productId || quantity <= 0}
                      >
                        {loading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <ArrowUp className="mr-2 h-4 w-4" />
                        )}
                        Stock Out
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="recent-transactions" className="mt-0">
                    {fetchingData ? (
                      <div className="flex justify-center items-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                      </div>
                    ) : recentTransactions.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <History className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                        <p>No recent transactions found</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Product</TableHead>
                              <TableHead>Warehouse</TableHead>
                              <TableHead className="text-right">Quantity</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {recentTransactions.map((transaction) => (
                              <TableRow key={transaction.id}>
                                <TableCell className="text-sm">
                                  {formatDate(transaction.createdAt)}
                                </TableCell>
                                <TableCell>
                                  <Badge variant={transaction.type === "in" ? "secondary" : "destructive"}>
                                    {transaction.type === "in" ? (
                                      <ArrowDown className="mr-1 h-3 w-3" />
                                    ) : (
                                      <ArrowUp className="mr-1 h-3 w-3" />
                                    )}
                                    {transaction.type === "in" ? "Stock In" : "Stock Out"}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {transaction.product?.title || transaction.productId}
                                </TableCell>
                                <TableCell>
                                  {transaction.warehouse?.name || transaction.warehouseId}
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                  {transaction.quantity} units
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>
          
          {/* Right Column - Warehouse Info */}
          <div>
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
                <CardTitle className="flex items-center text-xl">
                  <Building2 className="mr-2 h-5 w-5" />
                  Warehouse Status
                </CardTitle>
                <CardDescription className="text-emerald-100">
                  Current capacity and utilization
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {fetchingData ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : warehouses.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Building2 className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>No warehouses found</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {warehouses.map((warehouse) => {
                      const capacityUsage = calculateCapacityUsage(warehouse);
                      return (
                        <div key={warehouse.id} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <h3 className="font-medium">{warehouse.name}</h3>
                            <Badge variant={capacityUsage > 90 ? "destructive" : capacityUsage > 70 ? "secondary" : "outline"}>
                              {capacityUsage}% Used
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500">{warehouse.location}</p>
                          <Progress value={capacityUsage} className="h-2" />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Available: {warehouse.availableCapacity} units</span>
                            <span>Total: {warehouse.capacity} units</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-gray-50 px-6 py-4 border-t">
                <Button variant="outline" className="w-full" onClick={() => router.push('/warehouses')}>
                  <Building2 className="mr-2 h-4 w-4" />
                  Manage Warehouses
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="shadow-lg border-0 mt-6">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white">
                <CardTitle className="flex items-center text-xl">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Inventory Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {fetchingData ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Total Products</p>
                        <p className="text-2xl font-bold">{products.length}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Total Warehouses</p>
                        <p className="text-2xl font-bold">{warehouses.length}</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="font-medium text-sm text-gray-700 mb-2">Low Stock Products</h3>
                      {products.filter(p => p.stock < 10).slice(0, 3).map(product => (
                        <div key={product.id} className="flex justify-between items-center py-2">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gray-200 rounded-md mr-2 overflow-hidden">
                              {product.image ? (
                                <img 
                                  src={product.image || "/placeholder.svg"} 
                                  alt={product.title} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package2 className="w-full h-full p-1 text-gray-400" />
                              )}
                            </div>
                            <span className="text-sm truncate max-w-[150px]">{product.title}</span>
                          </div>
                          <Badge variant="destructive" className="ml-2">{product.stock} left</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-gray-50 px-6 py-4 border-t">
                <Button variant="outline" className="w-full" onClick={() => router.push('/inventory/products')}>
                  <Package2 className="mr-2 h-4 w-4" />
                  View All Products
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockManagementPage;
