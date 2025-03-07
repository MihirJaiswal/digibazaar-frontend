"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/inventory/dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatNumber } from "@/app/inventory/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, ArrowDown, ArrowUp, BarChart3, DollarSign, MapPin, Package, PackageCheck, PackageX, PieChart, ShoppingBag, ShoppingCart, TrendingUp, Truck, Users, WarehouseIcon } from 'lucide-react'
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuthStore } from "@/store/authStore"
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell 
} from "recharts"
import Header from "@/components/global/Header"

// Types for our data
interface Warehouse {
  id: string
  name: string
  location: string
  capacity: number
  contactInfo: {
    phone: string
    email?: string
  }
  coordinates: {
    latitude: number
    longitude: number
  }
  availableCapacity: number
  usedCapacity: number
  totalStock: number
}

interface Product {
  id: string
  title: string
  description: string
  price: number
  stock: number
  categoryId: string | null
  costPerItem: number | null
  profit: number | null
  margin: number | null
}

interface OrderItem {
  id: string
  productId: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface Order {
  id: string
  totalPrice: number
  status: string
  paymentStatus: string
  shippingAddress: {
    phone: string
    address: string
  }
  createdAt: string
  items: OrderItem[]
}

interface SalesReport {
  totalRevenue: number
  totalOrders: number
  topSellingProducts: {
    product: {
      title: string
    }
    quantitySold: number
  }[]
  revenueTrend: {
    month: string
    revenue: number
  }[]
}

interface StockReport {
  warehouse: string
  product: string
  stock: number
  stockValue: number
}

interface StockAlert {
  warehouse: string
  product: string
  currentStock: number
  reorderLevel: number
  supplier: string
  supplierContact: string
}

export default function Dashboard() {
  // State for all our data
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null)
  const [stockReport, setStockReport] = useState<StockReport[]>([])
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { token, _hasRehydrated } = useAuthStore()
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

