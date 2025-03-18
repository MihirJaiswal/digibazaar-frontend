"use client";

import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { motion } from "framer-motion";

interface NewsletterSectionProps {
  primaryColor: string;
  sectionBackgroundColor?: string;
  title?: string;
  description?: string;
  inputPlaceholder?: string;
  subscribeButtonText?: string;
  privacyText?: string;
}

const NewsletterSection: React.FC<NewsletterSectionProps> = ({
  primaryColor,
  sectionBackgroundColor = "bg-gray-900",
  title = "Join Our Community",
  description = "Subscribe to our newsletter and be the first to know about new products, exclusive offers, and more.",
  inputPlaceholder = "Your email address",
  subscribeButtonText = "Subscribe",
  privacyText = "By subscribing, you agree to our privacy policy and consent to receive marketing emails.",
}) => {
  return (
    <section
      className={`py-20 ${sectionBackgroundColor} text-white relative overflow-hidden`}
    >
      {/* Gradient Background Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, ${primaryColor}55 0%, ${sectionBackgroundColor.replace(
            "bg-",
            "#"
          )} 100%)`,
        }}
      ></div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center"
        >
          <motion.h2 className="text-4xl md:text-5xl font-extrabold mb-6">
            {title}
          </motion.h2>
          <motion.p className="text-lg text-gray-300 mb-10">
            {description}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <input
              type="email"
              placeholder={inputPlaceholder}
              className="w-full sm:w-auto flex-1 px-5 py-4 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800"
            />
            <Button
              style={{ backgroundColor: primaryColor }}
              className="rounded-full px-8 py-4 text-white font-semibold shadow-lg"
            >
              {subscribeButtonText} <Mail className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
          <motion.p className="text-sm text-gray-400 mt-6">
            {privacyText}
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};

export default NewsletterSection;
