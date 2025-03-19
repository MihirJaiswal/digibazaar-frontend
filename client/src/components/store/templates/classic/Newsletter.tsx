"use client";

import { Button } from "@/components/ui/button";
import { Mail, ArrowRight } from 'lucide-react';
import { motion } from "framer-motion";

interface NewsletterSectionProps {
  primaryColor: string;
  sectionBackgroundColor?: string;
  textColor?: string;
  buttonTextColor?: string;
  accentColor?: string;
  borderRadius?: string;
  title?: string;
  description?: string;
  inputPlaceholder?: string;
  subscribeButtonText?: string;
  privacyText?: string;
}

const NewsletterSection: React.FC<NewsletterSectionProps> = ({
  primaryColor,
  sectionBackgroundColor = "#111827", // dark gray-900
  textColor = "#ffffff",
  buttonTextColor = "#ffffff",
  accentColor,
  borderRadius = "8px",
  title = "Join Our Community",
  description = "Subscribe to our newsletter and be the first to know about new products, exclusive offers, and more.",
  inputPlaceholder = "Your email address",
  subscribeButtonText = "Subscribe",
  privacyText = "By subscribing, you agree to our privacy policy and consent to receive marketing emails.",
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
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <section 
      className="py-24 relative overflow-hidden"
      style={{ backgroundColor: sectionBackgroundColor }}
    >
      {/* Background decorative elements */}
      <div 
        className="absolute inset-0 z-0"
        style={{ 
          backgroundImage: `
            radial-gradient(circle at 15% 50%, ${primaryColor}20 0%, transparent 25%),
            radial-gradient(circle at 85% 30%, ${accentColor || primaryColor}15 0%, transparent 30%)
          ` 
        }}
      ></div>
      
      {/* Animated light beam */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-full opacity-20"
        initial={{ height: 0, opacity: 0 }}
        animate={{ 
          height: '100%', 
          opacity: [0, 0.2, 0.1, 0.3, 0.1],
        }}
        transition={{ 
          duration: 5, 
          repeat: Infinity,
          repeatType: "reverse" 
        }}
        style={{ background: `linear-gradient(to bottom, transparent, ${primaryColor}, transparent)` }}
      ></motion.div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="max-w-2xl mx-auto text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <motion.h2 
            className="text-4xl md:text-5xl font-bold tracking-tight mb-6"
            style={{ color: textColor }}
            variants={itemVariants}
          >
            {title}
          </motion.h2>
          
          <motion.p 
            className="text-lg mb-10 leading-relaxed"
            style={{ color: `${textColor}CC` }}
            variants={itemVariants}
          >
            {description}
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            variants={itemVariants}
          >
            <div className="relative flex-1">
              <input
                type="email"
                placeholder={inputPlaceholder}
                className="w-full px-5 py-4 rounded-full text-gray-900 focus:outline-none focus:ring-2 shadow-lg"
                style={{ 
                  borderRadius: borderRadius
                }}
              />
            </div>
            <Button
              style={{ 
                backgroundColor: primaryColor,
                color: buttonTextColor,
                borderRadius: borderRadius,
              }}
              className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-6 py-4 text-base"
            >
              {subscribeButtonText} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
          
          <motion.p 
            className="text-sm mt-6"
            style={{ color: `${textColor}99` }}
            variants={itemVariants}
          >
            {privacyText}
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};

export default NewsletterSection;
