'use client'

import Image from "next/image"
import { Button } from "@/components/ui/button"

// This interface matches the Customization interface from SettingsPanel
export interface ThemeCustomization {
  fontFamily?: string;
  fontSize?: string;
  fontColor?: string;
  backgroundColor?: string;
  textColor?: string;
  buttonColor?: string;
  bannerImage?: string;
  bannerText?: string;
  footerText?: string;
  theme?: string;
}

interface DefaultTemplateProps {
  viewMode: string;
  currentPage: string;
  storeName?: string;
  storeDescription?: string;
  themeCustomization?: ThemeCustomization;
}

export function DefaultTemplate({ 
  viewMode, 
  currentPage, 
  storeName = "Default Store",
  storeDescription = "Discover our great products and enjoy an exceptional shopping experience.",
  themeCustomization = {} 
}: DefaultTemplateProps) {
  // Apply customization settings from SettingsPanel or use defaults
  const backgroundColor = themeCustomization?.backgroundColor || "#ffffff"; // white background by default
  const textColor = themeCustomization?.textColor || "#000000"; // black text by default
  const buttonColor = themeCustomization?.buttonColor || "#3b82f6"; // blue buttons by default
  const fontFamily = themeCustomization?.fontFamily || "sans-serif";
  const fontSize = themeCustomization?.fontSize || "16px";
  const bannerText = themeCustomization?.bannerText || `Welcome to the ${storeName}`;
  const footerText = themeCustomization?.footerText || `© ${new Date().getFullYear()} ${storeName}. All rights reserved.`;
  
  return (
    <div 
      className="min-h-[600px]" 
      style={{ 
        backgroundColor, 
        color: textColor,
        fontFamily,
        fontSize
      }}
    >
      {/* Header - applies backgroundColor and textColor from settings */}
      <header 
        className="sticky top-0 z-10 flex h-16 items-center justify-between border-b px-4 md:px-6"
        style={{ 
          backgroundColor,
          borderColor: 'rgba(0,0,0,0.1)'
        }}
      >
        <div className="text-xl font-bold" style={{ color: textColor }}>{storeName}</div>
        <nav className="hidden md:flex items-center gap-6">
          <a href="#" className="text-sm font-medium" style={{ color: textColor }}>Home</a>
          <a href="#" className="text-sm font-medium" style={{ color: textColor }}>Products</a>
          <a href="#" className="text-sm font-medium" style={{ color: textColor }}>About</a>
          <a href="#" className="text-sm font-medium" style={{ color: textColor }}>Contact</a>
        </nav>
      </header>

      {/* Main content - uses bannerImage and bannerText from settings */}
      <main>
        <section className="py-12 text-center">
          {themeCustomization?.bannerImage && (
            <div className="relative h-64 w-full max-w-2xl mx-auto mb-8 rounded-lg overflow-hidden">
              <Image
                src={themeCustomization.bannerImage || "/placeholder.svg"}
                alt="Banner"
                fill
                className="object-cover"
              />
            </div>
          )}
          <h1 className="text-3xl font-bold mb-4" style={{ color: textColor }}>{bannerText}</h1>
          <p className="max-w-2xl mx-auto mb-8" style={{ color: `${textColor}99` }}>
            {storeDescription}
          </p>
          <div className="flex justify-center gap-4">
            {/* Button uses buttonColor from settings */}
            <Button style={{ backgroundColor: buttonColor }}>Shop Now</Button>
            <Button variant="outline" style={{ borderColor: buttonColor, color: buttonColor }}>
              Learn More
            </Button>
          </div>
        </section>

        {/* Featured Categories Section */}
        <section className="py-16 bg-gray-50" style={{ backgroundColor: `${backgroundColor === '#ffffff' ? '#f9fafb' : backgroundColor}` }}>
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-8" style={{ color: textColor }}>Featured Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((item) => (
                <div key={item} className="group relative rounded-lg overflow-hidden shadow-md transition-all hover:shadow-lg">
                  <div className="relative h-64 w-full">
                    <Image
                      src={`/placeholder.svg?height=400&width=600&text=Category+${item}`}
                      alt={`Category ${item}`}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-xl font-semibold text-white mb-1">Category {item}</h3>
                    <p className="text-white/80 text-sm mb-3">Explore our selection</p>
                    <Button 
                      size="sm" 
                      style={{ backgroundColor: buttonColor }}
                      className="opacity-90 hover:opacity-100"
                    >
                      View Products
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-16 text-center">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-2xl font-bold mb-4" style={{ color: textColor }}>Stay Updated</h2>
            <p className="mb-6" style={{ color: `${textColor}99` }}>
              Subscribe to our newsletter to receive updates on new products, special offers, and more.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="flex-1 px-4 py-2 rounded-md border"
                style={{ 
                  borderColor: 'rgba(0,0,0,0.1)',
                  backgroundColor: backgroundColor,
                  color: textColor
                }}
              />
              <Button style={{ backgroundColor: buttonColor }}>Subscribe</Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer - applies textColor from settings */}
      <footer 
        className="border-t py-12"
        style={{ 
          borderColor: 'rgba(0,0,0,0.1)',
          backgroundColor: backgroundColor === '#ffffff' ? '#f9fafb' : backgroundColor
        }}
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-bold mb-4" style={{ color: textColor }}>{storeName}</h3>
              <p className="text-sm" style={{ color: `${textColor}99` }}>
                Quality products for every need. We pride ourselves on customer satisfaction and product excellence.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4" style={{ color: textColor }}>Shop</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm" style={{ color: `${textColor}99` }}>All Products</a></li>
                <li><a href="#" className="text-sm" style={{ color: `${textColor}99` }}>New Arrivals</a></li>
                <li><a href="#" className="text-sm" style={{ color: `${textColor}99` }}>Featured</a></li>
                <li><a href="#" className="text-sm" style={{ color: `${textColor}99` }}>Sale</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4" style={{ color: textColor }}>About</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm" style={{ color: `${textColor}99` }}>Our Story</a></li>
                <li><a href="#" className="text-sm" style={{ color: `${textColor}99` }}>Blog</a></li>
                <li><a href="#" className="text-sm" style={{ color: `${textColor}99` }}>Testimonials</a></li>
                <li><a href="#" className="text-sm" style={{ color: `${textColor}99` }}>Press</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4" style={{ color: textColor }}>Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm" style={{ color: `${textColor}99` }}>Contact Us</a></li>
                <li><a href="#" className="text-sm" style={{ color: `${textColor}99` }}>FAQs</a></li>
                <li><a href="#" className="text-sm" style={{ color: `${textColor}99` }}>Shipping & Returns</a></li>
                <li><a href="#" className="text-sm" style={{ color: `${textColor}99` }}>Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t text-center" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
            <p className="text-sm" style={{ color: `${textColor}99` }}>{footerText}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}