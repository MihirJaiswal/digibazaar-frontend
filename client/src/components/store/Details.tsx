"use client";

import { useEffect, useState} from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Store,
  Box,
  ShoppingCart,
  DollarSign,
  Edit,
  Trash,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { StoreLayout } from "./StoreSidebar";

interface StoreData {
  id: string;
  name: string;
  description: string;
  category: string;
  language: string;
  currency: string;
  timezone: string;
  enableBlog: boolean;
  enableProductReviews: boolean;
  theme: string;
  subdomain: string;
}

interface Order {
  id: string;
  status: string;
  totalPrice: number;
  createdAt: string;
}

export default function StoreDashboardPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [store, setStore] = useState<StoreData | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [sales, setSales] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState<StoreData>({
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
    id: "",
  });

  // Consolidated fetch call: fetch store, products, orders, and sales concurrently.
  useEffect(() => {
    if (token) {
      async function fetchAllData() {
        try {
          const [storeRes, productsRes, ordersRes, salesRes] = await Promise.all([
            fetch("http://localhost:8800/api/stores", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch("http://localhost:8800/api/products", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch("http://localhost:8800/api/orders", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch("http://localhost:8800/api/reports/sales", {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

          if (!storeRes.ok) throw new Error("Failed to fetch store");
          if (!productsRes.ok) throw new Error("Failed to fetch products");
          if (!ordersRes.ok) throw new Error("Failed to fetch orders");
          if (!salesRes.ok) throw new Error("Failed to fetch sales report");

          const storeData = await storeRes.json();
          const productsData = await productsRes.json();
          const ordersData = await ordersRes.json();
          const salesData = await salesRes.json();

          setStore(storeData);
          setFormData(storeData);
          setProducts(productsData);
          setOrders(ordersData);
          setSales(salesData.totalSales || 0);
        } catch (error: any) {
          toast.error("Error loading store data", {
            description: error.message,
          });
        } finally {
          setLoading(false);
        }
      }
      fetchAllData();
    }
  }, [token]);

  const handleUpdateStore = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8800/api/stores", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      const updatedStore = await response.json();
      setStore(updatedStore);
      setEditOpen(false);
      toast.success("Store updated successfully");
    } catch (error: any) {
      toast.error("Failed to update store", {
        description: error.message,
      });
    }
  };

  const handleDeleteStore = async () => {
    try {
      const response = await fetch("http://localhost:8800/api/stores", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to delete store");

      toast.success("Store deleted successfully");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error("Deletion failed", {
        description: error.message,
      });
    } finally {
      setDeleteConfirm(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!store)
    return (
      <Alert className="m-8 max-w-2xl">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No store found</AlertTitle>
        <AlertDescription>
          You haven&apos;t created a store yet. Create one to get started.
        </AlertDescription>
      </Alert>
    );

  return (
    <StoreLayout>
      <div className="p-4 md:p-8 space-y-8">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <Box className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
              <p className="text-xs text-muted-foreground">
                Total products in store
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.length}</div>
              <p className="text-xs text-muted-foreground">
                Total orders received
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${sales.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Total revenue generated
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Store Details Section */}
        <Card>
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <Store className="h-8 w-8" />
              <div>
                <h2 className="text-2xl font-bold">{store.name}</h2>
                <p className="text-muted-foreground">{store.subdomain}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setEditOpen(true)}>
                <Edit className="mr-2 h-4 w-4" /> Edit Store
              </Button>
              <Button variant="destructive" onClick={() => setDeleteConfirm(true)}>
                <Trash className="mr-2 h-4 w-4" /> Delete
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Store Information</h3>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Category</dt>
                    <dd className="capitalize">{store.category?.toLowerCase()}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Currency</dt>
                    <dd>{store.currency}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Timezone</dt>
                    <dd>{store.timezone}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="font-medium mb-2">Features</h3>
                <div className="flex flex-wrap gap-2">
                  {store.enableBlog && <Badge>Blog</Badge>}
                  {store.enableProductReviews && <Badge>Product Reviews</Badge>}
                  <Badge variant="secondary">{store.theme} Theme</Badge>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Description</h3>
              <p className="text-muted-foreground">
                {store.description || "No description provided"}
              </p>
            </div>
          </div>
        </Card>

        {/* Recent Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.slice(0, 5).map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.id.slice(0, 8)}...</TableCell>
                    <TableCell>
                      <Badge variant="outline">{order.status}</Badge>
                    </TableCell>
                    <TableCell>${order.totalPrice.toFixed(2)}</TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit Store Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Store Settings</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateStore} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Store Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subdomain</Label>
                  <Input
                    value={formData.subdomain}
                    onChange={(e) =>
                      setFormData({ ...formData, subdomain: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(StoreCategory).map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select
                    value={formData.theme}
                    onValueChange={(value) =>
                      setFormData({ ...formData, theme: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["default", "modern", "classic"].map((theme) => (
                        <SelectItem key={theme} value={theme}>
                          {theme}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) =>
                      setFormData({ ...formData, currency: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(Currency).map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select
                    value={formData.timezone}
                    onValueChange={(value) =>
                      setFormData({ ...formData, timezone: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(Timezone).map((tz) => (
                        <SelectItem key={tz} value={tz}>
                          {tz}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select
                    value={formData.language}
                    onValueChange={(value) =>
                      setFormData({ ...formData, language: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(Language).map((lang) => (
                        <SelectItem key={lang} value={lang}>
                          {lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Blog</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow blog post creation
                    </p>
                  </div>
                  <Switch
                    checked={formData.enableBlog}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, enableBlog: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Product Reviews</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow customers to review products
                    </p>
                  </div>
                  <Switch
                    checked={formData.enableProductReviews}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, enableProductReviews: checked })
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Store</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  This action cannot be undone. All products, orders, and data associated with this store will be permanently removed.
                </AlertDescription>
              </Alert>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDeleteConfirm(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteStore}>
                  Confirm Delete
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </StoreLayout>
  );
}

// Enums to match Prisma schema
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
