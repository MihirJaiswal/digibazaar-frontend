"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Loader2,
  MapPinIcon,
  BuildingIcon,
  PackageIcon,
  TruckIcon,
  CheckCircleIcon,
  InfoIcon,
  ArrowRightIcon,
  PhoneIcon,
  HomeIcon,
  CalendarIcon,
  DollarSignIcon,
} from "lucide-react"

// Utilities
import { formatCurrency, formatDate } from "@/app/inventory/lib/utils"

// Fix for default marker icon issues in React Leaflet
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
})

// Custom marker icons
const warehouseIcon = L.icon({
  iconUrl: "https://cdn.icon-icons.com/icons2/1883/PNG/512/storage-warehouse_121575.png",
  iconSize: [38, 38],
  iconAnchor: [19, 38],
})

const deliveryIcon = L.icon({
  iconUrl: "https://cdn.icon-icons.com/icons2/1371/PNG/512/pin1_90956.png",
  iconSize: [38, 38],
  iconAnchor: [19, 38],
})

// TypeScript Interfaces
interface Warehouse {
  id: string
  name: string
  location: {
    latitude: number
    longitude: number
  }
  coordinates: {
    latitude: number
    longitude: number
  }
}

interface InventoryItem {
  id: string
  productId: string
  quantity: number
}

interface SelectedItem {
  productId: string
  quantity: number
}

interface Product {
  id: string
  title: string
  mainImage: string
  price: number
}

interface Order {
  id: string
  totalPrice: number
  status: string
  createdAt: string
  userId: string
  shippingAddress: {
    phone: string
    address: string
    latitude?: number
    longitude?: number
  }
  items: {
    id: string
    productId: string
    quantity: number
    unitPrice: number
    totalPrice: number
    product?: Product
  }[]
}

