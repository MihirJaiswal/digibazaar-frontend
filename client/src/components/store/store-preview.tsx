"use client"

import { DefaultTemplate } from "@/components/store/templates/DefaultTemplate"
import { ModernTemplate } from "@/components/store/templates/ModernTemplate"
import { ClassicTemplate } from "@/components/store/templates/ClassicTemplate"
import { MinimalTemplate } from "@/components/store/templates/MinimalTemplate"

// Define a simple Product interface for type safety
export interface Product {
  id: string
  name: string
  price: number
  image: string
  variants?: string[]
  description?: string
}

// Define ThemeCustomization interface based on your settings panel
export interface ThemeCustomization {
  fontFamily?: string
  fontSize?: string
  fontColor?: string
  backgroundColor?: string
  textColor?: string
  buttonColor?: string
  bannerImage?: string
  bannerText?: string
  footerText?: string
}

interface StorePreviewProps {
  viewMode: "desktop" | "tablet" | "mobile"
  currentPage: string
  theme: string // e.g., "default", "modern", etc.
  storeName: string
  storeDescription: string
  products: Product[]
  storeLogo: string
  themeCustomization?: ThemeCustomization
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
}: StorePreviewProps) {
  const renderTemplate = () => {
    // Common props to pass to all templates
    const templateProps = {
      viewMode,
      currentPage,
      storeName,
      storeDescription,
      products,
      storeLogo,
      themeCustomization,
    };

    switch (theme) {
      case "default":
        return <DefaultTemplate {...templateProps} />
      case "modern":
        return <ModernTemplate {...templateProps} />
      case "classic":
        return <ClassicTemplate {...templateProps} />
      case "minimal":
        return <MinimalTemplate {...templateProps} />
      default:
        return <DefaultTemplate {...templateProps} />
    }
  }

  return <div className="store-preview">{renderTemplate()}</div>
}