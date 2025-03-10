"use client"

import type React from "react"

import Image from "next/image"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Menu, X, ShoppingCart, Check, ChevronRight, Star } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { useStripe, useElements, CardElement, Elements } from "@stripe/react-stripe-js"
import { useAuthStore } from "@/store/authStore"
import { loadStripe } from "@stripe/stripe-js"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Product {
  id: string
  name: string
  price: number
  image: string
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
    country: "India",
  })

  const openProductDialog = (product: Product) => {
    setSelectedProduct(product)
    setIsProductDialogOpen(true)
    setCurrentStep("details")
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
        totalPrice: selectedProduct.price,
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
            quantity: 1,
            unitPrice: selectedProduct.price,
            totalPrice: selectedProduct.price,
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

  const primaryColor = themeCustomization?.buttonColor || "#3b82f6"

  return (
    <div
      className="min-h-[600px]"
      style={{
        backgroundColor: themeCustomization?.backgroundColor || "#ffffff",
        fontFamily: themeCustomization?.fontFamily || "sans-serif",
        color: themeCustomization?.textColor || "#000000",
        fontSize: themeCustomization?.fontSize || "16px",
      }}
    >
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 shadow-md bg-white dark:bg-gray-900">
        <div className="flex items-center gap-4">
          <Image
            src={storeLogo || "/placeholder.svg?height=50&width=50"}
            alt={storeName || "Store Logo"}
            width={50}
            height={50}
            className="rounded-full object-cover"
          />
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{storeName}</span>
        </div>
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {["Home", "Products", "About", "Contact"].map((item) => (
            <a
              key={item}
              href="#"
              className="text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              {item}
            </a>
          ))}
          <Button variant="outline" size="icon" className="ml-2 relative">
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              0
            </span>
          </Button>
        </nav>
        {/* Mobile Menu Toggle */}
        <button className="md:hidden text-gray-900 dark:text-white" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
        {/* Mobile Menu */}
        {menuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-16 left-0 w-full bg-white dark:bg-gray-900 shadow-md p-4 flex flex-col gap-4 md:hidden z-30"
          >
            {["Home", "Products", "About", "Contact"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
                onClick={() => setMenuOpen(false)}
              >
                {item}
              </a>
            ))}
            <Button
              variant="outline"
              className="flex items-center justify-center gap-2"
              onClick={() => setMenuOpen(false)}
            >
              <ShoppingCart className="h-5 w-5" />
              <span>Cart (0)</span>
            </Button>
          </motion.nav>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative flex flex-col items-center text-center py-20 px-6 md:px-12">
        {themeCustomization?.bannerImage && (
          <div className="absolute inset-0 w-full h-full">
            <Image
              src={themeCustomization.bannerImage || "/placeholder.svg"}
              alt={themeCustomization.bannerText || "Banner"}
              fill
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-black/40 dark:bg-black/50"></div>
          </div>
        )}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-3xl"
        >
          {!themeCustomization?.bannerImage && (
            <div className="mb-6">
              <Image
                src={storeLogo || "/placeholder.svg?height=150&width=150"}
                alt={storeName || "Store Logo"}
                width={150}
                height={150}
                className="rounded-full shadow-lg mx-auto"
              />
            </div>
          )}
          {themeCustomization?.bannerText ? (
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-lg mb-4">
              {themeCustomization.bannerText}
            </h1>
          ) : (
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome to {storeName}
            </h1>
          )}
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-100 dark:text-gray-300 mb-8">
            {storeDescription}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              style={{ backgroundColor: primaryColor }}
              className="px-8 py-6 text-lg font-medium text-white rounded-lg shadow-lg hover:opacity-90 transition"
              size="lg"
            >
              Shop Now
            </Button>
            <Button
              variant="outline"
              className="px-8 py-6 text-lg font-medium rounded-lg shadow-lg transition border-2"
              size="lg"
            >
              Learn More
            </Button>
          </div>
        </motion.div>
      </section>

      {/* About Section */}
      <section className="py-16 px-6 md:px-12 ">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="relative rounded-lg overflow-hidden shadow-xl"
              >
                <Image
                  src="/placeholder.svg?height=400&width=600"
                  alt="About our store"
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover"
                />
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="md:w-1/2"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">About {storeName}</h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">{storeDescription}</p>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                We are committed to providing high-quality products and exceptional customer service. Our mission is to
                make your shopping experience as seamless and enjoyable as possible.
              </p>
              <Button
                style={{ backgroundColor: primaryColor }}
                className="px-6 py-2 text-white rounded-lg shadow-md hover:opacity-90 transition"
              >
                Learn More About Us
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="mb-2 px-3 py-1 text-sm" style={{ backgroundColor: primaryColor }}>
              Our Collection
            </Badge>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Featured Products</h3>
            <Separator className="w-24 h-1 mx-auto mt-4 mb-6" style={{ backgroundColor: primaryColor }} />
            <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-300">
              Discover our handpicked selection of premium products designed to enhance your lifestyle.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-700 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <div className="relative w-full aspect-[4/3] overflow-hidden">
                  <Image
                    src={product.image || "/placeholder.svg?height=300&width=400"}
                    alt={product.name || "Product Image"}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white">{product.name}</h4>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm ml-1 text-gray-600 dark:text-gray-300">4.9</span>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    ₹{product.price.toLocaleString("en-IN")}
                  </p>
                  <Button
                    className="w-full"
                    style={{ backgroundColor: primaryColor }}
                    onClick={() => openProductDialog(product)}
                  >
                    View Details
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button variant="outline" size="lg" className="border-2">
              View All Products <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 px-6 md:px-8 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="mb-2 px-3 py-1 text-sm" style={{ backgroundColor: primaryColor }}>
              Our Promise
            </Badge>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Why Choose Us</h3>
            <Separator className="w-24 h-1 mx-auto mt-4 mb-6" style={{ backgroundColor: primaryColor }} />
            <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-300">
              We're committed to providing you with the best shopping experience possible.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-6 text-white"
                style={{ backgroundColor: primaryColor }}
              >
                <span className="text-2xl">🚀</span>
              </div>
              <h4 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Fast Delivery</h4>
              <p className="text-gray-600 dark:text-gray-300">
                Experience speedy delivery with our efficient logistics network. We ensure your products reach you in
                the shortest time possible.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-6 text-white"
                style={{ backgroundColor: primaryColor }}
              >
                <span className="text-2xl">💎</span>
              </div>
              <h4 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Quality Assurance</h4>
              <p className="text-gray-600 dark:text-gray-300">
                Our products are carefully curated to ensure the highest quality. We stand behind everything we sell
                with our satisfaction guarantee.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-6 text-white"
                style={{ backgroundColor: primaryColor }}
              >
                <span className="text-2xl">📞</span>
              </div>
              <h4 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">24/7 Support</h4>
              <p className="text-gray-600 dark:text-gray-300">
                We provide round-the-clock customer support for all your needs. Our dedicated team is always ready to
                assist you with any questions.
              </p>
            </motion.div>
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
          <DialogContent className="max-w-3xl p-0 overflow-hidden">
            <div className="flex flex-col md:flex-row">
              {/* Product Image */}
              <div className="md:w-1/2 relative">
                <div className="relative h-[300px] md:h-full w-full">
                  <Image
                    src={selectedProduct.image || "/placeholder.svg?height=600&width=600"}
                    alt={selectedProduct.name || "Product Image"}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Product Details */}
              <div className="md:w-1/2 p-6 flex flex-col">
                <DialogHeader className="mb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <DialogTitle className="text-2xl font-bold">{selectedProduct.name}</DialogTitle>
                      <div className="flex items-center mt-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          ))}
                        </div>
                        <span className="text-sm ml-2 text-gray-600">(42 reviews)</span>
                      </div>
                    </div>
                    <Badge className="text-lg px-3 py-1">₹{selectedProduct.price.toLocaleString("en-IN")}</Badge>
                  </div>
                </DialogHeader>

                <Tabs defaultValue="description" className="flex-1">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="description">Description</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                  </TabsList>
                  <TabsContent value="description" className="mt-4">
                    <DialogDescription className="text-base">
                      {selectedProduct.description ||
                        "This premium product is designed to provide exceptional quality and performance. Made with the finest materials and crafted with attention to detail, it's perfect for those who appreciate excellence."}
                    </DialogDescription>
                  </TabsContent>
                  <TabsContent value="details" className="mt-4">
                    {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold mb-2">Available Variants:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {selectedProduct.variants.map((variant, index) => (
                            <li key={index} className="text-gray-700 dark:text-gray-300">
                              {variant}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">SKU:</span> {selectedProduct.id}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Category:</span> Premium Collection
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">In Stock:</span> Yes
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <Button className="flex-1" style={{ backgroundColor: primaryColor }} onClick={openPaymentDialog}>
                      Buy Now
                    </Button>
                    <Button variant="outline" className="flex-1">
                      Add to Cart
                    </Button>
                  </div>
                </div>
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
          <DialogContent className="max-w-2xl p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Complete Your Purchase</DialogTitle>
              <DialogDescription>
                You're purchasing {selectedProduct.name} for ₹{selectedProduct.price.toLocaleString("en-IN")}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center mr-3">
                  {currentStep === "details" ? "1" : <Check className="h-5 w-5" />}
                </div>
                <div className="h-1 flex-1 bg-gray-200">
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: currentStep === "details" ? "0%" : currentStep === "shipping" ? "50%" : "100%",
                      backgroundColor: primaryColor,
                    }}
                  ></div>
                </div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mx-3 ${
                    currentStep === "details"
                      ? "bg-gray-200 text-gray-600"
                      : currentStep === "shipping"
                        ? "bg-primary text-white"
                        : "bg-primary text-white"
                  }`}
                  style={{ backgroundColor: currentStep !== "details" ? primaryColor : undefined }}
                >
                  {currentStep === "shipping" ? "2" : currentStep === "payment" ? <Check className="h-5 w-5" /> : "2"}
                </div>
                <div className="h-1 flex-1 bg-gray-200">
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: currentStep === "payment" ? "100%" : "0%",
                      backgroundColor: primaryColor,
                    }}
                  ></div>
                </div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ml-3 ${
                    currentStep === "payment" ? "bg-primary text-white" : "bg-gray-200 text-gray-600"
                  }`}
                  style={{ backgroundColor: currentStep === "payment" ? primaryColor : undefined }}
                >
                  3
                </div>
              </div>

              {currentStep === "details" && (
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6">
                    <div className="flex items-start gap-4">
                      <div className="relative h-16 w-16 flex-shrink-0">
                        <Image
                          src={selectedProduct.image || "/placeholder.svg?height=64&width=64"}
                          alt={selectedProduct.name || "Product Image"}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                      <div>
                        <h4 className="font-medium">{selectedProduct.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Quantity: 1</p>
                        <p className="font-bold mt-1">₹{selectedProduct.price.toLocaleString("en-IN")}</p>
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full"
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
                      <label htmlFor="fullName" className="text-sm font-medium">
                        Full Name
                      </label>
                      <input
                        id="fullName"
                        type="text"
                        className="w-full p-2 border rounded-md"
                        value={shippingAddress.fullName}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="address" className="text-sm font-medium">
                        Address
                      </label>
                      <input
                        id="address"
                        type="text"
                        className="w-full p-2 border rounded-md"
                        value={shippingAddress.address}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="city" className="text-sm font-medium">
                        City
                      </label>
                      <input
                        id="city"
                        type="text"
                        className="w-full p-2 border rounded-md"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="state" className="text-sm font-medium">
                        State
                      </label>
                      <input
                        id="state"
                        type="text"
                        className="w-full p-2 border rounded-md"
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="postalCode" className="text-sm font-medium">
                        Postal Code
                      </label>
                      <input
                        id="postalCode"
                        type="text"
                        className="w-full p-2 border rounded-md"
                        value={shippingAddress.postalCode}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="country" className="text-sm font-medium">
                        Country
                      </label>
                      <select
                        id="country"
                        className="w-full p-2 border rounded-md"
                        value={shippingAddress.country}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                        required
                      >
                        <option value="India">India</option>
                        <option value="USA">USA</option>
                        <option value="UK">UK</option>
                        <option value="Canada">Canada</option>
                        <option value="Australia">Australia</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-between mt-6">
                    <Button type="button" variant="outline" onClick={() => setCurrentStep("details")}>
                      Back
                    </Button>
                    <Button type="submit" style={{ backgroundColor: primaryColor }}>
                      Continue to Payment
                    </Button>
                  </div>
                </form>
              )}

              {currentStep === "payment" && (
                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Payment Details</h4>
                    <div className="p-4 border rounded-md bg-white">
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

                  <div className="border-t pt-4">
                    <div className="flex justify-between mb-2">
                      <span>Subtotal</span>
                      <span>₹{selectedProduct.price.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Shipping</span>
                      <span>₹0.00</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Tax</span>
                      <span>₹{(selectedProduct.price * 0.18).toLocaleString("en-IN")}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>₹{(selectedProduct.price * 1.18).toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep("shipping")}>
                      Back
                    </Button>
                    <Button
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
          </DialogContent>
        </Dialog>
      )}

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-900 py-12 px-4 md:px-8">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Image
                  src={storeLogo || "/placeholder.svg?height=40&width=40"}
                  alt={storeName || "Store Logo"}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <span className="text-xl font-bold">{storeName}</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{storeDescription.substring(0, 100)}...</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
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
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                    Products
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Customer Service</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                    Shipping Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                    Returns & Refunds
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Newsletter</h4>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Subscribe to our newsletter for updates and offers.
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 p-2 border rounded-l-md focus:outline-none"
                />
                <Button className="rounded-l-none" style={{ backgroundColor: primaryColor }}>
                  Subscribe
                </Button>
              </div>
            </div>
          </div>

          <Separator className="my-8" />

          <div className="text-center text-gray-600 dark:text-gray-400">
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

