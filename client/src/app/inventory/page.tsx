"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/inventory/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatNumber } from "@/app/inventory/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, ArrowUp, DollarSign, Package, ShoppingCart } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "@/components/ui/chart"
import Header from "@/components/global/Header"

export default function Dashboard() {
  const [stockData, setStockData] = useState<any>(null)
  const [salesData, setSalesData] = useState<any>(null)
  const [utilizationData, setUtilizationData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // In a real app, these would be actual API calls
        // For demo purposes, we'll simulate the data

        // Simulated stock data
        const stockData = {
          totalProducts: 156,
          totalStock: 4328,
          stockValue: 287650,
          lowStockItems: 12,
          topProducts: [
            { name: "Premium Headphones", stock: 128, value: 12800 },
            { name: "Wireless Keyboard", stock: 95, value: 5700 },
            { name: "USB-C Cable", stock: 342, value: 3420 },
            { name: "Bluetooth Speaker", stock: 78, value: 7800 },
            { name: "Laptop Stand", stock: 54, value: 2700 },
          ],
        }

        // Simulated sales data
        const salesData = {
          totalRevenue: 124500,
          totalOrders: 287,
          pendingOrders: 42,
          completedOrders: 245,
          monthlySales: [
            { month: "Jan", sales: 12500 },
            { month: "Feb", sales: 15800 },
            { month: "Mar", sales: 14200 },
            { month: "Apr", sales: 18900 },
            { month: "May", sales: 21500 },
            { month: "Jun", sales: 19800 },
          ],
        }

        // Simulated warehouse utilization
        const utilizationData = {
          warehouses: [
            { name: "Main Warehouse", capacity: 5000, used: 3850, utilization: 77 },
            { name: "East Facility", capacity: 3000, used: 2100, utilization: 70 },
            { name: "West Storage", capacity: 2500, used: 1950, utilization: 78 },
          ],
        }

        setStockData(stockData)
        setSalesData(salesData)
        setUtilizationData(utilizationData)
      } catch (err) {
        setError("Failed to load dashboard data")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <>
    <Header/>
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

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
            {/* Summary Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(stockData?.totalProducts || 0)}</div>
                  <p className="text-xs text-muted-foreground">{stockData?.lowStockItems} items low on stock</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Stock Value</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(stockData?.stockValue || 0)}</div>
                  <p className="text-xs text-muted-foreground">Across {stockData?.totalProducts} products</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(salesData?.totalOrders || 0)}</div>
                  <p className="text-xs text-muted-foreground">
                    {salesData?.pendingOrders} pending, {salesData?.completedOrders} completed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(salesData?.totalRevenue || 0)}</div>
                  <div className="flex items-center text-xs text-green-600">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    <span>12% from last month</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sales Chart */}
            <div className="grid gap-6 md:grid-cols-2 mb-6">
              <Card className="col-span-1 md:col-span-2">
                <CardHeader>
                  <CardTitle>Monthly Sales</CardTitle>
                  <CardDescription>Sales revenue over the last 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={salesData?.monthlySales || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip
                          formatter={(value) => [`$${value}`, "Revenue"]}
                          labelFormatter={(label) => `Month: ${label}`}
                        />
                        <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Warehouse Utilization */}
            <div className="grid gap-6 md:grid-cols-2 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Warehouse Utilization</CardTitle>
                  <CardDescription>Current capacity usage across warehouses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {utilizationData?.warehouses.map((warehouse: any) => (
                      <div key={warehouse.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{warehouse.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {warehouse.used} / {warehouse.capacity} units
                          </div>
                        </div>
                        <Progress value={warehouse.utilization} className="h-2" />
                        <div className="text-xs text-muted-foreground text-right">
                          {warehouse.utilization}% utilized
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Low Stock Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle>Low Stock Alerts</CardTitle>
                  <CardDescription>Products that need restocking</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stockData?.topProducts.slice(0, 3).map((product: any) => (
                      <div key={product.name} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">{product.stock} units in stock</div>
                        </div>
                        <div
                          className={`px-2 py-1 rounded-md text-xs ${product.stock < 100 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}
                        >
                          {product.stock < 100 ? "Low Stock" : "In Stock"}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
    </>
  )
}

