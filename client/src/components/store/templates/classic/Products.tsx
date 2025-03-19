"use client"

import type React from "react"

import Image from "next/image"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronRight, Heart, Star, Eye } from "lucide-react"
import { cn } from "@/lib/utils"

interface Product {
  id: string
  title: string
  price: number
  mainImage: string
  rating?: number
}

interface FeaturedCollectionSectionProps {
  backgroundColor?: string
  primaryColor?: string
  textColor?: string
  cardBackgroundColor?: string
  accentColor?: string
  borderRadius?: string
  buttonTextColor?: string
  productGridLayout?: string
  products: Product[]
  addToWishlist: (productId: string) => void
  wishlist: string[]
  openProductDialog: (product: Product) => void
}

// Extend React.CSSProperties to include custom properties.
interface CustomCSSProperties extends React.CSSProperties {
  "--card-radius"?: string
  "--btn-radius"?: string
}

const FeaturedCollectionSection: React.FC<FeaturedCollectionSectionProps> = ({
  backgroundColor,
  primaryColor,
  textColor,
  cardBackgroundColor,
  accentColor,
  borderRadius = "8px",
  buttonTextColor,
  productGridLayout = "grid-cols-4",
  products,
  addToWishlist,
  wishlist,
  openProductDialog,
}) => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  }

  // Determine the grid layout based on the productGridLayout prop
  const gridClass = cn(
    "grid gap-6 sm:gap-8",
    {
      "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3": productGridLayout === "grid-cols-3",
      "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4": productGridLayout === "grid-cols-4",
      "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2": productGridLayout === "grid-cols-2",
    },
    productGridLayout !== "grid-cols-2" &&
      productGridLayout !== "grid-cols-3" &&
      productGridLayout !== "grid-cols-4"
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      : "",
  )

  return (
    <section className="py-24 overflow-hidden" style={{ backgroundColor }}>
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section Heading */}
        <motion.div
          className="flex flex-col items-center text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <Badge
              className="mb-4 px-4 py-1.5 text-sm font-medium rounded-full"
              style={{
                backgroundColor: accentColor || primaryColor,
                color: buttonTextColor || "#ffffff",
              }}
            >
              New Arrivals
            </Badge>
          </motion.div>

          <motion.h2
            className="text-4xl md:text-5xl font-bold tracking-tight mb-6"
            style={{ color: textColor }}
            variants={itemVariants}
          >
            Featured Collection
          </motion.h2>

          <motion.p className="max-w-2xl text-lg" style={{ color: textColor }} variants={itemVariants}>
            Discover our carefully curated selection of premium products designed to elevate your lifestyle.
          </motion.p>
        </motion.div>

        {/* Products Grid */}
        <motion.div
          className={gridClass}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
        >
          {products.map((product) => (
            <motion.div
              key={product.id}
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="group relative"
            >
              <div
                className="overflow-hidden rounded-[var(--card-radius)] shadow-lg transition-all duration-300 h-full flex flex-col"
                style={
                  {
                    "--card-radius": borderRadius,
                    backgroundColor: cardBackgroundColor,
                  } as CustomCSSProperties
                }
              >
                {/* Product Image Container */}
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image
                    src={product.mainImage || "/placeholder.svg?height=480&width=360"}
                    alt={product.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Overlay with actions */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Button
                      className="rounded-full p-3 shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
                      style={{ backgroundColor: primaryColor, color: buttonTextColor || "#ffffff" }}
                      size="icon"
                      onClick={() => openProductDialog(product)}
                    >
                      <Eye className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Wishlist Button */}
                <button
                  className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md hover:scale-110 transition-transform z-10"
                  onClick={(e) => {
                    e.stopPropagation()
                    addToWishlist(product.id)
                  }}
                  aria-label="Add to wishlist"
                >
                  <Heart
                    className={cn(
                      "h-5 w-5",
                      wishlist.includes(product.id)
                        ? "fill-red-500 text-red-500"
                        : "fill-transparent text-gray-700",
                    )}
                  />
                </button>

                {/* Card Content */}
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg line-clamp-1" style={{ color: textColor }}>
                      {product.title}
                    </h3>

                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm" style={{ color: textColor }}>
                        {product.rating || 4.9}
                      </span>
                    </div>
                  </div>

                  <p className="font-bold text-xl mt-1 mb-4" style={{ color: textColor }}>
                    ₹{product.price.toLocaleString("en-IN")}
                  </p>

                  {/* Quick View Button */}
                  <div className="mt-auto">
                    <Button
                      className="w-full rounded-[var(--btn-radius)] font-medium transition-all hover:shadow-lg"
                      style={
                        {
                          "--btn-radius": borderRadius,
                          backgroundColor: primaryColor,
                          color: buttonTextColor || "#ffffff",
                        } as CustomCSSProperties
                      }
                      onClick={() => openProductDialog(product)}
                    >
                      Quick View
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* View All Button */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <Button
            variant="outline"
            size="lg"
            className="rounded-full px-8 py-6 border-2 font-medium transition-all hover:scale-105"
            style={{
              borderColor: primaryColor,
              color: textColor,
            }}
          >
            View All Products <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    </section>
  )
}

export default FeaturedCollectionSection
