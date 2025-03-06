"use client"

import { useEffect, useState, type FormEvent } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/inventory/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import Header from "@/components/global/Header"
import { formatNumber } from "@/app/inventory/your-inventory/lib/utils"
import {
  Database,
  Package,
  Activity,
  Edit,
  Trash,
  Mail,
  Phone,
  MapPin,
  ArrowLeft,
  BarChart2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
} from "lucide-react"
import { toast } from "sonner"
import { SelectContent } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  DialogHeader as UI_DialogHeader,
  DialogTitle as UI_DialogTitle,
  DialogFooter as UI_DialogFooter,
} from "@/components/ui/dialog"
import { SelectValue } from "@/components/ui/select"
import { SelectTrigger } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectItem as UI_SelectItem } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import WarehouseStock from "@/components/inventory/WarehouseStock"
import dynamic from "next/dynamic"
import { useAuthStore } from "@/store/authStore"

// Dynamically import chart component to avoid SSR issues
const WarehouseCapacityChart = dynamic(() => import("@/components/inventory/warehouse-capacity-chart"), { ssr: false })

interface Warehouse {
  id: string
  title: string
  location: string
  capacity: number
  availableCapacity: number
  usedCapacity: number
  contactInfo: { phone: string; email: string }
  stockMovements?: Array<{
    id: string
    date: string
    product: string
    quantity: number
    type: "in" | "out"
  }>
}

interface StockItem {
  id: string
  productId: string
  quantity: number
  location?: string
  product: { title: string }
}

