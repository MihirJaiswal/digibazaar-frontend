"use client";

import { DefaultTemplate } from "@/components/store/templates/DefaultTemplate";
import { ModernTemplate } from "@/components/store/templates/ModernTemplate";
import { ClassicTemplate } from "@/components/store/templates/ClassicTemplate";
import { MinimalTemplate } from "@/components/store/templates/MinimalTemplate";
import { ThemeCustomization } from "@/components/store/templates/MinimalTemplate";

interface Product {
  id: string;
  title: string;
  price: number;
  mainImage: string;
  variants?: string[];
  description?: string;
} 
interface StorePreviewProps {
  viewMode: "desktop" | "tablet" | "mobile";
  currentPage: string;
  theme: string; // e.g., "default", "modern", etc.
  storeName: string;
  storeDescription: string;
  products: Product[];
  storeLogo: string;
  themeCustomization?: ThemeCustomization;
  storeId: string;
  userId: string;
}

export function StorePreview({
  viewMode,
  currentPage,
  theme,
  storeName,
  storeDescription,
  products,
  storeLogo,
  themeCustomization,
  storeId,
  userId,
}: StorePreviewProps) {
  // Common props to pass to all templates
  const templateProps = {
    viewMode,
    currentPage,
    storeName,
    storeDescription,
    products,
    storeLogo,
    themeCustomization,
    storeId,
    userId,
  };

  switch (theme) {
    case "default":
      return <DefaultTemplate {...templateProps} />;
    case "modern":
      return <ModernTemplate {...templateProps} />;
    case "classic":
      return <ClassicTemplate {...templateProps} />;
    case "minimal":
      return <MinimalTemplate {...templateProps} />;
    default:
      return <DefaultTemplate {...templateProps} />;
  }
}
