"use client";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner"; // Add this if you're using sonner for notifications

const CreateProductVariant = ({ productId }: { productId: string }) => {
  const { token } = useAuthStore();
  const [variants, setVariants] = useState([{ name: "", value: "", price: 0, stock: 0 }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Submit variants one by one
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Filter out empty variants
      const validVariants = variants.filter(v => v.name.trim() && v.value.trim());
      
      if (validVariants.length === 0) {
        toast ? toast.error("Please add at least one valid variant") : alert("Please add at least one valid variant");
        return;
      }
      
      // Create variants one by one
      for (const variant of validVariants) {
        const res = await fetch("http://localhost:8800/api/variants", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify([
            {
              ...variant,
              productId
            }
          ]),
        });
        
        if (!res.ok) {
          throw new Error("Failed to create variant");
        }
      }
      
      toast ? toast.success("Variants created successfully!") : alert("Variants created successfully!");
      // Reset form
      setVariants([{ name: "", value: "", price: 0, stock: 0 }]);
    } catch (error) {
      console.error(error);
      toast ? toast.error("Error creating variants") : alert("Error creating variants");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 mt-6 shadow-md rounded-md">
      <h2 className="text-md md:text-xl font-bold mb-4">Add Product Variants</h2>
      {variants.map((variant, index) => (
        <div key={index} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <Input 
            placeholder="Name (e.g., Color)" 
            value={variant.name} 
            onChange={e => handleVariantChange(index, "name", e.target.value)} 
          />
          <Input 
            placeholder="Value (e.g., Red)" 
            value={variant.value} 
            onChange={e => handleVariantChange(index, "value", e.target.value)} 
          />
          <Input 
            placeholder="Price" 
            type="number" 
            value={variant.price} 
            onChange={e => handleVariantChange(index, "price", parseFloat(e.target.value) || 0)} 
          />
          <Input 
            placeholder="Stock" 
            type="number" 
            value={variant.stock} 
            onChange={e => handleVariantChange(index, "stock", parseInt(e.target.value, 10) || 0)} 
          />
        </div>
      ))}
      <div className="flex justify-center items-center">
        <Button onClick={addVariant} className="mr-4" variant="outline">+ Add More</Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Variants"}
        </Button>
      </div>
    </div>
  );
};

export default CreateProductVariant;