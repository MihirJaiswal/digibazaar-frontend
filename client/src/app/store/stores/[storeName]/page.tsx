"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, ShoppingCart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { StorePreview } from "@/components/store/store-preview";

// Define a simple Product interface (optional)
export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  variants?: string[];
  description?: string;
}

interface StorePageProps {
  params: Promise<{ storeName: string }>;
}

export default function StorePage({ params }: StorePageProps) {
  // Unwrap the params promise using the experimental use hook.
  const { storeName } = use(params);
  console.log("Store name from params:", storeName);

  const { token } = useAuthStore();
  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [customization, setCustomization] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        // Fetch the store details by storeName.
        const resStore = await fetch(`http://localhost:8800/api/stores/${storeName}`, {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
        if (!resStore.ok) {
          throw new Error("Failed to fetch store");
        }
        const storeData = await resStore.json();
        console.log("Store data:", storeData);
        setStore(storeData);

        // Fetch products for this store (if your API supports filtering by storeId)
        const resProducts = await fetch(`http://localhost:8800/api/products?storeId=${storeData.id}`, {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
        if (!resProducts.ok) {
          throw new Error("Failed to fetch products");
        }
        const productsData = await resProducts.json();
        setProducts(productsData);

        // Fetch theme customization for this store
        const resCustomization = await fetch(
          `http://localhost:8800/api/stores/theme-customization/${storeName}`,
          {
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          }
        );
        if (resCustomization.ok) {
          const customizationData = await resCustomization.json();
          setCustomization(customizationData);
        } else {
          setCustomization({});
        }
      } catch (error) {
        console.error("Error fetching store, products, or customization:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [storeName, token]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading store...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Instead of hard-coding the layout here, we simply render our imported template */}
      <StorePreview
        viewMode="desktop"
        currentPage="home"
        theme={store?.theme || "default"}
        storeName={store?.name || "Default Store"}
        storeDescription={store?.description || "Welcome to our store."}
        storeLogo={store?.logo || "/images/placeholder.png"}
        products={products}
        themeCustomization={customization || {}}
      />
    </div>
  );
}
