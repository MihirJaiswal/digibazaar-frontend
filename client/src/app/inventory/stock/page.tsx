"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const StockManagementPage = () => {
  const router = useRouter();
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouseId, setWarehouseId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch Warehouses & Products
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [warehousesRes, productsRes] = await Promise.all([
          fetch("http://localhost:8800/api/warehouses").then((res) => res.json()),
          fetch("http://localhost:8800/api/products").then((res) => res.json()),
        ]);
        setWarehouses(warehousesRes);
        setProducts(productsRes);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // Handle Stock Update
  const handleStockUpdate = async (type: "in" | "out") => {
    if (!warehouseId || !productId || quantity <= 0) {
      toast.error("Please fill all fields correctly!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8800/api/stock/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ warehouseId, productId, quantity }),
      });

      if (!response.ok) throw new Error("Stock update failed!");

      toast.success(`Stock ${type === "in" ? "added" : "removed"} successfully!`);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-10">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Stock Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Warehouse Selection */}
            <div>
              <Label>Warehouse</Label>
              <Select value={warehouseId} onValueChange={setWarehouseId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Warehouse" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((wh: any) => (
                    <SelectItem key={wh.id} value={wh.id}>
                      {wh.name} ({wh.location})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Product Selection */}
            <div>
              <Label>Product</Label>
              <Select value={productId} onValueChange={setProductId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product: any) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.title} - ${product.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quantity Input */}
            <div>
              <Label>Quantity</Label>
              <Input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button className="w-full" onClick={() => handleStockUpdate("in")} disabled={loading}>
                {loading ? "Processing..." : "Stock In"}
              </Button>
              <Button className="w-full" variant="destructive" onClick={() => handleStockUpdate("out")} disabled={loading}>
                {loading ? "Processing..." : "Stock Out"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockManagementPage;