  useEffect(() => {
    console.log("[1] useEffect triggered - Token:", token, "Rehydrated:", _hasRehydrated);
    
    if (!token || !_hasRehydrated) {
      console.log("Waiting for token and rehydration to complete");
      return;
    }
  
    const fetchAllData = async () => {
      try {
        console.log("[4] Starting data fetch with token:", token);
        setIsLoading(true);
  
        console.log("Token being sent:", token); // Log the token to ensure it's present
  
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };
        console.log("[5] Making API requests...");
        const responses = await Promise.all([
          fetch("http://localhost:8800/api/warehouses", { headers }),
          fetch("http://localhost:8800/api/products", { headers }),
          fetch("http://localhost:8800/api/orders", { headers }),
          fetch("http://localhost:8800/api/reports/sales", { headers }),
          fetch("http://localhost:8800/api/reports/stock", { headers }),
          fetch("http://localhost:8800/api/reports/stock-alert", { headers }),
        ]);
        console.log("[6] Responses received:", responses);
        // Check response status codes
        responses.forEach((res) => {
          if (!res.ok) {
            console.error(`API call failed: ${res.url} → Status: ${res.status}`);
          }
        });
  
        // If any request fails, throw an error
        if (responses.some((res) => !res.ok)) {
          throw new Error("Failed to fetch dashboard data. Check server logs.");
        }
  
        // Parse all responses
        const [
          warehousesData,
          productsData,
          ordersData,
          salesReportData,
          stockReportData,
          stockAlertData,
        ] = await Promise.all(responses.map((res) => res.json()));
  
        // Update state with fetched data
        setWarehouses(warehousesData);
        setProducts(productsData);
        setOrders(ordersData);
        setSalesReport(salesReportData);
        setStockReport(stockReportData);
        setStockAlerts(stockAlertData);
      } catch (err) {
        console.error("[7] Fetch error:", err);
        setError("Failed to load dashboard data");
        console.error("Fetch Error:", err);
      } finally {
        console.log("[8] Finished data fetch attempt");
        setIsLoading(false);
      }
    };
  
    fetchAllData();
  }, [token, _hasRehydrated]); // Refetch if token changes

  console.log("[0] Component render - Token:", token, "Rehydrated:", _hasRehydrated);
  
  // Calculate summary metrics
  const totalWarehouses = warehouses.length
  const totalProducts = products.length
  const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0)
  const totalRevenue = salesReport?.totalRevenue || 0
  const totalOrders = orders.length
  const pendingOrders = orders.filter(o => o.status === "PENDING").length
  const completedOrders = orders.filter(o => o.status === "COMPLETED").length
  const pendingPayments = orders.filter(o => o.paymentStatus === "PENDING").length
  const lowStockItems = stockAlerts.length

  // Calculate total warehouse capacity and usage
  const totalCapacity = warehouses.reduce((sum, w) => sum + w.capacity, 0)
  const totalUsedCapacity = warehouses.reduce((sum, w) => sum + w.usedCapacity, 0)
  const overallUtilization = totalCapacity > 0 ? (totalUsedCapacity / totalCapacity) * 100 : 0

  // Prepare data for charts
  const warehouseUtilization = warehouses.map(w => ({
    name: w.name,
    location: w.location,
    capacity: w.capacity,
    used: w.usedCapacity,
    available: w.availableCapacity,
    utilization: Math.round((w.usedCapacity / w.capacity) * 100)
  }))

  // Prepare monthly sales data
  const monthlySalesData = salesReport?.revenueTrend || []

  // Prepare order status data for pie chart
  const orderStatusData = [
    { name: 'Completed', value: completedOrders },
    { name: 'Pending', value: pendingOrders }
  ]

  // Prepare top selling products data
  const topSellingProducts = salesReport?.topSellingProducts || []

  // Prepare warehouse stock distribution data
  const warehouseStockDistribution = warehouses.map(warehouse => {
    const warehouseStocks = stockReport.filter(stock => stock.warehouse === warehouse.name)
    const totalStockValue = warehouseStocks.reduce((sum, stock) => sum + stock.stockValue, 0)
    
    return {
      name: warehouse.name,
      stockValue: totalStockValue,
      stockCount: warehouseStocks.reduce((sum, stock) => sum + stock.stock, 0)
    }
  })

  // Get recent orders (last 5)
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  // Get products with highest profit margin
  const topProfitMarginProducts = [...products]
    .filter(p => p.margin !== null)
    .sort((a, b) => (b.margin || 0) - (a.margin || 0))
    .slice(0, 5)

  return (
    <>
      <Header />
      <DashboardLayout>
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h1 className="text-3xl font-bold">Inventory Dashboard</h1>
            <div className="flex items-center space-x-2 mt-2 md:mt-0">
              <Button variant="outline" size="sm">
                <BarChart3 className="mr-2 h-4 w-4" />
                Export Reports
              </Button>
              <Button size="sm">
                <TrendingUp className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="pb-2">
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              {/* Key Metrics */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card className="overflow-hidden border-l-4 border-l-blue-500">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 bg-blue-50 dark:bg-blue-950/20">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                    <div className="flex items-center mt-1 text-xs">
                      <Badge variant="outline" className="text-green-600 bg-green-50">
                        <ArrowUp className="h-3 w-3 mr-1" />
                        12.5%
                      </Badge>
                      <span className="text-muted-foreground ml-2">from last month</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden border-l-4 border-l-green-500">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 bg-green-50 dark:bg-green-950/20">
                    <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                    <ShoppingBag className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold">{formatNumber(totalOrders)}</div>
                    <div className="flex flex-col mt-1">
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium text-green-600">{completedOrders}</span> completed, 
                        <span className="font-medium text-amber-600 ml-1">{pendingOrders}</span> pending
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium text-red-600">{pendingPayments}</span> pending payments
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden border-l-4 border-l-purple-500">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 bg-purple-50 dark:bg-purple-950/20">
                    <CardTitle className="text-sm font-medium">Warehouse Capacity</CardTitle>
                    <WarehouseIcon className="h-4 w-4 text-purple-500" />
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold">{Math.round(overallUtilization)}% Used</div>
                    <div className="mt-2">
                      <Progress value={overallUtilization} className="h-2" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatNumber(totalUsedCapacity)} of {formatNumber(totalCapacity)} units
                    </p>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden border-l-4 border-l-red-500">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 bg-red-50 dark:bg-red-950/20">
                    <CardTitle className="text-sm font-medium">Stock Alerts</CardTitle>
                    <PackageX className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold">{lowStockItems}</div>
                    <div className="flex items-center mt-1 text-xs">
                      <Badge variant="outline" className="text-red-600 bg-red-50">
                        <ArrowUp className="h-3 w-3 mr-1" />
                        {lowStockItems > 0 ? "Action Required" : "All Good"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {lowStockItems} products need reordering
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Tabs for different dashboard sections */}
              <Tabs defaultValue="overview" className="mb-8">
                <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="inventory">Inventory</TabsTrigger>
                  <TabsTrigger value="sales">Sales & Orders</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  {/* Sales Trend Chart */}
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card className="md:col-span-2">
                      <CardHeader>
                        <CardTitle>Revenue Trend</CardTitle>
                        <CardDescription>Monthly revenue performance</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                              data={monthlySalesData}
                              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                            >
                              <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis 
                                dataKey="month" 
                                tickFormatter={(value) => {
                                  const [year, month] = value.split('-');
                                  return `${new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'short' })}`;
                                }}
                              />
                              <YAxis />
                              <Tooltip 
                                formatter={(value) => [`$${value}`, "Revenue"]}
                                labelFormatter={(value) => {
                                  const [year, month] = value.split('-');
                                  return `${new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}`;
                                }}
                              />
                              <Area 
                                type="monotone" 
                                dataKey="revenue" 
                                stroke="#8884d8" 
                                fillOpacity={1} 
                                fill="url(#colorRevenue)" 
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Order Status Distribution */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Order Status</CardTitle>
                        <CardDescription>Distribution of order statuses</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[250px] flex items-center justify-center">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                              <Pie
                                data={orderStatusData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {orderStatusData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value) => [`${value} orders`, ""]} />
                              <Legend />
                            </RechartsPieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Warehouse Stock Distribution */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Warehouse Stock Value</CardTitle>
                        <CardDescription>Stock value by warehouse</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[250px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={warehouseStockDistribution}
                              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip formatter={(value) => [`$${value}`, "Stock Value"]} />
                              <Bar dataKey="stockValue" fill="#82ca9d" name="Stock Value" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Orders */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Orders</CardTitle>
                      <CardDescription>Latest 5 orders in the system</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Payment</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {recentOrders.map((order) => (
                            <TableRow key={order.id}>
                              <TableCell className="font-medium">{order.id.substring(0, 8)}...</TableCell>
                              <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <Badge variant={order.status === "COMPLETED" ? "secondary" : "outline"}>
                                  {order.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={order.paymentStatus === "PAID" ? "secondary" : "outline"}>
                                  {order.paymentStatus}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">{formatCurrency(order.totalPrice)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                      <Button variant="outline" size="sm">View All Orders</Button>
                    </CardFooter>
                  </Card>
                </TabsContent>

                {/* Inventory Tab */}
                <TabsContent value="inventory" className="space-y-6">
                  {/* Warehouse Utilization */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Warehouse Utilization</CardTitle>
                      <CardDescription>Current storage usage across all warehouses</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {warehouseUtilization.map((warehouse) => (
                          <div key={warehouse.name} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-medium">{warehouse.name}</div>
                                <div className="text-xs text-muted-foreground flex items-center">
                                  <MapPin className="h-3 w-3 mr-1" /> {warehouse.location}
                                </div>
                              </div>
                              <div className="text-sm">
                                <span className="font-medium">{warehouse.used}</span>
                                <span className="text-muted-foreground"> / {warehouse.capacity} units</span>
                              </div>
                            </div>
                            <Progress 
                              value={warehouse.utilization} 
                              className={`h-2 ${
                                warehouse.utilization > 90 ? "bg-red-500" : 
                                warehouse.utilization > 75 ? "bg-amber-500" : 
                                "bg-green-500"
                              }`}
                            />
                            <div className="text-xs text-right">
                              <span 
                                className={
                                  warehouse.utilization > 90 ? "text-red-500" : 
                                  warehouse.utilization > 75 ? "text-amber-500" : 
                                  "text-green-500"
                                }
                              >
                                {warehouse.utilization}% utilized
                              </span>
                              <span className="text-muted-foreground ml-2">
                                ({warehouse.available} units available)
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Stock Alerts */}
                  <Card className={stockAlerts.length > 0 ? "border-red-200 bg-red-50/30 dark:bg-red-950/10" : ""}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Low Stock Alerts</CardTitle>
                        {stockAlerts.length > 0 && (
                          <Badge variant="destructive">{stockAlerts.length} Items</Badge>
                        )}
                      </div>
                      <CardDescription>Products that need to be reordered soon</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {stockAlerts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                          <PackageCheck className="h-12 w-12 text-green-500 mb-4" />
                          <h3 className="text-lg font-medium">All Stock Levels are Good</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            There are no products that need reordering at this time.
                          </p>
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Product</TableHead>
                              <TableHead>Warehouse</TableHead>
                              <TableHead>Current Stock</TableHead>
                              <TableHead>Supplier</TableHead>
                              <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {stockAlerts.map((alert, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">{alert.product}</TableCell>
                                <TableCell>{alert.warehouse}</TableCell>
                                <TableCell>
                                  <Badge variant="destructive">{alert.currentStock} units</Badge>
                                </TableCell>
                                <TableCell>{alert.supplier}</TableCell>
                                <TableCell className="text-right">
                                  <Button size="sm" variant="outline">Reorder</Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>

                  {/* Top Products by Profit Margin */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Products by Profit Margin</CardTitle>
                      <CardDescription>Products with the highest profit margins</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={topProfitMarginProducts}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" domain={[0, 100]} />
                            <YAxis type="category" dataKey="title" width={150} />
                            <Tooltip formatter={(value) => [`${value}%`, "Profit Margin"]} />
                            <Bar dataKey="margin" fill="#8884d8" name="Profit Margin" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Sales Tab */}
                <TabsContent value="sales" className="space-y-6">
                  {/* Sales Summary */}
                  <div className="grid gap-6 md:grid-cols-3">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Total Revenue</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">{formatCurrency(totalRevenue)}</div>
                        <div className="flex items-center mt-1 text-xs">
                          <Badge variant="outline" className="text-green-600 bg-green-50">
                            <ArrowUp className="h-3 w-3 mr-1" />
                            12.5%
                          </Badge>
                          <span className="text-muted-foreground ml-2">from last month</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Average Order Value</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">
                          {formatCurrency(totalOrders > 0 ? totalRevenue / totalOrders : 0)}
                        </div>
                        <div className="flex items-center mt-1 text-xs">
                          <Badge variant="outline" className="text-green-600 bg-green-50">
                            <ArrowUp className="h-3 w-3 mr-1" />
                            3.2%
                          </Badge>
                          <span className="text-muted-foreground ml-2">from last month</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Conversion Rate</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">24.8%</div>
                        <div className="flex items-center mt-1 text-xs">
                          <Badge variant="outline" className="text-red-600 bg-red-50">
                            <ArrowDown className="h-3 w-3 mr-1" />
                            1.5%
                          </Badge>
                          <span className="text-muted-foreground ml-2">from last month</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Top Selling Products */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Selling Products</CardTitle>
                      <CardDescription>Products with the highest sales volume</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={topSellingProducts}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="product.title" />
                            <YAxis />
                            <Tooltip formatter={(value) => [`${value} units`, "Quantity Sold"]} />
                            <Bar dataKey="quantitySold" fill="#8884d8" name="Quantity Sold" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Order Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Order Details</CardTitle>
                      <CardDescription>Complete list of recent orders</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Payment</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orders.map((order) => (
                            <TableRow key={order.id}>
                              <TableCell className="font-medium">{order.id.substring(0, 8)}...</TableCell>
                              <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                              <TableCell>{order.items.length}</TableCell>
                              <TableCell>
                                <Badge variant={order.status === "COMPLETED" ? "secondary" : "outline"}>
                                  {order.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={order.paymentStatus === "PAID" ? "secondary" : "outline"}>
                                  {order.paymentStatus}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">{formatCurrency(order.totalPrice)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" size="sm">Previous</Button>
                      <Button variant="outline" size="sm">Next</Button>
                    </CardFooter>
                  </Card>

                  {/* Payment Status Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Payment Status</CardTitle>
                      <CardDescription>Distribution of payment statuses</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[250px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={[
                                { name: 'Paid', value: orders.filter(o => o.paymentStatus === "PAID").length },
                                { name: 'Pending', value: orders.filter(o => o.paymentStatus === "PENDING").length }
                              ]}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              <Cell fill="#4ade80" />
                              <Cell fill="#f97316" />
                            </Pie>
                            <Tooltip formatter={(value) => [`${value} orders`, ""]} />
                            <Legend />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </DashboardLayout>
    </>
  )
}
