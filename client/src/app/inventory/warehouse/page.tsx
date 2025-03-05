"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/inventory/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Warehouse, BarChart3, Package, DollarSign } from "lucide-react";
import { formatCurrency, formatNumber } from "@/app/inventory/lib/utils";
import Header from "@/components/global/Header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const WarehousesPage = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCapacity, setFilterCapacity] = useState("all");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const res = await fetch("http://localhost:8800/api/warehouses");
        const data = await res.json();
        setWarehouses(data);
      } catch (error) {
        console.error("Error fetching warehouses:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWarehouses();
  }, []);

  const filteredWarehouses = warehouses.filter((warehouse: any) => {
    const matchesSearch = warehouse.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCapacity = filterCapacity === "all" || warehouse.capacity >= parseInt(filterCapacity);
    return matchesSearch && matchesCapacity;
  });

  const totalStockValue = warehouses.reduce((sum: number, warehouse: any) => sum + warehouse.totalStock * 50, 0);
  const totalStockItems = warehouses.reduce((sum: number, warehouse: any) => sum + warehouse.totalStock, 0);
  const totalCapacity = warehouses.reduce((sum: number, warehouse: any) => sum + warehouse.capacity, 0);

  return (
    <>
      <Header />
      <DashboardLayout>
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold mb-6">Warehouses</h1>

          {/* Summary Cards */}
          <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Stock Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalStockValue)}</div>
                <p className="text-xs text-muted-foreground">Across all warehouses</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Stock Quantity</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(totalStockItems)}</div>
                <p className="text-xs text-muted-foreground">Total stock across warehouses</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
                <Warehouse className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(totalCapacity)}</div>
                <p className="text-xs text-muted-foreground">Total capacity across warehouses</p>
              </CardContent>
            </Card>
          </div>

          {/* Search & Filter */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search warehouses by name..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterCapacity} onValueChange={setFilterCapacity}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by Capacity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Capacities</SelectItem>
                <SelectItem value="50">50+</SelectItem>
                <SelectItem value="100">100+</SelectItem>
                <SelectItem value="200">200+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <p className="text-center">Loading warehouses...</p>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Available Stock</TableHead>
                    <TableHead>Used Stock</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWarehouses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No warehouses found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredWarehouses.map((warehouse: any) => (
                      <TableRow key={warehouse.id}>
                        <TableCell>{warehouse.name}</TableCell>
                        <TableCell>{warehouse.location}</TableCell>
                        <TableCell>{warehouse.capacity}</TableCell>
                        <TableCell>{warehouse.availableCapacity}</TableCell>
                        <TableCell>{warehouse.usedCapacity}</TableCell>
                        <TableCell>{warehouse.contactInfo?.phone || "N/A"}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" onClick={() => router.push(`/inventory/warehouse/${warehouse.id}`)}>
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
};

export default WarehousesPage;
