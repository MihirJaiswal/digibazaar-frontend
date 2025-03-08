"use client";

import { Checkbox } from "@/components/ui/checkbox";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronRight, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";

export default function SetupWizardPage() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Updated state includes a new logo field.
  const [storeData, setStoreData] = useState({
    name: "",
    description: "",
    category: "OTHER",
    language: "EN",
    currency: "USD",
    timezone: "UTC",
    enableBlog: false,
    enableProductReviews: false,
    theme: "default",
    subdomain: "",
    logo: "", // Will not be used directly; file upload overrides it.
  });

  // New state to hold the selected logo file and its preview URL.
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setStoreData((prev) => ({ 
      ...prev, 
      [name]: value,
      // Generate subdomain automatically when name changes
      ...(name === "name" && {
        subdomain: `${value.toLowerCase().replace(/\s+/g, "-")}.mystore.com`
      })
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setStoreData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setStoreData((prev) => ({ ...prev, [name]: checked }));
  };

  // New handler for logo file change
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleNext = () => {
    if (step === 1 && (!storeData.name || !storeData.subdomain)) {
      toast.error("Missing required fields", {
        description: "Store name and subdomain are required"
      });
      return;
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleFinish = async () => {
    setIsLoading(true);
    
    try {
      if (!token) throw new Error("Authentication required");

      // Build FormData payload so that we can include file uploads
      const formPayload = new FormData();
      // Append all text fields from storeData
      for (const key in storeData) {
        formPayload.append(key, (storeData as any)[key]);
      }
      // Append logo file if selected
      if (logoFile) {
        formPayload.append("logo", logoFile);
      }

      const response = await fetch("http://localhost:8800/api/stores", {
        method: "POST",
        headers: {
          // Do not set Content-Type manually so that the browser generates the proper boundary.
          Authorization: `Bearer ${token}`
        },
        body: formPayload,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create store");
      }

      const newStore = await response.json();
      toast.success("Store created successfully!", {
        description: "Your store is now ready to be customized."
      });
      router.push("/dashboard");
    } catch (err: any) {
      toast.error("Failed to create store", {
        description: err.message || "Please check your input and try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex h-14 items-center border-b px-4 lg:h-16 lg:px-6">
        <div className="flex items-center gap-2 font-semibold">
          <Store className="h-6 w-6" />
          <span>StoreForge</span>
        </div>
      </div>
      <main className="flex flex-1 items-center justify-center p-4 md:p-8">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    step >= i ? "bg-primary text-primary-foreground" : "border bg-muted"
                  }`}
                >
                  {step > i ? <Check className="h-5 w-5" /> : i}
                </div>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-4 text-center text-sm">
              <span>Store Details</span>
              <span>Choose Template</span>
              <span>Store Settings</span>
              <span>Finish Setup</span>
            </div>
          </div>

          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Store Details</CardTitle>
                <CardDescription>Tell us about your store</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Store Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={storeData.name}
                    onChange={handleChange}
                    placeholder="My Awesome Store"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subdomain">Store URL *</Label>
                  <Input
                    id="subdomain"
                    name="subdomain"
                    value={storeData.subdomain}
                    onChange={handleChange}
                    placeholder="my-store.mystore.com"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    You can connect a custom domain later
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Store Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={storeData.description}
                    onChange={handleChange}
                    placeholder="Describe your store and what you sell"
                    rows={3}
                  />
                </div>
                {/* New File Input for Store Logo */}
                <div className="space-y-2">
                  <Label htmlFor="logo">Store Logo</Label>
                  <Input
                    id="logo"
                    name="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                  />
                  {logoPreview && (
                    <img
                      src={logoPreview}
                      alt="Logo Preview"
                      className="w-24 h-24 object-cover rounded mt-2"
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Store Category</Label>
                  <Select
                    value={storeData.category}
                    onValueChange={(value) => handleSelectChange("category", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(StoreCategory).map(([key, value]) => (
                        <SelectItem key={key} value={value}>
                          {value.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleNext} className="ml-auto">
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Choose a Template</CardTitle>
                <CardDescription>Select a starting point for your store</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup 
                  value={storeData.theme}
                  onValueChange={(value) => handleSelectChange("theme", value)}
                >
                  <div className="grid gap-4">
                    {["default", "modern", "classic", "minimal"].map((template) => (
                      <div key={template} className="relative">
                        <RadioGroupItem 
                          value={template} 
                          id={template} 
                          className="absolute right-2 top-2 h-4 w-4" 
                        />
                        <Label
                          htmlFor={template}
                          className="block cursor-pointer overflow-hidden rounded-lg border bg-background p-2"
                        >
                          <div className="aspect-video w-full overflow-hidden rounded-md bg-muted">
                            <img
                              src="/placeholder.svg"
                              alt={`${template} template`}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="mt-2">
                            <h3 className="font-medium capitalize">{template}</h3>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
                <Button onClick={handleNext}>
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Store Settings</CardTitle>
                <CardDescription>Configure your store's basic settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Store Language</Label>
                  <Select
                    value={storeData.language}
                    onValueChange={(value) => handleSelectChange("language", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(Language).map(([key, value]) => (
                        <SelectItem key={key} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Store Currency</Label>
                  <Select
                    value={storeData.currency}
                    onValueChange={(value) => handleSelectChange("currency", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(Currency).map(([key, value]) => (
                        <SelectItem key={key} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Store Timezone</Label>
                  <Select
                    value={storeData.timezone}
                    onValueChange={(value) => handleSelectChange("timezone", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(Timezone).map(([key, value]) => (
                        <SelectItem key={key} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enableBlog">Enable Blog</Label>
                    <p className="text-sm text-muted-foreground">
                      Create and manage blog posts for your store
                    </p>
                  </div>
                  <Switch
                    id="enableBlog"
                    checked={storeData.enableBlog}
                    onCheckedChange={(checked) => handleSwitchChange("enableBlog", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enableProductReviews">Enable Product Reviews</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow customers to leave reviews on your products
                    </p>
                  </div>
                  <Switch
                    id="enableProductReviews"
                    checked={storeData.enableProductReviews}
                    onCheckedChange={(checked) => handleSwitchChange("enableProductReviews", checked)}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
                <Button onClick={handleNext}>
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          )}

          {step === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Ready to Launch</CardTitle>
                <CardDescription>Your store is almost ready to go live</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border p-4">
                  <h3 className="mb-2 font-medium">Store Summary</h3>
                  <div className="space-y-2">
                    {Object.entries(storeData)
                      .filter(([key]) => key !== "logo") // Skip showing the logo string value
                      .map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-sm text-muted-foreground capitalize">
                            {key.replace(/([A-Z])/g, " $1")}:
                          </span>
                          <span className="text-sm font-medium">
                            {typeof value === "boolean" ? (value ? "Yes" : "No") : value}
                          </span>
                        </div>
                      ))}
                    {logoPreview && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Logo:</span>
                        <img src={logoPreview} alt="Logo" className="h-8 w-8 object-cover rounded" />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
                <Button onClick={handleFinish} disabled={isLoading}>
                  {isLoading ? "Creating Store..." : "Finish Setup"}
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

// Enums to match your Prisma schema
enum StoreCategory {
  FASHION = "FASHION",
  ELECTRONICS = "ELECTRONICS",
  GROCERY = "GROCERY",
  HOME_DECOR = "HOME_DECOR",
  BEAUTY = "BEAUTY",
  TOYS = "TOYS",
  SPORTS = "SPORTS",
  AUTOMOTIVE = "AUTOMOTIVE",
  BOOKS = "BOOKS",
  OTHER = "OTHER"
}

enum Language {
  EN = "EN",
  ES = "ES",
  FR = "FR",
  DE = "DE",
  IT = "IT",
  PT = "PT",
  HI = "HI",
  ZH = "ZH",
  JA = "JA",
  AR = "AR"
}

enum Currency {
  USD = "USD",
  EUR = "EUR",
  GBP = "GBP",
  INR = "INR",
  JPY = "JPY",
  AUD = "AUD",
  CAD = "CAD",
  CNY = "CNY",
  BRL = "BRL"
}

enum Timezone {
  UTC = "UTC",
  EST = "EST",
  CST = "CST",
  PST = "PST",
  IST = "IST",
  GMT = "GMT",
  CET = "CET",
  EET = "EET",
  JST = "JST",
  AEST = "AEST"
}