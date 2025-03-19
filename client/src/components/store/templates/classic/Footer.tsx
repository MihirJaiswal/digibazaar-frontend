"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { ArrowRight, Facebook, Instagram, Twitter, Mail, MapPin, Phone } from 'lucide-react';

interface FooterSectionProps {
  storeLogo: string;
  storeName: string;
  storeDescription: string;
  primaryColor: string;
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  borderRadius?: string;
  buttonTextColor?: string;
  footerText?: string;
}

const FooterSection: React.FC<FooterSectionProps> = ({
  storeLogo,
  storeName,
  storeDescription,
  primaryColor,
  backgroundColor = "#111827", // dark gray-900
  textColor = "#ffffff",
  accentColor,
  borderRadius = "8px",
  buttonTextColor = "#ffffff",
  footerText,
}) => {
  const [email, setEmail] = useState("");
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle subscription logic here
    console.log("Subscribed with email:", email);
    setEmail("");
  };

  return (
    <footer 
      className="pt-24 pb-10 relative overflow-hidden"
      style={{ backgroundColor }}
    >
      {/* Background decorative elements */}
      <div 
        className="absolute inset-0 z-0 opacity-30"
        style={{ 
          backgroundImage: `
            radial-gradient(circle at 10% 90%, ${primaryColor}20 0%, transparent 20%),
            radial-gradient(circle at 90% 10%, ${accentColor || primaryColor}15 0%, transparent 25%)
          ` 
        }}
      ></div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          {/* Store Info */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-3 mb-6">
              {storeLogo ? (
                <div className="relative h-12 w-12 overflow-hidden rounded-lg shadow-md">
                  <Image
                    src={storeLogo || "/placeholder.svg"}
                    alt={storeName}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div
                  className="h-12 w-12 rounded-lg flex items-center justify-center text-white font-bold shadow-md"
                  style={{ backgroundColor: primaryColor }}
                >
                  {storeName.charAt(0)}
                </div>
              )}
              <span 
                className="text-xl font-bold tracking-tight"
                style={{ color: textColor }}
              >
                {storeName}
              </span>
            </div>
            <p 
              className="mb-6 leading-relaxed"
              style={{ color: `${textColor}99` }}
            >
              {storeDescription.length > 120
                ? `${storeDescription.substring(0, 120)}...`
                : storeDescription}
            </p>
            
            <div className="flex space-x-4">
              <a
                href="#"
                className="p-2 rounded-full transition-all duration-300 hover:scale-110"
                style={{ 
                  backgroundColor: `${primaryColor}20`,
                  color: textColor
                }}
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="p-2 rounded-full transition-all duration-300 hover:scale-110"
                style={{ 
                  backgroundColor: `${primaryColor}20`,
                  color: textColor
                }}
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="p-2 rounded-full transition-all duration-300 hover:scale-110"
                style={{ 
                  backgroundColor: `${primaryColor}20`,
                  color: textColor
                }}
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </motion.div>
          
          {/* Shop Links */}
          <motion.div variants={itemVariants}>
            <h4 
              className="text-xl font-bold mb-6"
              style={{ color: textColor }}
            >
              Shop
            </h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="#"
                  className="flex items-center group"
                  style={{ color: `${textColor}99` }}
                >
                  <span className="transition-all duration-300 group-hover:translate-x-1" style={{ color: `${textColor}99` }}>All Products</span>
                  <ArrowRight className="ml-2 h-3 w-3 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" style={{ color: primaryColor }} />
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center group"
                  style={{ color: `${textColor}99` }}
                >
                  <span className="transition-all duration-300 group-hover:translate-x-1" style={{ color: `${textColor}99` }}>New Arrivals</span>
                  <ArrowRight className="ml-2 h-3 w-3 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" style={{ color: primaryColor }} />
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center group"
                  style={{ color: `${textColor}99` }}
                >
                  <span className="transition-all duration-300 group-hover:translate-x-1" style={{ color: `${textColor}99` }}>Featured Items</span>
                  <ArrowRight className="ml-2 h-3 w-3 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" style={{ color: primaryColor }} />
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center group"
                  style={{ color: `${textColor}99` }}
                >
                  <span className="transition-all duration-300 group-hover:translate-x-1" style={{ color: `${textColor}99` }}>Special Offers</span>
                  <ArrowRight className="ml-2 h-3 w-3 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" style={{ color: primaryColor }} />
                </a>
              </li>
            </ul>
          </motion.div>
          
          {/* Support Links */}
          <motion.div variants={itemVariants}>
            <h4 
              className="text-xl font-bold mb-6"
              style={{ color: textColor }}
            >
              Support
            </h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="#"
                  className="flex items-center group"
                  style={{ color: `${textColor}99` }}
                >
                  <span className="transition-all duration-300 group-hover:translate-x-1" style={{ color: `${textColor}99` }}>Contact Us</span>
                  <ArrowRight className="ml-2 h-3 w-3 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" style={{ color: primaryColor }} />
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center group"
                  style={{ color: `${textColor}99` }}
                >
                  <span className="transition-all duration-300 group-hover:translate-x-1" style={{ color: `${textColor}99` }}>FAQs</span>
                  <ArrowRight className="ml-2 h-3 w-3 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" style={{ color: primaryColor }} />
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center group"
                  style={{ color: `${textColor}99` }}
                >
                  <span className="transition-all duration-300 group-hover:translate-x-1" style={{ color: `${textColor}99` }}>Shipping Policy</span>
                  <ArrowRight className="ml-2 h-3 w-3 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" style={{ color: primaryColor }} />
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center group"
                  style={{ color: `${textColor}99` }}
                >
                  <span className="transition-all duration-300 group-hover:translate-x-1" style={{ color: `${textColor}99` }}>Returns & Exchanges</span>
                  <ArrowRight className="ml-2 h-3 w-3 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" style={{ color: primaryColor }} />
                </a>
              </li>
            </ul>
          </motion.div>
          
          {/* Stay Connected */}
          <motion.div variants={itemVariants}>
            <h4 
              className="text-xl font-bold mb-6"
              style={{ color: textColor }}
            >
              Stay Connected
            </h4>
            <p 
              className="mb-6"
              style={{ color: `${textColor}99` }}
            >
              Join our mailing list for updates on new products, promotions, and more.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-4">
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 p-3 rounded-l-lg focus:outline-none text-gray-900"
                  style={{ borderTopLeftRadius: borderRadius, borderBottomLeftRadius: borderRadius }}
                  required
                />
                <Button
                  type="submit"
                  className="rounded-l-none"
                  style={{ 
                    backgroundColor: primaryColor,
                    color: buttonTextColor,
                    borderTopRightRadius: borderRadius,
                    borderBottomRightRadius: borderRadius
                  }}
                >
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </form>
            
            {/* Contact info */}
            <div className="mt-8 space-y-3">
              <div 
                className="flex items-center gap-3"
                style={{ color: `${textColor}99` }}
              >
                <Mail className="h-4 w-4" style={{ color: primaryColor }} />
                <span>support@{storeName.toLowerCase().replace(/\s+/g, '')}.com</span>
              </div>
              <div 
                className="flex items-center gap-3"
                style={{ color: `${textColor}99` }}
              >
                <Phone className="h-4 w-4" style={{ color: primaryColor }} />
                <span>+1 (555) 123-4567</span>
              </div>
              <div 
                className="flex items-start gap-3"
                style={{ color: `${textColor}99` }}
              >
                <MapPin className="h-4 w-4 mt-1" style={{ color: primaryColor }} />
                <span>123 Commerce St, Suite 100<br />New York, NY 10001</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
        
        <Separator className="my-10 opacity-20" />
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p 
            className="text-sm"
            style={{ color: `${textColor}80` }}
          >
            {footerText ||
              `© ${new Date().getFullYear()} ${storeName}. All rights reserved.`}
          </p>
          
          <div className="flex gap-6">
            <a 
              href="#" 
              className="text-sm hover:underline"
              style={{ color: `${textColor}80` }}
            >
              Privacy Policy
            </a>
            <a 
              href="#" 
              className="text-sm hover:underline"
              style={{ color: `${textColor}80` }}
            >
              Terms of Service
            </a>
            <a 
              href="#" 
              className="text-sm hover:underline"
              style={{ color: `${textColor}80` }}
            >
              Sitemap
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
