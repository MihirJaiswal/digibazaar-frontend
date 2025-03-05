"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/inventory/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, ClipboardList, Eye, MoreHorizontal, Plus, Search, Truck } from "lucide-react"
import { formatCurrency, formatDate, getStatusColor } from "@/app/inventory/lib/utils"
import { toast } from "sonner"
import { useOrderStore } from "@/app/inventory/store/OrderStore"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import Header from "@/components/global/Header" 
// Mock order data
const mockOrders = [
  {
    id: "ORD-001",
    customer: "John Smith",
    date: "2023-05-15",
    status: "Delivered",
    total: 249.97,
    items: [
      { id: "1", name: "Premium Headphones", quantity: 1, price: 99.99 },
      { id: "3", name: "USB-C Cable", quantity: 2, price: 9.99 },
      { id: "5", name: "Laptop Stand", quantity: 1, price: 49.99 },
    ],
  },
  {
    id: "ORD-002",
    customer: "Sarah Johnson",
    date: "2023-05-18",
    status: "Processing",
    total: 159.98,
    items: [
      { id: "2", name: "Wireless Keyboard", quantity: 1, price: 59.99 },
      { id: "4", name: "Bluetooth Speaker", quantity: 1, price: 79.99 },
      { id: "3", name: "USB-C Cable", quantity: 2, price: 9.99 },
    ],
  },
  {
    id: "ORD-003",
    customer: "Michael Brown",
    date: "2023-05-20",
    status: "Pending",
    total: 129.97,
    items: [
      { id: "6", name: "Wireless Mouse", quantity: 1, price: 29.99 },
      { id: "4", name: "Bluetooth Speaker", quantity: 1, price: 79.99 },
      { id: "7", name: "HDMI Cable", quantity: 1, price: 14.99 },
    ],
  },
  {
    id: "ORD-004",
    customer: "Emily Davis",
    date: "2023-05-22",
    status: "Shipped",
    total: 189.97,
    items: [
      { id: "1", name: "Premium Headphones", quantity: 1, price: 99.99 },
      { id: "6", name: "Wireless Mouse", quantity: 1, price: 29.99 },
      { id: "5", name: "Laptop Stand", quantity: 1, price: 49.99 },
    ],
  },
  {
    id: "ORD-005",
    customer: "David Wilson",
    date: "2023-05-25",
    status: "Cancelled",
    total: 109.98,
    items: [
      { id: "2", name: "Wireless Keyboard", quantity: 1, price: 59.99 },
      { id: "7", name: "HDMI Cable", quantity: 1, price: 14.99 },
      { id: "3", name: "USB-C Cable", quantity: 2, price: 9.99 },
    ],
  },
]

// Order status options
const statusOptions = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"]

