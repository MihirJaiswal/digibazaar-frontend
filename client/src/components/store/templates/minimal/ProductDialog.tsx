"use client"

import React, { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Heart, Star, Truck, RefreshCw, ShieldCheck, Check } from 'lucide-react'

interface Product {
  id: string
  title: string
  price: number
  mainImage: string
  variants?: string[]
  description?: string
  additionalImages?: string[]
  specifications?: Record<string, string>
  features?: string[]
  shippingInfo?: {
    estimatedDelivery: string
    returnPolicy: string
    warranty: string
  }
}

interface ProductDetailDialogProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddToCart: (product: Product, quantity: number) => void
  onBuyNow: (product: Product, quantity: number) => void
  primaryColor?: string
  wishlist: string[]
  onAddToWishlist: (productId: string) => void
}

const ProductDetailDialog: React.FC<ProductDetailDialogProps> = ({
  product,
  open,
  onOpenChange,
  onAddToCart,
  onBuyNow,
  primaryColor = "#3b82f6",
  wishlist,
  onAddToWishlist
}) => {
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState("")

  if (!product) return null

  const incrementQuantity = () => {
    setQuantity(quantity + 1)
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const handleAddToCart = () => {
    onAddToCart(product, quantity)
  }

  const handleBuyNow = () => {
    onBuyNow(product, quantity)
  }

  // Default shipping info if not provided
  const shippingInfo = product.shippingInfo || {
    estimatedDelivery: "3-5 business days",
    returnPolicy: "30-day easy returns",
    warranty: "1 year manufacturer warranty"
  }

  // Sample images or use product's additional images
  const images = product.additionalImages 
    ? [product.mainImage, ...product.additionalImages] 
    : [product.mainImage]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden rounded-xl">
        <div className="flex flex-col lg:flex-row max-h-[85vh]">
          {/* Product Images Section */}
          <div className="lg:w-1/2 relative bg-gray-50 dark:bg-gray-800">
            <div className="relative h-[400px] lg:h-full w-full">
              <Image
                src={images[selectedImage] || "/placeholder.svg?height=800&width=800"}
                alt={product.title}
                fill
                className="object-contain p-4"
              />
              <button 
                className="absolute top-4 right-4 h-10 w-10 flex items-center justify-center text-gray-700 bg-white rounded-full shadow-md hover:scale-110 transition-transform"
                onClick={() => onAddToWishlist(product.id)}
                aria-label="Add to wishlist"
              >
                <Heart 
                  className={cn(
                    "h-5 w-5", 
                    wishlist.includes(product.id) 
                      ? "fill-red-500 text-red-500" 
                      : "fill-transparent"
                  )} 
                />
              </button>
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="flex items-center justify-center gap-2 p-4 overflow-x-auto">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    className={cn(
                      "h-16 w-16 rounded-md overflow-hidden border-2",
                      selectedImage === idx ? `border-[${primaryColor}]` : "border-gray-200"
                    )}
                    onClick={() => setSelectedImage(idx)}
                    style={{ 
                      borderColor: selectedImage === idx ? primaryColor : undefined 
                    }}
                  >
                    <div className="relative h-full w-full">
                      <Image
                        src={img || "/placeholder.svg?height=64&width=64"}
                        alt={`${product.title} thumbnail ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details Section */}
          <div className="lg:w-1/2 flex flex-col">
            <ScrollArea className="h-full max-h-[85vh] lg:max-h-none">
              <div className="p-6">
                <DialogHeader className="mb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                        {product.title}
                      </DialogTitle>
                      <div className="flex items-center mt-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          ))}
                        </div>
                        <span className="text-sm ml-2 text-gray-600 dark:text-gray-400">(42 reviews)</span>
                      </div>
                    </div>
                    <Badge 
                      className="text-lg px-3 py-1.5 font-semibold"
                      style={{ backgroundColor: primaryColor }}
                    >
                      ₹{product.price.toLocaleString("en-IN")}
                    </Badge>
                  </div>
                </DialogHeader>

                <Tabs defaultValue="description" className="flex-1 mt-4">
                  <TabsList className="grid w-full grid-cols-4 mb-4">
                    <TabsTrigger value="description">Description</TabsTrigger>
                    <TabsTrigger value="specifications">Specs</TabsTrigger>
                    <TabsTrigger value="features">Features</TabsTrigger>
                    <TabsTrigger value="shipping">Shipping</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="description" className="mt-2">
                    <DialogDescription className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                      {product.description ||
                        "This premium product is designed to provide exceptional quality and performance. Made with the finest materials and crafted with attention to detail, it's perfect for those who appreciate excellence."}
                    </DialogDescription>
                  </TabsContent>
                  
                  <TabsContent value="specifications" className="mt-2">
                    <div className="space-y-2 text-gray-700 dark:text-gray-300">
                      <p className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                        <span className="font-medium">SKU:</span> 
                        <span>{product.id}</span>
                      </p>
                      <p className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                        <span className="font-medium">Category:</span> 
                        <span>Premium Collection</span>
                      </p>
                      {product.specifications ? 
                        Object.entries(product.specifications).map(([key, value], index) => (
                          <p key={index} className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                            <span className="font-medium">{key}:</span>
                            <span>{value}</span>
                          </p>
                        )) : (
                          <p className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                            <span className="font-medium">Material:</span>
                            <span>Premium Quality</span>
                          </p>
                        )
                      }
                      <p className="flex justify-between py-2">
                        <span className="font-medium">In Stock:</span> 
                        <span>Yes</span>
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="features" className="mt-2">
                    <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                      {product.features ? product.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      )) : (
                        <>
                          <li className="flex items-start gap-2">
                            <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>Premium quality materials for durability</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>Ergonomic design for comfort</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>Versatile functionality for various uses</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>Energy efficient design</span>
                          </li>
                        </>
                      )}
                    </ul>
                  </TabsContent>
                  
                  <TabsContent value="shipping" className="mt-2">
                    <div className="space-y-4 text-gray-700 dark:text-gray-300">
                      <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <Truck className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Estimated Delivery</p>
                          <p className="text-sm">{shippingInfo.estimatedDelivery}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <RefreshCw className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Return Policy</p>
                          <p className="text-sm">{shippingInfo.returnPolicy}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <ShieldCheck className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Warranty</p>
                          <p className="text-sm">{shippingInfo.warranty}</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Variants Selection */}
                {product.variants && product.variants.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-3 text-gray-900 dark:text-white">Available Variants</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {product.variants.map((variant, index) => (
                        <Badge 
                          key={index} 
                          variant={selectedVariant === variant ? "default" : "outline"} 
                          className={cn(
                            "px-3 py-1.5 border-2 cursor-pointer",
                            selectedVariant === variant
                              ? "bg-opacity-90 border-transparent"
                              : "hover:bg-gray-100 dark:hover:bg-gray-800"
                          )}
                          style={selectedVariant === variant ? { backgroundColor: primaryColor } : {}}
                          onClick={() => setSelectedVariant(variant)}
                        >
                          {variant}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity Selection */}
                <div className="mt-8">
                  <h4 className="font-medium mb-3 text-gray-900 dark:text-white">Quantity</h4>
                  <div className="flex items-center mb-6">
                    <button 
                      className="h-12 w-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                    >
                      <span className="text-xl font-medium">-</span>
                    </button>
                    <span className="w-16 text-center font-medium text-lg">{quantity}</span>
                    <button 
                      className="h-12 w-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={incrementQuantity}
                    >
                      <span className="text-xl font-medium">+</span>
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <Button 
                      className="flex-1 rounded-full h-12 text-lg font-medium"
                      style={{ backgroundColor: primaryColor }}
                      onClick={handleBuyNow}
                    >
                      Buy Now
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 rounded-full h-12 text-lg font-medium border-2"
                      onClick={handleAddToCart}
                    >
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ProductDetailDialog