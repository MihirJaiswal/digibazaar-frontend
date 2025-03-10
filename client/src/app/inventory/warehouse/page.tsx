"use client";

import { useState, useMemo, useCallback, Suspense } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/inventory/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Warehouse,
  BarChart3,
  Package,
  DollarSign,
  Plus,
  MapPin,
  Phone,
  ArrowUpDown,
  RefreshCw,
  Building2,
} from "lucide-react";
import { formatCurrency, formatNumber } from "@/app/inventory/lib/utils";
import Header from "@/components/global/Header";
import dynamic from "next/dynamic";
import { useAuthStore } from "@/store/authStore";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";

// Create a QueryClient instance
const queryClient = new QueryClient();

const WarehouseCapacityChart = dynamic(
  () => import("@/components/inventory/warehouse-capacity-chart"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        Loading chart...
      </div>
    ),
  }
);

const WarehouseSkeleton = () => (
  <div className="space-y-3 animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    <div className="h-20 bg-gray-200 rounded"></div>
  </div>
);

const ITEMS_PER_PAGE = 10;

interface WarehouseType {
  id: string;
  name: string;
  location: string;
  capacity: number;
  availableCapacity: number;
  usedCapacity: number;
  totalStock: number;
  contactInfo?: {
    phone?: string;
    email?: string;
  };
}