const WarehouseDetailsPage = () => {
  const router = useRouter()
  const { id } = useParams()
  const { token } = useAuthStore()
  const [authChecked, setAuthChecked] = useState(false);

  console.log(token)

  // Warehouse state
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null)
  const [loading, setLoading] = useState(true)

  // Update warehouse modal state & form (using nested contactInfo)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [updateForm, setUpdateForm] = useState({
    name: "",
    location: "",
    capacity: 0,
    contactInfo: { phone: "", email: "" },
  })

  // Delete confirmation dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Warehouse stock state
  const [warehouseStock, setWarehouseStock] = useState<StockItem[]>([])

  // Assign location modal state & form
  const [assignLocationModalOpen, setAssignLocationModalOpen] = useState(false)
  const [assignLocationForm, setAssignLocationForm] = useState({
    productId: "",
    location: "",
  })


  useEffect(() => {
    // Set a flag to indicate we've checked auth status
    // This prevents premature fetch attempts
    const checkAuth = () => {
      setAuthChecked(true);
    };
    
    // Small timeout to allow auth store to initialize if it's async
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, []);


  // Fetch warehouse details
  useEffect(() => {
    const fetchWarehouseDetails = async () => {
      if (!token) {
        console.error("Token is missing!");
        setLoading(false);
        return;
      }
  
      console.log('Ye hai token hamara', token);
      console.log('Ye hai id hamara', id);
      setLoading(true); // Start loading state
  
      try {
        const res = await fetch(`http://localhost:8800/api/warehouses/${id}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
  
        if (!res.ok) {
          throw new Error("Failed to fetch warehouse details.");
        }
  
        const data = await res.json();
        setWarehouse(data);
      } catch (error) {
        console.error("Error fetching warehouse details:", error);
        // Optionally, set an error state here to show the error in the UI
      } finally {
        setLoading(false); // End loading state
      }
    };
  
    if (id && authChecked) {
      fetchWarehouseDetails();
    }
  }, [id, authChecked, token]); // Adding token in the dependencies to ensure it updates when the token changes
  

  // Pre-fill the update form when modal opens
  useEffect(() => {
    if (isUpdateModalOpen && warehouse) {
      setUpdateForm({
        name: warehouse.title ?? "",
        location: warehouse.location ?? "",
        capacity: warehouse.capacity ?? 0,
        contactInfo: warehouse.contactInfo ?? { phone: "", email: "" },
      })
    }
  }, [isUpdateModalOpen, warehouse, authChecked])

  // Fetch warehouse stock
  useEffect(() => {
    const fetchWarehouseStock = async () => {
      try {
        const res = await fetch(`http://localhost:8800/api/warehouses/${id}/stock`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })
        const data = await res.json()
        setWarehouseStock(data)
      } catch (error) {
        console.error("Error fetching warehouse stock:", error)
      }
    }
    if (id && authChecked) fetchWarehouseStock()
  }, [id, authChecked ])

  // Delete warehouse
  const handleDelete = async () => {
    try {
      const res = await fetch(`http://localhost:8800/api/warehouses/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      if (res.ok) {
        toast.success("Warehouse deleted successfully")
        router.push("/inventory/warehouse")
      } else {
        console.error("Failed to delete warehouse")
        toast.error("Failed to delete warehouse")
      }
    } catch (error) {
      console.error("Error deleting warehouse:", error)
      toast.error("An error occurred while deleting the warehouse")
    } finally {
      setIsDeleteDialogOpen(false)
    }
  }

  // Update warehouse details
  const handleUpdateSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch(`http://localhost:8800/api/warehouses/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(updateForm),
      })
      if (res.ok) {
        const updatedWarehouse = await res.json()
        setWarehouse(updatedWarehouse)
        toast.success("Warehouse updated successfully")
        setIsUpdateModalOpen(false)
      } else {
        console.error("Failed to update warehouse")
        toast.error("Failed to update warehouse")
      }
    } catch (error) {
      console.error("Error updating warehouse:", error)
      toast.error("An error occurred while updating the warehouse")
    }
  }

  // Submit assign product location
  const handleAssignLocation = async () => {
    try {
      const res = await fetch("http://localhost:8800/api/warehouses/assign-location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          warehouseId: id,
          productId: assignLocationForm.productId,
          location: assignLocationForm.location,
        }),
      })
      await res.json()
      setAssignLocationModalOpen(false)
      toast.success("Product location assigned successfully")

      // Refresh warehouse stock
      const stockRes = await fetch(`http://localhost:8800/api/warehouses/${id}/stock`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      const stockData = await stockRes.json()
      setWarehouseStock(stockData)
    } catch (error) {
      console.error("Error assigning location:", error)
      toast.error("Failed to assign product location")
    }
  }

  if (loading)
    return (
      <>
        <Header />
        <DashboardLayout>
          <div className="container mx-auto px-4 py-6 flex items-center justify-center h-[50vh]">
            <div className="flex flex-col items-center gap-2">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="text-muted-foreground">Loading warehouse details...</p>
            </div>
          </div>
        </DashboardLayout>
      </>
    )

  if (!warehouse)
    return (
      <>
        <Header />
        <DashboardLayout>
          <div className="container mx-auto px-4 py-6 flex flex-col items-center justify-center h-[50vh]">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-red-500">Warehouse Not Found</h2>
            <p className="text-muted-foreground mt-2">The requested warehouse could not be found.</p>
            <Button variant="outline" onClick={() => router.push("/inventory/warehouse")} className="mt-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Warehouses
            </Button>
          </div>
        </DashboardLayout>
      </>
    )

  // Fallback for optional lists
  const stockMovements = warehouse.stockMovements || []

  // Calculate capacity percentage
  const capacityPercentage = (warehouse.usedCapacity / warehouse.capacity) * 100

  return (
    <>
      <Header />
      <DashboardLayout>
        <div className="container mx-auto px-4 py-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => router.push("/inventory/warehouse")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-bold">Warehouse Details</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsUpdateModalOpen(true)} className="flex items-center gap-1">
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="flex items-center gap-1"
              >
                <Trash className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>

          <Card className="shadow-md">
            <CardHeader className="pb-2">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <CardTitle className="text-2xl">{warehouse.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {warehouse.location}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setAssignLocationModalOpen(true)}
                  className="flex items-center gap-1 md:self-end"
                >
                  <MapPin className="h-4 w-4" />
                  Assign Product Location
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card className="bg-muted/40">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Total Capacity</p>
                            <p className="text-2xl font-bold">{formatNumber(warehouse.capacity)}</p>
                          </div>
                          <Database className="h-8 w-8 text-primary" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/40">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Available Space</p>
                            <p className="text-2xl font-bold text-green-600">
                              {formatNumber(warehouse.availableCapacity)}
                            </p>
                          </div>
                          <Package className="h-8 w-8 text-green-600" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/40">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Used Capacity</p>
                            <p className="text-2xl font-bold text-amber-600">{formatNumber(warehouse.usedCapacity)}</p>
                          </div>
                          <Activity className="h-8 w-8 text-amber-600" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <BarChart2 className="h-5 w-5 text-primary" />
                      Capacity Utilization
                    </h3>
                    <Progress value={capacityPercentage} className="h-2" />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Used: {warehouse.usedCapacity}</span>
                      <span className="text-muted-foreground">Available: {warehouse.availableCapacity}</span>
                      <span className="font-medium">Total: {warehouse.capacity}</span>
                    </div>

                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-2">Contact Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-primary" />
                          <span>{warehouse.contactInfo?.phone || "No phone number"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-primary" />
                          <span>{warehouse.contactInfo?.email || "No email address"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-[250px]">
                  <WarehouseCapacityChart usedCapacity={warehouse.usedCapacity} totalCapacity={warehouse.capacity} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="stock" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="stock">Warehouse Stock</TabsTrigger>
              <TabsTrigger value="movements">Stock Movements</TabsTrigger>
            </TabsList>

            <TabsContent value="stock" className="pt-4">
              <WarehouseStock warehouseId={id as string} />
            </TabsContent>

            <TabsContent value="movements" className="pt-4">
              <Card className="shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Activity className="h-5 w-5 text-primary" />
                    Stock Movement History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stockMovements.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                      <Calendar className="h-12 w-12 mb-4" />
                      <p>No stock movement data available</p>
                    </div>
                  ) : (
                    <div className="rounded-md border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Type</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {stockMovements.map((movement) => (
                            <TableRow key={movement.id}>
                              <TableCell>
                                {new Date(movement.date).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </TableCell>
                              <TableCell>{movement.product}</TableCell>
                              <TableCell className="font-medium">{movement.quantity}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={movement.type === "in" ? "outline" : "secondary"}
                                  className={`${
                                    movement.type === "in"
                                      ? "border-green-500 text-green-600 bg-green-50"
                                      : "border-red-500 text-red-600 bg-red-50"
                                  }`}
                                >
                                  {movement.type === "in" ? (
                                    <ArrowUpRight className="h-3 w-3 mr-1" />
                                  ) : (
                                    <ArrowDownRight className="h-3 w-3 mr-1" />
                                  )}
                                  {movement.type === "in" ? "Incoming" : "Outgoing"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>

      {/* Update Warehouse Modal */}
      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <UI_DialogHeader>
            <UI_DialogTitle>Update Warehouse</UI_DialogTitle>
          </UI_DialogHeader>
          <form onSubmit={handleUpdateSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={updateForm.name || ""}
                  onChange={(e) => setUpdateForm({ ...updateForm, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">
                  Location
                </Label>
                <Input
                  id="location"
                  value={updateForm.location || ""}
                  onChange={(e) => setUpdateForm({ ...updateForm, location: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="capacity" className="text-right">
                  Capacity
                </Label>
                <Input
                  id="capacity"
                  type="number"
                  value={updateForm.capacity}
                  onChange={(e) => {
                    const parsed = Number.parseInt(e.target.value)
                    setUpdateForm({
                      ...updateForm,
                      capacity: isNaN(parsed) ? 0 : parsed,
                    })
                  }}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Phone
                </Label>
                <Input
                  id="phone"
                  value={updateForm.contactInfo?.phone || ""}
                  onChange={(e) =>
                    setUpdateForm({
                      ...updateForm,
                      contactInfo: { ...updateForm.contactInfo, phone: e.target.value },
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  value={updateForm.contactInfo?.email || ""}
                  onChange={(e) =>
                    setUpdateForm({
                      ...updateForm,
                      contactInfo: { ...updateForm.contactInfo, email: e.target.value },
                    })
                  }
                  className="col-span-3"
                />
              </div>
            </div>
            <UI_DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsUpdateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Warehouse</Button>
            </UI_DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Confirm Deletion
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Are you sure you want to delete <strong>{warehouse.title}</strong>?
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              This action cannot be undone. This will permanently delete the warehouse and all associated data.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Warehouse
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Product Location Modal */}
      <Dialog open={assignLocationModalOpen} onOpenChange={setAssignLocationModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Assign Product Location</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Product</Label>
              <Select
                value={assignLocationForm.productId}
                onValueChange={(value) => setAssignLocationForm({ ...assignLocationForm, productId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Product" />
                </SelectTrigger>
                <SelectContent>
                  {warehouseStock.map((item) => (
                    <UI_SelectItem key={item.productId} value={item.productId}>
                      {item.product.title}
                    </UI_SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Location (Aisle, Rack, Bin)</Label>
              <Input
                placeholder="e.g. A-1-2"
                value={assignLocationForm.location || ""}
                onChange={(e) => setAssignLocationForm({ ...assignLocationForm, location: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Specify the exact location in the warehouse where this product is stored.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignLocationModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAssignLocation}
              disabled={!assignLocationForm.productId || !assignLocationForm.location}
            >
              Assign Location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default WarehouseDetailsPage

