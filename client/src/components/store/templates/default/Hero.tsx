"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

interface HeroSectionProps {
  bannerImage?: string
  bannerText?: string
  storeLogo: string
  storeName: string
  storeDescription: string
  primaryColor: string
  textColor: string
}

const HeroSection: React.FC<HeroSectionProps> = ({
  bannerImage,
  bannerText,
  storeLogo,
  storeName,
  storeDescription,
  primaryColor,
  textColor
}) => {
  return (
    <section className=" overflow-hidden">
      <div className="px-12 py-16 lg:py-24 flex flex-col lg:flex-row items-center lg:items-start gap-12">
        
        {/* Right Column: Hero Image */}
        <div className="w-full lg:w-1/2 flex justify-center">
          {bannerImage ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative rounded-xl overflow-hidden shadow-2xl"
            >
              <Image
                src={bannerImage}
                alt={bannerText || "Hero Image"}
                width={800}
                height={600}
                className="object-cover w-full h-full"
              />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative rounded-xl overflow-hidden shadow-2xl flex items-center justify-center bg-gray-200 w-full h-[400px]"
            >
              <Image
                src={storeLogo}
                alt={storeName}
                width={150}
                height={150}
                className="rounded-full object-cover"
              />
            </motion.div>
          )}
        </div>

        {/* Left Column: Content & CTAs */}
        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center lg:items-start"
          >
            {/* Logo & Store Name Stacked */}
            <div className="flex flex-col items-center lg:items-start mb-4">
              <Image
                src={storeLogo}
                alt={storeName}
                width={64}
                height={64}
                className="rounded-full object-cover mb-2"
              />
              <span className="text-2xl font-bold" style={{ color: textColor }}>
                {storeName}
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6" style={{ color: textColor }}>
              {bannerText || `Discover ${storeName}`}
            </h1>

            {/* Description */}
            <p className="text-lg mb-8 max-w-md" style={{ color: textColor }}>
              {storeDescription}
            </p>

            {/* Call-to-Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Button
                style={{ backgroundColor: primaryColor }}
                className="rounded-full px-8 py-3 text-white font-medium shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                size="lg"
              >
                Shop Now <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
