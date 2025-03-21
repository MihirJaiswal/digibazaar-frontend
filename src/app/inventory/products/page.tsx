"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { DashboardLayout } from "@/components/inventory/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit,
  Eye,
  Filter,
  MoreHorizontal,
  Package,
  Plus,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { formatCurrency } from "@/app/inventory/lib/utils";
import { toast } from "sonner";
import Header from "@/components/global/Header";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetFooter,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  useQuery, 
  QueryClient, 
  QueryClientProvider 
} from "@tanstack/react-query";
import Image from "next/image";

// Define types
interface Product {
  id: number;
  title: string;
  sku: string;
  categoryId: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
  description: string;
  mainImage: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Filters {
  search: string;
  category: string;
  lowStock: boolean;
  priceRange: [number, number] | null;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

const categories = [
  "Electronics",
  "Accessories",
  "Furniture",
  "Office Supplies",
  "Storage",
];

// Create a client
const queryClient = new QueryClient();

// Wrapper component that provides the QueryClient to the app
function ProductsPageWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <ProductsPageContent />
    </QueryClientProvider>
  );
}

function ProductsPageContent() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState<boolean>(false);
  const [activeFilters, setActiveFilters] = useState<number>(0);
  const { token } = useAuthStore();
  const router = useRouter();

  const [filters, setFilters] = useState<Filters>({
    search: "",
    category: "",
    lowStock: false,
    priceRange: null,
    sortBy: "title",
    sortOrder: "asc",
  });

  // Fetch products using React Query
  const fetchProducts = async (): Promise<Product[]> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    
    if (!res.ok) {
      throw new Error("Failed to fetch products");
    }
    
    return res.json();
  };

  const {
    data: products,
    isLoading,
    isRefetching,
    refetch,
    error,
  } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: fetchProducts,
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 3,
    // Correctly placing error handling in the correct location
    meta: {
      errorHandler: (err: Error) => {
        console.error("Error fetching products:", err);
        toast.error("Failed to fetch products");
      }
    },
  });

  // Handle error using effect
  useEffect(() => {
    if (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products");
    }
  }, [error]);

  // Debounced search handler
  const debounce = (fn: Function, delay: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay);
    };
  };

  const handleSearchChange = useCallback(
    debounce((value: string) => {
      setFilters((prev) => ({ ...prev, search: value }));
      setCurrentPage(1); // Reset to first page when searching
    }, 300),
    []
  );

  const resetFilters = useCallback(() => {
    setFilters({
      search: "",
      category: "",
      lowStock: false,
      priceRange: null,
      sortBy: "title",
      sortOrder: "asc",
    });
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.category) count++;
    if (filters.lowStock) count++;
    if (filters.priceRange) count++;
    if (filters.sortBy !== "title" || filters.sortOrder !== "asc") count++;
    setActiveFilters(count);
  }, [filters]);

  // Manual refetch handler with toast notification
  const handleRefresh = useCallback(async () => {
    try {
      await refetch();
      toast.success("Products refreshed successfully");
    } catch {
      toast.error("Failed to refresh products");
    }
  }, [refetch]);

  const filteredProducts = useMemo(() => {
    // Make sure products is an array before filtering
    return (products || [])
      .filter((product) => {
        const productName = product.title?.toLowerCase() || "";
        const productSku = product.sku?.toLowerCase() || "";
        const searchTerm = filters.search.toLowerCase();

        const matchesSearch =
          !searchTerm || productName.includes(searchTerm) || productSku.includes(searchTerm);
        const matchesCategory = !filters.category || product.categoryId === filters.category;
        const matchesLowStock =
          !filters.lowStock || product.stock <= product.lowStockThreshold;
        const matchesPriceRange =
          !filters.priceRange ||
          (product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]);

        return matchesSearch && matchesCategory && matchesLowStock && matchesPriceRange;
      })
      .sort((a, b) => {
        const sortBy = filters.sortBy;
        const sortOrder = filters.sortOrder === "asc" ? 1 : -1;

        if (sortBy === "price") return (a.price - b.price) * sortOrder;
        if (sortBy === "stock") return (a.stock - b.stock) * sortOrder;
        return a.title.localeCompare(b.title) * sortOrder;
      });
  }, [products, filters]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleDetail = useCallback((id: number) => {
    router.push(`/inventory/products/${id}`);
  }, [router]);

  const handleAddProduct = useCallback(() => {
    router.push("/inventory/products/create");
  }, [router]);

  const handleSort = useCallback((column: string) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: column,
      sortOrder: prev.sortBy === column && prev.sortOrder === "asc" ? "desc" : "asc",
    }));
  }, []);

  const exportToCSV = useCallback(() => {
    const headers = ["ID", "Title", "SKU", "Category", "Price", "Stock", "Low Stock Threshold"];
    const csvContent = [
      headers.join(","),
      ...filteredProducts.map((product) =>
        [
          product.id,
          `"${product.title.replace(/"/g, '""')}"`,
          product.sku,
          product.categoryId,
          product.price,
          product.stock,
          product.lowStockThreshold,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `products_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Products exported successfully");
  }, [filteredProducts]);

  const renderSortableHeader = useCallback(
    (label: string, column: string) => (
      <div
        className="flex items-center cursor-pointer group"
        onClick={() => handleSort(column)}
      >
        {label}
        <ArrowUpDown
          className={`ml-1 h-4 w-4 transition-opacity ${
            filters.sortBy === column ? "opacity-100" : "opacity-0 group-hover:opacity-70"
          } ${filters.sortBy === column && filters.sortOrder === "desc" ? "rotate-180" : ""}`}
        />
      </div>
    ),
    [filters.sortBy, filters.sortOrder, handleSort]
  );

  if (isLoading) {
    return (
      <>
        <div className="mx-auto px-4 py-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <Skeleton className="h-8 w-1/4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-full mb-4" />
              <Table>
                <TableHeader>
                  <TableRow>
                    {Array(7)
                      .fill(0)
                      .map((_, i) => (
                        <TableHead key={i}>
                          <Skeleton className="h-4 w-20" />
                        </TableHead>
                      ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-10 w-10 rounded-md" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-[180px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-[80px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-[100px]" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-4 w-[60px] ml-auto" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-4 w-[50px] ml-auto" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-8 w-8 rounded-full ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <DashboardLayout>
        <div className="mx-auto md:px-4 md:py-6 ">
          <Card className="shadow-sm p-4 border">
            <CardHeader className="pb-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl font-bold">Products</CardTitle>
                  <CardDescription className="mt-1">
                    Manage your inventory products and stock levels
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isRefetching}
                  >
                    <RefreshCw
                      className={`mr-2 h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
                    />
                    Refresh
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportToCSV}>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                  <Button onClick={handleAddProduct} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="p-4 border-y bg-muted/20">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search products by name or SKU..."
                      className="pl-8 bg-white dark:bg-zinc-700"
                      value={filters.search}
                      onChange={(e) => handleSearchChange(e.target.value)}
                    />
                    {filters.search && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1 h-7 w-7"
                        onClick={() => setFilters({ ...filters, search: "" })}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <Sheet
                    open={isFilterSheetOpen}
                    onOpenChange={setIsFilterSheetOpen}
                  >
                    <SheetTrigger asChild>
                      <Button variant="outline" className="sm:w-auto w-full">
                        <Filter className="mr-2 h-4 w-4" />
                        Filters
                        {activeFilters > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {activeFilters}
                          </Badge>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="sm:max-w-md">
                      <SheetHeader>
                        <SheetTitle>Filter Products</SheetTitle>
                        <SheetDescription>
                          Refine your product list with custom filters
                        </SheetDescription>
                      </SheetHeader>
                      <div className="py-6 space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="category">Category</Label>
                          <Select
                            value={filters.category || ""}
                            onValueChange={(value) =>
                              setFilters({ ...filters, category: value })
                            }
                          >
                            <SelectTrigger id="category">
                              <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">All Categories</SelectItem>
                              {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="lowStock"
                              checked={filters.lowStock}
                              onCheckedChange={(checked) =>
                                setFilters({ ...filters, lowStock: !!checked })
                              }
                            />
                            <Label htmlFor="lowStock">
                              Show Low Stock Items Only
                            </Label>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Price Range</Label>
                          <div className="grid grid-cols-2 gap-4">
                            <Input
                              type="number"
                              placeholder="Min"
                              value={filters.priceRange?.[0] || ""}
                              onChange={(e) => {
                                const min = e.target.value ? Number(e.target.value) : 0;
                                const max = filters.priceRange?.[1] || 10000;
                                setFilters({
                                  ...filters,
                                  priceRange: [min, max],
                                });
                              }}
                            />
                            <Input
                              type="number"
                              placeholder="Max"
                              value={filters.priceRange?.[1] || ""}
                              onChange={(e) => {
                                const max = e.target.value ? Number(e.target.value) : 10000;
                                const min = filters.priceRange?.[0] || 0;
                                setFilters({
                                  ...filters,
                                  priceRange: [min, max],
                                });
                              }}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Sort By</Label>
                          <Select
                            value={filters.sortBy}
                            onValueChange={(value) =>
                              setFilters({ ...filters, sortBy: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="title">Product Name</SelectItem>
                              <SelectItem value="price">Price</SelectItem>
                              <SelectItem value="stock">Stock Level</SelectItem>
                            </SelectContent>
                          </Select>

                          <div className="flex items-center space-x-4 mt-2">
                            <Label>Order:</Label>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant={filters.sortOrder === "asc" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setFilters({ ...filters, sortOrder: "asc" })}
                              >
                                Ascending
                              </Button>
                              <Button
                                variant={filters.sortOrder === "desc" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setFilters({ ...filters, sortOrder: "desc" })}
                              >
                                Descending
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <SheetFooter className="flex flex-row gap-3 sm:justify-between">
                        <Button
                          variant="outline"
                          onClick={resetFilters}
                          className="flex-1"
                        >
                          Reset All
                        </Button>
                        <SheetClose asChild>
                          <Button className="flex-1">Apply Filters</Button>
                        </SheetClose>
                      </SheetFooter>
                    </SheetContent>
                  </Sheet>
                </div>

                {activeFilters > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {filters.category && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        Category: {filters.category}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1 p-0"
                          onClick={() => setFilters({ ...filters, category: "" })}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    )}
                    {filters.lowStock && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        Low Stock Only
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1 p-0"
                          onClick={() => setFilters({ ...filters, lowStock: false })}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    )}
                    {filters.priceRange && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        Price: ${filters.priceRange[0]} - ${filters.priceRange[1]}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1 p-0"
                          onClick={() => setFilters({ ...filters, priceRange: null })}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    )}
                    {(filters.sortBy !== "title" || filters.sortOrder !== "asc") && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        Sort: {filters.sortBy} ({filters.sortOrder})
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1 p-0"
                          onClick={() =>
                            setFilters({ ...filters, sortBy: "title", sortOrder: "asc" })
                          }
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Image</TableHead>
                      <TableHead>{renderSortableHeader("Product", "title")}</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">
                        {renderSortableHeader("Price", "price")}
                      </TableHead>
                      <TableHead className="text-right">
                        {renderSortableHeader("Stock", "stock")}
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10">
                          <div className="flex flex-col items-center justify-center">
                            <Package className="h-12 w-12 text-muted-foreground mb-2" />
                            <p className="text-muted-foreground font-medium">
                              No products found
                            </p>
                            <p className="text-muted-foreground text-sm mt-1">
                              {filteredProducts.length === 0 && products && products.length > 0
                                ? "Try adjusting your filters"
                                : "Add your first product to get started"}
                            </p>
                            {filteredProducts.length === 0 && products && products.length > 0 && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-4"
                                onClick={resetFilters}
                              >
                                Reset Filters
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedProducts.map((product) => (
                        <TableRow
                          key={product.id}
                          className="group hover:bg-muted/30"
                        >
                          <TableCell>
                            <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 border">
                              <Image
                                src={product.mainImage || "/placeholder.svg?height=40&width=40"}
                                alt={product.title}
                                width={40}
                                height={40}
                                loading="lazy"
                                quality={100}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    "/placeholder.svg?height=40&width=40";
                                }}
                              />
                            </div>
                          </TableCell>
                          <TableCell
                            onClick={() => handleDetail(product.id)}
                            className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
                          >
                            {product.title}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {product.sku}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-normal">
                              {product.categoryId}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(product.price)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end">
                              <span
                                className={`mr-2 ${
                                  product.stock <= product.lowStockThreshold
                                    ? "text-red-600 font-medium"
                                    : ""
                                }`}
                              >
                                {product.stock}
                              </span>
                              {product.stock <= product.lowStockThreshold && (
                                <Badge variant="destructive" className="text-xs">
                                  Low
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDetail(product.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleDetail(product.id)}
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      router.push(`/inventory/products/edit/${product.id}`)
                                    }
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Product
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>

            {!isLoading && filteredProducts.length > 0 && (
              <CardFooter className="flex flex-col sm:flex-row items-center justify-between p-4 border-t">
                <div className="text-sm text-muted-foreground mb-4 sm:mb-0">
                  Showing {Math.min(filteredProducts.length, (currentPage - 1) * itemsPerPage + 1)} to{" "}
                  {Math.min(filteredProducts.length, currentPage * itemsPerPage)} of{" "}
                  {filteredProducts.length} products
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum = i + 1;
                      if (totalPages > 5) {
                        if (currentPage > 3 && currentPage < totalPages - 1) {
                          pageNum = currentPage - 2 + i;
                        } else if (currentPage >= totalPages - 1) {
                          pageNum = totalPages - 4 + i;
                        }
                      }
                      return (
                        <Button
                          key={i}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="icon"
                          onClick={() => handlePageChange(pageNum)}
                          className="w-9 h-9"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            )}
          </Card>
        </div>
      </DashboardLayout>
    </>
  );
}

export default ProductsPageWrapper;