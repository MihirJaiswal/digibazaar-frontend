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
  accentColor = "#f59e0b",
  primaryColor = "#3b82f6",
  storeName,
  storeDescription,
  imageUrl,
  badgeText = "Our Story",
  missionText = "Our mission is to provide exceptional products that enhance your lifestyle while maintaining the highest standards of quality, sustainability, and customer service.",
  buttonText = "Learn More About Us",
}) => {
  return (
    <section className="py-20" style={{ backgroundColor }}>
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center lg:space-x-12">
          {/* Image (top on mobile, left on desktop) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2 flex justify-center mb-8 lg:mb-0"
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

          {/* Text Content (bottom on mobile, right on desktop) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2"
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
            <p className="mb-4 leading-relaxed">{storeDescription}</p>
            <p className="mb-8 leading-relaxed">{missionText}</p>
            <Button
              style={{ backgroundColor: primaryColor }}
              className="rounded-full px-8 py-3 text-white font-medium shadow-lg"
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
