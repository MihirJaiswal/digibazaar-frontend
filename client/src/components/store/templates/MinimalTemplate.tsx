"use client"

import type React from "react"

import Image from "next/image"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Menu, X, ShoppingCart, Check, ChevronRight, Star, ArrowRight, Heart, Package, RefreshCw, Truck, ShieldCheck, Mail } from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { useStripe, useElements, CardElement, Elements } from "@stripe/react-stripe-js"
import { useAuthStore } from "@/store/authStore"
import { loadStripe } from "@stripe/stripe-js"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface Product {
  id: string
  title: string
  price: number
  mainImage: string
  variants?: string[]
  description?: string
}

export interface ThemeCustomization {
  fontFamily?: string
  fontSize?: string
  fontColor?: string
  backgroundColor?: string
  textColor?: string
  buttonColor?: string
  bannerImage?: string
  bannerText?: string
  footerText?: string
  accentColor?: string
}

interface MinimalTemplateProps {
  viewMode: "desktop" | "tablet" | "mobile"
  currentPage: string
  storeName: string
  storeDescription: string
  products: Product[]
  storeLogo: string
  themeCustomization?: ThemeCustomization
  storeId: string
  userId: string
}

interface ShippingAddress {
  fullName: string
  address: string
  city: string
  state: string
  postalCode: string
  country: string
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "")

