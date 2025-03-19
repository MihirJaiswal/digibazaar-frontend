"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, Heart, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  title: string;
  price: number;
  mainImage: string;
}

interface FeaturedCollectionSectionProps {
  backgroundColor: string;
  primaryColor: string;
  textColor: string;
  products: Product[];
  addToWishlist: (productId: string) => void;
  wishlist: string[];
  openProductDialog: (product: Product) => void;
}

const FeaturedCollectionSection: React.FC<FeaturedCollectionSectionProps> = ({
  backgroundColor,
  primaryColor,
  textColor,
  products,
  addToWishlist,
  wishlist,
  openProductDialog,
}) => {
  return (
    <section className="py-20" style={{ backgroundColor }}>
      <div className="container max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <Badge
            className="mb-3 px-4 py-1 text-sm font-medium"
            style={{ backgroundColor: primaryColor, color: "#fff" }}
          >
            New Arrivals
          </Badge>
          <h2
            className="text-3xl md:text-4xl font-bold tracking-tight mb-4"
            style={{ color: textColor }}
          >
            Our Products
          </h2>
          <p className="max-w-2xl" style={{ color: textColor }}>
            Discover our carefully curated selection of premium products designed to elevate your lifestyle.
          </p>
        </div>

        {/* Horizontal Scroll Product Layout */}
        <div className="flex space-x-8 overflow-x-auto pb-4">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative group flex-shrink-0 w-80"
            >
              <div className="relative overflow-hidden rounded-xl">
                <Image
                  src={product.mainImage || "/placeholder.svg"}
                  alt={product.title}
                  width={400}
                  height={500}
                  className="object-cover w-full h-64 transition-transform duration-500 group-hover:scale-105"
                />

                {/* Wishlist Button */}
                <button
                  className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white shadow hover:scale-110 transition-transform"
                  onClick={() => addToWishlist(product.id)}
                  aria-label="Add to wishlist"
                >
                  <Heart
                    className={cn(
                      "h-5 w-5",
                      wishlist.includes(product.id)
                        ? "fill-red-500 text-red-500"
                        : "fill-transparent text-gray-600"
                    )}
                  />
                </button>

                {/* Hover Overlay with Quick View Button */}
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-40 transition duration-300">
                  <Button
                    className="rounded-full px-6 py-2"
                    style={{ backgroundColor: primaryColor, color: "#fff" }}
                    onClick={() => openProductDialog(product)}
                  >
                    Quick View
                  </Button>
                </div>
              </div>

              {/* Product Details */}
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-1" style={{ color: textColor }}>
                  {product.title}
                </h3>
                <div className="flex items-center justify-between">
                  <p className="font-bold" style={{ color: textColor }}>
                    ₹{product.price.toLocaleString("en-IN")}
                  </p>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm ml-1" style={{ color: textColor }}>
                      4.9
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Products Button */}
        <div className="mt-16 text-center">
          <Button
            variant="outline"
            size="lg"
            className="rounded-full px-8 py-3 border-2"
            style={{ borderColor: primaryColor, color: primaryColor, background: 'transparent' }}
          >
            View All Products <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollectionSection;
