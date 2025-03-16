"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, ChevronRight, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { useAuthStore } from "@/store/authStore"
import Image from "next/image"
import Header from "@/components/global/Header"

export default function SetupWizardPage() {
  const router = useRouter()
  const { token } = useAuthStore()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

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
  })

  // New state to hold the selected logo file and its preview URL.
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setStoreData((prev) => ({
      ...prev,
      [name]: value,
      // Generate subdomain automatically when name changes
      ...(name === "name" && {
        subdomain: `${value.toLowerCase().replace(/\s+/g, "-")}.mystore.com`,
      }),
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setStoreData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setStoreData((prev) => ({ ...prev, [name]: checked }))
  }

  // New handler for logo file change
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setLogoFile(file)
      setLogoPreview(URL.createObjectURL(file))
    }
  }

  const handleNext = () => {
    if (step === 1 && (!storeData.name || !storeData.subdomain)) {
      toast.error("Missing required fields", {
        description: "Store name and subdomain are required",
      })
      return
    }
    setStep((prev) => prev + 1)
  }

  const handleBack = () => {
    setStep((prev) => prev - 1)
  }

  const handleFinish = async () => {
    setIsLoading(true)

    try {
      if (!token) throw new Error("Authentication required")

      // Build FormData payload so that we can include file uploads
      const formPayload = new FormData()
      // Append all text fields from storeData
      for (const key in storeData) {
        formPayload.append(key, (storeData as any)[key])
      }
      // Append logo file if selected
      if (logoFile) {
        formPayload.append("logo", logoFile)
      }

      const response = await fetch("http://localhost:8800/api/stores", {
        method: "POST",
        headers: {
          // Do not set Content-Type manually so that the browser generates the proper boundary.
          Authorization: `Bearer ${token}`,
        },
        body: formPayload,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create store")
      }

      toast.success("Store created successfully!", {
        description: "Your store is now ready to be customized.",
      })
      router.push("/store")
    } catch (err: any) {
      toast.error("Failed to create store", {
        description: err.message || "Please check your input and try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
    <Header/>
    <div className="flex min-h-screen bg-white dark:bg-zinc-900">
      <main className="flex-1 py-6 px-4 sm:px-6 md:px-8 lg:px-10">
        <div className="mx-auto max-w-5xl border pt-8 rounded-lg bg-white dark:bg-black">
          {/* Progress indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-between max-w-64 md:max-w-md mx-auto">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`relative flex h-8 w-8 items-center justify-center rounded-full ${
                    step >= i ? "bg-purple-500 dark:text-white text-black" : "border bg-muted"
                  }`}
                >
                  {step > i ? <Check className="h-4 w-4" /> : i}
                  <span className="absolute -bottom-6 text-xs whitespace-nowrap">
                    {i === 1 ? "Details" : i === 2 ? "Template" : i === 3 ? "Settings" : "Finish"}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-8 h-1 w-full bg-muted">
              <div
                className="h-1 bg-primary transition-all duration-300 ease-in-out"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>

          {/* Content area */}
          <div className="mt-8">
            {step === 1 && (
              <Card className="overflow-hidden border-none shadow-md">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <Store className="h-5 w-5 text-primary" />
                    <CardTitle>Store Details</CardTitle>
                  </div>
                  <CardDescription>Tell us about your store</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-5 md:grid-cols-2">
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
                      <p className="text-xs text-muted-foreground">You can connect a custom domain later</p>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="description">Store Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={storeData.description}
                        onChange={handleChange}
                        placeholder="Describe your store and what you sell"
                        rows={2}
                        className="resize-none"
                      />
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
                    <div className="space-y-2">
                      <Label htmlFor="logo">Store Logo</Label>
                      <div className="flex items-center gap-3">
                        {logoPreview ? (
                          <div className="relative h-12 w-12 overflow-hidden rounded-md border">
                            <Image
                              src={logoPreview || "/placeholder.svg"}
                              alt="Logo Preview"
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-md border bg-muted">
                            <Store className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1">
                          <Input
                            id="logo"
                            name="logo"
                            type="file"
                            accept="image/*"
                            onChange={handleLogoChange}
                            className="text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-white dark:bg-black px-6 py-4">
                  <Button onClick={handleNext} className="ml-auto">
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            )}

            {step === 2 && (
              <Card className="overflow-hidden border-none shadow-md">
                <CardHeader className="pb-4">
                  <CardTitle>Choose a Template</CardTitle>
                  <CardDescription>Select a starting point for your store</CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={storeData.theme}
                    onValueChange={(value) => handleSelectChange("theme", value)}
                    className="grid grid-cols-2 md:grid-cols-4 gap-3"
                  >
                    {["default", "modern", "classic", "minimal"].map((template) => (
                      <div key={template} className="relative">
                        <RadioGroupItem value={template} id={template} className="absolute right-2 top-2 h-4 w-4" />
                        <Label
                          htmlFor={template}
                          className="block cursor-pointer overflow-hidden rounded-lg border bg-background p-2 hover:border-primary/50 transition-colors"
                        >
                          <div className="aspect-video w-full overflow-hidden rounded-md bg-muted">
                            <img
                              src={`/${template}.png`}
                              alt={`${template} template`}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="mt-2 text-center">
                            <h3 className="text-sm font-medium capitalize">{template}</h3>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
                <CardFooter className="border-t bg-white dark:bg-black px-6 py-4 flex justify-between">
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
              <Card className="overflow-hidden border-none shadow-md">
                <CardHeader className="pb-4">
                  <CardTitle>Store Settings</CardTitle>
                  <CardDescription>Configure your store&apos;s basic settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-5 md:grid-cols-2">
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

                    <div className="md:col-span-2 space-y-3 pt-2">
                      <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <Label htmlFor="enableBlog" className="text-sm font-medium">
                            Enable Blog
                          </Label>
                          <p className="text-xs text-muted-foreground">Create and manage blog posts for your store</p>
                        </div>
                        <Switch
                          id="enableBlog"
                          checked={storeData.enableBlog}
                          onCheckedChange={(checked) => handleSwitchChange("enableBlog", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <Label htmlFor="enableProductReviews" className="text-sm font-medium">
                            Enable Product Reviews
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Allow customers to leave reviews on your products
                          </p>
                        </div>
                        <Switch
                          id="enableProductReviews"
                          checked={storeData.enableProductReviews}
                          onCheckedChange={(checked) => handleSwitchChange("enableProductReviews", checked)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t  bg-white dark:bg-black px-6 py-4 flex justify-between">
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
              <Card className="overflow-hidden border-none shadow-md">
                <CardHeader className="pb-4">
                  <CardTitle>Ready to Launch</CardTitle>
                  <CardDescription>Your store is almost ready to go live</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <h3 className="mb-3 font-medium flex items-center gap-2">
                      <Store className="h-4 w-4 text-primary" />
                      Store Summary
                    </h3>
                    <div className="grid gap-2 md:grid-cols-2">
                      {Object.entries(storeData)
                        .filter(([key]) => key !== "logo" && key !== "description") // Skip showing the logo string value and description
                        .map(([key, value]) => (
                          <div key={key} className="flex justify-between border-b pb-1">
                            <span className="text-sm text-muted-foreground capitalize">
                              {key.replace(/([A-Z])/g, " $1")}:
                            </span>
                            <span className="text-sm font-medium">
                              {typeof value === "boolean" ? (value ? "Yes" : "No") : value}
                            </span>
                          </div>
                        ))}
                    </div>

                    <div className="mt-4 grid md:grid-cols-2 gap-4">
                      {logoPreview && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Store Logo</h4>
                          <div className="h-16 w-16 overflow-hidden rounded-md border">
                            <Image
                              src={logoPreview || "/placeholder.svg"}
                              alt="Logo"
                              width={64}
                              height={64}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        </div>
                      )}

                      {storeData.description && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Store Description</h4>
                          <p className="text-sm text-muted-foreground line-clamp-3">{storeData.description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-white dark:bg-black px-6 py-4 flex justify-between">
                  <Button variant="outline" onClick={handleBack}>
                    Back
                  </Button>
                  <Button onClick={handleFinish} disabled={isLoading} className="min-w-[140px]">
                    {isLoading ? "Creating Store..." : "Finish Setup"}
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
    </>
  )
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
  OTHER = "OTHER",
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
  AR = "AR",
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
  BRL = "BRL",
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
  AEST = "AEST",
}

