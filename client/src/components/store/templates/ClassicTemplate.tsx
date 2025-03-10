"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Menu, X, ShoppingCart, Check, ChevronRight, Star } from 'lucide-react';
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useStripe, useElements, CardElement, Elements } from "@stripe/react-stripe-js";
import { useAuthStore } from "@/store/authStore";
import { loadStripe } from "@stripe/stripe-js";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Product {
  id: string;
  title: string;
  price: number;
  mainImage: string;
  variants?: string[];
  description?: string;
}

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
}

interface ClassicTemplateProps {
  viewMode: "desktop" | "tablet" | "mobile";
  currentPage: string;
  storeName?: string;
  storeDescription?: string;
  products?: Product[];
  storeLogo?: string;
  themeCustomization?: ThemeCustomization;
  storeId?: string;
  userId?: string;
}

interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

// This is the internal component that uses Stripe hooks
function ClassicTemplateInternal({
  storeName = "Classic Store",
  storeDescription = "Enjoy a timeless design that focuses on tradition and quality.",
  products = [],
  storeLogo = "/placeholder.svg?height=50&width=50",
  themeCustomization = {},
  storeId = "",
  userId = "",
}: ClassicTemplateProps) {
  const { token } = useAuthStore();
  const stripe = useStripe();
  const elements = useElements();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'details' | 'shipping' | 'payment'>('details');
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });

  // Use sample products if none are provided
  const displayProducts = products.length > 0 ? products : [
    {
      id: "1",
      name: "Vintage Armchair",
      price: 15999,
      image: "/placeholder.svg?height=400&width=400",
      description: "Handcrafted armchair with premium upholstery and solid wood frame."
    },
    {
      id: "2",
      name: "Brass Table Lamp",
      price: 7499,
      image: "/placeholder.svg?height=400&width=400",
      description: "Elegant brass lamp with adjustable arm and warm lighting."
    },
    {
      id: "3",
      name: "Wooden Bookshelf",
      price: 22999,
      image: "/placeholder.svg?height=400&width=400",
      description: "Solid oak bookshelf with adjustable shelves and traditional craftsmanship."
    },
    {
      id: "4",
      name: "Handwoven Rug",
      price: 12999,
      image: "/placeholder.svg?height=400&width=400",
      description: "Traditional pattern rug made with natural fibers and artisanal techniques."
    }
  ];

  const openProductDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsProductDialogOpen(true);
    setCurrentStep('details');
  };

  const closeProductDialog = () => {
    setIsProductDialogOpen(false);
    setTimeout(() => setSelectedProduct(null), 300);
  };

  const openPaymentDialog = () => {
    setIsProductDialogOpen(false);
    setTimeout(() => {
      setIsPaymentDialogOpen(true);
    }, 300);
  };

  const closePaymentDialog = () => {
    setIsPaymentDialogOpen(false);
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep('payment');
  };

  // When the user clicks "Add to Cart", follow these steps:
  // 1. Create a Payment Intent on the backend.
  // 2. Confirm the card payment via Stripe.
  // 3. If payment succeeds, create the order.
  const handleProcessPayment = async () => {
    if (!selectedProduct) return;
    if (!stripe || !elements) {
      toast.error("Stripe has not loaded. Please refresh and try again.");
      return;
    }
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      toast.error("Payment details not available. Please try again.");
      return;
    }

    setProcessing(true);
    try {
      // Step 1: Create Payment Intent (amount in cents)
      const paymentIntentRes = await fetch(
        "http://localhost:8800/api/orders/payments/create-intent",
        {
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
        }
      );

      if (!paymentIntentRes.ok) {
        throw new Error("Failed to create payment intent");
      }
      const { clientSecret, paymentIntentId } = await paymentIntentRes.json();
      console.log("Payment Intent:", { clientSecret, paymentIntentId });

      // Step 2: Confirm Payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement },
      });

      if (error || paymentIntent?.status !== "succeeded") {
        throw new Error(error?.message || "Payment not completed");
      }
      console.log("Payment succeeded:", paymentIntent);

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
          fullName: shippingAddress.fullName
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
      };

      const orderRes = await fetch("http://localhost:8800/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderPayload),
      });

      if (!orderRes.ok) {
        throw new Error("Failed to create order");
      }
      toast.success("Order placed successfully!");
      closePaymentDialog();
    } catch (error: any) {
      console.error("Error creating order:", error);
      toast.error(error.message || "Failed to create order");
    }
    setProcessing(false);
  };

  const primaryColor = themeCustomization?.buttonColor || "#854d0e";

  return (
    <div className="min-h-[600px] bg-gray-100 font-serif">
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-4">
          <Image
            src={storeLogo || "/placeholder.svg"}
            alt={storeName || "Store Logo"
            }
            width={40}
            height={40}
            className="rounded-full object-cover"
          />
          <span className="text-2xl font-bold text-gray-900">
            {storeName}
          </span>
        </div>
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {["Home", "Products", "About", "Contact"].map((item) => (
            <a
              key={item}
              href="#"
              className="text-base font-medium text-gray-700 hover:text-amber-800 transition-colors duration-200"
            >
              {item}
            </a>
          ))}
          <Button 
            variant="outline" 
            size="icon"
            className="ml-2 relative border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute -top-2 -right-2 bg-amber-700 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              0
            </span>
          </Button>
        </nav>
        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-gray-900"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
        {/* Mobile Menu */}
        {menuOpen && (
          <motion.nav 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-16 left-0 w-full bg-white border-b border-gray-200 shadow-md p-6 flex flex-col gap-6 md:hidden z-30"
          >
            {["Home", "Products", "About", "Contact"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-lg font-medium text-gray-700 hover:text-amber-800 transition-colors duration-200"
                onClick={() => setMenuOpen(false)}
              >
                {item}
              </a>
            ))}
            <Button 
              variant="outline" 
              className="flex items-center justify-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-100"
              onClick={() => setMenuOpen(false)}
            >
              <ShoppingCart className="h-5 w-5" />
              <span>Cart (0)</span>
            </Button>
          </motion.nav>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 bg-amber-50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:w-1/2 text-center lg:text-left"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                {themeCustomization?.bannerText || "Welcome to the Classic Store"}
              </h1>
              <p className="text-xl text-gray-700 mb-8 max-w-xl mx-auto lg:mx-0">
                {storeDescription}
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <Button 
                  size="lg"
                  className="bg-amber-700 hover:bg-amber-800 text-white px-8 py-6 text-lg"
                  style={{ backgroundColor: primaryColor }}
                >
                  Discover Our Collection
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-amber-700 text-amber-700 hover:bg-amber-50 px-8 py-6 text-lg"
                >
                  Learn More
                </Button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:w-1/2"
            >
              <div className="relative h-[400px] w-full rounded-lg overflow-hidden shadow-xl border-8 border-white">
                <Image
                  src={themeCustomization?.bannerImage || "/placeholder.svg?height=400&width=600"}
                  alt="Classic Store"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Timeless Collection
            </h2>
            <div className="w-24 h-1 bg-amber-700 mx-auto my-6" style={{ backgroundColor: primaryColor }}></div>
            <p className="max-w-2xl mx-auto text-gray-700 text-lg">
              Discover our handcrafted selection of premium products designed with traditional craftsmanship and enduring quality.
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
                className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 group"
              >
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name || "Product Image"}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {product.name}
                    </h3>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                      <span className="text-sm ml-1 text-gray-600">4.9</span>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-gray-900 mb-4">
                    ₹{product.price.toLocaleString('en-IN')}
                  </p>
                  <Button
                    className="w-full bg-amber-700 hover:bg-amber-800 text-white"
                    style={{ backgroundColor: primaryColor }}
                    onClick={() => openProductDialog(product)}
                  >
                    View Details
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <Button 
              variant="outline" 
              size="lg"
              className="border-amber-700 text-amber-700 hover:bg-amber-50 px-8"
            >
              View All Products <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-amber-50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row-reverse items-center gap-12">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="lg:w-1/2"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                About {storeName}
              </h2>
              <div className="w-24 h-1 bg-amber-700 my-6" style={{ backgroundColor: primaryColor }}></div>
              <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                {storeDescription}
              </p>
              <p className="text-gray-700 text-lg mb-8 leading-relaxed">
                We are dedicated to preserving traditional craftsmanship while providing exceptional quality. Each piece in our collection is carefully selected to ensure authenticity, durability, and timeless appeal.
              </p>
              <Button
                className="bg-amber-700 hover:bg-amber-800 text-white"
                style={{ backgroundColor: primaryColor }}
              >
                Our Heritage
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="lg:w-1/2"
            >
              <div className="relative h-[400px] w-full rounded-lg overflow-hidden shadow-xl border-8 border-white">
                <Image
                  src="/placeholder.svg?height=400&width=600"
                  alt="About our store"
                  fill
                  className="object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Us
            </h2>
            <div className="w-24 h-1 bg-amber-700 mx-auto my-6" style={{ backgroundColor: primaryColor }}></div>
            <p className="max-w-2xl mx-auto text-gray-700 text-lg">
              We&apos;re committed to providing you with the best shopping experience possible.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white border border-gray-200 p-8 rounded-lg shadow-md"
            >
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mb-6 text-white"
                style={{ backgroundColor: primaryColor }}
              >
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Fast Delivery</h3>
              <p className="text-gray-700">
                Experience speedy delivery with our efficient logistics network. We ensure your products reach you in the shortest time possible, carefully packaged and ready to enhance your home.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white border border-gray-200 p-8 rounded-lg shadow-md"
            >
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mb-6 text-white"
                style={{ backgroundColor: primaryColor }}
              >
                <span className="text-2xl">💎</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Artisanal Quality</h3>
              <p className="text-gray-700">
                Our products are carefully curated to ensure the highest quality. We stand behind everything we sell with our satisfaction guarantee and commitment to traditional craftsmanship.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-white border border-gray-200 p-8 rounded-lg shadow-md"
            >
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mb-6 text-white"
                style={{ backgroundColor: primaryColor }}
              >
                <span className="text-2xl">📞</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Personal Service</h3>
              <p className="text-gray-700">
                We provide attentive customer support for all your needs. Our dedicated team is always ready to assist you with any questions or concerns about your purchase.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Product Detail Dialog */}
      {selectedProduct && (
        <Dialog 
          open={isProductDialogOpen} 
          onOpenChange={(open) => { if (!open) closeProductDialog(); }}
        >
          <DialogContent className="max-w-3xl p-0 overflow-hidden bg-white">
            <div className="flex flex-col md:flex-row">
              {/* Product Image */}
              <div className="md:w-1/2 relative">
                <div className="relative h-[300px] md:h-full w-full">
                  <Image
                    src={selectedProduct.mainImage || "/placeholder.svg?height=600&width=600"}
                    alt={selectedProduct.title || "Product Image"}
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
                      <DialogTitle className="text-2xl font-bold text-gray-900">{selectedProduct.title}</DialogTitle>
                      <div className="flex items-center mt-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="h-4 w-4 text-amber-500 fill-amber-500" />
                          ))}
                        </div>
                        <span className="text-sm ml-2 text-gray-600">(42 reviews)</span>
                      </div>
                    </div>
                    <Badge className="text-lg px-3 py-1 bg-amber-700">₹{selectedProduct.price.toLocaleString('en-IN')}</Badge>
                  </div>
                </DialogHeader>
                
                <Tabs defaultValue="description" className="flex-1">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="description">Description</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                  </TabsList>
                  <TabsContent value="description" className="mt-4">
                    <DialogDescription className="text-base text-gray-700">
                      {selectedProduct.description || 
                        "This premium product is crafted with traditional techniques and the finest materials. Each piece is unique and made to last for generations, bringing timeless elegance to your home."}
                    </DialogDescription>
                  </TabsContent>
                  <TabsContent value="details" className="mt-4">
                    {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold mb-2 text-gray-900">Available Variants:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {selectedProduct.variants.map((variant, index) => (
                            <li key={index} className="text-gray-700">{variant}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium text-gray-900">SKU:</span> {selectedProduct.id}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium text-gray-900">Category:</span> Heritage Collection
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium text-gray-900">In Stock:</span> Yes
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="mt-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <Button 
                      className="flex-1 bg-amber-700 hover:bg-amber-800 text-white"
                      style={{ backgroundColor: primaryColor }}
                      onClick={openPaymentDialog}
                    >
                      Buy Now
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 border-amber-700 text-amber-700 hover:bg-amber-50"
                    >
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
          onOpenChange={(open) => { if (!open) closePaymentDialog(); }}
        >
          <DialogContent className="max-w-2xl p-6 bg-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900">Complete Your Purchase</DialogTitle>
              <DialogDescription className="text-gray-700">
                You&apos;re purchasing {selectedProduct.title} for ₹{selectedProduct.price.toLocaleString('en-IN')}
              </DialogDescription>
            </DialogHeader>
            
            <div className="mt-6">
              <div className="flex items-center mb-6">
                <div 
                  className="w-8 h-8 rounded-full text-white flex items-center justify-center mr-3"
                  style={{ backgroundColor: currentStep === 'details' ? primaryColor : '#10b981' }}
                >
                  {currentStep === 'details' ? '1' : <Check className="h-5 w-5" />}
                </div>
                <div className="h-1 flex-1 bg-gray-200">
                  <div 
                    className="h-full transition-all duration-300"
                    style={{ 
                      width: currentStep === 'details' ? '0%' : currentStep === 'shipping' ? '50%' : '100%',
                      backgroundColor: primaryColor
                    }}
                  ></div>
                </div>
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center mx-3 ${
                    currentStep === 'details' 
                      ? 'bg-gray-200 text-gray-600' 
                      : currentStep === 'shipping' 
                        ? 'text-white' 
                        : 'text-white'
                  }`}
                  style={{ backgroundColor: currentStep !== 'details' ? primaryColor : undefined }}
                >
                  {currentStep === 'shipping' ? '2' : currentStep === 'payment' ? <Check className="h-5 w-5" /> : '2'}
                </div>
                <div className="h-1 flex-1 bg-gray-200">
                  <div 
                    className="h-full transition-all duration-300"
                    style={{ 
                      width: currentStep === 'payment' ? '100%' : '0%',
                      backgroundColor: primaryColor
                    }}
                  ></div>
                </div>
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center ml-3 ${
                    currentStep === 'payment' 
                      ? 'text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}
                  style={{ backgroundColor: currentStep === 'payment' ? primaryColor : undefined }}
                >
                  3
                </div>
              </div>
              
              {currentStep === 'details' && (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
                    <div className="flex items-start gap-4">
                      <div className="relative h-16 w-16 flex-shrink-0">
                        <Image
                          src={selectedProduct.mainImage || "/placeholder.svg?height=64&width=64"}
                          alt={selectedProduct.title || "Product Image"}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{selectedProduct.mainImage}</h4>
                        <p className="text-sm text-gray-600">Quantity: 1</p>
                        <p className="font-bold mt-1 text-gray-900">₹{selectedProduct.price.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full bg-amber-700 hover:bg-amber-800 text-white"
                    style={{ backgroundColor: primaryColor }}
                    onClick={() => setCurrentStep('shipping')}
                  >
                    Continue to Shipping
                  </Button>
                </div>
              )}
              
              {currentStep === 'shipping' && (
                <form onSubmit={handleShippingSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                        Full Name
                      </label>
                      <input
                        id="fullName"
                        type="text"
                        className="w-full p-2 border rounded-md border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                        value={shippingAddress.fullName}
                        onChange={(e) => setShippingAddress({...shippingAddress, fullName: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="address" className="text-sm font-medium text-gray-700">
                        Address
                      </label>
                      <input
                        id="address"
                        type="text"
                        className="w-full p-2 border rounded-md border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                        value={shippingAddress.address}
                        onChange={(e) => setShippingAddress({...shippingAddress, address: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="city" className="text-sm font-medium text-gray-700">
                        City
                      </label>
                      <input
                        id="city"
                        type="text"
                        className="w-full p-2 border rounded-md border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="state" className="text-sm font-medium text-gray-700">
                        State
                      </label>
                      <input
                        id="state"
                        type="text"
                        className="w-full p-2 border rounded-md border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="postalCode" className="text-sm font-medium text-gray-700">
                        Postal Code
                      </label>
                      <input
                        id="postalCode"
                        type="text"
                        className="w-full p-2 border rounded-md border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                        value={shippingAddress.postalCode}
                        onChange={(e) => setShippingAddress({...shippingAddress, postalCode: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="country" className="text-sm font-medium text-gray-700">
                        Country
                      </label>
                      <select
                        id="country"
                        className="w-full p-2 border rounded-md border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                        value={shippingAddress.country}
                        onChange={(e) => setShippingAddress({...shippingAddress, country: e.target.value})}
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
                    <Button 
                      type="button" 
                      variant="outline"
                      className="border-amber-700 text-amber-700 hover:bg-amber-50"
                      onClick={() => setCurrentStep('details')}
                    >
                      Back
                    </Button>
                    <Button 
                      type="submit"
                      className="bg-amber-700 hover:bg-amber-800 text-white"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Continue to Payment
                    </Button>
                  </div>
                </form>
              )}
              
              {currentStep === 'payment' && (
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="font-medium mb-2 text-gray-900">Payment Details</h4>
                    <div className="p-4 border rounded-md bg-white border-gray-300">
                      <CardElement
                        options={{
                          style: {
                            base: {
                              fontSize: "16px",
                              color: "#374151",
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
                  
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700">Subtotal</span>
                      <span className="text-gray-900">₹{selectedProduct.price.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700">Shipping</span>
                      <span className="text-gray-900">₹0.00</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700">Tax</span>
                      <span className="text-gray-900">₹{(selectedProduct.price * 0.18).toLocaleString('en-IN')}</span>
                    </div>
                    <Separator className="my-2 bg-gray-200" />
                    <div className="flex justify-between font-bold">
                      <span className="text-gray-900">Total</span>
                      <span className="text-gray-900">₹{(selectedProduct.price * 1.18).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button 
                      variant="outline"
                      className="border-amber-700 text-amber-700 hover:bg-amber-50"
                      onClick={() => setCurrentStep('shipping')}
                    >
                      Back
                    </Button>
                    <Button 
                      className="bg-amber-700 hover:bg-amber-800 text-white"
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
      <footer className="bg-amber-50 py-12 px-4 md:px-8">
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
export function ClassicTemplate(props: ClassicTemplateProps) {
  return (
    <Elements stripe={stripePromise}>
      <ClassicTemplateInternal {...props} />
    </Elements>
  )
}

// Default export for convenience
export default ClassicTemplate
