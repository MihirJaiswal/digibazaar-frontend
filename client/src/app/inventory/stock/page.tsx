"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QueryClient, QueryClientProvider, useQuery, useMutation } from "react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  ArrowDown,
  ArrowUp,
  Building2,
  Package2,
  Loader2,
  History,
  BarChart3,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuthStore } from "@/store/authStore";
import { DashboardLayout } from "@/components/inventory/dashboard-layout";
import Header from "@/components/global/Header";
import Image from "next/image";

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

// Create a QueryClient instance for React Query
const queryClient = new QueryClient();

function StockManagementComponent() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [warehouseId, setWarehouseId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("stock-movement");
  const [recentTransactions, _setRecentTransactions] = useState([]);

  // Fetch warehouses
  const { data: warehouses, isLoading: loadingWarehouses } = useQuery(
    "warehouses",
    () =>
      fetch("http://localhost:8800/api/warehouses", {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => res.json()),
    { enabled: !!token }
  );

  // Fetch products
  const { data: products, isLoading: loadingProducts } = useQuery(
    "products",
    () =>
      fetch("http://localhost:8800/api/products", {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => res.json()),
    { enabled: !!token }
  );

  // Fetch warehouse stock when a warehouse is selected
  const { data: warehouseStock } = useQuery(
    ["warehouseStock", warehouseId],
    () =>
      fetch(`http://localhost:8800/api/warehouses/${warehouseId}/stock`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => res.json()),
    { enabled: !!warehouseId && !!token }
  );

  // Find selected product
  const selectedProduct =
    products && products.find((p: any) => p.id === productId) || null;

  // Mutation for stock update (either "in" or "out")
  const mutation = useMutation(
    (type: "in" | "out") =>
      fetch(`http://localhost:8800/api/stock/${type}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ warehouseId, productId, quantity }),
      }).then((res) => {
        if (!res.ok) throw new Error("Stock update failed!");
        return res.json();
      }),
    {
      onSuccess: () => {
        toast.success("Stock updated successfully!");
        setQuantity(1);
        queryClient.invalidateQueries("warehouses");
        queryClient.invalidateQueries("products");
        if (warehouseId) {
          queryClient.invalidateQueries(["warehouseStock", warehouseId]);
        }
      },
      onError: (error: any) => {
        toast.error(error.message || "Stock update failed!");
      },
    }
  );

  const handleStockUpdate = (type: "in" | "out") => {
    if (!warehouseId || !productId || quantity <= 0) {
      toast.error("Please fill all fields correctly!");
      return;
    }
    mutation.mutate(type);
  };

  const calculateCapacityUsage = (warehouse: Warehouse) => {
    const usedCapacity = warehouse.capacity - warehouse.availableCapacity;
    return Math.min(Math.round((usedCapacity / warehouse.capacity) * 100), 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
    <Header/>
    <DashboardLayout>
      <div className="bg-gradient-to-b py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Stock Management</h1>
            <p className=" mt-1">Manage inventory across warehouses</p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push("/inventory")}
            className="mt-4 md:mt-0"
          >
            Back to Dashboard
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column – Stock Movement Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-purple-700 via-blue-700 to-cyan-700 text-white rounded-t-2xl">
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
                      <Label htmlFor="warehouse" className="text-sm font-medium">
                        Warehouse
                      </Label>
                      {loadingWarehouses ? (
                        <div className="flex justify-center">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      ) : (
                        <Select value={warehouseId} onValueChange={setWarehouseId}>
                          <SelectTrigger id="warehouse" className="w-full">
                            <SelectValue placeholder="Select Warehouse" />
                          </SelectTrigger>
                          <SelectContent>
                            {warehouses &&
                              warehouses.map((wh: Warehouse) => (
                                <SelectItem key={wh.id} value={wh.id}>
                                  {wh.name} ({wh.location})
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>

                    {/* Product Selection */}
                    <div className="space-y-2">
                      <Label htmlFor="product" className="text-sm font-medium">
                        Product
                      </Label>
                      {loadingProducts ? (
                        <div className="flex justify-center">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      ) : (
                        <Select value={productId} onValueChange={setProductId}>
                          <SelectTrigger id="product" className="w-full">
                            <SelectValue placeholder="Select Product" />
                          </SelectTrigger>
                          <SelectContent>
                            {products &&
                              products.map((product: Product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.title} - ${product.price}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>

                    {/* Quantity Input */}
                    <div className="space-y-2">
                      <Label htmlFor="quantity" className="text-sm font-medium">
                        Quantity
                      </Label>
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
                      <div className="p-4 rounded-lg">
                        <h3 className="font-medium text-smmb-2">
                          Current Stock Information
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm ">Total Stock:</p>
                            <p className="font-medium">{selectedProduct.stock} units</p>
                          </div>
                          <div>
                            <p className="text-sm ">In Selected Warehouse:</p>
                            <p className="font-medium">
                              {warehouseStock &&
                                warehouseStock.find((item: any) => item.productId === productId)
                                  ?.quantity || 0}{" "}
                              units
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
                        disabled={mutation.isLoading || !warehouseId || !productId || quantity <= 0}
                      >
                        {mutation.isLoading ? (
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
                        disabled={mutation.isLoading || !warehouseId || !productId || quantity <= 0}
                      >
                        {mutation.isLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <ArrowUp className="mr-2 h-4 w-4" />
                        )}
                        Stock Out
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="recent-transactions" className="mt-0">
                    {recentTransactions.length === 0 ? (
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
                            {recentTransactions.map((transaction: StockTransaction) => (
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

          {/* Right Column – Warehouse Info */}
          <div>
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r rounded-t-2xl from-blue-700 to-cyan-700 text-white">
                <CardTitle className="flex items-center text-xl">
                  <Building2 className="mr-2 h-5 w-5" />
                  Warehouse Status
                </CardTitle>
                <CardDescription className="text-emerald-100">
                  Current capacity and utilization
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {loadingWarehouses ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400 dark:text-zinc-300" />
                  </div>
                ) : warehouses && warehouses.length > 0 ? (
                  <div className="space-y-6">
                    {warehouses.map((warehouse: Warehouse) => {
                      const capacityUsage = calculateCapacityUsage(warehouse);
                      return (
                        <div key={warehouse.id} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <h3 className="font-medium">{warehouse.name}</h3>
                            <Badge
                              variant={
                                capacityUsage > 90
                                  ? "destructive"
                                  : capacityUsage > 70
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {capacityUsage}% Used
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-zinc-300">{warehouse.location}</p>
                          <Progress value={capacityUsage} className="h-2" />
                          <div className="flex justify-between text-xs text-gray-500 dark:text-zinc-300">
                            <span>Available: {warehouse.availableCapacity} units</span>
                            <span>Total: {warehouse.capacity} units</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-zinc-300">
                    <Building2 className="h-12 w-12 mx-auto mb-2 text-gray-400 dark:text-zinc-300" />
                    <p>No warehouses found</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-gray-50 dark:bg-zinc-900 px-6 py-4 border-t">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/inventory/warehouses")}
                >
                  <Building2 className="mr-2 h-4 w-4" />
                  Manage Warehouses
                </Button>
              </CardFooter>
            </Card>

            <Card className="shadow-lg border-0 mt-6">
              <CardHeader className="bg-gradient-to-r rounded-t-2xl from-purple-700 to-indigo-700 text-white">
                <CardTitle className="flex items-center text-xl">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Inventory Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {(loadingProducts || loadingWarehouses) ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className=" p-4 rounded-lg">
                        <p className="text-sm dark:text-gray-200 text-gray-500">Total Products</p>
                        <p className="text-2xl font-bold">{products ? products.length : 0}</p>
                      </div>
                      <div className="p-4 rounded-lg">
                        <p className="text-sm dark:text-gray-200 text-gray-500">Total Warehouses</p>
                        <p className="text-2xl font-bold">{warehouses ? warehouses.length : 0}</p>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="font-medium text-sm text-gray-700 dark:text-zinc-300 mb-2">
                        Low Stock Products
                      </h3>
                      {products &&
                        products
                          .filter((p: any) => p.stock < 10)
                          .slice(0, 3)
                          .map((product: any) => (
                            <div key={product.id} className="flex justify-between items-center py-2">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-gray-200 rounded-md mr-2 overflow-hidden">
                                  {product.image ? (
                                    <Image
                                      src={product.image || "/placeholder.svg"}
                                      alt={product.title}
                                      width={32}
                                      height={32}
                                      loading="lazy"
                                      quality={100}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <Package2 className="w-full h-full p-1 text-gray-400" />
                                  )}
                                </div>
                                <span className="text-sm truncate max-w-[150px]">{product.title}</span>
                              </div>
                              <Badge variant="destructive" className="ml-2">
                                {product.stock} left
                              </Badge>
                            </div>
                          ))}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-gray-50 dark:bg-zinc-800 px-6 py-4 border-t">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/inventory/products")}
                >
                  <Package2 className="mr-2 h-4 w-4" />
                  View All Products
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
    </DashboardLayout>
    </>
  );
}

export default function StockManagementPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <StockManagementComponent />
    </QueryClientProvider>
  );
}
