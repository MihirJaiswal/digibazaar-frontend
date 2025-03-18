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
  // add other product fields if needed
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
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center mb-16">
          <Badge
            className="mb-3 px-3 py-1 text-sm font-medium"
            style={{ backgroundColor: primaryColor }}
          >
            New Arrivals
          </Badge>
          <h2
            className="text-3xl md:text-4xl font-bold tracking-tight mb-4"
            style={{ color: textColor }}
          >
            Featured Collection
          </h2>
          <p className="max-w-2xl" style={{ color: textColor }}>
            Discover our carefully curated selection of premium products
            designed to elevate your lifestyle.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative"
            >
              <div className="aspect-[3/4] relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 mb-4">
                <Image
                  src={product.mainImage || "/placeholder.svg?height=480&width=360"}
                  alt={product.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 transition-colors duration-300"></div>

                <div className="absolute top-3 right-3 flex flex-col gap-2">
                  <button
                    className="h-9 w-9 flex items-center justify-center text-gray-700 dark:text-white bg-white dark:bg-gray-800 rounded-full shadow-md hover:scale-110 transition-transform"
                    onClick={() => addToWishlist(product.id)}
                    aria-label="Add to wishlist"
                  >
                    <Heart
                      className={cn(
                        "h-4 w-4",
                        wishlist.includes(product.id)
                          ? "fill-red-500 text-red-500"
                          : "fill-transparent"
                      )}
                    />
                  </button>
                </div>

                <div className="absolute inset-x-0 bottom-0 p-4 h-1/2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute inset-x-0 bottom-4 flex justify-center">
                    <Button
                      className="rounded-full shadow-lg text-sm font-medium"
                      style={{ backgroundColor: primaryColor }}
                      onClick={() => openProductDialog(product)}
                    >
                      Quick View
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-1 group-hover:text-primary transition-colors">
                  {product.title}
                </h3>
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    ₹{product.price.toLocaleString("en-IN")}
                  </p>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm ml-1 text-gray-600 dark:text-gray-400">
                      4.9
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Button
            variant="outline"
            size="lg"
            className="rounded-full px-8 border-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            View All Products <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollectionSection;
