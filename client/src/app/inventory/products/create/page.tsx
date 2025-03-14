"use client";

import React, { useState, useEffect, useCallback } from "react";
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
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Ruler,
  Weight,
  Layers,
  Store,
} from "lucide-react";
import CreateProductVariant from "@/components/inventory/CreateProductVariant";
import Image from "next/image";
import Header from "@/components/global/Header";

const CreateProductPage = () => {
  const { token } = useAuthStore();
  const router = useRouter();

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
    profit: "0",
    margin: "0",
    isPublished: true,
    resume: "",
  });

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [productId, setProductId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [stores, setStores] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string>("");
  const [additionalImageFiles, setAdditionalImageFiles] = useState<File[]>([]);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    const fetchStores = async () => {
      if (!token) {
        setMessage({ type: "error", text: "No authentication token available" });
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const storesRes = await fetch("http://localhost:8800/api/stores", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });

        if (!storesRes.ok) {
          throw new Error(`HTTP error! Status: ${storesRes.status}`);
        }

        const storesData = await storesRes.json();
        console.log("Raw API Response:", storesData);

        let validStores: Array<{ id: string; name: string }> = [];
        if (Array.isArray(storesData)) {
          validStores = storesData;
        } else if (storesData && typeof storesData === "object" && storesData.id && storesData.name) {
          validStores = [storesData];
        }

        setStores(validStores);

        if (validStores.length > 0) {
          setFormData((prev) => ({ ...prev, storeId: validStores[0].id }));
        } else {
          setMessage({ type: "error", text: "No stores found in response" });
        }
      } catch (error:any) {
        console.error("Error fetching stores:", error);
        setMessage({ type: "error", text: `Failed to load stores: ${error.message}` });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStores();
  }, [token]);

  useEffect(() => {
    return () => {
      if (mainImagePreview) URL.revokeObjectURL(mainImagePreview);
      additionalImagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [mainImagePreview, additionalImagePreviews]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updatedData = { ...prev, [name]: value };
      if (name === "price" || name === "costPerItem") {
        const price = parseFloat(updatedData.price) || 0;
        const costPerItem = parseFloat(updatedData.costPerItem) || 0;
        const profit = price - costPerItem;
        const margin = price > 0 ? (profit / price) * 100 : 0;
        updatedData.profit = profit.toFixed(2);
        updatedData.margin = margin.toFixed(2);
      }
      return updatedData;
    });
  }, []);

  const handleSwitchChange = useCallback((checked: boolean) => {
    setFormData((prev) => ({ ...prev, isPublished: checked }));
  }, []);

  const handleMainImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMainImageFile(file);
      setMainImagePreview(URL.createObjectURL(file));
    }
  }, []);

  const handleAdditionalImagesChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setAdditionalImageFiles(files);
      setAdditionalImagePreviews(files.map((file) => URL.createObjectURL(file)));
    }
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setMessage(null);
      setIsSubmitting(true);

      try {
        const formPayload = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          formPayload.append(key, String(value));
        });

        if (mainImageFile) formPayload.append("mainImage", mainImageFile);
        additionalImageFiles.forEach((file) => formPayload.append("images", file));

        const res = await fetch("http://localhost:8800/api/products", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formPayload,
        });

        if (!res.ok) throw new Error("Failed to create product");

        const data = await res.json();
        setProductId(data.id);
        setMessage({ type: "success", text: "Product created successfully! You can now add variants below." });
        setActiveTab("variants");

        setTimeout(() => {
          const variantsSection = document.getElementById("variants-section");
          if (variantsSection) {
            variantsSection.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      } catch (error: any) {
        setMessage({ type: "error", text: error.message });
        console.error("Error creating product:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, mainImageFile, additionalImageFiles, token]
  );

  const isFormValid = useCallback(() => {
    return (
      formData.storeId.trim() !== "" &&
      formData.title.trim() !== "" &&
      formData.price !== "" &&
      formData.stock !== "" &&
      formData.costPerItem !== ""
    );
  }, [formData]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-zinc-900 dark:to-zinc-800 py-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">Create New Product</h1>
          </div>

          {message && (
            <Alert variant={message.type === "success" ? "default" : "destructive"} className="mb-6">
              {message.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertTitle>{message.type === "success" ? "Success" : "Error"}</AlertTitle>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="shadow-lg border-t-4 border-white dark:border-zinc-700">
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
                    <TabsList className="grid w-full grid-cols-4 mb-6">
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
                      Media
                      </TabsTrigger>
                      <TabsTrigger value="variants" className="flex items-center gap-1" disabled={!productId}>
                        <Tag className="h-4 w-4" />
                        Variants
                      </TabsTrigger>
                    </TabsList>
                    <form onSubmit={handleSubmit}>
                      <TabsContent value="basic" className="space-y-6">
                        {/* Basic Info Form */}
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
                        <div className="space-y-2">
                          <Label className="text-base">Store</Label>
                          <p className="text-sm text-muted-foreground">
                            {stores.find((s) => s.id === formData.storeId)?.name || "No store assigned"}
                          </p>
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
                        {/* Pricing Form */}
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
                        <div className="flex flex-wrap gap-3 justify-between">
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
                        {/* Inventory & Media Form */}
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

                        <div className="space-y-2">
                          <Label htmlFor="mainImage" className="text-base">
                            Main Image
                          </Label>
                          <Input id="mainImage" type="file" accept="image/*" onChange={handleMainImageChange} />
                          {mainImagePreview && (
                            <Image
                              src={mainImagePreview}
                              alt="Main Image Preview"
                              width={200}
                              height={200}
                              loading="lazy"
                              quality={100}
                              className="w-full h-48 object-cover mt-2 rounded"
                            />
                          )}
                        </div>

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
                              <Image
                                key={index}
                                src={preview}
                                alt={`Additional Image ${index + 1} Preview`}
                                width={100}
                                height={100}
                                loading="lazy"
                                quality={100}
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

                      <TabsContent value="variants" className="space-y-6">
                        <div id="variants-section">
                          {productId ? (
                            <Card className="shadow-lg border-t-4 border-t-green-500">
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
                          ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                              <Package className="h-16 w-16 mb-4 text-muted-foreground" />
                              <p className="text-lg font-medium">Create the product first to add variants</p>
                              <p className="text-sm text-muted-foreground mt-2">
                                You'll be able to add sizes, colors, and other options after saving the product
                              </p>
                            </div>
                          )}
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
                          <Image
                            src={mainImagePreview}
                            alt={formData.title}
                            width={200}
                            height={200}
                            loading="lazy"
                            quality={100}
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
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{formData.description}</p>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-xl">${parseFloat(formData.price || "0").toFixed(2)}</div>
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
        </div>
      </div>
    </>
  );
};

export default CreateProductPage;
