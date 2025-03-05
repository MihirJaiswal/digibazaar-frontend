// ManageProductVariants.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Trash2, Edit } from "lucide-react";

export default function ManageProductVariants({ productId }: { productId: string }) {
  const { token } = useAuthStore();
  const [variants, setVariants] = useState([]);
  const [editingVariant, setEditingVariant] = useState(null);

  useEffect(() => {
    fetchVariants();
  }, [productId]);

  const fetchVariants = async () => {
    try {
      const res = await fetch(`http://localhost:8800/api/variants/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch variants");
      const data = await res.json();
      setVariants(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:8800/api/variants/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete variant");
      toast.success("Variant deleted!");
      fetchVariants();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleUpdate = async (variant: any) => {
    try {
      const res = await fetch(`http://localhost:8800/api/variants/${variant.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(variant),
      });
      if (!res.ok) throw new Error("Failed to update variant");
      toast.success("Variant updated!");
      setEditingVariant(null);
      fetchVariants();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Manage Product Variants</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Attribute</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variants.map((variant: any) => (
              <TableRow key={variant.id}>
                <TableCell>{variant.name}</TableCell>
                <TableCell>{variant.value}</TableCell>
                <TableCell>${variant.price}</TableCell>
                <TableCell>{variant.stock}</TableCell>
                <TableCell>
                  <Button variant="outline" onClick={() => setEditingVariant(variant)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" onClick={() => handleDelete(variant.id)} className="ml-2">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
