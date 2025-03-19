"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ShoppingCart, Check, Star, Heart } from "lucide-react"
import { toast } from "sonner"
import { useStripe, useElements, CardElement, Elements } from "@stripe/react-stripe-js"
import { useAuthStore } from "@/store/authStore"
import { loadStripe } from "@stripe/stripe-js"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import Navbar from "./classic/Navbar"
import BannerSection from "./classic/Hero"
import FeaturedCollectionSection from "./classic/Products"
import AboutSection from "./classic/About"
import NewsletterSection from "./classic/Newsletter"
import FooterSection from "./classic/Footer"

interface Product {
  id: string
  title: string
  price: number
  mainImage: string
  variants?: string[]
  description?: string
}

export interface ThemeCustomization {
  theme?: string
  id?: string
  storeId?: string
  createdAt?: Date
  updatedAt?: Date
  fontFamily?: string
  fontSize?: string
  fontColor?: string
  headingFontFamily?: string
  headingFontSize?: string
  headingFontColor?: string
  backgroundColor?: string
  backgroundColor2?: string
  textColor?: string
  accentColor?: string
  borderColor?: string
  cardBackgroundColor?: string
  buttonColor?: string
  buttonTextColor?: string
  buttonHoverColor?: string
  buttonHoverTextColor?: string
  buttonBorderRadius?: string
  navBarColor?: string
  navBarTextColor?: string
  navBarHoverColor?: string
  linkColor?: string
  linkHoverColor?: string
  errorColor?: string
  successColor?: string
  warningColor?: string
  borderRadius?: string
  productGridLayout?: string
  containerWidth?: string
  aboutImage?: string
  bannerImage?: string
  footerImage?: string
  logoImage?: string
  favicon?: string
  bannerText?: string
  footerText?: string
}

