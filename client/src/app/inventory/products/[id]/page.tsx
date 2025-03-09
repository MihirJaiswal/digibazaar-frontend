"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Edit,
  Trash2,
  ArrowLeft,
  Tag,
  DollarSign,
  Percent,
  Clock,
  AlertTriangle,
} from "lucide-react";
import ManageProductVariants from "@/components/inventory/ManageProductVariants";
import StockMovementsTable from "@/components/inventory/StockMovementsTable";
import ProductStock from "@/components/inventory/ProductStock";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";

// Create a QueryClient instance
const queryClient = new QueryClient();

export function ProductDetailPageComponent() {
  const { token } = useAuthStore();
  const { id } = useParams();
  const router = useRouter();

  // States for editing modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [updatedProduct, setUpdatedProduct] = useState({
    title: "",
    description: "",
    price: 0,
    sku: "",
    category: "",
    profit: 0,
    costPerItem: 0,
    margin: 0,
  });

  // Use React Query to fetch product details
  const {
    data: product,
    isLoading: productLoading,
    error: productError,
  } = useQuery(
    ["product", id],
    async () => {
      const res = await fetch(`http://localhost:8800/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to fetch product");
      return res.json();
    },
    { enabled: !!id && !!token }
  );

  // Use React Query to fetch product stock
  const {
    data: stockData,
    isLoading: stockLoading,
    error: stockError,
  } = useQuery(
    ["stock", id],
    async () => {
      const res = await fetch(`http://localhost:8800/api/products/${id}/stock`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to fetch stock");
      return res.json();
    },
    { enabled: !!id && !!token }
  );

  // Combine loading states
  const loading = productLoading || stockLoading;

  // Derive stock from stockData (assuming API returns an object with a "stock" property)
  const stock = stockData?.stock;

  // Update local state for editing when product data arrives
  useEffect(() => {
    if (product) {
      setUpdatedProduct({
        title: product.title || "",
        description: product.description || "",
        price: product.price || 0,
        sku: product.sku || "",
        category: product.category || "",
        profit: product.profit || 0,
        costPerItem: product.costPerItem || 0,
        margin: product.margin || 0,
      });
    }
  }, [product]);

  // Handle input changes in edit form
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setUpdatedProduct((prev) => ({
        ...prev,
        [name]:
          name === "price" || name === "costPerItem" ? Number(value) : value,
      }));
    },
    []
  );

  // Update product handler
  const handleUpdateProduct = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:8800/api/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedProduct),
      });
      if (!res.ok) throw new Error("Failed to update product");

      toast.success("Product updated successfully!");
      // Optionally update local cache or refetch queries here
      // For simplicity, we update local product state
      // (In a full app, you might call queryClient.invalidateQueries(['product', id]) )
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product.");
    }
  }, [id, token, updatedProduct]);

  // Delete product handler
  const handleDeleteProduct = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:8800/api/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete product");

      toast.success("Product deleted successfully!");
      router.push("/products");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product.");
    } finally {
      setIsDeleteDialogOpen(false);
    }
  }, [id, token, router]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center h-[50vh]">
        <div className="flex flex-col items-center gap-2">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (productError || !product) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center h-[50vh]">
        <p className="text-muted-foreground">Failed to load product details.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Product Details</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="stock">Stock Management</TabsTrigger>
          <TabsTrigger value="variants">Variants</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">{product.title}</CardTitle>
                    <CardDescription>SKU: {product.sku || "N/A"}</CardDescription>
                  </div>
                  <Badge
                    variant={
                      stock && stock > 10
                        ? "default"
                        : stock && stock > 0
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {stock && stock > 10
                      ? "In Stock"
                      : stock && stock > 0
                      ? "Low Stock"
                      : "Out of Stock"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Description
                    </h3>
                    <p className="text-sm">
                      {product.description || "No description available."}
                    </p>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">
                        Category
                      </h3>
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-primary" />
                        <span>{product.category || "Uncategorized"}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">
                        Created
                      </h3>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <span>
                          {product.createdAt
                            ? new Date(product.createdAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Financial Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-muted/40 p-4 rounded-lg">
                    <div className="text-3xl font-bold text-primary">
                      ${product.price?.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Selling Price
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">
                        Cost
                      </h3>
                      <div className="flex items-center gap-1">
                        <span className="text-lg font-semibold">
                          ${product.costPerItem?.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">
                        Profit
                      </h3>
                      <div className="flex items-center gap-1">
                        <span className="text-lg font-semibold text-green-600">
                          ${product.profit?.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Margin
                    </h3>
                    <div className="flex items-center gap-2">
                      <Percent className="h-4 w-4 text-primary" />
                      <span className="text-lg font-semibold">
                        {product.margin?.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <StockMovementsTable productId={id as string} />
        </TabsContent>

        <TabsContent value="stock" className="space-y-6">
          <ProductStock productId={id as string} />
        </TabsContent>

        <TabsContent value="variants" className="space-y-6">
          <ManageProductVariants productId={id as string} />
        </TabsContent>
      </Tabs>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                name="title"
                value={updatedProduct.title}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={updatedProduct.description}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price ($)
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={updatedProduct.price}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sku" className="text-right">
                SKU
              </Label>
              <Input
                id="sku"
                name="sku"
                value={updatedProduct.sku}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Input
                id="category"
                name="category"
                value={updatedProduct.category}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="costPerItem" className="text-right">
                Cost Per Item
              </Label>
              <Input
                id="costPerItem"
                name="costPerItem"
                type="number"
                value={updatedProduct.costPerItem}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateProduct}>Save Changes</Button>
          </DialogFooter>
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
              Are you sure you want to delete <strong>{product.title}</strong>?
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              This action cannot be undone. This will permanently delete the product and all associated data.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProduct}>
              Delete Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Wrap the component with QueryClientProvider to enable React Query
export default function ProductDetailPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <ProductDetailPageComponent />
    </QueryClientProvider>
  );
}
