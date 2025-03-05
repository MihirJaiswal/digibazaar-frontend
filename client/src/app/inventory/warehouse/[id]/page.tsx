"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { DashboardLayout } from "@/components/inventory/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Header from "@/components/global/Header";
import { formatNumber } from "@/app/inventory/lib/utils";
import { Database, Package, Activity, Edit, Trash, Mail, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";
import { SelectItem } from "@/components/ui/select";
import { SelectContent } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SelectValue } from "@/components/ui/select";
import { SelectTrigger } from "@/components/ui/select";
import { DialogContent } from "@/components/ui/dialog";
import { Dialog } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface Warehouse {
  id: string;
  name: string;
  location: string;
  capacity: number;
  availableCapacity: number;
  usedCapacity: number;
  contactInfo: { phone: string; email: string };
  stockMovements?: Array<{
    date: string;
    product: string;
    quantity: number;
    type: "in" | "out";
  }>;
}

interface StockItem {
  id: string;
  productId: string;
  quantity: number;
  location?: string;
  product: { name: string };
}

const WarehouseDetailsPage = () => {
  const router = useRouter();
  const { id } = useParams();

  // Warehouse state
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [loading, setLoading] = useState(true);

  // Update warehouse modal state & form (using nested contactInfo)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    name: "",
    location: "",
    capacity: 0,
    contactInfo: { phone: "", email: "" },
  });

  // Warehouse stock state
  const [warehouseStock, setWarehouseStock] = useState<StockItem[]>([]);

  // Assign location modal state & form
  const [assignLocationModalOpen, setAssignLocationModalOpen] = useState(false);
  const [assignLocationForm, setAssignLocationForm] = useState({
    productId: "",
    location: "",
  });

  // Fetch warehouse details
  useEffect(() => {
    const fetchWarehouseDetails = async () => {
      try {
        const res = await fetch(`http://localhost:8800/api/warehouses/${id}`);
        const data = await res.json();
        setWarehouse(data);
      } catch (error) {
        console.error("Error fetching warehouse details:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchWarehouseDetails();
  }, [id]);

  // Pre-fill the update form when modal opens
  useEffect(() => {
    if (isUpdateModalOpen && warehouse) {
      setUpdateForm({
        name: warehouse.name ?? "",
        location: warehouse.location ?? "",
        capacity: warehouse.capacity ?? 0,
        contactInfo: warehouse.contactInfo ?? { phone: "", email: "" },
      });
    }
  }, [isUpdateModalOpen, warehouse]);

  // Fetch warehouse stock
  useEffect(() => {
    const fetchWarehouseStock = async () => {
      try {
        const res = await fetch(`http://localhost:8800/api/warehouses/${id}/stock`);
        const data = await res.json();
        setWarehouseStock(data);
      } catch (error) {
        console.error("Error fetching warehouse stock:", error);
      }
    };
    if (id) fetchWarehouseStock();
  }, [id]);

  // Delete warehouse
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this warehouse?")) {
      try {
        const res = await fetch(`http://localhost:8800/api/warehouses/${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          toast.success("Warehouse deleted successfully");
          router.push("/inventory/warehouse");
        } else {
          console.error("Failed to delete warehouse");
        }
      } catch (error) {
        console.error("Error deleting warehouse:", error);
      }
    }
  };

  // Update warehouse details
  const handleUpdateSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:8800/api/warehouses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateForm),
      });
      if (res.ok) {
        const updatedWarehouse = await res.json();
        setWarehouse(updatedWarehouse);
        toast.success("Warehouse updated successfully");
        setIsUpdateModalOpen(false);
      } else {
        console.error("Failed to update warehouse");
      }
    } catch (error) {
      console.error("Error updating warehouse:", error);
    }
  };

  // Submit assign product location
  const handleAssignLocation = async () => {
    try {
      const res = await fetch("http://localhost:8800/api/warehouses/assign-location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          warehouseId: id,
          productId: assignLocationForm.productId,
          location: assignLocationForm.location,
        }),
      });
      await res.json();
      setAssignLocationModalOpen(false);
      toast.success("Product location assigned successfully");
      // Optionally refresh warehouse details
    } catch (error) {
      console.error("Error assigning location:", error);
      toast.error("Failed to assign product location");
    }
  };

  if (loading) return <p className="text-center">Loading warehouse details...</p>;
  if (!warehouse) return <p className="text-center text-red-500">Warehouse not found</p>;

  // Fallback for optional lists
  const stockMovements = warehouse.stockMovements || [];

  return (
    <>
      <Header />
      <DashboardLayout>
        <div className="container mx-auto px-4 py-6">
          <Button variant="outline" onClick={() => router.push("/inventory/warehouse")}>
            ← Back to Warehouses
          </Button>

          {/* Warehouse Action Buttons */}
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsUpdateModalOpen(true)}
              className="flex items-center gap-1"
            >
              <Edit size={16} /> Update Warehouse
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="flex items-center gap-1"
            >
              <Trash size={16} /> Delete Warehouse
            </Button>
            <Button variant="outline" onClick={() => setAssignLocationModalOpen(true)}>
              Assign Product Location
            </Button>
          </div>

          <h1 className="text-3xl font-bold mt-4">{warehouse.name}</h1>
          <p className="text-gray-500">{warehouse.location}</p>

          {/* Warehouse Stats */}
          <div className="grid gap-6 mt-6 md:grid-cols-3">
            <Card>
              <CardHeader className="flex items-center gap-2">
                <Database size={20} />
                <CardTitle>Total Capacity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(warehouse.capacity)}</div>
                <p className="text-sm text-gray-500">Max storage capacity</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex items-center gap-2">
                <Package size={20} />
                <CardTitle>Available Stock</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(warehouse.availableCapacity)}</div>
                <p className="text-sm text-gray-500">Stock currently in storage</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex items-center gap-2">
                <Activity size={20} />
                <CardTitle>Used Capacity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(warehouse.usedCapacity)}</div>
                <p className="text-sm text-gray-500">Space occupied by stock</p>
              </CardContent>
            </Card>
          </div>

          {/* Stock Movement Section */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold">Stock Movement</h2>
            <div className="border rounded-lg mt-4 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Product</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Type</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockMovements.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        No stock movement data
                      </TableCell>
                    </TableRow>
                  ) : (
                    stockMovements.map((movement, index) => (
                      <TableRow key={index}>
                        <TableCell>{new Date(movement.date).toLocaleDateString()}</TableCell>
                        <TableCell>{movement.product}</TableCell>
                        <TableCell>{movement.quantity}</TableCell>
                        <TableCell className={movement.type === "in" ? "text-green-500" : "text-red-500"}>
                          {movement.type === "in" ? "Incoming" : "Outgoing"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Warehouse Stock Section */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold">Warehouse Stock</h2>
            <div className="border rounded-lg mt-4 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {warehouseStock.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        No stock available
                      </TableCell>
                    </TableRow>
                  ) : (
                    warehouseStock.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.product.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.location || "Not assigned"}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={() => {
                              setAssignLocationForm({
                                productId: item.productId,
                                location: item.location || "",
                              });
                              setAssignLocationModalOpen(true);
                            }}
                          >
                            <MapPin size={16} /> Assign Product Location
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </DashboardLayout>

      {/* Update Warehouse Modal */}
      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Warehouse</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateSubmit}>
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input 
                  value={updateForm.name || ""}
                  onChange={(e) =>
                    setUpdateForm({ ...updateForm, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Location</Label>
                <Input 
                  value={updateForm.location || ""}
                  onChange={(e) =>
                    setUpdateForm({ ...updateForm, location: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Capacity</Label>
                <Input 
                  type="number"
                  value={updateForm.capacity}
                  onChange={(e) => {
                    const parsed = parseInt(e.target.value);
                    setUpdateForm({
                      ...updateForm,
                      capacity: isNaN(parsed) ? 0 : parsed,
                    });
                  }}
                />
              </div>
              <div>
                <Label>Contact Info (Phone)</Label>
                <Input 
                  value={updateForm.contactInfo?.phone || ""}
                  onChange={(e) =>
                    setUpdateForm({
                      ...updateForm,
                      contactInfo: { ...updateForm.contactInfo, phone: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input 
                  value={updateForm.contactInfo?.email || ""}
                  onChange={(e) =>
                    setUpdateForm({
                      ...updateForm,
                      contactInfo: { ...updateForm.contactInfo, email: e.target.value },
                    })
                  }
                />
              </div>
              <Button
                type="submit">
                Update Warehouse
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Product Location Modal */}
      <Dialog open={assignLocationModalOpen} onOpenChange={setAssignLocationModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Product Location</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Product</Label>
              <Select
                onValueChange={(value) =>
                  setAssignLocationForm({ ...assignLocationForm, productId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Product" />
                </SelectTrigger>
                <SelectContent>
                  {warehouseStock.map((item) => (
                    <SelectItem key={item.productId} value={item.productId}>
                      {item.product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Location (Aisle, Rack, Bin)</Label>
              <Input 
                placeholder="e.g. A-1-2"
                value={assignLocationForm.location || ""}
                onChange={(e) =>
                  setAssignLocationForm({ ...assignLocationForm, location: e.target.value })
                }
              />
            </div>
            <Button
              onClick={handleAssignLocation}
              disabled={!assignLocationForm.productId || !assignLocationForm.location}
            >
              Assign Location
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WarehouseDetailsPage;
