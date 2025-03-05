"use client"

import { useState, useEffect } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Edit, MoreHorizontal, Package, Plus, Search, Trash2 } from "lucide-react"
import { formatCurrency } from "@/app/inventory/lib/utils"
import { toast } from "sonner"
import { useProductStore } from "@/app/inventory/store/ProductStore"
import Header from "@/components/global/Header"
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";

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
  image?: string;
}

interface Filters {
  search: string;
  category: string;
  lowStock: boolean;
}

// Mock categories
const categories = ["Electronics", "Accessories", "Furniture", "Office Supplies", "Storage"]

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const { token } = useAuthStore();
  const router = useRouter();

  const { filters, setFilters, resetFilters } = useProductStore();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:8800/api/products", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch products");
        const data: Product[] = await res.json();
        setProducts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchProducts();
  }, [token]);

  // Filter products based on search, category, and lowStock
  const filteredProducts = products.filter((product) => {
    const productName = product.title ? product.title.toLowerCase() : "";
    const productSku = product.sku ? product.sku.toLowerCase() : "";
    const matchesSearch =
      productName.includes(filters.search.toLowerCase()) ||
      productSku.includes(filters.search.toLowerCase());
    const matchesCategory = !filters.category || product.categoryId === filters.category;
    const matchesLowStock = !filters.lowStock || product.stock <= product.lowStockThreshold;
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const handleDetail = (id: number) => {
    router.push(`/inventory/products/${id}`);
  }

  const handleAddProduct = () => {
    router.push("/inventory/products/create");
  }
  

  return (
    <>
      <Header />
      <DashboardLayout>
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Products</h1>
            <Button onClick={handleAddProduct}>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products by name or SKU..."
                className="pl-8"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <Select
              value={filters.category || "all"}
              onValueChange={(value) => setFilters({ ...filters, category: value === "all" ? "" : value })}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="lowStock"
                checked={filters.lowStock}
                onCheckedChange={(checked) => setFilters({ ...filters, lowStock: !!checked })}
              />
              <Label htmlFor="lowStock">Low Stock Only</Label>
            </div>
            <Button variant="outline" onClick={resetFilters}>
              Reset Filters
            </Button>
          </div>

          {/* Products Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center">
                        <Package className="h-12 w-12 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No products found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <img
                          src={product.image || "/placeholder.svg"}
                          alt={product.title}
                          className="w-10 h-10 object-cover rounded-md"
                        />
                      </TableCell>
                      <TableCell onClick={() => handleDetail(product.id)} className="font-medium text-blue-500 cursor-pointer">
                        {product.title}
                      </TableCell>
                      <TableCell>{product.sku}</TableCell>
                      <TableCell>{product.categoryId}</TableCell>
                      <TableCell className="text-right">{formatCurrency(product.price)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end">
                          <span className="mr-2">{product.stock}</span>
                          {product.stock <= product.lowStockThreshold && (
                            <Badge variant="destructive" className="text-xs">
                              Low
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDetail(product.id)}>View Details</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
