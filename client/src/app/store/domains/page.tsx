import { Globe, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DomainsList } from "@/components/store/domains-list"
import { StoreLayout } from "@/components/store/StoreSidebar"
import Header from "@/components/global/Header"

export default function DomainsPage() {
  // In a real app, you would fetch the store data from your database
  const storeSlug = "my-awesome-store"
  const storeUrl = `storeforge.com/stores/${storeSlug}`

  return (
   <>
   
   <Header/>
   
   <StoreLayout>
     <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Domains</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Custom Domain
        </Button>
      </div>
      <Tabs defaultValue="domains" className="space-y-4">
        <TabsList>
          <TabsTrigger value="domains">Domains</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="domains" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Store URL</CardTitle>
              <CardDescription>
                This is your store's default URL. Share this link with your customers or connect a custom domain.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 rounded-md border bg-muted p-3">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">{storeUrl}</span>
                <Button variant="ghost" size="sm" className="ml-auto h-8 gap-1">
                  Copy URL
                </Button>
                <Button variant="outline" size="sm" className="h-8 gap-1" asChild>
                  <a href={`/stores/${storeSlug}`} target="_blank" rel="noopener noreferrer">
                    Visit Store
                  </a>
                </Button>
              </div>
              <div className="rounded-md border p-4">
                <h3 className="mb-2 font-medium">Store Status</h3>
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
                  <span className="text-sm">Your store is live and accessible</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Custom Domains</CardTitle>
              <CardDescription>Connect your own domain to your store for a professional look.</CardDescription>
            </CardHeader>
            <CardContent>
              <DomainsList />
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Custom Domain
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>URL Settings</CardTitle>
              <CardDescription>Configure how your store URLs are structured.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="store-slug">Store URL Slug</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">storeforge.com/stores/</span>
                  <Input id="store-slug" defaultValue={storeSlug} className="flex-1" />
                </div>
                <p className="text-xs text-muted-foreground">
                  This is the unique identifier for your store in our platform. Changing this will update your store
                  URL.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-url">Product URL Structure</Label>
                <Input id="product-url" defaultValue="/products/[product-slug]" />
                <p className="text-xs text-muted-foreground">
                  Define how product URLs appear. Use [product-slug] as a placeholder.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="collection-url">Collection URL Structure</Label>
                <Input id="collection-url" defaultValue="/collections/[collection-slug]" />
                <p className="text-xs text-muted-foreground">
                  Define how collection URLs appear. Use [collection-slug] as a placeholder.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>Configure SEO settings for your store.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="site-title">Site Title</Label>
                <Input id="site-title" defaultValue="My Awesome Store" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="site-description">Site Description</Label>
                <Input id="site-description" defaultValue="The best products for your needs" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
   </StoreLayout>
   </>
  )
}

