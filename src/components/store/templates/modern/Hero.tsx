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
    <section
      className="relative overflow-hidden lg:px-24"
    >
      <div className="container mx-auto px-6 py-16 lg:py-24 flex flex-col-reverse lg:flex-row items-center">
        {/* Left Column: Content & CTAs */}
        <div className="w-full lg:w-1/2">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-start"
          >
            {/* Logo & Store Name */}
            <div className="flex items-center mb-4">
              <Image
                src={storeLogo}
                alt={storeName}
                width={48}
                height={48}
                className="rounded-full object-cover"
              />
              <span
                className="ml-3 text-2xl font-bold"
                style={{ color: textColor }}
              >
                {storeName}
              </span>
            </div>

            {/* Headline */}
            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6"
              style={{ color: textColor }}
            >
              {bannerText || `Discover ${storeName}`}
            </h1>

            {/* Description */}
            <p
              className="text-lg mb-8 max-w-md"
              style={{ color: textColor }}
            >
              {storeDescription}
            </p>

            {/* Call-to-Action Buttons */}
            <div className="flex gap-4">
              <Button
                style={{ backgroundColor: primaryColor }}
                className="rounded-full px-8 py-3 text-white font-medium shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                size="lg"
              >
                Shop Now <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                className="rounded-full px-8 py-3 font-medium border"
                style={{
                  color: primaryColor ,
                  borderColor: primaryColor,
                }}
                size="lg"
              >
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Hero Image */}
        <div className="w-full lg:w-1/2 mb-12 lg:mb-0 relative">
          {bannerImage ? (
            <>
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
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative rounded-xl overflow-hidden shadow-2xl flex items-center justify-center bg-gray-200"
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
      </div>
    </section>
  )
}

export default HeroSection
