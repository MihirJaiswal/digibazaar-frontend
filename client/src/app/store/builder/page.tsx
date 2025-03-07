"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Code,
  Columns,
  Eye,
  Laptop,
  Redo,
  Smartphone,
  Tablet,
  Undo,
  Plus,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "sonner"
import { StorePreview } from "@/components/store/store-preview"
import { SettingsPanel } from "@/components/store/settings-panel"
import { StoreLayout } from "@/components/store/StoreSidebar"
import Header from "@/components/global/Header"
import { useAuthStore } from "@/store/authStore"
import { ThemeSelector } from "@/components/store/ThemeSelector"

interface ThemeCustomization {
  theme?: string;
  [key: string]: any;
}

export default function BuilderPage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const [currentPage, setCurrentPage] = useState("home")
  const [isPublishing, setIsPublishing] = useState(false)
  const { token, _hasRehydrated, user } = useAuthStore()
  const [themeCustomization, setThemeCustomization] = useState<ThemeCustomization>({})
  const [isCustomizationLoading, setIsCustomizationLoading] = useState(true)

  // In a real app, storeSlug would come from the logged in user's data or route params.
  const storeSlug = user?.store

  // Fetch the store data from your API
  const [store, setStore] = useState<any>(null)
  const [isStoreLoading, setIsStoreLoading] = useState(true)

  useEffect(() => {
    if (!token || !_hasRehydrated) {
      console.log("Waiting for token and rehydration to complete")
      return
    }
    async function fetchStore() {
      try {
        const response = await fetch(`http://localhost:8800/api/stores`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        })
        if (!response.ok) {
          throw new Error("Failed to fetch store data")
        }
        const data = await response.json()
        setStore(data)
      } catch (error) {
        console.error("Error fetching store:", error)
      } finally {
        setIsStoreLoading(false)
      }
    }
    fetchStore()
  }, [token, _hasRehydrated])

  useEffect(() => {
    async function fetchCustomization() {
      try {
        const response = await fetch(`http://localhost:8800/api/stores/theme-customization/${store?.name}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        })
        if (!response.ok) throw new Error("Failed to fetch theme customization")
        const data = await response.json()
        setThemeCustomization(data)
      } catch (error) {
        console.error("Error fetching theme customization:", error)
      } finally {
        setIsCustomizationLoading(false)
      }
    }
    if (store && store.id) {
      fetchCustomization()
    }
  }, [store, token])

  // Fetch the products data from your API
  const [products, setProducts] = useState<any[]>([])
  const [isProductsLoading, setIsProductsLoading] = useState(true)

  useEffect(() => {
    if (!token || !_hasRehydrated) {
      console.log("Waiting for token and rehydration to complete")
      return
    }
    async function fetchProducts() {
      try {
        const response = await fetch("http://localhost:8800/api/products", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        })
        if (!response.ok) {
          throw new Error("Failed to fetch products")
        }
        const data = await response.json()
        setProducts(data)
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setIsProductsLoading(false)
      }
    }
    fetchProducts()
  }, [token, _hasRehydrated])

  // Updated handlePublish to update store isPublished to true
  const handlePublish = async () => {
    setIsPublishing(true)
    try {
      const response = await fetch("http://localhost:8800/api/stores", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: store?.id, // Ensure the store id is passed to the backend
          isPublished: true,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to publish store")
      }

      const data = await response.json()
      setStore(data)
      toast.success("Store published successfully!", {
        description: "Your store is now live and accessible to customers.",
      })
    } catch (error) {
      console.error("Error publishing store:", error)
      toast.error("Error publishing store")
    } finally {
      setIsPublishing(false)
    }
  }

  const handlePreview = () => {
    // Open the store in a new tab
    window.open(`/store/stores/${store?.name}`, "_blank")
  }

  return (
    <div>
      <Header />
      <StoreLayout>
        <div className="flex h-[calc(100vh-4rem)] flex-col">
          <div className="flex items-center justify-between border-b bg-background p-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Editing:</span>
                <select
                  className="rounded-md border bg-background px-2 py-1 text-sm"
                  value={currentPage}
                  onChange={(e) => setCurrentPage(e.target.value)}
                >
                  <option value="home">Home Page</option>
                  <option value="products">Products Page</option>
                  <option value="about">About Us</option>
                  <option value="contact">Contact</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={() => setViewMode("desktop")}>
                      <Laptop className={`h-4 w-4 ${viewMode === "desktop" ? "text-primary" : ""}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Desktop View</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={() => setViewMode("tablet")}>
                      <Tablet className={`h-4 w-4 ${viewMode === "tablet" ? "text-primary" : ""}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Tablet View</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={() => setViewMode("mobile")}>
                      <Smartphone className={`h-4 w-4 ${viewMode === "mobile" ? "text-primary" : ""}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Mobile View</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div className="mx-2 h-6 w-px bg-border"></div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Undo className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Undo</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Redo className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Redo</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div className="mx-2 h-6 w-px bg-border"></div>
              <Button variant="outline" size="sm" className="gap-1">
                <Code className="h-4 w-4" />
                Custom Code
              </Button>
              <Button variant="outline" size="sm" className="gap-1" onClick={handlePreview}>
                <Eye className="h-4 w-4" />
                Preview
              </Button>
              <Button size="sm" className="gap-1" onClick={handlePublish} disabled={isPublishing}>
                <Check className="h-4 w-4" />
                {isPublishing ? "Publishing..." : "Publish"}
              </Button>
            </div>
          </div>
          <div className="flex flex-1 overflow-hidden">
            <div className="w-64 overflow-auto border-r">
              <Tabs defaultValue="settings">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="settings">
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Settings
                  </TabsTrigger>
                  <TabsTrigger value="theme">
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Theme
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="pages" className="p-4">
                  <div className="space-y-4">
                    <Card>
                      <CardContent className="p-3">
                        <div className="font-medium">Home Page</div>
                        <div className="text-xs text-muted-foreground">Landing page</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-3">
                        <div className="font-medium">Products Page</div>
                        <div className="text-xs text-muted-foreground">Product listings</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-3">
                        <div className="font-medium">About Us</div>
                        <div className="text-xs text-muted-foreground">Company information</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-3">
                        <div className="font-medium">Contact</div>
                        <div className="text-xs text-muted-foreground">Contact form</div>
                      </CardContent>
                    </Card>
                    <Button variant="outline" className="w-full gap-1">
                      <Plus className="h-4 w-4" />
                      Add New Page
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="settings" className="p-0">
                  <SettingsPanel
                    storeId={store?.id}
                    initialCustomization={themeCustomization as any}
                    token={token as string}
                    onCustomizationUpdate={(updated) => setThemeCustomization(updated as any)}
                  />
                </TabsContent>
                <TabsContent value="theme" className="p-0">
                  <ThemeSelector
                    initialTheme={themeCustomization?.theme || "default"}
                    storeId={store?.id}
                    token={token || ""}
                    onThemeUpdate={(updatedTheme) => {
                      // Update local state or trigger a re-fetch of the customization
                      setThemeCustomization((prev: ThemeCustomization) => ({ ...prev, theme: updatedTheme }));
                    }}
                  />
                </TabsContent>
              </Tabs>
            </div>
            <div className="flex-1 overflow-auto bg-muted/50 p-4">
              <div
                className={`mx-auto overflow-hidden rounded-lg border bg-background shadow-sm ${
                  viewMode === "desktop" ? "w-full" : viewMode === "tablet" ? "w-[768px]" : "w-[375px]"
                }`}
              >
                {isStoreLoading || isProductsLoading ? (
                  <div className="flex h-full items-center justify-center">
                    Loading store preview...
                  </div>
                ) : (
                  <StorePreview
                    viewMode={viewMode}
                    currentPage={currentPage}
                    theme={store?.theme || "default"}
                    storeName={store?.name || "Default Store"}
                    storeDescription={store?.description || "Welcome to our store."}
                    storeLogo={store?.logo || "/images/placeholder.png"}
                    products={products}
                    themeCustomization={themeCustomization as any}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </StoreLayout>
    </div>
  )
}
