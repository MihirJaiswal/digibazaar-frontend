"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface BannerSectionProps {
  bannerImage?: string
  bannerText?: string
  storeLogo: string
  storeName: string
  storeDescription: string
  primaryColor: string
}

const BannerSection: React.FC<BannerSectionProps> = ({
  bannerImage,
  bannerText,
  storeLogo,
  storeName,
  storeDescription,
  primaryColor,
}) => {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-[600px] py-24 px-6 overflow-hidden">
      {bannerImage && (
        <>
          <Image
            src={bannerImage || "/placeholder.svg"}
            alt={bannerText || "Banner"}
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-black/60"></div>
        </>
      )}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-4xl mx-auto text-center px-4"
      >
        {!bannerImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <Image
              src={storeLogo || "/placeholder.svg?height=120&width=120"}
              alt={storeName}
              width={120}
              height={120}
              className="rounded-full object-cover mx-auto shadow-xl"
            />
          </motion.div>
        )}

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className={cn(
            "text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6",
            bannerImage ? "text-white" : "text-gray-900 dark:text-white"
          )}
        >
          {bannerText || `Discover ${storeName}`}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className={cn(
            "text-lg md:text-xl mb-10 max-w-2xl mx-auto",
            bannerImage ? "text-gray-200" : "text-gray-600 dark:text-gray-300"
          )}
        >
          {storeDescription}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            style={{ backgroundColor: primaryColor }}
            className="rounded-full px-8 text-white font-medium shadow-lg hover:shadow-xl transition-all hover:translate-y-[-2px]"
            size="lg"
          >
            Shop Now <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            className={cn(
              "rounded-full px-8 font-medium",
              bannerImage 
                ? "text-white border-white hover:bg-white/10" 
                : "text-gray-900 border-gray-300 dark:text-white dark:border-gray-600"
            )}
            size="lg"
          >
            Learn More
          </Button>
        </motion.div>
      </motion.div>
    </section>
  )
}

export default BannerSection
