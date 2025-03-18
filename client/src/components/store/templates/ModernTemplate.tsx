"use client"

import type React from "react"

import Image from "next/image"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import {
  Menu,
  X,
  ShoppingCart,
  Check,
  ChevronRight,
  Star,
  ArrowRight,
  Heart,
  Plus,
  Minus,
  Sparkles,
  ShieldCheck,
  Truck,
  Clock,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { useStripe, useElements, CardElement, Elements } from "@stripe/react-stripe-js"
import { useAuthStore } from "@/store/authStore"
import { loadStripe } from "@stripe/stripe-js"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { cn } from "@/lib/utils"

interface Product {
  id: string
  title: string
  name?: string
  price: number
  mainImage?: string
  image?: string
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

interface ModernTemplateProps {
  viewMode: "desktop" | "tablet" | "mobile"
  currentPage: string
  storeName?: string
  storeDescription?: string
  products?: Product[]
  storeLogo?: string
  themeCustomization?: ThemeCustomization
  storeId?: string
  userId?: string
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
function ModernTemplateInternal({
  storeName = "Nebula",
  storeDescription = "Experience a sleek, contemporary design that sets your store apart with premium products and exceptional service.",
  products = [],
  storeLogo = "/placeholder.svg?height=50&width=50",
  themeCustomization = {},
  storeId = "",
  userId = "",
}: ModernTemplateProps) {
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
  const [cartOpen, setCartOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Use sample products if none are provided
  const displayProducts =
    products.length > 0
      ? products
      : [
          {
            id: "1",
            title: "Quantum Chair",
            price: 12999,
            mainImage: "/placeholder.svg?height=400&width=400",
            description:
              "Sleek, ergonomic chair with minimalist design and premium materials for ultimate comfort and style.",
          },
          {
            id: "2",
            title: "Nebula Lamp",
            price: 8499,
            mainImage: "/placeholder.svg?height=400&width=400",
            description:
              "Contemporary lighting solution with adjustable brightness and modern aesthetics that transforms any space.",
          },
          {
            id: "3",
            title: "Zenith Desk",
            price: 24999,
            mainImage: "/placeholder.svg?height=400&width=400",
            description:
              "Spacious workspace with clean lines and hidden storage compartments for a minimalist, organized environment.",
          },
          {
            id: "4",
            title: "Cosmos Art Piece",
            price: 18999,
            mainImage: "/placeholder.svg?height=400&width=400",
            description:
              "Original abstract artwork that adds a contemporary touch to any space with vibrant colors and dynamic forms.",
          },
        ]

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const incrementQuantity = () => {
    setQuantity((prev) => prev + 1)
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1)
    }
  }

  const toggleWishlist = (id: string) => {
    if (wishlist.includes(id)) {
      setWishlist(wishlist.filter((item) => item !== id))
      toast.success("Removed from wishlist")
    } else {
      setWishlist([...wishlist, id])
      toast.success("Added to wishlist")
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
          quantity,
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

  const primaryColor = themeCustomization?.buttonColor || "#6366f1"
  const accentColor = themeCustomization?.accentColor || "#10b981"

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Header */}
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-300",
          scrolled ? "py-3 bg-black/90 backdrop-blur-md border-b border-gray-800" : "py-5 bg-transparent",
        )}
      >
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src={storeLogo || "/placeholder.svg"}
              alt={storeName}
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
            <span className="text-2xl font-bold text-white tracking-tight">{storeName}</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {["Home", "Shop", "Collections", "About"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200"
              >
                {item}
              </a>
            ))}
            <Button
              variant="ghost"
              size="icon"
              className="relative text-white hover:bg-white/10"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-indigo-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                0
              </span>
            </Button>
          </nav>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-4 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="relative text-white hover:bg-white/10"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-indigo-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                0
              </span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-gray-800 bg-black/95 backdrop-blur-md"
            >
              <div className="container mx-auto py-6 px-4 flex flex-col gap-5">
                {["Home", "Shop", "Collections", "About"].map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="text-lg font-medium text-gray-300 hover:text-white transition-colors duration-200"
                    onClick={() => setMenuOpen(false)}
                  >
                    {item}
                  </a>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <Image
            src={themeCustomization?.bannerImage || "/placeholder.svg?height=1080&width=1920"}
            alt={themeCustomization?.bannerText || "Modern Hero"}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/50"></div>
        </div>
        <div className="container mx-auto px-4 z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <Badge className="mb-4 px-3 py-1 text-sm font-medium" style={{ backgroundColor: accentColor }}>
              Premium Collection
            </Badge>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 tracking-tight">
              {themeCustomization?.bannerText || "Modern Aesthetics"}
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-xl leading-relaxed">{storeDescription}</p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="px-8 py-6 text-lg rounded-full" style={{ backgroundColor: primaryColor }}>
                Explore Collection <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-gray-600 text-white hover:bg-white/10 px-8 py-6 text-lg rounded-full"
              >
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-24 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-2 px-3 py-1 text-sm font-medium" style={{ backgroundColor: accentColor }}>
              Curated Selection
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Featured Products</h2>
            <Separator className="w-24 h-1 mx-auto my-6" style={{ backgroundColor: primaryColor }} />
            <p className="max-w-2xl mx-auto text-gray-400 text-lg">
              Discover our handpicked collection of premium products designed with modern aesthetics and functionality
              in mind.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {displayProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative"
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-gray-900">
                  <Image
                    src={product.mainImage || product.image || "/placeholder.svg?height=600&width=450"}
                    alt={product.title || product.name || "Product"}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute top-4 right-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white"
                        onClick={() => toggleWishlist(product.id)}
                      >
                        <Heart
                          className={cn("h-4 w-4", wishlist.includes(product.id) ? "fill-red-500 text-red-500" : "")}
                        />
                      </Button>
                    </div>

                    <div className="absolute inset-x-0 bottom-4 flex justify-center">
                      <Button
                        className="rounded-full shadow-lg"
                        style={{ backgroundColor: primaryColor }}
                        onClick={() => openProductDialog(product)}
                      >
                        Quick View
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-medium text-white group-hover:text-indigo-400 transition-colors">
                      {product.title || product.name}
                    </h3>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm ml-1 text-gray-400">4.9</span>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-white mt-1">₹{product.price.toLocaleString("en-IN")}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Button
              variant="outline"
              size="lg"
              className="border-gray-700 text-white hover:bg-white/10 px-8 rounded-full"
            >
              View All Products <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-2 px-3 py-1 text-sm font-medium" style={{ backgroundColor: accentColor }}>
              Our Promise
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">The {storeName} Experience</h2>
            <Separator className="w-24 h-1 mx-auto my-6" style={{ backgroundColor: primaryColor }} />
            <p className="max-w-2xl mx-auto text-gray-400 text-lg">
              We're committed to providing you with the best shopping experience possible.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-black/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-800"
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-6 text-white"
                style={{ backgroundColor: primaryColor }}
              >
                <Truck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">Premium Delivery</h3>
              <p className="text-gray-400">
                Experience white-glove delivery with our premium logistics service. We ensure your products reach you in
                perfect condition, carefully packaged and ready to enhance your space.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-black/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-800"
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-6 text-white"
                style={{ backgroundColor: primaryColor }}
              >
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">Curated Quality</h3>
              <p className="text-gray-400">
                Our products are meticulously selected to ensure the highest quality. We stand behind everything we sell
                with our satisfaction guarantee and commitment to excellence.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-black/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-800"
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-6 text-white"
                style={{ backgroundColor: primaryColor }}
              >
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">Secure Transactions</h3>
              <p className="text-gray-400">
                Shop with confidence knowing that your personal information and transactions are protected with
                state-of-the-art encryption and security protocols.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-black/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-800"
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-6 text-white"
                style={{ backgroundColor: primaryColor }}
              >
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">24/7 Support</h3>
              <p className="text-gray-400">
                We provide round-the-clock customer support for all your needs. Our dedicated team is always ready to
                assist you with any questions or concerns about your purchase.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 bg-black">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="lg:w-1/2"
            >
              <div className="relative h-[500px] w-full rounded-2xl overflow-hidden">
                <Image
                  src="/placeholder.svg?height=500&width=700"
                  alt="About our store"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div
                  className="absolute bottom-8 left-8 right-8 p-6 rounded-xl backdrop-blur-md bg-black/30 border border-white/10"
                  style={{ boxShadow: `0 0 30px ${primaryColor}20` }}
                >
                  <h3 className="text-2xl font-bold mb-2">Our Vision</h3>
                  <p className="text-gray-300">
                    To redefine modern living through thoughtful design and exceptional quality.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="lg:w-1/2"
            >
              <Badge className="mb-4 px-3 py-1 text-sm font-medium" style={{ backgroundColor: accentColor }}>
                Our Story
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">About {storeName}</h2>
              <p className="text-gray-300 text-lg mb-6 leading-relaxed">{storeDescription}</p>
              <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                We are dedicated to bringing you the finest modern designs that combine aesthetics with functionality.
                Our curated collection represents the pinnacle of contemporary style, carefully selected to enhance your
                living space.
              </p>
              <Button className="rounded-full px-8" style={{ backgroundColor: primaryColor }} size="lg">
                Learn More About Us
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24 bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.2),transparent_40%)]"></div>
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_70%,rgba(16,185,129,0.2),transparent_40%)]"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 px-3 py-1 text-sm font-medium" style={{ backgroundColor: accentColor }}>
              Stay Updated
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Join Our Community</h2>
            <p className="text-gray-300 text-lg mb-8">
              Subscribe to our newsletter and be the first to know about new products, exclusive offers, and design
              inspiration.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-4 py-3 rounded-full bg-black/50 border border-gray-700 text-whitete focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <Button className="rounded-full" style={{ backgroundColor: primaryColor }}>
                Subscribe
              </Button>
            </div>
            <p className="text-gray-500 text-sm mt-4">
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
          <DialogContent className="max-w-4xl p-0 overflow-hidden bg-gray-900 text-white border border-gray-800 rounded-xl">
            <div className="flex flex-col md:flex-row">
              {/* Product Image */}
              <div className="md:w-1/2 relative">
                <div className="relative h-[300px] md:h-full w-full">
                  <Image
                    src={selectedProduct.mainImage || selectedProduct.image || "/placeholder.svg?height=600&width=600"}
                    alt={selectedProduct.title || selectedProduct.name || "Product"}
                    fill
                    className="object-cover"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white"
                    onClick={() => toggleWishlist(selectedProduct.id)}
                  >
                    <Heart
                      className={cn(
                        "h-4 w-4",
                        wishlist.includes(selectedProduct.id) ? "fill-red-500 text-red-500" : "",
                      )}
                    />
                  </Button>
                </div>
              </div>

              {/* Product Details */}
              <div className="md:w-1/2 flex flex-col">
                <ScrollArea className="h-[500px] md:h-auto">
                  <div className="p-6">
                    <DialogHeader className="mb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <DialogTitle className="text-2xl font-bold text-white">
                            {selectedProduct.title || selectedProduct.name}
                          </DialogTitle>
                          <div className="flex items-center mt-2">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                              ))}
                            </div>
                            <span className="text-sm ml-2 text-gray-400">(42 reviews)</span>
                          </div>
                        </div>
                        <Badge className="text-lg px-3 py-1 font-medium" style={{ backgroundColor: primaryColor }}>
                          ₹{selectedProduct.price.toLocaleString("en-IN")}
                        </Badge>
                      </div>
                    </DialogHeader>

                    <Tabs defaultValue="description" className="flex-1">
                      <TabsList className="grid w-full grid-cols-2 bg-gray-800/50">
                        <TabsTrigger value="description" className="data-[state=active]:bg-gray-700">
                          Description
                        </TabsTrigger>
                        <TabsTrigger value="details" className="data-[state=active]:bg-gray-700">
                          Details
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="description" className="mt-4">
                        <DialogDescription className="text-base text-gray-300 leading-relaxed">
                          {selectedProduct.description ||
                            "This premium product is designed to provide exceptional quality and performance. Made with the finest materials and crafted with attention to detail, it's perfect for those who appreciate excellence."}
                        </DialogDescription>
                      </TabsContent>
                      <TabsContent value="details" className="mt-4">
                        {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-semibold mb-2 text-white">Available Variants:</h4>
                            <div className="flex flex-wrap gap-2 mt-3">
                              {selectedProduct.variants.map((variant, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="px-3 py-1 border border-gray-700 hover:bg-gray-800 cursor-pointer"
                                >
                                  {variant}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="space-y-2 mt-4">
                          <div className="flex justify-between py-2 border-b border-gray-800">
                            <span className="font-medium text-gray-300">SKU:</span>
                            <span className="text-gray-400">{selectedProduct.id}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-800">
                            <span className="font-medium text-gray-300">Category:</span>
                            <span className="text-gray-400">Premium Collection</span>
                          </div>
                          <div className="flex justify-between py-2">
                            <span className="font-medium text-gray-300">In Stock:</span>
                            <span className="text-gray-400">Yes</span>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>

                    <div className="mt-8">
                      <h4 className="font-medium mb-3 text-white">Quantity</h4>
                      <div className="flex items-center mb-6">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-10 w-10 rounded-full border border-gray-700 text-white"
                          onClick={decrementQuantity}
                          disabled={quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center font-medium text-white">{quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-10 w-10 rounded-full border border-gray-700 text-white"
                          onClick={incrementQuantity}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
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
                          className="flex-1 rounded-full border border-gray-700 text-white hover:bg-gray-800"
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
          <DialogContent className="max-w-2xl p-0 bg-gray-900 text-white border border-gray-800 rounded-xl">
            <ScrollArea className="max-h-[80vh]">
              <div className="p-6">
                <DialogHeader className="mb-6">
                  <DialogTitle className="text-2xl font-bold text-white">Complete Your Purchase</DialogTitle>
                  <DialogDescription className="text-gray-300">
                    You're purchasing {selectedProduct.title || selectedProduct.name} ({quantity}) for ₹
                    {(selectedProduct.price * quantity).toLocaleString("en-IN")}
                  </DialogDescription>
                </DialogHeader>

                <div className="mb-8">
                  <div className="flex items-center mb-8">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: currentStep === "details" ? primaryColor : "#10b981" }}
                    >
                      {currentStep === "details" ? "1" : <Check className="h-5 w-5" />}
                    </div>
                    <div className="h-1 flex-1 bg-gray-800 mx-2">
                      <div
                        className="h-full transition-all duration-300"
                        style={{
                          width: currentStep === "details" ? "0%" : currentStep === "shipping" ? "50%" : "100%",
                          backgroundColor: primaryColor,
                        }}
                      ></div>
                    </div>
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        currentStep === "details"
                          ? "bg-gray-800 text-gray-400"
                          : currentStep === "shipping"
                            ? "text-white"
                            : "text-white"
                      }`}
                      style={{ backgroundColor: currentStep !== "details" ? primaryColor : undefined }}
                    >
                      {currentStep === "shipping" ? (
                        "2"
                      ) : currentStep === "payment" ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        "2"
                      )}
                    </div>
                    <div className="h-1 flex-1 bg-gray-800 mx-2">
                      <div
                        className="h-full transition-all duration-300"
                        style={{
                          width: currentStep === "payment" ? "100%" : "0%",
                          backgroundColor: primaryColor,
                        }}
                      ></div>
                    </div>
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        currentStep === "payment" ? "text-white" : "bg-gray-800 text-gray-400"
                      }`}
                      style={{ backgroundColor: currentStep === "payment" ? primaryColor : undefined }}
                    >
                      3
                    </div>
                  </div>

                  {currentStep === "details" && (
                    <div className="space-y-4">
                      <div className="bg-black/50 p-5 rounded-xl border border-gray-800">
                        <div className="flex items-start gap-4">
                          <div className="relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden">
                            <Image
                              src={
                                selectedProduct.mainImage ||
                                selectedProduct.image ||
                                "/placeholder.svg?height=80&width=80"
                              }
                              alt={selectedProduct.title || selectedProduct.name || "Product"}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-white">{selectedProduct.title || selectedProduct.name}</h4>
                            <p className="text-sm text-gray-400">Quantity: {quantity}</p>
                            <div className="flex justify-between items-end mt-2">
                              <span className="text-sm text-gray-400">
                                ₹{selectedProduct.price.toLocaleString("en-IN")} × {quantity}
                              </span>
                              <span className="font-bold text-white">
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
                    <form onSubmit={handleShippingSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label htmlFor="fullName" className="text-sm font-medium text-gray-300">
                            Full Name
                          </label>
                          <input
                            id="fullName"
                            type="text"
                            className="w-full p-3 rounded-lg bg-black/50 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={shippingAddress.fullName}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="address" className="text-sm font-medium text-gray-300">
                            Address
                          </label>
                          <input
                            id="address"
                            type="text"
                            className="w-full p-3 rounded-lg bg-black/50 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={shippingAddress.address}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="city" className="text-sm font-medium text-gray-300">
                            City
                          </label>
                          <input
                            id="city"
                            type="text"
                            className="w-full p-3 rounded-lg bg-black/50 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={shippingAddress.city}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="state" className="text-sm font-medium text-gray-300">
                            State
                          </label>
                          <input
                            id="state"
                            type="text"
                            className="w-full p-3 rounded-lg bg-black/50 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={shippingAddress.state}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="postalCode" className="text-sm font-medium text-gray-300">
                            Postal Code
                          </label>
                          <input
                            id="postalCode"
                            type="text"
                            className="w-full p-3 rounded-lg bg-black/50 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={shippingAddress.postalCode}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="country" className="text-sm font-medium text-gray-300">
                            Country
                          </label>
                          <select
                            id="country"
                            className="w-full p-3 rounded-lg bg-black/50 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                          className="rounded-full border border-gray-700 text-white hover:bg-gray-800"
                          onClick={() => setCurrentStep("details")}
                        >
                          Back
                        </Button>
                        <Button type="submit" className="rounded-full" style={{ backgroundColor: primaryColor }}>
                          Continue to Payment
                        </Button>
                      </div>
                    </form>
                  )}

                  {currentStep === "payment" && (
                    <div className="space-y-6">
                      <div className="bg-black/50 p-5 rounded-xl border border-gray-800">
                        <h4 className="font-medium mb-4 text-white">Payment Details</h4>
                        <div className="p-4 rounded-lg bg-black/70 border border-gray-700">
                          <CardElement
                            options={{
                              style: {
                                base: {
                                  fontSize: "16px",
                                  color: "#ffffff",
                                  "::placeholder": {
                                    color: "#9ca3af",
                                  },
                                },
                                invalid: {
                                  color: "#ef4444",
                                },
                              },
                            }}
                          />
                        </div>
                      </div>

                      <div className="border-t border-gray-800 pt-4">
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-300">Subtotal</span>
                          <span className="text-white">
                            ₹{(selectedProduct.price * quantity).toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-300">Shipping</span>
                          <span className="text-white">₹0.00</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-300">Tax (18%)</span>
                          <span className="text-white">
                            ₹{(selectedProduct.price * quantity * 0.18).toLocaleString("en-IN")}
                          </span>
                        </div>
                        <Separator className="my-3 bg-gray-800" />
                        <div className="flex justify-between font-bold">
                          <span className="text-white">Total</span>
                          <span className="text-white">
                            ₹{(selectedProduct.price * quantity * 1.18).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between">
                        <Button
                          variant="outline"
                          className="rounded-full border border-gray-700 text-white hover:bg-gray-800"
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

      {/* Cart Drawer */}
      <Drawer open={cartOpen} onOpenChange={setCartOpen}>
        <DrawerContent className="bg-gray-900 text-white border-t border-gray-800">
          <DrawerHeader>
            <DrawerTitle className="text-xl font-bold">Your Cart</DrawerTitle>
            <DrawerDescription className="text-gray-400">You have 0 items in your cart</DrawerDescription>
          </DrawerHeader>
          <div className="p-4 flex flex-col items-center justify-center min-h-[200px]">
            <ShoppingCart className="h-12 w-12 text-gray-600 mb-4" />
            <p className="text-gray-400 text-center">Your cart is empty</p>
            <p className="text-gray-500 text-sm text-center mt-1">Add items to your cart to continue shopping</p>
          </div>
          <DrawerFooter>
            <Button className="w-full rounded-full" style={{ backgroundColor: primaryColor }} disabled>
              Checkout
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" className="w-full rounded-full border border-gray-700 text-white">
                Continue Shopping
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Footer */}
      <footer className="bg-black py-16 text-gray-400 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Image
                  src={storeLogo || "/placeholder.svg"}
                  alt={storeName}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <span className="text-xl font-bold text-white">{storeName}</span>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                {storeDescription.length > 120 ? `${storeDescription.substring(0, 120)}...` : storeDescription}
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-500 hover:text-white transition-colors duration-200">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a href="#" className="text-gray-500 hover:text-white transition-colors duration-200">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-500 hover:text-white transition-colors duration-200">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Shop</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                    New Arrivals
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                    Best Sellers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                    Collections
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                    Sale
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Support</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                    FAQs
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                    Shipping Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                    Returns & Refunds
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Newsletter</h4>
              <p className="text-gray-400 mb-4">Subscribe to our newsletter for exclusive offers and updates.</p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 p-3 rounded-l-lg bg-black/50 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 border-r-0"
                />
                <Button className="rounded-l-none" style={{ backgroundColor: primaryColor }}>
                  Subscribe
                </Button>
              </div>
            </div>
          </div>

          <Separator className="my-8 bg-gray-800" />

          <div className="text-center text-gray-500">
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
export function ModernTemplate(props: ModernTemplateProps) {
  return (
    <Elements stripe={stripePromise}>
      <ModernTemplateInternal {...props} />
    </Elements>
  )
}

export default ModernTemplate