export default function AssignInventoryPage() {
  const { id: orderId } = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [filteredWarehouses, setFilteredWarehouses] = useState<Warehouse[]>([])
  const [selectedWarehouse, setSelectedWarehouse] = useState("")
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([])
  const [nearestWarehouse, setNearestWarehouse] = useState<(Warehouse & { distance: number }) | null>(null)
  const [loading, setLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  // Calculate distance between two geographic points
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371 // Radius of Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180)
    const dLon = (lon2 - lon1) * (Math.PI / 180)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c // Distance in km
  }

  // Find the nearest warehouse based on user's shipping address
  const findNearestWarehouse = (
    userLat: number | null,
    userLon: number | null,
    warehouses: Warehouse[],
  ): (Warehouse & { distance: number }) | null => {
    // If user coordinates are not available, return the first warehouse or null
    if (userLat === null || userLon === null) {
      if (warehouses.length > 0) {
        const firstWarehouse = warehouses[0]
        return {
          ...firstWarehouse,
          location: {
            latitude: firstWarehouse.coordinates.latitude,
            longitude: firstWarehouse.coordinates.longitude,
          },
          distance: 0, // Default distance
        }
      }
      return null
    }

    let nearestWarehouse = null
    let minDistance = Number.POSITIVE_INFINITY

    warehouses.forEach((warehouse) => {
      const distance = calculateDistance(
        userLat,
        userLon,
        warehouse.coordinates.latitude,
        warehouse.coordinates.longitude,
      )

      if (distance < minDistance) {
        minDistance = distance
        nearestWarehouse = {
          ...warehouse,
          location: {
            latitude: warehouse.coordinates.latitude,
            longitude: warehouse.coordinates.longitude,
          },
          distance,
        }
      }
    })

    return nearestWarehouse
  }

  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true)
      try {
        const res = await fetch(`http://localhost:8800/api/orders/${orderId}`)
        const orderData: Order = await res.json()

        // Fetch product details for each item
        const productPromises = orderData.items.map(async (item) => {
          const productRes = await fetch(`http://localhost:8800/api/products/${item.productId}`)
          const productData: Product = await productRes.json()
          return { ...item, product: productData }
        })

        const updatedItems = await Promise.all(productPromises)
        setOrder({ ...orderData, items: updatedItems })
      } catch (error) {
        console.error("Error fetching order details:", error)
        toast.error("Failed to load order details")
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [orderId])

  // Fetch warehouses
  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const res = await fetch("http://localhost:8800/api/warehouses")
        const data: Warehouse[] = await res.json()

        const mappedWarehouses = data.map((warehouse) => ({
          ...warehouse,
          location: {
            latitude: warehouse.coordinates.latitude,
            longitude: warehouse.coordinates.longitude,
          },
        }))

        setWarehouses(mappedWarehouses)

        // Use null for coordinates if not available
        const nearest = findNearestWarehouse(
          order?.shippingAddress?.latitude ?? null,
          order?.shippingAddress?.longitude ?? null,
          mappedWarehouses,
        )

        setSelectedWarehouse(nearest?.id || "")
        setNearestWarehouse(nearest)
      } catch (error) {
        console.error("Error fetching warehouses:", error)
        toast.error("Failed to load warehouses")
      }
    }

    if (order) {
      fetchWarehouses()
    }
  }, [order, order?.shippingAddress?.latitude, order?.shippingAddress?.longitude])

  // Filter warehouses with required stock
  useEffect(() => {
    const filterWarehousesWithStock = async () => {
      if (!order || warehouses.length === 0) return

      setLoading(true)
      const validWarehouses: Warehouse[] = []

      for (const warehouse of warehouses) {
        try {
          const res = await fetch(`http://localhost:8800/api/warehouses/${warehouse.id}/stock`)
          const stockData: InventoryItem[] = await res.json()

          const hasOrderedProduct = stockData.some((item) =>
            order.items.some((orderedItem) => orderedItem.productId === item.productId),
          )

          if (hasOrderedProduct) validWarehouses.push(warehouse)
        } catch (error) {
          console.error(`Error checking stock for warehouse ${warehouse.id}:`, error)
        }
      }

      setFilteredWarehouses(validWarehouses)
      setLoading(false)
    }

    filterWarehousesWithStock()
  }, [warehouses, order])

  // Handle warehouse selection
  const handleWarehouseSelect = async (warehouseId: string) => {
    setSelectedWarehouse(warehouseId)
    setLoading(true)

    try {
      const res = await fetch(`http://localhost:8800/api/warehouses/${warehouseId}/stock`)
      const data: InventoryItem[] = await res.json()

      const filteredInventory = data.filter((item) => order?.items.some((o) => o.productId === item.productId))

      setInventory(filteredInventory)

      const autoSelectedItems = filteredInventory.map((item) => ({
        productId: item.productId,
        quantity: order?.items.find((o) => o.productId === item.productId)?.quantity || 0,
      }))

      setSelectedItems(autoSelectedItems)
    } catch (error) {
      console.error("Error fetching warehouse stock:", error)
      toast.error("Failed to load inventory")
    } finally {
      setLoading(false)
    }
  }

  // Assign inventory to order
  const handleAssignInventory = async () => {
    if (!selectedWarehouse) {
      toast.error("Please select a warehouse")
      return
    }

    if (selectedItems.length === 0) {
      toast.error("Please select at least one product to assign")
      return
    }

    const itemsWithWarehouse = selectedItems.map((item) => ({
      ...item,
      warehouseId: selectedWarehouse,
    }))

    setIsProcessing(true)

    try {
      const res = await fetch(`http://localhost:8800/api/orders/${orderId}/assign-stock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          items: itemsWithWarehouse,
        }),
      })

      if (!res.ok) throw new Error("Failed to assign inventory")

      toast.success("Inventory assigned successfully!")

      // Save selected warehouse ID to localStorage for the shipping step
      localStorage.setItem("selectedWarehouseId", selectedWarehouse)

      router.push(`/inventory/orders/${orderId}/ship`)
    } catch (error) {
      console.error("Error assigning inventory:", error)
      toast.error("Error assigning inventory")
    } finally {
      setIsProcessing(false)
    }
  }

  // Render warehouse map
  const renderWarehouseMap = () => {
    // If no warehouses or no shipping address, don't render map
    if (!order?.shippingAddress || warehouses.length === 0) {
      return (
        <Card className="mt-4 border-slate-200 shadow-md">
          <CardHeader className="bg-slate-50 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <MapPinIcon className="h-5 w-5 text-slate-500" />
              <CardTitle className="text-xl">Warehouse Locations</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-40 bg-slate-50 rounded-md border border-dashed border-slate-300">
              <p className="text-slate-500 flex items-center gap-2">
                <InfoIcon className="h-4 w-4" />
                Unable to display map: Missing location information
              </p>
            </div>
          </CardContent>
        </Card>
      )
    }

    // If shipping address lacks coordinates, use first warehouse as center
    const centerLat = order.shippingAddress.latitude || warehouses[0]?.coordinates?.latitude || 22.2702 // Fallback to a default latitude
    const centerLon = order.shippingAddress.longitude || warehouses[0]?.coordinates?.longitude || 79.4258 // Fallback to a default longitude

    return (
      <Card className="mt-6 border-slate-200 shadow-md overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <MapPinIcon className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-xl">Warehouse Locations</CardTitle>
              <CardDescription>Select the most optimal warehouse for this order</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[400px] w-full relative">
            <MapContainer
              center={[centerLat, centerLon]}
              zoom={10}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Conditionally render markers only if coordinates exist */}
              {order.shippingAddress.latitude && order.shippingAddress.longitude && (
                <Marker
                  position={[order.shippingAddress.latitude, order.shippingAddress.longitude]}
                  icon={deliveryIcon}
                >
                  <Popup className="custom-popup">
                    <div className="font-medium text-primary">📍 Delivery Address</div>
                    <div className="text-sm mt-1">{order.shippingAddress.address}</div>
                  </Popup>
                </Marker>
              )}

              {/* Warehouses Markers */}
              {filteredWarehouses.map((warehouse) => (
                <Marker
                  key={warehouse.id}
                  position={[warehouse.coordinates.latitude, warehouse.coordinates.longitude]}
                  icon={warehouseIcon}
                >
                  <Popup className="custom-popup">
                    <div className="font-medium">🏢 {warehouse.name}</div>
                    {/* Only show distance if shipping address coordinates exist */}
                    {order.shippingAddress.latitude && order.shippingAddress.longitude && (
                      <div className="text-sm mt-1">
                        <span className="font-medium">Distance:</span>{" "}
                        {calculateDistance(
                          order.shippingAddress.latitude,
                          order.shippingAddress.longitude,
                          warehouse.coordinates.latitude,
                          warehouse.coordinates.longitude,
                        ).toFixed(2)}{" "}
                        km
                      </div>
                    )}
                    <Button
                      size="sm"
                      className="mt-2 w-full"
                      onClick={() => {
                        setSelectedWarehouse(warehouse.id)
                        handleWarehouseSelect(warehouse.id)
                      }}
                    >
                      Select Warehouse
                    </Button>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            {/* Map Legend */}
            <div className="absolute bottom-4 right-4 bg-white p-3 rounded-md shadow-md z-[1000] border border-slate-200">
              <div className="text-sm font-medium mb-2">Map Legend</div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span>Delivery Location</span>
              </div>
              <div className="flex items-center gap-2 text-xs mt-1">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span>Available Warehouses</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading && !order) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-slate-600">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Could not load order details. Please try again or contact support.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <PackageIcon className="h-6 w-6 text-primary" />
          Assign Inventory
        </h1>
        <Badge
          className={`px-3 py-1 text-sm ${
            order.status === "ACCEPTED"
              ? "bg-green-100 text-green-800 border-green-200"
              : order.status === "PENDING"
                ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                : "bg-blue-100 text-blue-800 border-blue-200"
          }`}
        >
          {order.status}
        </Badge>
      </div>

      {/* Order Summary */}
      <Card className="border-slate-200 shadow-md overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <InfoIcon className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-xl">Order Information</CardTitle>
              <CardDescription>Order #{order.id}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CalendarIcon className="h-5 w-5 text-slate-500 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500">Order Date</p>
                  <p className="font-medium">{formatDate(order.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <PhoneIcon className="h-5 w-5 text-slate-500 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500">Contact Phone</p>
                  <p className="font-medium">{order.shippingAddress.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <HomeIcon className="h-5 w-5 text-slate-500 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500">Shipping Address</p>
                  <p className="font-medium">{order.shippingAddress.address}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <DollarSignIcon className="h-5 w-5 text-slate-500 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500">Total Amount</p>
                  <p className="font-medium text-lg text-primary">{formatCurrency(order.totalPrice)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <TruckIcon className="h-5 w-5 text-slate-500 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500">Shipping Status</p>
                  <Badge
                    className={`mt-1 ${
                      order.status === "ACCEPTED"
                        ? "bg-green-100 text-green-800 border-green-200"
                        : order.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                          : "bg-blue-100 text-blue-800 border-blue-200"
                    }`}
                  >
                    {order.status}
                  </Badge>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <PackageIcon className="h-5 w-5 text-slate-500 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500">Items Count</p>
                  <p className="font-medium">{order.items.length} products</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ordered Products */}
      <Card className="mt-6 border-slate-200 shadow-md">
        <CardHeader className="bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <PackageIcon className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl">Ordered Products</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.productId} className="hover:bg-slate-50">
                  <TableCell>
                    <div className="h-12 w-12 rounded-md overflow-hidden border border-slate-200">
                      <img
                        src={item.product?.mainImage || "/placeholder.svg?height=48&width=48"}
                        alt={item.product?.title || "Product image"}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{item.product?.title || "Unknown Product"}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(item.totalPrice)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-end p-4 bg-slate-50 border-t border-slate-200">
          <div className="text-right">
            <p className="text-sm text-slate-500">Order Total</p>
            <p className="text-xl font-bold text-primary">{formatCurrency(order.totalPrice)}</p>
          </div>
        </CardFooter>
      </Card>

      {/* Warehouse Map */}
      {order?.status === "ACCEPTED" && renderWarehouseMap()}

      {/* Warehouse Selection */}
      {order?.status === "ACCEPTED" && (
        <Card className="mt-6 border-slate-200 shadow-md">
          <CardHeader className="bg-slate-50 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <BuildingIcon className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-xl">Select Warehouse</CardTitle>
                <CardDescription>Choose a warehouse with available inventory</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="flex items-center justify-center h-20">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2 text-slate-600">Loading warehouses...</span>
              </div>
            ) : (
              <>
                {nearestWarehouse && (
                  <Alert className="mb-4 bg-green-50 border-green-200">
                    <CheckCircleIcon className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-700 font-medium">Recommended Warehouse</AlertTitle>
                    <AlertDescription className="text-green-600">
                      {nearestWarehouse.name} is the closest warehouse to the delivery address
                      {nearestWarehouse.distance > 0 && ` (${nearestWarehouse.distance.toFixed(2)} km away)`}.
                    </AlertDescription>
                  </Alert>
                )}

                <Select onValueChange={handleWarehouseSelect} value={selectedWarehouse}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredWarehouses.length > 0 ? (
                      filteredWarehouses.map((warehouse) => (
                        <SelectItem key={warehouse.id} value={warehouse.id} className="py-3">
                          <div className="flex items-center justify-between w-full">
                            <span className="font-medium">{warehouse.name}</span>
                            {order.shippingAddress.latitude && order.shippingAddress.longitude && (
                              <Badge variant="outline" className="ml-2">
                                {calculateDistance(
                                  order.shippingAddress.latitude,
                                  order.shippingAddress.longitude,
                                  warehouse.coordinates.latitude,
                                  warehouse.coordinates.longitude,
                                ).toFixed(2)}{" "}
                                km
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-3 text-slate-500 text-sm">No warehouse has the required products</div>
                    )}
                  </SelectContent>
                </Select>

                {selectedWarehouse && inventory.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-3">Available Inventory</h3>
                    <div className="bg-slate-50 rounded-md p-4 border border-slate-200">
                      <Table>
                        <TableHeader className="bg-white">
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead className="text-right">Available</TableHead>
                            <TableHead className="text-right">Required</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {inventory.map((item) => {
                            const orderItem = order.items.find((o) => o.productId === item.productId)
                            const isAvailable = item.quantity >= (orderItem?.quantity || 0)

                            return (
                              <TableRow key={item.productId}>
                                <TableCell className="font-medium">
                                  {orderItem?.product?.title || `Product ${item.productId}`}
                                </TableCell>
                                <TableCell className="text-right">{item.quantity}</TableCell>
                                <TableCell className="text-right">{orderItem?.quantity || 0}</TableCell>
                                <TableCell className="text-right">
                                  <Badge
                                    className={isAvailable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                                  >
                                    {isAvailable ? "Available" : "Insufficient"}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
          <CardFooter className="flex justify-between p-4 bg-slate-50 border-t border-slate-200">
            <Button variant="outline">Cancel</Button>
            <Button
              onClick={handleAssignInventory}
              disabled={isProcessing || !selectedWarehouse || inventory.length === 0}
              className="gap-2"
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircleIcon className="h-4 w-4" />}
              Confirm Inventory Assignment
              <ArrowRightIcon className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}

