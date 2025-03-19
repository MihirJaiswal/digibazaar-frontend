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
  title = "Stay Updated!",
  description = "Subscribe to our newsletter to receive the latest news and exclusive offers.",
  inputPlaceholder = "Enter your email",
  subscribeButtonText = "Subscribe Now",
  privacyText = "We respect your privacy and won't spam you.",
}) => {
  return (
    <section className={`relative overflow-hidden ${sectionBackgroundColor} py-24`}>
      {/* Diagonal Overlay */}
      <div className="absolute inset-0">
        <svg
          className="w-full h-full"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
        >
          <polygon fill={primaryColor} points="0,0 100,0 100,100" style={{ opacity: 0.1 }} />
        </svg>
      </div>

      <div className="container mx-auto relative z-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="max-w-xl mx-auto text-center"
        >
          <h2 className="text-4xl font-bold ">{title}</h2>
          <p className="text-lg mb-8">{description}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
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
          </div>
          <p className="mt-6 text-sm text-gray-400">{privacyText}</p>
        </motion.div>
      </div>
    </section>
  );
};

export default NewsletterSection;
