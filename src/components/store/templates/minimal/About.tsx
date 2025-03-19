"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AboutSectionProps {
  backgroundColor?: string;
  accentColor?: string;
  primaryColor?: string;
  storeName: string;
  storeDescription: string;
  imageUrl: string;
  badgeText?: string;
  missionText?: string;
  buttonText?: string;
}

const AboutSection: React.FC<AboutSectionProps> = ({
  backgroundColor = "#f9fafb", // default light gray background
  accentColor = "#f59e0b", // default accent (e.g., amber-500)
  primaryColor = "#3b82f6", // default primary (e.g., blue-500)
  storeName,
  storeDescription,
  imageUrl,
  badgeText = "Our Story",
  missionText = "Our mission is to provide exceptional products that enhance your lifestyle while maintaining the highest standards of quality, sustainability, and customer service.",
  buttonText = "Learn More About Us",
}) => {
  return (
    <section className="py-20" style={{ backgroundColor }}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="relative rounded-2xl overflow-hidden"
          >
            <Image
              src={imageUrl}
              alt={`About ${storeName}`}
              width={800}
              height={600}
              className="w-full h-auto object-cover rounded-2xl"
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Badge
              className="mb-3 px-3 py-1 text-sm font-medium"
              style={{ backgroundColor: accentColor }}
            >
              {badgeText}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
              The {storeName} Journey
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg leading-relaxed">
              {storeDescription}
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg leading-relaxed">
              {missionText}
            </p>
            <Button
              style={{ backgroundColor: primaryColor }}
              className="rounded-full px-8 shadow-md text-white font-medium"
              size="lg"
            >
              {buttonText}
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
