"use client";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CreateProductVariant = ({ productId }: { productId: string }) => {
  const { token } = useAuthStore();
  const [variants, setVariants] = useState([{ name: "", value: "", price: 0, stock: 0 }]);

  // Add new variant row
  const addVariant = () => {
    setVariants([...variants, { name: "", value: "", price: 0, stock: 0 }]);
  };

  // Handle input change
  const handleVariantChange = (index: number, field: keyof typeof variants[0], value: string | number) => {
    const newVariants = [...variants];
    newVariants[index][field] = value as never;
    setVariants(newVariants);
  };

  // Submit variants
  const handleSubmit = async () => {
    try {
      const res = await fetch("http://localhost:8800/api/variants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(variants.map(v => ({ ...v, productId }))),
      });

      if (!res.ok) throw new Error("Failed to create variants");

      alert("Variants created successfully!");
    } catch (error) {
      console.error(error);
      alert("Error creating variants");
    }
  };

  return (
    <div className="p-6 mt-6 bg-white shadow-md rounded-md">
      <h2 className="text-xl font-bold mb-4">Add Product Variants</h2>
      {variants.map((variant, index) => (
        <div key={index} className="grid grid-cols-4 gap-4 mb-4">
          <Input placeholder="Name (e.g., Color)" value={variant.name} onChange={e => handleVariantChange(index, "name", e.target.value)} />
          <Input placeholder="Value (e.g., Red)" value={variant.value} onChange={e => handleVariantChange(index, "value", e.target.value)} />
          <Input placeholder="Price" type="number" value={variant.price} onChange={e => handleVariantChange(index, "price", parseFloat(e.target.value))} />
          <Input placeholder="Stock" type="number" value={variant.stock} onChange={e => handleVariantChange(index, "stock", parseInt(e.target.value, 10))} />
        </div>
      ))}
      <Button onClick={addVariant} className="mr-4">+ Add More</Button>
      <Button onClick={handleSubmit}>Save Variants</Button>
    </div>
  );
};

export default CreateProductVariant;