const DashboardStats = ({ warehouses }: { warehouses: WarehouseType[] }) => {
  const stats = useMemo(() => {
    const totalStockValue = warehouses.reduce(
      (sum, warehouse) => sum + warehouse.totalStock * 50,
      0
    );
    const totalStockItems = warehouses.reduce(
      (sum, warehouse) => sum + warehouse.totalStock,
      0
    );
    const totalCapacity = warehouses.reduce(
      (sum, warehouse) => sum + warehouse.capacity,
      0
    );
    const totalUsedCapacity = warehouses.reduce(
      (sum, warehouse) => sum + warehouse.usedCapacity,
      0
    );
    const averageUtilization =
      warehouses.length > 0 ? (totalUsedCapacity / totalCapacity) * 100 : 0;
    return {
      totalStockValue,
      totalStockItems,
      totalCapacity,
      totalUsedCapacity,
      averageUtilization,
    };
  }, [warehouses]);
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Stock Value
          </CardTitle>
          <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
            {formatCurrency(stats.totalStockValue)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Across all warehouses
          </p>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Stock Quantity
          </CardTitle>
          <Package className="h-5 w-5 text-green-600 dark:text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-700 dark:text-green-300">
            {formatNumber(stats.totalStockItems)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Items in inventory
          </p>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
          <Warehouse className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-amber-700 dark:text-amber-300">
            {formatNumber(stats.totalCapacity)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Maximum storage capacity
          </p>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Utilization</CardTitle>
          <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">
            {stats.averageUtilization.toFixed(1)}%
          </div>
          <Progress value={stats.averageUtilization} className="h-2 mt-2" />
        </CardContent>
      </Card>
    </div>
  );
};

const WarehouseTable = ({
  warehouses,
  handleSort,
  onViewDetails,
}: {
  warehouses: WarehouseType[];
  handleSort: (key: keyof WarehouseType) => void;
  sortConfig: { key: keyof WarehouseType | null; direction: "ascending" | "descending" };
  onViewDetails: (id: string) => void;
}) => {
  return (
    <div className="rounded-lg border overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>
              <Button
                variant="ghost"
                className="flex items-center gap-1 p-0 h-auto font-semibold"
                onClick={() => handleSort("name")}
              >
                Name
                <ArrowUpDown className="h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                className="flex items-center gap-1 p-0 h-auto font-semibold"
                onClick={() => handleSort("location")}
              >
                Location
                <ArrowUpDown className="h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                className="flex items-center gap-1 p-0 h-auto font-semibold"
                onClick={() => handleSort("capacity")}
              >
                Capacity
                <ArrowUpDown className="h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                className="flex items-center gap-1 p-0 h-auto font-semibold"
                onClick={() => handleSort("availableCapacity")}
              >
                Available
                <ArrowUpDown className="h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                className="flex items-center gap-1 p-0 h-auto font-semibold"
                onClick={() => handleSort("usedCapacity")}
              >
                Used
                <ArrowUpDown className="h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Utilization</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {warehouses.map((warehouse) => {
            const utilizationPercentage =
              (warehouse.usedCapacity / warehouse.capacity) * 100;
            let utilizationColor = "bg-green-500";
            if (utilizationPercentage > 90)
              utilizationColor = "bg-red-500";
            else if (utilizationPercentage > 70)
              utilizationColor = "bg-amber-500";
            return (
              <TableRow
                key={warehouse.id}
                className="hover:bg-muted/50 transition-colors"
              >
                <TableCell className="font-medium">
                  {warehouse.name}
                </TableCell>
                <TableCell className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  {warehouse.location}
                </TableCell>
                <TableCell>{formatNumber(warehouse.capacity)}</TableCell>
                <TableCell>
                  {formatNumber(warehouse.availableCapacity)}
                </TableCell>
                <TableCell>{formatNumber(warehouse.usedCapacity)}</TableCell>
                <TableCell>
                  {warehouse.contactInfo?.phone ? (
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      {warehouse.contactInfo.phone}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">N/A</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={utilizationPercentage}
                      className={`h-2 w-16 ${utilizationColor}`}
                    />
                    <span className="text-sm">
                      {utilizationPercentage.toFixed(0)}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetails(warehouse.id)}
                    className="hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

const WarehouseGrid = ({
  warehouses,
  onViewDetails,
}: {
  warehouses: WarehouseType[];
  onViewDetails: (id: string) => void;
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {warehouses.map((warehouse) => {
        const utilizationPercentage =
          (warehouse.usedCapacity / warehouse.capacity) * 100;
        let utilizationColor = "text-green-600";
        let utilizationBg = "bg-green-500";
        if (utilizationPercentage > 90) {
          utilizationColor = "text-red-600";
          utilizationBg = "bg-red-500";
        } else if (utilizationPercentage > 70) {
          utilizationColor = "text-amber-600";
          utilizationBg = "bg-amber-500";
        }
        return (
          <Card
            key={warehouse.id}
            className="overflow-hidden hover:shadow-md transition-shadow"
          >
            <CardHeader className="pb-2 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{warehouse.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />
                    {warehouse.location}
                  </CardDescription>
                </div>
                <Badge variant="outline" className={utilizationColor}>
                  {utilizationPercentage.toFixed(0)}% Used
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Capacity</p>
                  <p className="font-semibold">
                    {formatNumber(warehouse.capacity)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Available</p>
                  <p className="font-semibold">
                    {formatNumber(warehouse.availableCapacity)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Used</p>
                  <p className="font-semibold">
                    {formatNumber(warehouse.usedCapacity)}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Utilization</span>
                  <span>{utilizationPercentage.toFixed(1)}%</span>
                </div>
                <Progress
                  value={utilizationPercentage}
                  className={`h-2 ${utilizationBg}`}
                />
              </div>
              {warehouse.contactInfo?.phone && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  {warehouse.contactInfo.phone}
                </div>
              )}
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={() => onViewDetails(warehouse.id)}
              >
                View Details
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

const WarehousesPage = () => {
  const [searchTerm, _setSearchTerm] = useState("");
  const [filterCapacity, _setFilterCapacity] = useState("all");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof WarehouseType | null;
    direction: "ascending" | "descending";
  }>({ key: null, direction: "ascending" });
  const [viewMode, _setViewMode] = useState<"table" | "grid">("table");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("overview");
  const router = useRouter();
  const { token } = useAuthStore();

  // Use react-query to fetch warehouses data
  const {
    data: warehouses = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<WarehouseType[]>(
    ["warehouses"],
    async () => {
      const res = await fetch("http://localhost:8800/api/warehouses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch warehouses");
      return res.json();
    },
    { enabled: !!token }
  );

  const sortedFilteredWarehouses = useMemo(() => {
    const sorted = [...warehouses].sort((a, b) => {
      if (!sortConfig.key) return 0;
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortConfig.direction === "ascending"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      return sortConfig.direction === "ascending"
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });
    return sorted.filter((warehouse) => {
      const matchesSearch =
        warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        warehouse.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCapacity =
        filterCapacity === "all" ||
        warehouse.capacity >= parseInt(filterCapacity);
      return matchesSearch && matchesCapacity;
    });
  }, [warehouses, sortConfig, searchTerm, filterCapacity]);

  const paginatedWarehouses = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedFilteredWarehouses.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );
  }, [sortedFilteredWarehouses, currentPage]);

  const totalPages = useMemo(
    () => Math.ceil(sortedFilteredWarehouses.length / ITEMS_PER_PAGE),
    [sortedFilteredWarehouses]
  );

  const handleSort = useCallback(
    (key: keyof WarehouseType) => {
      let direction: "ascending" | "descending" = "ascending";
      if (sortConfig.key === key && sortConfig.direction === "ascending") {
        direction = "descending";
      }
      setSortConfig({ key, direction });
    },
    [sortConfig]
  );

  const handleViewDetails = useCallback(
    (warehouseId: string) => {
      router.push(`/inventory/warehouse/${warehouseId}`);
    },
    [router]
  );

  const refreshData = useCallback(() => {
    refetch();
  }, [refetch]);

  const totalUsedCapacity = useMemo(
    () => warehouses.reduce((sum, w) => sum + w.usedCapacity, 0),
    [warehouses]
  );
  const totalCapacity = useMemo(
    () => warehouses.reduce((sum, w) => sum + w.capacity, 0),
    [warehouses]
  );

  if (!token) {
    return (
      <>
        <Header />
        <DashboardLayout>
          <div className="container mx-auto px-4 py-6 space-y-6">
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <h3 className="text-lg font-medium">Authentication Required</h3>
              <p className="text-muted-foreground mt-1">
                Please log in to view warehouse data
              </p>
              <Button className="mt-4" onClick={() => router.push("/login")}>
                Go to Login
              </Button>
            </div>
          </div>
        </DashboardLayout>
      </>
    );
  }

  return (
    <>
      <Header />
      <DashboardLayout>
        <div className="container mx-auto px-4 py-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Warehouses</h1>
              <p className="text-muted-foreground">
                Manage and monitor your warehouse inventory
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={refreshData}
                className="flex items-center gap-1"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Refresh
              </Button>
              <Button
                className="flex items-center gap-1"
                onClick={() =>
                  router.push("/inventory/warehouse/create")
                }
              >
                <Plus className="h-4 w-4" />
                Add Warehouse
              </Button>
            </div>
          </div>
          {isError && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">
                {(error as Error)?.message}
              </span>
            </div>
          )}
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <WarehouseSkeleton key={i} />
              ))}
            </div>
          ) : sortedFilteredWarehouses.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No warehouses found</h3>
              <p className="text-muted-foreground mt-1">
                Try adjusting your search or filters
              </p>
            </div>
          ) : viewMode === "table" ? (
            <>
              <WarehouseTable
                warehouses={paginatedWarehouses}
                handleSort={handleSort}
                sortConfig={sortConfig}
                onViewDetails={handleViewDetails}
              />
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                    {Math.min(
                      currentPage * ITEMS_PER_PAGE,
                      sortedFilteredWarehouses.length
                    )}{" "}
                    of {sortedFilteredWarehouses.length} warehouses
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(totalPages, prev + 1)
                        )
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <WarehouseGrid
                warehouses={paginatedWarehouses}
                onViewDetails={handleViewDetails}
              />
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                    {Math.min(
                      currentPage * ITEMS_PER_PAGE,
                      sortedFilteredWarehouses.length
                    )}{" "}
                    of {sortedFilteredWarehouses.length} warehouses
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(totalPages, prev + 1)
                        )
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
          <Tabs
            defaultValue="overview"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-flex">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <DashboardStats warehouses={warehouses} />
            </TabsContent>
            <TabsContent value="analytics">
              <Suspense fallback={<WarehouseSkeleton />}>
                <WarehouseCapacityChart
                  usedCapacity={totalUsedCapacity}
                  totalCapacity={totalCapacity}
                />
              </Suspense>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </>
  );
};

export default function WarehousesPageWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <WarehousesPage />
    </QueryClientProvider>
  );
}