export default function OrdersPage() {
  const [orders, setOrders] = useState(mockOrders)
  const [isLoading, setIsLoading] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [newOrder, setNewOrder] = useState({
    customer: "",
    items: [{ id: "", name: "", quantity: 1, price: 0 }],
    status: "Pending",
  })

  const { filters, setFilters, resetFilters } = useOrderStore()


  // Filter orders based on search, status, and date range
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customer.toLowerCase().includes(filters.search.toLowerCase()) ||
      order.id.toLowerCase().includes(filters.search.toLowerCase())
    const matchesStatus = !filters.status || order.status === filters.status

    let matchesDateRange = true
    if (filters.dateRange[0] && filters.dateRange[1]) {
      const orderDate = new Date(order.date)
      const startDate = filters.dateRange[0]
      const endDate = filters.dateRange[1]
      matchesDateRange = orderDate >= startDate && orderDate <= endDate
    }

    return matchesSearch && matchesStatus && matchesDateRange
  })

  const handleStatusChange = (orderId: string, newStatus: string) => {
    setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))

    toast.success(`Order ${orderId} status changed to ${newStatus}`, {
      description: `Order ${orderId} status changed to ${newStatus}`,
    })
  }

  const handleAddOrder = () => {
    const newOrderId = `ORD-${String(orders.length + 1).padStart(3, "0")}`
    const total = newOrder.items.reduce((sum, item) => sum + item.quantity * item.price, 0)

    const orderToAdd = {
      id: newOrderId,
      customer: newOrder.customer,
      date: new Date().toISOString().split("T")[0],
      status: newOrder.status,
      total,
      items: newOrder.items,
    }

    setOrders([...orders, orderToAdd])
    setNewOrder({
      customer: "",
      items: [{ id: "", name: "", quantity: 1, price: 0 }],
      status: "Pending",
    })
    setIsAddDialogOpen(false)

    toast.success("Order created", {
      description: `Order ${newOrderId} has been created successfully`,
    })
  }

  const addItemToNewOrder = () => {
    setNewOrder({
      ...newOrder,
      items: [...newOrder.items, { id: "", name: "", quantity: 1, price: 0 }],
    })
  }

  const removeItemFromNewOrder = (index: number) => {
    if (newOrder.items.length === 1) return

    setNewOrder({
      ...newOrder,
      items: newOrder.items.filter((_, i) => i !== index),
    })
  }

  const updateNewOrderItem = (index: number, field: string, value: any) => {
    setNewOrder({
      ...newOrder,
      items: newOrder.items.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    })
  }

  return (
    <>
    <Header/>
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Orders</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Order
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Order</DialogTitle>
                <DialogDescription>Add a new customer order to the system.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="customer">Customer Name</Label>
                  <Input
                    id="customer"
                    value={newOrder.customer}
                    onChange={(e) => setNewOrder({ ...newOrder, customer: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Order Status</Label>
                  <Select value={newOrder.status} onValueChange={(value) => setNewOrder({ ...newOrder, status: value })}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                        {statusOptions.map((status) => (
                        <SelectItem key={status} value={status || "default"}>
                            {status}
                        </SelectItem>
                        ))}
                    </SelectContent>
                    </Select>

                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Order Items</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addItemToNewOrder}>
                      <Plus className="h-4 w-4 mr-1" /> Add Item
                    </Button>
                  </div>
                  {newOrder.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5">
                        <Input
                          placeholder="Item name"
                          value={item.name}
                          onChange={(e) => updateNewOrderItem(index, "name", e.target.value)}
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          placeholder="Qty"
                          value={String(item.quantity)}
                          onChange={(e) => updateNewOrderItem(index, "quantity", Number.parseInt(e.target.value))}
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                          type="number"
                          placeholder="Price"
                          value={String(item.price)}
                          onChange={(e) => updateNewOrderItem(index, "price", Number.parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="col-span-2 flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItemFromNewOrder(index)}
                          disabled={newOrder.items.length === 1}
                        >
                          <Truck className="h-4 w-4" />
                          <span className="sr-only">Remove item</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddOrder}>Create Order</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders by ID or customer..."
              className="pl-8"
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
            />
          </div>
          <Select value={filters.status || "Pending"} onValueChange={(value) => setFilters({ status: value })}>
                <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Pending">All Statuses</SelectItem> {/* Ensure a default value */}
                    {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                        {status}
                    </SelectItem>
                    ))}
                </SelectContent>
                </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full md:w-[240px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateRange[0] && filters.dateRange[1] ? (
                  <>
                    {filters.dateRange[0].toLocaleDateString()} - {filters.dateRange[1].toLocaleDateString()}
                  </>
                ) : (
                  <span>Select date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={{
                  from: filters.dateRange[0] || undefined,
                  to: filters.dateRange[1] || undefined,
                }}
                onSelect={(range) =>
                  setFilters({
                    dateRange: [range?.from || null, range?.to || null],
                  })
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button variant="outline" onClick={resetFilters}>
            Reset Filters
          </Button>
        </div>

        {/* Orders Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center">
                      <ClipboardList className="h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No orders found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{formatDate(order.date)}</TableCell>
                    <TableCell>
                      <Badge className={cn("text-xs", getStatusColor(order.status))}>{order.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(order.total)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedOrder(order)
                              setIsViewDialogOpen(true)
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                          {statusOptions.map((status) => (
                            <DropdownMenuItem
                              key={status}
                              disabled={order.status === status}
                              onClick={() => handleStatusChange(order.id, status)}
                            >
                              <Badge className={cn("mr-2 text-xs", getStatusColor(status))}>{status}</Badge>
                              Set as {status}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* View Order Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
              <DialogDescription>
                {selectedOrder && `Order ${selectedOrder.id} - ${formatDate(selectedOrder.date)}`}
              </DialogDescription>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Customer</h3>
                    <p className="font-medium">{selectedOrder.customer}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                    <Badge className={cn("text-xs", getStatusColor(selectedOrder.status))}>
                      {selectedOrder.status}
                    </Badge>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Order Items</h3>
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead className="text-right">Quantity</TableHead>
                          <TableHead className="text-right">Price</TableHead>
                          <TableHead className="text-right">Subtotal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedOrder.items.map((item: any) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.quantity * item.price)}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={3} className="text-right font-medium">
                            Total
                          </TableCell>
                          <TableCell className="text-right font-bold">{formatCurrency(selectedOrder.total)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Order Timeline</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <p className="text-sm">Order Created - {formatDate(selectedOrder.date)}</p>
                    </div>
                    {selectedOrder.status !== "Pending" && (
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                        <p className="text-sm">
                          Processing Started - {formatDate(new Date(new Date(selectedOrder.date).getTime() + 86400000))}
                        </p>
                      </div>
                    )}
                    {(selectedOrder.status === "Shipped" || selectedOrder.status === "Delivered") && (
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                        <p className="text-sm">
                          Shipped - {formatDate(new Date(new Date(selectedOrder.date).getTime() + 172800000))}
                        </p>
                      </div>
                    )}
                    {selectedOrder.status === "Delivered" && (
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <p className="text-sm">
                          Delivered - {formatDate(new Date(new Date(selectedOrder.date).getTime() + 259200000))}
                        </p>
                      </div>
                    )}
                    {selectedOrder.status === "Cancelled" && (
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-red-500"></div>
                        <p className="text-sm">
                          Cancelled - {formatDate(new Date(new Date(selectedOrder.date).getTime() + 86400000))}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Close
              </Button>
              {selectedOrder && selectedOrder.status !== "Delivered" && selectedOrder.status !== "Cancelled" && (
                <Select
                value={selectedOrder?.status || "Pending"}
                onValueChange={(value) => {
                  handleStatusChange(selectedOrder.id, value)
                  setSelectedOrder({ ...selectedOrder, status: value })
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Change Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status || "Pending"} disabled={selectedOrder.status === status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
    </>
  )
}

