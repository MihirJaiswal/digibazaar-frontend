"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { Trash2, Edit, Plus, Save, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface Variant {
  id: string
  name: string
  value: string
  price: number
  stock: number
}

export default function ManageProductVariants({ productId }: { productId: string }) {
  const { token } = useAuthStore()
  const [variants, setVariants] = useState<Variant[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null)
  const [authChecked, setAuthChecked] = useState(false);
  const [newVariant, setNewVariant] = useState({
    name: "",
    value: "",
    price: 0,
    stock: 0,
    })

  useEffect(() => {
    // Set a flag to indicate we've checked auth status
    // This prevents premature fetch attempts
    const checkAuth = () => {
      setAuthChecked(true);
    };
    
    fetchVariants()
  }, [authChecked])

  const fetchVariants = async () => {
    setLoading(true)
    try {
      const res = await fetch(`http://localhost:8800/api/variants/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Failed to fetch variants")
      const data = await res.json()
      setVariants(data)
    } catch (err) {
      console.error(err)
      toast.error("Failed to load variants")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:8800/api/variants/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Failed to delete variant")
      toast.success("Variant deleted!")
      fetchVariants()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const handleUpdate = async () => {
    if (!editingVariant) return

    try {
      const res = await fetch(`http://localhost:8800/api/variants/${editingVariant.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingVariant),
      })

      if (!res.ok) throw new Error("Failed to update variant")

      toast.success("Variant updated!")
      setIsDialogOpen(false)
      setEditingVariant(null)
      fetchVariants()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const handleCreate = async () => {
    try {
      const res = await fetch(`http://localhost:8800/api/variants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify([
          {
            ...newVariant,
            productId,
          }
        ]),
      })

      if (!res.ok) throw new Error("Failed to create variant")

      toast.success("Variant created!")
      setIsDialogOpen(false)
      setNewVariant({
        name: "",
        value: "",
        price: 0,
        stock: 0,
      })
      fetchVariants()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const openEditDialog = (variant: Variant) => {
    setEditingVariant(variant)
    setIsDialogOpen(true)
  }

  const openCreateDialog = () => {
    setEditingVariant(null)
    setIsDialogOpen(true)
  }

  return (
    <Card className="w-full mt-6 shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl flex items-center gap-2">
          <Badge variant="outline" className="text-primary">
            Variants
          </Badge>
          Product Variants
        </CardTitle>
        <Button onClick={openCreateDialog} className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          Add Variant
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="text-muted-foreground">Loading variants...</p>
            </div>
          </div>
        ) : variants.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <AlertCircle className="h-8 w-8 mb-2" />
            <p>No variants found for this product</p>
            <Button variant="outline" onClick={openCreateDialog} className="mt-4">
              Add your first variant
            </Button>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Attribute</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variants.map((variant: Variant) => (
                  <TableRow key={variant.id}>
                    <TableCell className="font-medium">{variant.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{variant.value}</Badge>
                    </TableCell>
                    <TableCell className="text-right">${variant.price?.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <span className={variant.stock <= 5 ? "text-red-500 font-medium" : ""}>{variant.stock}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(variant)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(variant.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Edit/Create Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingVariant ? "Edit Variant" : "Create New Variant"}</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Attribute
                </Label>
                <Input
                  id="name"
                  value={editingVariant ? editingVariant.name : newVariant.name}
                  onChange={(e) => {
                    if (editingVariant) {
                      setEditingVariant({ ...editingVariant, name: e.target.value })
                    } else {
                      setNewVariant({ ...newVariant, name: e.target.value })
                    }
                  }}
                  placeholder="e.g. Color, Size"
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="value" className="text-right">
                  Value
                </Label>
                <Input
                  id="value"
                  value={editingVariant ? editingVariant.value : newVariant.value}
                  onChange={(e) => {
                    if (editingVariant) {
                      setEditingVariant({ ...editingVariant, value: e.target.value })
                    } else {
                      setNewVariant({ ...newVariant, value: e.target.value })
                    }
                  }}
                  placeholder="e.g. Red, XL"
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                  Price
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={editingVariant ? editingVariant.price : newVariant.price}
                  onChange={(e) => {
                    const value = e.target.value === "" ? 0 : Number.parseFloat(e.target.value);
                    if (editingVariant) {
                      setEditingVariant({ ...editingVariant, price: value });
                    } else {
                      setNewVariant({ ...newVariant, price: value });
                    }
                  }}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="stock" className="text-right">
                  Stock
                </Label>
                <Input
                  id="stock"
                  type="number"
                  value={editingVariant ? editingVariant.stock : newVariant.stock}
                  onChange={(e) => {
                    const value = e.target.value === "" ? 0 : Number.parseInt(e.target.value)
                    if (editingVariant) {
                      setEditingVariant({ ...editingVariant, stock: value })
                    } else {
                      setNewVariant({ ...newVariant, stock: value })
                    }
                  }}
                  className="col-span-3"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={editingVariant ? handleUpdate : handleCreate}>
                <Save className="h-4 w-4 mr-2" />
                {editingVariant ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

