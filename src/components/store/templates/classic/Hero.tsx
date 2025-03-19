"use client"

import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from 'lucide-react'
import { motion } from "framer-motion"

interface ThemeCustomization {
  buttonColor?: string
  accentColor?: string
  backgroundColor?: string
  textColor?: string
  fontFamily?: string
  fontSize?: string
  headingFontFamily?: string
  headingFontSize?: string
  headingFontColor?: string
  buttonTextColor?: string
  buttonHoverColor?: string
  buttonHoverTextColor?: string
  buttonBorderRadius?: string
  cardBackgroundColor?: string
  borderRadius?: string
}

interface HeroSectionProps {
  bannerImage?: string
  bannerText?: string
  backgroundColor?: string
  storeLogo: string
  storeName: string
  storeDescription: string
  primaryColor: string
  textColor: string
  cardBackgroundColor: string
  themeCustomization?: ThemeCustomization
}

const HeroSection: React.FC<HeroSectionProps> = ({
  bannerImage,
  backgroundColor,
  bannerText,
  storeLogo,
  storeName,
  storeDescription,
  primaryColor,
  textColor,
  themeCustomization,
  cardBackgroundColor
}) => {
  // Fallback theme values
  const accentColor = themeCustomization?.accentColor || "#f59e0b"
  const fontFamily = themeCustomization?.fontFamily || "Arial, sans-serif"
  const headingFontFamily = themeCustomization?.headingFontFamily || "Arial, sans-serif"
  const headingFontSize = themeCustomization?.headingFontSize || "48px"
  const headingFontColor = themeCustomization?.headingFontColor || "#ffffff"
  const buttonTextColor = themeCustomization?.buttonTextColor || "#ffffff"
  const buttonHoverColor = themeCustomization?.buttonHoverColor || "#2563eb"
  const buttonHoverTextColor = themeCustomization?.buttonHoverTextColor || "#ffffff"
  const buttonBorderRadius = themeCustomization?.buttonBorderRadius || "12px"
  const borderRadius = themeCustomization?.borderRadius || "16px"

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }

  return (
    <section
      className="min-h-[90vh] flex flex-col md:flex-row overflow-hidden"
      style={{ backgroundColor, fontFamily }}
    >
      {/* Left Column: Content Card */}
      <motion.div 
        className="flex flex-col justify-center items-start p-6 md:p-12 lg:p-16 md:w-1/2 z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div 
          className="w-full max-w-xl"
          variants={itemVariants}
        >
          <Card 
            className="shadow-2xl border-0 overflow-hidden backdrop-blur-sm"
            style={{ 
              background: `${cardBackgroundColor}`,
              borderRadius: borderRadius,
            }}
          >
            <CardHeader className="flex flex-col items-start pb-2">
              <motion.div 
                className="mb-6"
                variants={itemVariants}
              >
                <Image
                  src={storeLogo || "/placeholder.svg"}
                  alt={storeName}
                  width={90}
                  height={90}
                  className="rounded-full shadow-lg border-4"
                  style={{ borderColor: accentColor }}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <CardTitle
                  className="text-left text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
                  style={{
                    fontFamily: headingFontFamily,
                    color: textColor
                  }}
                >
                  {bannerText || `Welcome to ${storeName}`}
                </CardTitle>
              </motion.div>
              <motion.div 
                className="mt-4"
                variants={itemVariants}
              >
                <CardDescription 
                  className="text-left text-lg leading-relaxed"
                  style={{ color: textColor }}
                >
                  {storeDescription}
                </CardDescription>
              </motion.div>
            </CardHeader>
            <CardContent className="mt-8 flex flex-col sm:flex-row gap-4">
              <motion.div variants={itemVariants}>
                <Button
                  style={{
                    backgroundColor: primaryColor,
                    color: buttonTextColor,
                    borderRadius: buttonBorderRadius,
                  }}
                  className="flex items-center gap-2 hover:shadow-lg transition-all duration-300 hover:scale-105 px-8 py-6 text-base"
                  size="lg"
                >
                  Shop Now <ArrowRight className="w-5 h-5 ml-1" />
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Right Column: Banner Image */}
      <div className="relative md:w-1/2 h-64 md:h-auto order-first md:order-last">
        {bannerImage ? (
          <>
            <Image
              src={bannerImage || "/placeholder.svg"}
              alt={bannerText || "Hero Image"}
              fill
              className="object-cover"
              quality={90}
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {/* Animated gradient overlay */}
            <motion.div 
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5 }}
              style={{ 
                background: `linear-gradient(135deg, ${backgroundColor}CC 0%, transparent 50%, ${backgroundColor}99 100%)`,
              }}
            ></motion.div>
          </>
        ) : (
          <div 
            className="flex items-center justify-center h-full"
            style={{ 
              background: `radial-gradient(circle at center, ${accentColor}33 0%, ${backgroundColor} 70%)` 
            }}
          >
            <motion.span 
              className="text-9xl font-bold"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{ color: accentColor }}
            >
              {storeName.charAt(0)}
            </motion.span>
          </div>
        )}
        
        {/* Decorative elements */}
        <motion.div 
          className="absolute bottom-0 left-0 w-full h-1/3 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 0.5, duration: 1 }}
          style={{ 
            background: `linear-gradient(to top, ${backgroundColor} 0%, transparent 100%)`,
          }}
        ></motion.div>
      </div>
    </section>
  )
}

export default HeroSection