// This is the internal component that uses Stripe hooks
function MinimalTemplateInternal({
  storeName,
  storeDescription,
  products,
  storeLogo,
  themeCustomization = {},
  storeId,
  userId,
}: MinimalTemplateProps) {
  const { token } = useAuthStore()
  const stripe = useStripe()
  const elements = useElements()

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [currentStep, setCurrentStep] = useState<"details" | "shipping" | "payment">("details")
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "United States",
  })
  const [quantity, setQuantity] = useState(1)
  const [wishlist, setWishlist] = useState<string[]>([])

  const primaryColor = themeCustomization?.buttonColor || "#3b82f6"
  const accentColor = themeCustomization?.accentColor || "#f59e0b"
  const backgroundColor = themeCustomization?.backgroundColor || "#01172b"
  const textColor = themeCustomization?.textColor || "#ccd7e0" 

  const addToWishlist = (productId: string) => {
    if (wishlist.includes(productId)) {
      setWishlist(wishlist.filter(id => id !== productId))
      toast.success("Removed from wishlist")
    } else {
      setWishlist([...wishlist, productId])
      toast.success("Added to wishlist")
    }
  }

  const incrementQuantity = () => {
    setQuantity(quantity + 1)
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const openProductDialog = (product: Product) => {
    setSelectedProduct(product)
    setIsProductDialogOpen(true)
    setCurrentStep("details")
    setQuantity(1)
  }

  const closeProductDialog = () => {
    setIsProductDialogOpen(false)
    setTimeout(() => setSelectedProduct(null), 300)
  }

  const openPaymentDialog = () => {
    setIsProductDialogOpen(false)
    setTimeout(() => {
      setIsPaymentDialogOpen(true)
    }, 300)
  }

  const closePaymentDialog = () => {
    setIsPaymentDialogOpen(false)
  }

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentStep("payment")
  }

  // When the user clicks "Add to Cart", follow these steps:
  // 1. Create a Payment Intent on the backend.
  // 2. Confirm the card payment via Stripe.
  // 3. If payment succeeds, create the order.
  const handleProcessPayment = async () => {
    if (!selectedProduct) return
    if (!stripe || !elements) {
      toast.error("Stripe has not loaded. Please refresh and try again.")
      return
    }
    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      toast.error("Payment details not available. Please try again.")
      return
    }

    setProcessing(true)
    try {
      // Step 1: Create Payment Intent (amount in cents)
      const paymentIntentRes = await fetch("http://localhost:8800/api/orders/payments/create-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: selectedProduct.id,
          storeId,
          // You can send additional info if needed.
        }),
      })

      if (!paymentIntentRes.ok) {
        throw new Error("Failed to create payment intent")
      }
      const { clientSecret, paymentIntentId } = await paymentIntentRes.json()
      console.log("Payment Intent:", { clientSecret, paymentIntentId })

      // Step 2: Confirm Payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement },
      })

      if (error || paymentIntent?.status !== "succeeded") {
        throw new Error(error?.message || "Payment not completed")
      }
      console.log("Payment succeeded:", paymentIntent)

      // Step 3: Create the order on the backend
      const orderPayload = {
        storeId,
        // Use the verified user id (passed as a prop) for the order.
        userId,
        totalPrice: selectedProduct.price * quantity,
        shippingAddress: {
          address: shippingAddress.address,
          city: shippingAddress.city,
          country: shippingAddress.country,
          state: shippingAddress.state,
          postalCode: shippingAddress.postalCode,
          fullName: shippingAddress.fullName,
        },
        paymentIntentId,
        items: [
          {
            productId: selectedProduct.id,
            quantity: quantity,
            unitPrice: selectedProduct.price,
            totalPrice: selectedProduct.price * quantity,
          },
        ],
      }

      const orderRes = await fetch("http://localhost:8800/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderPayload),
      })

      if (!orderRes.ok) {
        throw new Error("Failed to create order")
      }
      toast.success("Order placed successfully!")
      closePaymentDialog()
    } catch (error: any) {
      console.error("Error creating order:", error)
      toast.error(error.message || "Failed to create order")
    }
    setProcessing(false)
  }

  // Progress steps
  const steps = [
    { name: "Product Details", step: "details" },
    { name: "Shipping", step: "shipping" },
    { name: "Payment", step: "payment" },
  ]

  return (
    <div
      className="min-h-[600px] font-sans"
      style={{
        backgroundColor: themeCustomization?.backgroundColor || "#ffffff",
        fontFamily: themeCustomization?.fontFamily || "sans-serif",
        color: themeCustomization?.textColor || "#000000",
        fontSize: themeCustomization?.fontSize || "16px",
      }}
    >
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 dark:bg-gray-900/90 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {storeLogo ? (
              <Image
                src={storeLogo || "/placeholder.svg"}
                alt={storeName}
                width={40}
                height={40}
                className="rounded-md object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-md bg-primary flex items-center justify-center text-white font-bold">
                {storeName.charAt(0)}
              </div>
            )}
            <span className="text-xl font-bold tracking-tight">{storeName}</span>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {["Home", "Shop", "Collections", "About", "Contact"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-sm font-medium text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-white transition-colors"
              >
                {item}
              </a>
            ))}
          </nav>
          
          {/* Cart & Mobile Menu */}
          <div className="flex items-center gap-4">
            <button 
              className="h-9 w-9 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              aria-label="Cart"
            >
              <ShoppingCart className="h-5 w-5" />
            </button>
            
            <button
              className="md:hidden h-9 w-9 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-gray-200 dark:border-gray-800"
            >
              <nav className="container mx-auto py-4 px-4 flex flex-col gap-4">
                {["Home", "Shop", "Collections", "About", "Contact"].map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="py-2 text-base font-medium text-gray-700 dark:text-gray-300"
                    onClick={() => setMenuOpen(false)}
                  >
                    {item}
                  </a>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center min-h-[600px] py-24 px-6 overflow-hidden">
        {themeCustomization?.bannerImage && (
          <>
            <Image
              src={themeCustomization.bannerImage || "/placeholder.svg"}
              alt={themeCustomization.bannerText || "Banner"}
              fill
              className="object-cover object-center"
              priority
            />
            <div className="absolute inset-0 bg-black/60"></div>
          </>
        )}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-4xl mx-auto text-center px-4"
        >
          {!themeCustomization?.bannerImage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8"
            >
              <Image
                src={storeLogo || "/placeholder.svg?height=120&width=120"}
                alt={storeName}
                width={120}
                height={120}
                className="rounded-full object-cover mx-auto shadow-xl"
              />
            </motion.div>
          )}
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className={cn(
              "text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6",
              themeCustomization?.bannerImage ? "text-white" : "text-gray-900 dark:text-white"
            )}
          >
            {themeCustomization?.bannerText || `Discover ${storeName}`}
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className={cn(
              "text-lg md:text-xl mb-10 max-w-2xl mx-auto",
              themeCustomization?.bannerImage ? "text-gray-200" : "text-gray-600 dark:text-gray-300"
            )}
          >
            {storeDescription}
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              style={{ backgroundColor: primaryColor }}
              className="rounded-full px-8 text-white font-medium shadow-lg hover:shadow-xl transition-all hover:translate-y-[-2px]"
              size="lg"
            >
              Shop Now <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              className={cn(
                "rounded-full px-8 font-medium",
                themeCustomization?.bannerImage 
                  ? "text-white border-white hover:bg-white/10" 
                  : "text-gray-900 border-gray-300 dark:text-white dark:border-gray-600"
              )}
              size="lg"
            >
              Learn More
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20" style={{ backgroundColor: backgroundColor }}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center mb-16">
            <Badge 
              className="mb-3 px-3 py-1 text-sm font-medium"
              style={{ backgroundColor: primaryColor }}
            >
              New Arrivals
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4"  style={{ color: textColor }} >
              Featured Collection
            </h2>
            <p className="max-w-2xl" style={{ color: textColor }}>
              Discover our carefully curated selection of premium products designed to elevate your lifestyle.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative"
              >
                <div className="aspect-[3/4] relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 mb-4">
                  <Image
                    src={product.mainImage || "/placeholder.svg?height=480&width=360"}
                    alt={product.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 transition-colors duration-300"></div>
                  
                  <div className="absolute top-3 right-3 flex flex-col gap-2">
                    <button 
                      className="h-9 w-9 flex items-center justify-center text-gray-700 dark:text-white bg-white dark:bg-gray-800 rounded-full shadow-md hover:scale-110 transition-transform"
                      onClick={() => addToWishlist(product.id)}
                      aria-label="Add to wishlist"
                    >
                      <Heart 
                        className={cn(
                          "h-4 w-4", 
                          wishlist.includes(product.id) 
                            ? "fill-red-500 text-red-500" 
                            : "fill-transparent"
                        )} 
                      />
                    </button>
                  </div>
                  
                  <div className="absolute inset-x-0 bottom-0 p-4 h-1/2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute inset-x-0 bottom-4 flex justify-center">
                      <Button
                        className="rounded-full shadow-lg text-sm font-medium"
                        style={{ backgroundColor: primaryColor }}
                        onClick={() => openProductDialog(product)}
                      >
                        Quick View
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1 group-hover:text-primary transition-colors">
                    {product.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      ₹{product.price.toLocaleString("en-IN")}
                    </p>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm ml-1 text-gray-600 dark:text-gray-400">4.9</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Button 
              variant="outline" 
              size="lg" 
              className="rounded-full px-8 border-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              View All Products <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge 
              className="mb-3 px-3 py-1 text-sm font-medium"
              style={{ backgroundColor: accentColor }}
            >
              Why Choose Us
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
              The {storeName} Experience
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              We're committed to providing exceptional service and products that enhance your life.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center p-6"
            >
              <div 
                className="w-14 h-14 rounded-full flex items-center justify-center mb-5 text-white"
                style={{ backgroundColor: primaryColor }}
              >
                <Truck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Free Shipping</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Enjoy free shipping on all orders over ₹999 within India.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center p-6"
            >
              <div 
                className="w-14 h-14 rounded-full flex items-center justify-center mb-5 text-white"
                style={{ backgroundColor: primaryColor }}
              >
                <RefreshCw className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Easy Returns</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Simple 30-day return policy for a stress-free shopping experience.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center p-6"
            >
              <div 
                className="w-14 h-14 rounded-full flex items-center justify-center mb-5 text-white"
                style={{ backgroundColor: primaryColor }}
              >
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Secure Payments</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Your transactions are protected with state-of-the-art encryption.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center p-6"
            >
              <div 
                className="w-14 h-14 rounded-full flex items-center justify-center mb-5 text-white"
                style={{ backgroundColor: primaryColor }}
              >
                <Package className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Premium Quality</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Every product meets our high standards of quality and craftsmanship.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
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
                src="/placeholder.svg?height=600&width=800"
                alt="About our store"
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
                Our Story
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
                The {storeName} Journey
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg leading-relaxed">
                {storeDescription}
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg leading-relaxed">
                Our mission is to provide exceptional products that enhance your lifestyle while maintaining the highest standards of quality, sustainability, and customer service.
              </p>
              <Button
                style={{ backgroundColor: primaryColor }}
                className="rounded-full px-8 shadow-md text-white font-medium"
                size="lg"
              >
                Learn More About Us
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gray-900 text-white relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-gradient-to-br from-gray-900 via-transparent to-gray-900"
          style={{ backgroundImage: `radial-gradient(circle at 25% 60%, ${primaryColor}33 0%, transparent 40%)` }}
        ></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
              Join Our Community
            </h2>
            <p className="text-gray-300 mb-8">
              Subscribe to our newsletter and be the first to know about new products, exclusive offers, and more.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-4 py-3 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button
                style={{ backgroundColor: primaryColor }}
                className="rounded-full shadow-md text-white font-medium sm:px-6"
              >
                Subscribe <Mail className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <p className="text-gray-400 text-sm mt-4">
              By subscribing, you agree to our privacy policy and consent to receive marketing emails.
            </p>
          </div>
        </div>
      </section>

      {/* Product Detail Dialog */}
      {selectedProduct && (
        <Dialog
          open={isProductDialogOpen}
          onOpenChange={(open) => {
            if (!open) closeProductDialog()
          }}
        >
          <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-xl">
            <div className="flex flex-col md:flex-row max-h-[80vh]">
              {/* Product Image */}
              <div className="md:w-1/2 relative">
                <div className="relative h-[300px] md:h-full w-full">
                  <Image
                    src={selectedProduct.mainImage || "/placeholder.svg?height=600&width=600"}
                    alt={selectedProduct.title}
                    fill
                    className="object-cover"
                  />
                  <button 
                    className="absolute top-4 right-4 h-9 w-9 flex items-center justify-center text-gray-700 bg-white rounded-full shadow-md hover:scale-110 transition-transform"
                    onClick={() => addToWishlist(selectedProduct.id)}
                    aria-label="Add to wishlist"
                  >
                    <Heart 
                      className={cn(
                        "h-4 w-4", 
                        wishlist.includes(selectedProduct.id) 
                          ? "fill-red-500 text-red-500" 
                          : "fill-transparent"
                      )} 
                    />
                  </button>
                </div>
              </div>

              {/* Product Details */}
              <div className="md:w-1/2 flex flex-col">
                <ScrollArea className="h-full max-h-[80vh] md:max-h-none">
                  <div className="p-6">
                    <DialogHeader className="mb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                            {selectedProduct.title}
                          </DialogTitle>
                          <div className="flex items-center mt-2">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                              ))}
                            </div>
                            <span className="text-sm ml-2 text-gray-600 dark:text-gray-400">(42 reviews)</span>
                          </div>
                        </div>
                        <Badge 
                          className="text-lg px-3 py-1 font-semibold"
                          style={{ backgroundColor: primaryColor }}
                        >
                          ₹{selectedProduct.price.toLocaleString("en-IN")}
                        </Badge>
                      </div>
                    </DialogHeader>

                    <Tabs defaultValue="description" className="flex-1 mt-2">
                      <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="description">Description</TabsTrigger>
                        <TabsTrigger value="details">Details</TabsTrigger>
                      </TabsList>
                      <TabsContent value="description" className="mt-2">
                        <DialogDescription className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                          {selectedProduct.description ||
                            "This premium product is designed to provide exceptional quality and performance. Made with the finest materials and crafted with attention to detail, it's perfect for those who appreciate excellence."}
                        </DialogDescription>
                      </TabsContent>
                      <TabsContent value="details" className="mt-2">
                        {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Available Variants:</h4>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {selectedProduct.variants.map((variant, index) => (
                                <Badge 
                                  key={index} 
                                  variant="outline" 
                                  className="px-3 py-1 border-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                  {variant}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="space-y-2 text-gray-700 dark:text-gray-300">
                          <p className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                            <span className="font-medium">SKU:</span> 
                            <span>{selectedProduct.id}</span>
                          </p>
                          <p className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                            <span className="font-medium">Category:</span> 
                            <span>Premium Collection</span>
                          </p>
                          <p className="flex justify-between py-2">
                            <span className="font-medium">In Stock:</span> 
                            <span>Yes</span>
                          </p>
                        </div>
                      </TabsContent>
                    </Tabs>

                    <div className="mt-8">
                      <h4 className="font-medium mb-3 text-gray-900 dark:text-white">Quantity</h4>
                      <div className="flex items-center mb-6">
                        <button 
                          className="h-10 w-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800"
                          onClick={decrementQuantity}
                          disabled={quantity <= 1}
                        >
                          <span className="text-lg font-medium">-</span>
                        </button>
                        <span className="w-12 text-center font-medium">{quantity}</span>
                        <button 
                          className="h-10 w-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800"
                          onClick={incrementQuantity}
                        >
                          <span className="text-lg font-medium">+</span>
                        </button>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 mt-6">
                        <Button 
                          className="flex-1 rounded-full"
                          style={{ backgroundColor: primaryColor }}
                          onClick={openPaymentDialog}
                        >
                          Buy Now
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1 rounded-full border-2"
                        >
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Payment Dialog */}
      {selectedProduct && (
        <Dialog
          open={isPaymentDialogOpen}
          onOpenChange={(open) => {
            if (!open) closePaymentDialog()
          }}
        >
          <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-xl">
            <ScrollArea className="max-h-[80vh]">
              <div className="p-6">
                <DialogHeader className="mb-6">
                  <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                    Complete Your Purchase
                  </DialogTitle>
                  <DialogDescription>
                    You're purchasing {selectedProduct.title} for ₹{(selectedProduct.price * quantity).toLocaleString("en-IN")}
                  </DialogDescription>
                </DialogHeader>

                <div className="mb-8">
                  <nav aria-label="Progress" className="mb-8">
                    <ol className="flex items-center">
                      {steps.map((step, stepIdx) => (
                        <li key={step.name} className={cn("flex-1 relative", stepIdx !== steps.length - 1 && "pr-8")}>
                          {currentStep === step.step || steps.findIndex(s => s.step === currentStep) > stepIdx ? (
                            <div className="flex flex-col items-center">
                              <div 
                                className="rounded-full h-10 w-10 flex items-center justify-center text-white"
                                style={{ backgroundColor: primaryColor }}
                              >
                                {steps.findIndex(s => s.step === currentStep) > stepIdx ? (
                                  <Check className="h-5 w-5" />
                                ) : (
                                  stepIdx + 1
                                )}
                              </div>
                              <p className="text-sm font-medium mt-2">{step.name}</p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <div className="rounded-full h-10 w-10 flex items-center justify-center border-2 border-gray-300 text-gray-500">
                                {stepIdx + 1}
                              </div>
                              <p className="text-sm font-medium text-gray-500 mt-2">{step.name}</p>
                            </div>
                          )}
                          
                          {stepIdx !== steps.length - 1 && (
                            <div className={cn(
                              "hidden md:block absolute top-5 right-4 h-0.5 w-full -translate-y-1/2",
                              steps.findIndex(s => s.step === currentStep) > stepIdx 
                                ? "bg-primary" 
                                : "bg-gray-300"
                            )} style={steps.findIndex(s => s.step === currentStep) > stepIdx ? { backgroundColor: primaryColor } : {}} />
                          )}
                        </li>
                      ))}
                    </ol>
                  </nav>

                  {currentStep === "details" && (
                    <div className="space-y-6">
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                        <div className="flex items-start gap-4">
                          <div className="relative h-20 w-20 flex-shrink-0 rounded-md overflow-hidden">
                            <Image
                              src={selectedProduct.mainImage || "/placeholder.svg?height=80&width=80"}
                              alt={selectedProduct.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white">{selectedProduct.title}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Quantity: {quantity}</p>
                            <div className="flex justify-between items-end mt-2">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                ₹{selectedProduct.price.toLocaleString("en-IN")} × {quantity}
                              </span>
                              <span className="font-bold text-gray-900 dark:text-white">
                                ₹{(selectedProduct.price * quantity).toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Button
                        className="w-full rounded-full"
                        style={{ backgroundColor: primaryColor }}
                        onClick={() => setCurrentStep("shipping")}
                      >
                        Continue to Shipping
                      </Button>
                    </div>
                  )}

                  {currentStep === "shipping" && (
                    <form onSubmit={handleShippingSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label htmlFor="fullName" className="text-sm font-medium text-gray-900 dark:text-white">
                            Full Name
                          </label>
                          <input
                            id="fullName"
                            type="text"
                            className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            value={shippingAddress.fullName}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="address" className="text-sm font-medium text-gray-900 dark:text-white">
                            Address
                          </label>
                          <input
                            id="address"
                            type="text"
                            className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            value={shippingAddress.address}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="city" className="text-sm font-medium text-gray-900 dark:text-white">
                            City
                          </label>
                          <input
                            id="city"
                            type="text"
                            className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            value={shippingAddress.city}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="state" className="text-sm font-medium text-gray-900 dark:text-white">
                            State
                          </label>
                          <input
                            id="state"
                            type="text"
                            className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            value={shippingAddress.state}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="postalCode" className="text-sm font-medium text-gray-900 dark:text-white">
                            Postal Code
                          </label>
                          <input
                            id="postalCode"
                            type="text"
                            className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            value={shippingAddress.postalCode}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="country" className="text-sm font-medium text-gray-900 dark:text-white">
                            Country
                          </label>
                          <select
                            id="country"
                            className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            value={shippingAddress.country}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                            required
                          >
                            <option value="United States">United States</option>
                            <option value="India">India</option>
                            <option value="United Kingdom">United Kingdom</option>
                            <option value="Canada">Canada</option>
                            <option value="Australia">Australia</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-between mt-8">
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="rounded-full border-2"
                          onClick={() => setCurrentStep("details")}
                        >
                          Back
                        </Button>
                        <Button 
                          type="submit" 
                          className="rounded-full"
                          style={{ backgroundColor: primaryColor }}
                        >
                          Continue to Payment
                        </Button>
                      </div>
                    </form>
                  )}

                  {currentStep === "payment" && (
                    <div className="space-y-6">
                      <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-xl">
                        <h4 className="font-medium mb-4 text-gray-900 dark:text-white">Payment Details</h4>
                        <div className="p-4 border rounded-lg bg-white dark:bg-gray-700">
                          <CardElement
                            options={{
                              style: {
                                base: {
                                  fontSize: "16px",
                                  color: "#424770",
                                  "::placeholder": {
                                    color: "#aab7c4",
                                  },
                                },
                                invalid: {
                                  color: "#9e2146",
                                },
                              },
                            }}
                          />
                        </div>
                      </div>

                      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                        <div className="flex justify-between mb-2 text-gray-700 dark:text-gray-300">
                          <span>Subtotal</span>
                          <span>₹{(selectedProduct.price * quantity).toLocaleString("en-IN")}</span>
                        </div>
                        <div className="flex justify-between mb-2 text-gray-700 dark:text-gray-300">
                          <span>Shipping</span>
                          <span>₹0.00</span>
                        </div>
                        <div className="flex justify-between mb-2 text-gray-700 dark:text-gray-300">
                          <span>Tax (18%)</span>
                          <span>₹{(selectedProduct.price * quantity * 0.18).toLocaleString("en-IN")}</span>
                        </div>
                        <Separator className="my-3" />
                        <div className="flex justify-between font-bold text-gray-900 dark:text-white text-lg">
                          <span>Total</span>
                          <span>₹{(selectedProduct.price * quantity * 1.18).toLocaleString("en-IN")}</span>
                        </div>
                      </div>

                      <div className="flex justify-between mt-8">
                        <Button 
                          variant="outline" 
                          className="rounded-full border-2"
                          onClick={() => setCurrentStep("shipping")}
                        >
                          Back
                        </Button>
                        <Button
                          className="rounded-full"
                          style={{ backgroundColor: primaryColor }}
                          onClick={handleProcessPayment}
                          disabled={processing}
                        >
                          {processing ? "Processing..." : "Complete Purchase"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                {storeLogo ? (
                  <Image
                    src={storeLogo || "/placeholder.svg"}
                    alt={storeName}
                    width={40}
                    height={40}
                    className="rounded-md object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-md bg-primary flex items-center justify-center text-white font-bold">
                    {storeName.charAt(0)}
                  </div>
                )}
                <span className="text-xl font-bold tracking-tight">{storeName}</span>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                {storeDescription.length > 120 
                  ? `${storeDescription.substring(0, 120)}...` 
                  : storeDescription}
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Facebook">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Instagram">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Twitter">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-6">Shop</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    All Products
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    New Arrivals
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Featured Items
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Special Offers
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-6">Support</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    FAQs
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Shipping Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Returns & Exchanges
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-6">Stay Connected</h4>
              <p className="text-gray-400 mb-4">
                Join our mailing list for updates on new products, promotions, and more.
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 p-3 rounded-l-lg focus:outline-none text-gray-900"
                />
                <Button 
                  className="rounded-l-none" 
                  style={{ backgroundColor: primaryColor }}
                >
                  Subscribe
                </Button>
              </div>
            </div>
          </div>

          <Separator className="bg-gray-800 my-8" />

          <div className="text-center text-gray-500 text-sm">
            <p>
              {themeCustomization?.footerText || `© ${new Date().getFullYear()} ${storeName}. All rights reserved.`}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// This component wraps the internal component with the Stripe Elements provider
export function MinimalTemplate(props: MinimalTemplateProps) {
  return (
    <Elements stripe={stripePromise}>
      <MinimalTemplateInternal {...props} />
    </Elements>
  )
}

// Default export for convenience
export default MinimalTemplate
