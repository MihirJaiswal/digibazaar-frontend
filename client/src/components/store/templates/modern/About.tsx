"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AboutSectionProps {
  backgroundColor?: string;
  backgroundColor2?: string;
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
  backgroundColor = "#f9fafb", 
  backgroundColor2,
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
    <section
    className="py-20"
        style={{
          background: `linear-gradient(to bottom, ${backgroundColor}, ${
            backgroundColor2 || backgroundColor
          })`,
        }}
      >
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex flex-col-reverse lg:flex-row items-center lg:space-x-12">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2 mt-8 lg:mt-0"
          >
            <Badge
              className="mb-4 inline-block px-4 py-2 text-sm font-medium rounded-full"
              style={{ backgroundColor: accentColor, color: "#fff" }}
            >
              {badgeText}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              The {storeName} Journey
            </h2>
            <p className="mb-4 leading-relaxed">
              {storeDescription}
            </p>
            <p className="mb-8 leading-relaxed">
              {missionText}
            </p>
            <Button
              style={{ backgroundColor: primaryColor }}
              className="rounded-full px-8 py-3 text-white font-medium shadow-lg"
              size="lg"
            >
              {buttonText}
            </Button>
          </motion.div>
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2 flex justify-center"
          >
            <div className="relative w-72 h-72 lg:w-96 lg:h-96">
              <Image
                src={imageUrl}
                alt={`About ${storeName}`}
                fill
                className="object-cover rounded-full shadow-2xl"
              />
              {/* Decorative Accent Border */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  boxShadow: `0 0 0 10px ${accentColor}33`,
                }}
              ></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
