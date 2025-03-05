"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import ManageProductVariants from "@/components/inventory/ManageProductVariants";
export default function ProductDetailPage() {
  const { token } = useAuthStore();
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [stock, setStock] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Initialize updated product with empty defaults to prevent uncontrolled inputs
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

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:8800/api/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch product");
        const data = await res.json();
        setProduct(data);
        setUpdatedProduct({
          title: data.title || "",
          description: data.description || "",
          price: data.price || 0,
          sku: data.sku || "",
          category: data.category || "",
          profit: data.profit || 0,
          costPerItem: data.costPerItem || 0,
          margin: data.margin || 0,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    const fetchStock = async () => {
      try {
        const res = await fetch(`http://localhost:8800/api/products/${id}/stock`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch stock");
        const data = await res.json();
        setStock(data.stock);
      } catch (error) {
        console.error(error);
      }
    };

    fetchProduct();
    fetchStock();
  }, [id, token]);

  // Handle input changes for updating product
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setUpdatedProduct({ ...updatedProduct, [e.target.name]: e.target.value });
  };

  // Update product (PUT request)
  const handleUpdateProduct = async () => {
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
      setProduct(updatedProduct);
      setIsEditModalOpen(false); // Close modal
    } catch (error) {
      console.error(error);
      toast.error("Failed to update product.");
    }
  };

  // Delete product (DELETE request)
  const handleDeleteProduct = async () => {
    try {
      const res = await fetch(`http://localhost:8800/api/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete product");

      toast.success("Product deleted successfully!");
      router.push("/products"); // Redirect back to products list
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete product.");
    }
  };

  if (loading) return <div className="p-6 text-center">Loading product...</div>;

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>{product?.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">{product?.description}</p>
          <p className="mt-2 font-semibold">SKU: {product?.sku}</p>
          <p className="mt-2">Category: {product?.category || "N/A"}</p>
          <p className="mt-2 font-bold">Price: ${product?.price.toFixed(2)}</p>
          <p className="mt-2">Stock: {product?.stock}</p>
          <p className="mt-2">Profit: ${product?.profit?.toFixed(2)}</p>
          <p className="mt-2">Cost Per Item: ${product?.costPerItem?.toFixed(2)}</p>
          <p className="mt-2">Margin: ${product?.margin?.toFixed(2)}%</p>

          <div className="flex space-x-4 mt-4">
            <Button onClick={() => setIsEditModalOpen(true)}>Edit</Button>
            <Button variant="destructive" onClick={handleDeleteProduct}>
              Delete
            </Button>
            <Button variant="outline" onClick={() => router.back()}>
              Back
            </Button>
          </div>
        </CardContent>
        <ManageProductVariants productId={id as string} />
      </Card>

      {/* Edit Product Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input name="title" value={updatedProduct.title} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea name="description" value={updatedProduct.description} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="price">Price ($)</Label>
              <Input name="price" type="number" value={updatedProduct.price} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="sku">SKU</Label>
              <Input name="sku" value={updatedProduct.sku} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Input name="category" value={updatedProduct.category} onChange={handleInputChange} />
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
    </div>
  );
}
