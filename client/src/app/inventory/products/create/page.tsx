// src/pages/create-product.tsx
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CreateProductVariant from "@/components/inventory/CreateProductVariant";

const CreateProductPage = () => {
  const { token } = useAuthStore();

  // State for the product creation form
  const [formData, setFormData] = useState({
    storeId: "",
    title: "",
    description: "",
    price: "",
    sku: "",
    mainImage: "",
    images: "",
    stock: "",
    weight: "",
    dimensions: "",
    tags: "",
    costPerItem: "",
    categoryId: "",
    profit: "0",  // Auto-calculated
    margin: "0",  // Auto-calculated
  });

  const [message, setMessage] = useState("");
  const [productId, setProductId] = useState(""); 

  // Handler for input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    let updatedData = { ...formData, [name]: value };

    // Auto-calculate profit & margin when price or costPerItem changes
    if (name === "price" || name === "costPerItem") {
      const price = parseFloat(updatedData.price) || 0;
      const costPerItem = parseFloat(updatedData.costPerItem) || 0;

      const profit = price - costPerItem;
      const margin = price > 0 ? (profit / price) * 100 : 0;

      updatedData.profit = profit.toFixed(2);
      updatedData.margin = margin.toFixed(2);
    }

    setFormData(updatedData);
  };

  // Form submit handler to create a new product
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        costPerItem: parseFloat(formData.costPerItem),
        profit: parseFloat(formData.profit),
        margin: parseFloat(formData.margin),
        stock: parseInt(formData.stock, 10),
        weight: formData.weight ? parseFloat(formData.weight) : null,
        dimensions: formData.dimensions ? JSON.parse(formData.dimensions) : null,
        tags: formData.tags ? formData.tags.split(",").map((s) => s.trim()) : null,
        store: { connect: { id: formData.storeId } },
      };

      const res = await fetch("http://localhost:8800/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to create product");
      }

      const data = await res.json();
      setProductId(data.id);
      setMessage("Product created successfully!");
    } catch (error: any) {
      setMessage(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-extrabold text-center mb-8">
          Create a New Product
        </h1>
        {message && (
          <div className="mb-6 p-4 bg-green-200 text-green-800 rounded shadow-md text-center">
            {message}
          </div>
        )}
        <Card className="max-w-4xl mx-auto shadow-lg">
          <CardHeader className="border-b">
            <CardTitle className="text-2xl font-bold">Product Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Store ID & Title */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="storeId">Store ID</Label>
                  <Input id="storeId" name="storeId" value={formData.storeId} onChange={handleInputChange} />
                </div>
                <div>
                  <Label htmlFor="title">Product Title</Label>
                  <Input id="title" name="title" value={formData.title} onChange={handleInputChange} />
                </div>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} />
              </div>

              {/* Price, SKU & Stock */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input id="price" name="price" type="number" value={formData.price} onChange={handleInputChange} />
                </div>
                <div>
                  <Label htmlFor="costPerItem">Cost Per Item</Label>
                  <Input id="costPerItem" name="costPerItem" type="number" value={formData.costPerItem} onChange={handleInputChange} />
                </div>
                <div>
                  <Label htmlFor="stock">Stock</Label>
                  <Input id="stock" name="stock" type="number" value={formData.stock} onChange={handleInputChange} />
                </div>
              </div>

              {/* Auto-calculated Profit & Margin */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="profit">Profit</Label>
                  <Input id="profit" name="profit" type="number" value={formData.profit} disabled className="bg-gray-200 cursor-not-allowed" />
                </div>
                <div>
                  <Label htmlFor="margin">Margin (%)</Label>
                  <Input id="margin" name="margin" type="number" value={formData.margin} disabled className="bg-gray-200 cursor-not-allowed" />
                </div>
              </div>

              {/* Category */}
              <div>
                <Label htmlFor="categoryId">Category ID</Label>
                <Input id="categoryId" name="categoryId" value={formData.categoryId} onChange={handleInputChange} />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button type="submit" className="w-full py-3 text-lg">
                  Create Product
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        {productId && <CreateProductVariant productId={productId} />}
      </div>
    </div>
  );
};

export default CreateProductPage;
