"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Package,
  Tag,
  DollarSign,
  Percent,
  Info,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Save,
  ImagePlus,
  Truck,
  Ruler,
  Weight,
  Layers,
  Store,
} from "lucide-react";
import CreateProductVariant from "@/components/inventory/CreateProductVariant";

const CreateProductPage = () => {
  const { token } = useAuthStore();
  const router = useRouter();

  // State for text fields – note that mainImage and images are now handled separately
  const [formData, setFormData] = useState({
    storeId: "",
    title: "",
    description: "",
    price: "",
    sku: "",
    stock: "",
    weight: "",
    dimensions: "",
    tags: "",
    costPerItem: "",
    categoryId: "",
    profit: "0", // Auto-calculated
    margin: "0", // Auto-calculated
    isPublished: true,
    resume: "",
  });

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [productId, setProductId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [stores, setStores] = useState<Array<{ id: string; name: string }>>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);

  // New states for file uploads
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string>("");
  const [additionalImageFiles, setAdditionalImageFiles] = useState<File[]>([]);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>([]);

  // Fetch stores and categories
  useEffect(() => {
    const fetchStoresAndCategories = async () => {
      try {
        const storesRes = await fetch("http://localhost:8800/api/stores", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (storesRes.ok) {
          const storesData = await storesRes.json();
          console.log("Stores Data:", storesData);
          setStores(Array.isArray(storesData) ? storesData : []);
        }
      } catch (error) {
        console.error("Error fetching stores:", error);
      }
    };

    if (token) {
      fetchStoresAndCategories();
    }
  }, [token]);

  // Handler for input changes (text fields)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  // Handler for switch toggle
  const handleSwitchChange = (checked: boolean) => {
    setFormData({ ...formData, isPublished: checked });
  };

  // Handler for select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  // Handlers for file inputs
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMainImageFile(file);
      setMainImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setAdditionalImageFiles(files);
      const previews = files.map(file => URL.createObjectURL(file));
      setAdditionalImagePreviews(previews);
    }
  };

  // Cleanup preview URLs when component unmounts or when files change
  useEffect(() => {
    return () => {
      if (mainImagePreview) URL.revokeObjectURL(mainImagePreview);
      additionalImagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [mainImagePreview, additionalImagePreviews]);

  // Form submit handler to create a new product with file uploads using FormData
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsSubmitting(true);

    try {
      const formPayload = new FormData();

      // Append text fields
      formPayload.append("storeId", formData.storeId);
      formPayload.append("title", formData.title);
      formPayload.append("description", formData.description);
      formPayload.append("price", formData.price);
      formPayload.append("sku", formData.sku);
      formPayload.append("stock", formData.stock);
      formPayload.append("weight", formData.weight);
      formPayload.append("dimensions", formData.dimensions);
      formPayload.append("tags", formData.tags);
      formPayload.append("costPerItem", formData.costPerItem);
      formPayload.append("categoryId", formData.categoryId);
      formPayload.append("profit", formData.profit);
      formPayload.append("margin", formData.margin);
      formPayload.append("isPublished", formData.isPublished ? "true" : "false");
      formPayload.append("resume", formData.resume);

      // Append files if available
      if (mainImageFile) {
        formPayload.append("mainImage", mainImageFile);
      }
      if (additionalImageFiles.length > 0) {
        additionalImageFiles.forEach((file) => {
          formPayload.append("images", file);
        });
      }

      const res = await fetch("http://localhost:8800/api/products", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Do not set Content-Type; the browser will set the correct boundary.
        },
        body: formPayload,
      });

      if (!res.ok) throw new Error("Failed to create product");

      const data = await res.json();
      setProductId(data.id);
      setMessage({ type: "success", text: "Product created successfully!" });
      setActiveTab("variants");
      window.scrollTo(0, 0);
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
      console.error("Error creating product:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if form is valid
  const isFormValid = () => {
    return (
      formData.title.trim() !== "" &&
      formData.price !== "" &&
      formData.stock !== "" &&
      formData.costPerItem !== ""
    );
  };

  // Steps configuration
  const steps = [
    {
      title: "Basic Info",
      icon: <Info className="h-5 w-5" />,
      fields: ["title", "storeId", "description", "tags"],
    },
    {
      title: "Pricing",
      icon: <DollarSign className="h-5 w-5" />,
      fields: ["price", "costPerItem", "profit", "margin"],
    },
    {
      title: "Inventory & Media",
      icon: <Store className="h-5 w-5" />,
      fields: ["stock", "weight", "dimensions"],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Create New Product</h1>
        </div>

        {message && (
          <Alert variant={message.type === "success" ? "default" : "destructive"} className="mb-6">
            {message.type === "success" ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertTitle>{message.type === "success" ? "Success" : "Error"}</AlertTitle>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-t-4 border-t-primary">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                      <Package className="h-5 w-5 text-primary" />
                      Product Information
                    </CardTitle>
                    <CardDescription>Enter the details for your new product</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Published</span>
                    <Switch checked={formData.isPublished} onCheckedChange={handleSwitchChange} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="basic" className="flex items-center gap-1">
                      <Info className="h-4 w-4" />
                      Basic Info
                    </TabsTrigger>
                    <TabsTrigger value="pricing" className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      Pricing
                    </TabsTrigger>
                    <TabsTrigger value="inventory" className="flex items-center gap-1">
                      <Layers className="h-4 w-4" />
                      Inventory & Media
                    </TabsTrigger>
                  </TabsList>

                  <form onSubmit={handleSubmit}>
                    <TabsContent value="basic" className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="title" className="text-base">
                            Product Title <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="Enter product name"
                            className="h-11"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="sku" className="text-base">
                            SKU
                          </Label>
                          <Input
                            id="sku"
                            name="sku"
                            value={formData.sku}
                            onChange={handleInputChange}
                            placeholder="Stock Keeping Unit"
                            className="h-11"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-base">
                          Description
                        </Label>
                        <Textarea
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          placeholder="Describe your product"
                          className="min-h-[120px]"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="storeId" className="text-base">
                            Store
                          </Label>
                          <Input
                            id="storeId"
                            name="storeId"
                            value={formData.storeId}
                            onChange={handleInputChange}
                            placeholder="Enter store ID"
                            className="h-11"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="categoryId" className="text-base">
                            Category
                          </Label>
                          <Select
                            value={formData.categoryId}
                            onValueChange={(value) => handleSelectChange("categoryId", value)}
                          >
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tags" className="text-base">
                          Tags
                        </Label>
                        <Input
                          id="tags"
                          name="tags"
                          value={formData.tags}
                          onChange={handleInputChange}
                          placeholder="Enter tags separated by commas"
                          className="h-11"
                        />
                        <p className="text-xs text-muted-foreground">
                          Tags help customers find your product through search and filtering
                        </p>
                      </div>
                      <div className="flex justify-end">
                        <Button type="button" onClick={() => setActiveTab("pricing")} className="flex items-center gap-2">
                          Next: Pricing
                          <DollarSign className="h-4 w-4" />
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="pricing" className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="price" className="text-base">
                            Price <span className="text-red-500">*</span>
                          </Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                            <Input
                              id="price"
                              name="price"
                              type="number"
                              step="0.01"
                              value={formData.price}
                              onChange={handleInputChange}
                              placeholder="0.00"
                              className="h-11 pl-10"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="costPerItem" className="text-base">
                            Cost Per Item <span className="text-red-500">*</span>
                          </Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                            <Input
                              id="costPerItem"
                              name="costPerItem"
                              type="number"
                              step="0.01"
                              value={formData.costPerItem}
                              onChange={handleInputChange}
                              placeholder="0.00"
                              className="h-11 pl-10"
                              required
                            />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="profit" className="text-base">
                            Profit
                          </Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                            <Input
                              id="profit"
                              name="profit"
                              type="number"
                              value={formData.profit}
                              disabled
                              className="h-11 pl-10 bg-muted cursor-not-allowed"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="margin" className="text-base">
                            Margin
                          </Label>
                          <div className="relative">
                            <Percent className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                            <Input
                              id="margin"
                              name="margin"
                              type="number"
                              value={formData.margin}
                              disabled
                              className="h-11 pl-10 bg-muted cursor-not-allowed"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <Button type="button" variant="outline" onClick={() => setActiveTab("basic")} className="flex items-center gap-2">
                          <ArrowLeft className="h-4 w-4" />
                          Back
                        </Button>
                        <Button type="button" onClick={() => setActiveTab("inventory")} className="flex items-center gap-2">
                          Next: Inventory & Media
                          <Layers className="h-4 w-4" />
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="inventory" className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="stock" className="text-base">
                            Stock Quantity <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="stock"
                            name="stock"
                            type="number"
                            value={formData.stock}
                            onChange={handleInputChange}
                            placeholder="0"
                            className="h-11"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="weight" className="text-base">
                            Weight (kg)
                          </Label>
                          <div className="relative">
                            <Weight className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                            <Input
                              id="weight"
                              name="weight"
                              type="number"
                              step="0.01"
                              value={formData.weight}
                              onChange={handleInputChange}
                              placeholder="0.00"
                              className="h-11 pl-10"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dimensions" className="text-base">
                          Dimensions (JSON format)
                        </Label>
                        <div className="relative">
                          <Ruler className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                          <Input
                            id="dimensions"
                            name="dimensions"
                            value={formData.dimensions}
                            onChange={handleInputChange}
                            placeholder='{"length": 10, "width": 5, "height": 2}'
                            className="h-11 pl-10"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Enter dimensions in JSON format with length, width, and height in cm
                        </p>
                      </div>

                      {/* Updated file input for Main Image */}
                      <div className="space-y-2">
                        <Label htmlFor="mainImage" className="text-base">
                          Main Image
                        </Label>
                        <Input
                          id="mainImage"
                          type="file"
                          accept="image/*"
                          onChange={handleMainImageChange}
                        />
                        {mainImagePreview && (
                          <img
                            src={mainImagePreview}
                            alt="Main Image Preview"
                            className="w-full h-48 object-cover mt-2 rounded"
                          />
                        )}
                      </div>

                      {/* File input for Additional Images */}
                      <div className="space-y-2">
                        <Label htmlFor="additionalImages" className="text-base">
                          Additional Images
                        </Label>
                        <Input
                          id="additionalImages"
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleAdditionalImagesChange}
                        />
                        <div className="flex flex-wrap mt-2 gap-2">
                          {additionalImagePreviews.map((preview, index) => (
                            <img
                              key={index}
                              src={preview}
                              alt={`Additional Image ${index + 1} Preview`}
                              className="w-24 h-24 object-cover rounded"
                            />
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between">
                        <Button type="button" variant="outline" onClick={() => setActiveTab("pricing")} className="flex items-center gap-2">
                          <ArrowLeft className="h-4 w-4" />
                          Back
                        </Button>
                        <Button type="submit" disabled={!isFormValid() || isSubmitting} className="flex items-center gap-2">
                          {isSubmitting ? (
                            <>
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                              Creating...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4" />
                              Create Product
                            </>
                          )}
                        </Button>
                      </div>
                    </TabsContent>
                  </form>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Product Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.title ? (
                  <>
                    <div className="aspect-square bg-muted rounded-md flex items-center justify-center">
                      {mainImagePreview ? (
                        <img
                          src={mainImagePreview}
                          alt={formData.title}
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder.svg?height=200&width=200";
                          }}
                        />
                      ) : (
                        <Package className="h-16 w-16 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">{formData.title}</h3>
                      {formData.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {formData.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-xl">
                        ${parseFloat(formData.price || "0").toFixed(2)}
                      </div>
                      <Badge variant={formData.isPublished ? "default" : "secondary"}>
                        {formData.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <span>{formData.sku || "No SKU"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span>{formData.stock || "0"} in stock</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Store className="h-4 w-4 text-muted-foreground" />
                        <span>{stores.find((s) => s.id === formData.storeId)?.name || "No store"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Percent className="h-4 w-4 text-muted-foreground" />
                        <span>{formData.margin || "0"}% margin</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                    <Package className="h-12 w-12 mb-2" />
                    <p>Fill in the product details to see a preview</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Info className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  <p className="text-sm">Add detailed descriptions to improve search visibility.</p>
                </div>
                <div className="flex gap-2">
                  <Info className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  <p className="text-sm">Use high-quality images to showcase your product.</p>
                </div>
                <div className="flex gap-2">
                  <Info className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  <p className="text-sm">Set accurate pricing to maintain competitive margins.</p>
                </div>
                <div className="flex gap-2">
                  <Info className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  <p className="text-sm">Add variants for products with multiple options like size or color.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        {productId && (
          <Card className="mt-8 shadow-lg border-t-4 border-t-green-500">
            <CardHeader>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Layers className="h-5 w-5 text-green-500" />
                Product Variants
              </CardTitle>
              <CardDescription>
                Add variants for this product such as different sizes, colors, or materials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreateProductVariant productId={productId} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CreateProductPage;