interface ClassicTemplateProps {
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

function ClassicTemplateInternal({
  storeName,
  storeDescription,
  products,
  storeLogo,
  themeCustomization = {},
  storeId,
  userId,
}: ClassicTemplateProps) {
  const { token, user } = useAuthStore()
  const stripe = useStripe()
  const elements = useElements()

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
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
  const [quantity, setQuantity] = useState(1)
  const [wishlist, setWishlist] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const primaryColor = themeCustomization?.buttonColor || "#3b82f6"
  const accentColor = themeCustomization?.accentColor || "#f59e0b"
  const backgroundColor = themeCustomization?.backgroundColor || "#01172b"
  const textColor = themeCustomization?.textColor || "#ccd7e0"
  const fontFamily = themeCustomization?.fontFamily || "Arial, sans-serif"
  const fontSize = themeCustomization?.fontSize || "16px"
  const fontColor = themeCustomization?.fontColor || textColor
  const headingFontFamily = themeCustomization?.headingFontFamily || "Arial, sans-serif"
  const headingFontSize = themeCustomization?.headingFontSize || "24px"
  const headingFontColor = themeCustomization?.headingFontColor || "#ffffff"
  const backgroundColor2 = themeCustomization?.backgroundColor2 || "#ffffff"
  const borderColor = themeCustomization?.borderColor || "#e5e7eb"
  const cardBackgroundColor = themeCustomization?.cardBackgroundColor || "#1f2937"
  const buttonTextColor = themeCustomization?.buttonTextColor || "#ffffff"
  const buttonHoverColor = themeCustomization?.buttonHoverColor || "#2563eb"
  const buttonHoverTextColor = themeCustomization?.buttonHoverTextColor || "#ffffff"
  const buttonBorderRadius = themeCustomization?.buttonBorderRadius || "4px"
  const navBarColor = themeCustomization?.navBarColor || "#1f2937"
  const navBarTextColor = themeCustomization?.navBarTextColor || "#ffffff"
  const navBarHoverColor = themeCustomization?.navBarHoverColor || "#374151"
  const linkColor = themeCustomization?.linkColor || "#3b82f6"
  const linkHoverColor = themeCustomization?.linkHoverColor || "#2563eb"
  const errorColor = themeCustomization?.errorColor || "#dc2626"
  const successColor = themeCustomization?.successColor || "#16a34a"
  const warningColor = themeCustomization?.warningColor || "#f59e0b"
  const borderRadius = themeCustomization?.borderRadius || "8px"
  const productGridLayout = themeCustomization?.productGridLayout || "grid-cols-3"
  const containerWidth = themeCustomization?.containerWidth || "1200px"
  const aboutImage = themeCustomization?.aboutImage || "/default-about.jpg"
  const bannerImage = themeCustomization?.bannerImage || "/default-banner.jpg"
  const footerImage = themeCustomization?.footerImage || "/default-footer.jpg"
  const logoImage = themeCustomization?.logoImage || storeLogo
  const favicon = themeCustomization?.favicon || "/favicon.ico"
  const bannerText = themeCustomization?.bannerText || "Welcome to our store!"
  const footerText = themeCustomization?.footerText || "Thank you for visiting!"

  const addToWishlist = (productId: string) => {
    if (wishlist.includes(productId)) {
      setWishlist(wishlist.filter((id) => id !== productId))
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
    setError(null)
  }

  const closeProductDialog = () => {
    setIsProductDialogOpen(false)
    setTimeout(() => setSelectedProduct(null), 300)
  }

  const openPaymentDialog = () => {
    if (!token) {
      toast.error("Please login to continue")
      return
    }

    setIsProductDialogOpen(false)
    setTimeout(() => {
      setIsPaymentDialogOpen(true)
    }, 300)
  }

  const closePaymentDialog = () => {
    setIsPaymentDialogOpen(false)
    setError(null)
  }

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (
      !shippingAddress.fullName ||
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.postalCode ||
      !shippingAddress.country
    ) {
      toast.error("Please fill all shipping fields")
      return
    }
    setCurrentStep("payment")
  }

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
    setError(null)

    try {
      const paymentIntentRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/payments/create-intent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: selectedProduct.id,
          storeId,
          quantity,
          unitPrice: selectedProduct.price,
        }),
      })

      if (!paymentIntentRes.ok) {
        const errorData = await paymentIntentRes.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to create payment intent")
      }

      const { clientSecret, paymentIntentId } = await paymentIntentRes.json()

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: shippingAddress.fullName,
            address: {
              line1: shippingAddress.address,
              city: shippingAddress.city,
              state: shippingAddress.state,
              postal_code: shippingAddress.postalCode,
              country: shippingAddress.country,
            },
          },
        },
      })

      if (error) {
        throw new Error(error.message || "Payment failed")
      }

      if (paymentIntent?.status !== "succeeded") {
        throw new Error("Payment not completed")
      }

      const orderPayload = {
        storeId,
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

      const orderRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderPayload),
      })

      if (!orderRes.ok) {
        const errorData = await orderRes.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to create order")
      }

      toast.success("Order placed successfully!")
      closePaymentDialog()
    } catch (error: any) {
      console.error("Error processing payment:", error)
      setError(error.message || "Failed to process payment")
      toast.error(error.message || "Failed to process payment")
    } finally {
      setProcessing(false)
    }
  }

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
      <Navbar
        storeLogo={storeLogo}
        storeName={storeName}
        navBarColor={themeCustomization?.navBarColor || "rgba(0, 0, 0, 0.85)"}
        navBarTextColor={themeCustomization?.navBarTextColor || "#ffffff"}
        navBarHoverColor={themeCustomization?.navBarHoverColor || "#ff9900"}
        borderColor={themeCustomization?.borderColor || "#333333"}
        linkColor={themeCustomization?.linkColor || "#cccccc"}
        linkHoverColor={themeCustomization?.linkHoverColor || "#ff9900"}
      />

      <BannerSection
        bannerImage={themeCustomization?.bannerImage}
        bannerText={themeCustomization?.bannerText}
        cardBackgroundColor={themeCustomization?.cardBackgroundColor || "#ffffff"}
        storeLogo={storeLogo}
        textColor={themeCustomization?.textColor || "#fffff" }
        storeName={storeName}
        storeDescription={storeDescription}
        primaryColor={themeCustomization?.buttonColor || "#3b82f6"}
      />

      <AboutSection
        backgroundColor={themeCustomization?.backgroundColor || "#f9fafb"}
        accentColor={themeCustomization?.accentColor || "#f59e0b"}
        primaryColor={themeCustomization?.buttonColor || "#3b82f6"}
        storeName={storeName}
        storeDescription={storeDescription}
        imageUrl={themeCustomization?.aboutImage || "/placeholder.svg?height=600&width=800"}
        badgeText="Our Story"
        missionText="Our mission is to provide exceptional products that enhance your lifestyle while maintaining the highest standards of quality, sustainability, and customer service."
        buttonText="Learn More About Us"
      />

      <FeaturedCollectionSection
        backgroundColor={themeCustomization?.backgroundColor || "#ffffff"}
        primaryColor={themeCustomization?.buttonColor || "#3b82f6"}
        textColor={themeCustomization?.textColor || "#000000"}
        products={products}
        addToWishlist={addToWishlist}
        wishlist={wishlist}
        openProductDialog={openProductDialog}
      />

      

      <NewsletterSection
        primaryColor={themeCustomization?.buttonColor || "#3b82f6"}
        sectionBackgroundColor={themeCustomization?.backgroundColor || "bg-gray-900"}
        title="Join Our Community"
        description="Subscribe to our newsletter and be the first to know about new products, exclusive offers, and more."
        inputPlaceholder="Your email address"
        subscribeButtonText="Subscribe"
        privacyText="By subscribing, you agree to our privacy policy and consent to receive marketing emails."
      />

      {selectedProduct && (
        <Dialog
          open={isProductDialogOpen}
          onOpenChange={(open) => {
            if (!open) closeProductDialog()
          }}
        >
          <DialogContent className="max-w-5xl p-0 overflow-hidden rounded-xl border-0 shadow-xl">
            <div className="flex flex-col md:flex-row max-h-[85vh]">
              <div className="md:w-1/2 relative">
                <div className="relative h-[400px] md:h-full w-full">
                  <Image
                    src={selectedProduct.mainImage || "/placeholder.svg?height=600&width=600"}
                    alt={selectedProduct.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/20 to-transparent opacity-60"></div>
                  <button
                    className="absolute top-4 right-4 h-10 w-10 flex items-center justify-center text-gray-700 bg-white rounded-full shadow-md hover:scale-110 transition-transform"
                    onClick={() => addToWishlist(selectedProduct.id)}
                    aria-label="Add to wishlist"
                  >
                    <Heart
                      className={cn(
                        "h-5 w-5",
                        wishlist.includes(selectedProduct.id) ? "fill-red-500 text-red-500" : "fill-transparent",
                      )}
                    />
                  </button>
                  <Badge className="absolute top-4 left-4 text-sm px-2 py-1" style={{ backgroundColor: primaryColor }}>
                    New Arrival
                  </Badge>
                </div>
              </div>

              <div className="md:w-1/2 flex flex-col">
                <ScrollArea className="h-full max-h-[85vh] md:max-h-none">
                  <div className="p-8">
                    <DialogHeader className="mb-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <DialogTitle className="text-3xl font-bold text-gray-900 dark:text-white">
                            {selectedProduct.title}
                          </DialogTitle>
                          <div className="flex items-center mt-3">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                              ))}
                            </div>
                            <span className="text-sm ml-2 text-gray-600 dark:text-gray-400">(42 reviews)</span>
                          </div>
                        </div>
                        <Badge className="text-xl px-4 py-1.5 font-semibold" style={{ backgroundColor: primaryColor }}>
                          ₹{selectedProduct.price.toLocaleString("en-IN")}
                        </Badge>
                      </div>
                    </DialogHeader>

                    <Tabs defaultValue="description" className="flex-1 mt-4">
                      <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="description" className="text-base py-3">
                          Description
                        </TabsTrigger>
                        <TabsTrigger value="details" className="text-base py-3">
                          Details
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="description" className="mt-2">
                        <DialogDescription className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                          {selectedProduct.description ||
                            "This premium product is designed to provide exceptional quality and performance. Made with the finest materials and crafted with attention to detail, it's perfect for those who appreciate excellence."}
                        </DialogDescription>
                        <div className="mt-6 grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            <Check className="h-5 w-5 text-green-500" />
                            <span className="text-sm">Premium Quality</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="h-5 w-5 text-green-500" />
                            <span className="text-sm">Durable Materials</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="h-5 w-5 text-green-500" />
                            <span className="text-sm">Eco-Friendly</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="h-5 w-5 text-green-500" />
                            <span className="text-sm">1 Year Warranty</span>
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="details" className="mt-2">
                        {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                          <div className="mb-6">
                            <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Available Variants:</h4>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {selectedProduct.variants.map((variant, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="px-4 py-2 border-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 text-base"
                                >
                                  {variant}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="space-y-3 text-gray-700 dark:text-gray-300">
                          <p className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                            <span className="font-medium">SKU:</span>
                            <span>{selectedProduct.id}</span>
                          </p>
                          <p className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                            <span className="font-medium">Category:</span>
                            <span>Premium Collection</span>
                          </p>
                          <p className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                            <span className="font-medium">In Stock:</span>
                            <span className="text-green-600 font-medium">Yes</span>
                          </p>
                          <p className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                            <span className="font-medium">Shipping:</span>
                            <span>Free Shipping</span>
                          </p>
                          <p className="flex justify-between py-3">
                            <span className="font-medium">Estimated Delivery:</span>
                            <span>3-5 Business Days</span>
                          </p>
                        </div>
                      </TabsContent>
                    </Tabs>

                    <div className="mt-8">
                      {(!user || (user && user.id !== userId)) && (
                        <>
                          <h4 className="font-medium mb-3 text-gray-900 dark:text-white">Quantity</h4>
                          <div className="flex items-center mb-6">
                            <button
                              className="h-12 w-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800"
                              onClick={decrementQuantity}
                              disabled={quantity <= 1}
                            >
                              <span className="text-xl font-medium">-</span>
                            </button>
                            <span className="w-16 text-center font-medium text-lg">{quantity}</span>
                            <button
                              className="h-12 w-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800"
                              onClick={incrementQuantity}
                            >
                              <span className="text-xl font-medium">+</span>
                            </button>
                            <div className="ml-6 text-gray-600 dark:text-gray-400">
                              <span className="font-medium">Total: </span>
                              <span className="font-bold text-lg text-gray-900 dark:text-white">
                                ₹{(selectedProduct.price * quantity).toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>
                        </>
                      )}

                      <div className="flex flex-col sm:flex-row gap-4 mt-8">
                        {!token ? (
                          <Button
                            className="flex-1 rounded-full h-12 text-base"
                            style={{ backgroundColor: primaryColor }}
                            asChild
                          >
                            <a href="/auth/login">Login to Order</a>
                          </Button>
                        ) : user && user.id === userId ? (
                          <div className="text-center w-full p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300">
                            You're the store owner
                          </div>
                        ) : (
                          <>
                            <Button
                              className="flex-1 rounded-full h-12 text-base"
                              style={{ backgroundColor: primaryColor }}
                              onClick={openPaymentDialog}
                            >
                              <ShoppingCart className="mr-2 h-5 w-5" /> Buy Now
                            </Button>
                            <Button
                              variant="outline"
                              className="flex-1 rounded-full h-12 text-base border-2"
                              onClick={() => toast.success("Added to cart")}
                            >
                              Add to Cart
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {selectedProduct && (
        <Dialog
          open={isPaymentDialogOpen}
          onOpenChange={(open) => {
            if (!open) closePaymentDialog()
          }}
        >
          <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-xl border-0 shadow-xl">
            <ScrollArea className="max-h-[85vh]">
              <div className="p-8">
                <DialogHeader className="mb-8">
                  <DialogTitle className="text-3xl font-bold text-gray-900 dark:text-white">
                    Complete Your Purchase
                  </DialogTitle>
                  <DialogDescription className="text-base mt-2">
                    You're purchasing <span className="font-medium">{selectedProduct.title}</span> for{" "}
                    <span className="font-medium">₹{(selectedProduct.price * quantity).toLocaleString("en-IN")}</span>
                  </DialogDescription>
                </DialogHeader>

                <div className="mb-8">
                  <nav aria-label="Progress" className="mb-10">
                    <ol className="flex items-center">
                      {steps.map((step, stepIdx) => (
                        <li key={step.name} className={cn("flex-1 relative", stepIdx !== steps.length - 1 && "pr-8")}>
                          {currentStep === step.step || steps.findIndex((s) => s.step === currentStep) > stepIdx ? (
                            <div className="flex flex-col items-center">
                              <div
                                className="rounded-full h-12 w-12 flex items-center justify-center text-white"
                                style={{ backgroundColor: primaryColor }}
                              >
                                {steps.findIndex((s) => s.step === currentStep) > stepIdx ? (
                                  <Check className="h-6 w-6" />
                                ) : (
                                  stepIdx + 1
                                )}
                              </div>
                              <p className="text-sm font-medium mt-2">{step.name}</p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <div className="rounded-full h-12 w-12 flex items-center justify-center border-2 border-gray-300 text-gray-500">
                                {stepIdx + 1}
                              </div>
                              <p className="text-sm font-medium text-gray-500 mt-2">{step.name}</p>
                            </div>
                          )}

                          {stepIdx !== steps.length - 1 && (
                            <div
                              className={cn(
                                "hidden md:block absolute top-6 right-4 h-0.5 w-full -translate-y-1/2",
                                steps.findIndex((s) => s.step === currentStep) > stepIdx ? "bg-primary" : "bg-gray-300",
                              )}
                              style={
                                steps.findIndex((s) => s.step === currentStep) > stepIdx
                                  ? { backgroundColor: primaryColor }
                                  : {}
                              }
                            />
                          )}
                        </li>
                      ))}
                    </ol>
                  </nav>

                  {currentStep === "details" && (
                    <div className="space-y-6">
                      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
                        <div className="flex items-start gap-6">
                          <div className="relative h-28 w-28 flex-shrink-0 rounded-md overflow-hidden">
                            <Image
                              src={selectedProduct.mainImage || "/placeholder.svg?height=112&width=112"}
                              alt={selectedProduct.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-xl text-gray-900 dark:text-white">
                              {selectedProduct.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Quantity: {quantity}</p>
                            <div className="flex justify-between items-end mt-4">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                ₹{selectedProduct.price.toLocaleString("en-IN")} × {quantity}
                              </span>
                              <span className="font-bold text-xl text-gray-900 dark:text-white">
                                ₹{(selectedProduct.price * quantity).toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex justify-between text-gray-700 dark:text-gray-300">
                            <span>Subtotal</span>
                            <span>₹{(selectedProduct.price * quantity).toLocaleString("en-IN")}</span>
                          </div>
                          <div className="flex justify-between mt-2 text-gray-700 dark:text-gray-300">
                            <span>Shipping</span>
                            <span>Free</span>
                          </div>
                          <div className="flex justify-between mt-2 text-gray-700 dark:text-gray-300">
                            <span>Tax (18%)</span>
                            <span>₹{(selectedProduct.price * quantity * 0.18).toLocaleString("en-IN")}</span>
                          </div>
                          <Separator className="my-4" />
                          <div className="flex justify-between font-bold text-gray-900 dark:text-white text-lg">
                            <span>Total</span>
                            <span>₹{(selectedProduct.price * quantity * 1.18).toLocaleString("en-IN")}</span>
                          </div>
                        </div>
                      </div>

                      <Button
                        className="w-full rounded-full h-12 text-base"
                        style={{ backgroundColor: primaryColor }}
                        onClick={() => setCurrentStep("shipping")}
                      >
                        Continue to Shipping
                      </Button>
                    </div>
                  )}

                  {currentStep === "shipping" && (
                    <form onSubmit={handleShippingSubmit} className="space-y-6">
                      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
                        <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Shipping Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                              <option value="US">United States</option>
                              <option value="IN">India</option>
                              <option value="GB">United Kingdom</option>
                              <option value="CA">Canada</option>
                              <option value="AU">Australia</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between mt-8">
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-full border-2 h-12 px-6"
                          onClick={() => setCurrentStep("details")}
                        >
                          Back
                        </Button>
                        <Button
                          type="submit"
                          className="rounded-full h-12 px-6"
                          style={{ backgroundColor: primaryColor }}
                        >
                          Continue to Payment
                        </Button>
                      </div>
                    </form>
                  )}

                  {currentStep === "payment" && (
                    <div className="space-y-6">
                      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
                        <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Payment Details</h3>
                        <div className="p-5 border rounded-lg bg-white dark:bg-gray-700 shadow-sm">
                          <CardElement
                            options={{
                              style: {
                                base: {
                                  fontSize: "16px",
                                  color: "#424770",
                                  "::placeholder": {
                                    color: "#aab7c4",
                                  },
                                  padding: "10px 0",
                                },
                                invalid: {
                                  color: "#9e2146",
                                },
                              },
                            }}
                          />
                        </div>

                        <div className="mt-6 flex items-center">
                          <div className="flex gap-2 items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-green-500"
                            >
                              <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                            </svg>
                            <span className="text-sm text-gray-600 dark:text-gray-400">Secure payment processing</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
                        <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Order Summary</h3>
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
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

                        {error && (
                          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                            {error}
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between mt-8">
                        <Button
                          variant="outline"
                          className="rounded-full border-2 h-12 px-6"
                          onClick={() => setCurrentStep("shipping")}
                        >
                          Back
                        </Button>
                        <Button
                          className="rounded-full h-12 px-6"
                          style={{ backgroundColor: primaryColor }}
                          onClick={handleProcessPayment}
                          disabled={processing}
                        >
                          {processing ? (
                            <div className="flex items-center gap-2">
                              <svg
                                className="animate-spin h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Processing...
                            </div>
                          ) : (
                            "Complete Purchase"
                          )}
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
     <FooterSection
        storeLogo={storeLogo}
        storeName={storeName}
        storeDescription={storeDescription}
        backgroundColor={themeCustomization?.navBarColor || "rgba(0, 0, 0, 0.85)"}
        textColor={themeCustomization?.navBarTextColor || "#ffffff"}
        primaryColor={themeCustomization?.buttonColor || "#3b82f6"}
        footerText={themeCustomization?.footerText}
      />
    </div>
  )
}

export function ClassicTemplate(props: ClassicTemplateProps) {
  return (
    <Elements stripe={stripePromise}>
      <ClassicTemplateInternal {...props} />
    </Elements>
  )
}

export default ClassicTemplate

