"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AboutSectionProps {
  backgroundColor?: string;
  accentColor?: string;
  primaryColor?: string;
  textColor?: string;
  headingFontColor?: string;
  borderRadius?: string;
  storeName: string;
  storeDescription: string;
  imageUrl: string;
  badgeText?: string;
  missionText?: string;
  buttonText?: string;
  buttonTextColor?: string;
}

const AboutSection: React.FC<AboutSectionProps> = ({
  backgroundColor,
  accentColor,
  primaryColor,
  textColor,
  headingFontColor,
  borderRadius = "8px",
  storeName,
  storeDescription,
  imageUrl,
  badgeText = "Our Story",
  missionText = "Our mission is to provide exceptional products that enhance your lifestyle while maintaining the highest standards of quality, sustainability, and customer service.",
  buttonText = "Learn More About Us",
  buttonTextColor,
}) => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <section 
      className="py-24 overflow-hidden"
      style={{ backgroundColor }}
    >
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <motion.div
              className="relative rounded-[var(--image-radius)] overflow-hidden shadow-2xl order-2 lg:order-1"
              style={{ '--image-radius': borderRadius } as React.CSSProperties}
              variants={itemVariants}
            >
            <div className="aspect-[4/3] relative">
              <Image
                src={imageUrl || "/placeholder.svg"}
                alt={`About ${storeName}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              <div 
                className="absolute inset-0 shadow-inner"
                style={{ 
                  background: `linear-gradient(to bottom, transparent 70%, ${backgroundColor}40 100%)` 
                }}
              />
            </div>
          </motion.div>
          
          <motion.div
          className="flex flex-col space-y-6 order-1 lg:order-2"
          variants={containerVariants}
            >
            <motion.div variants={itemVariants}>
              <Badge
                className="mb-3 px-4 py-1.5 text-sm font-medium rounded-full"
                style={{ 
                  backgroundColor: accentColor,
                  color: buttonTextColor || "#ffffff"
                }}
              >
                {badgeText}
              </Badge>
            </motion.div>

            <motion.h2 
              className="text-4xl md:text-5xl font-bold tracking-tight leading-tight"
              style={{ color: headingFontColor }}
              variants={itemVariants}
            >
              The <span className="relative">
                {storeName}
                <span 
                  className="absolute bottom-1 left-0 w-full h-2 -z-10"
                  style={{ backgroundColor: `${accentColor}40` }}
                />
              </span> Journey
            </motion.h2>

            <motion.p 
              className="text-lg leading-relaxed"
              style={{ color: textColor }}
              variants={itemVariants}
            >
              {storeDescription}
            </motion.p>

            <motion.p 
              className="text-lg leading-relaxed"
              style={{ color: textColor }}
              variants={itemVariants}
            >
              {missionText}
            </motion.p>

            <motion.div variants={itemVariants}>
              <Button
                className="mt-4 rounded-full px-8 py-6 shadow-lg font-medium text-base transition-all hover:shadow-xl hover:scale-105"
                style={{ 
                  backgroundColor: primaryColor,
                  color: buttonTextColor || "#ffffff",
                }}
              >
                {buttonText}
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
