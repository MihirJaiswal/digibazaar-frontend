"use client";

import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

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
    <section className={`py-20 ${sectionBackgroundColor} text-white relative overflow-hidden`}>
      <div 
        className="absolute inset-0 bg-gradient-to-br from-gray-900 via-transparent to-gray-900"
        style={{ backgroundImage: `radial-gradient(circle at 25% 60%, ${primaryColor}33 0%, transparent 40%)` }}
      ></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
            {title}
          </h2>
          <p className="text-gray-300 mb-8">
            {description}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder={inputPlaceholder}
              className="flex-1 px-4 py-3 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button
              style={{ backgroundColor: primaryColor }}
              className="rounded-full shadow-md text-white font-medium sm:px-6"
            >
              {subscribeButtonText} <Mail className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <p className="text-gray-400 text-sm mt-4">
            {privacyText}
          </p>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
