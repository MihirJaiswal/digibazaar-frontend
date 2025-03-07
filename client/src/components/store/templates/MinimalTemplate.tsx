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
  DialogFooter,
} from "@/components/ui/dialog";
import { Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useStripe, useElements, CardElement, Elements } from "@stripe/react-stripe-js";
import { useAuthStore } from "@/store/authStore";
import { loadStripe } from "@stripe/stripe-js";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
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

interface MinimalTemplateProps {
  viewMode: "desktop" | "tablet" | "mobile";
  currentPage: string;
  storeName: string;
  storeDescription: string;
  products: Product[];
  storeLogo: string;
  themeCustomization?: ThemeCustomization;
  storeId: string;
  userId: string;
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

// This is the internal component that uses Stripe hooks
function MinimalTemplateInternal({
  viewMode,
  currentPage,
  storeName,
  storeDescription,
  products,
  storeLogo,
  themeCustomization = {},
  storeId,
  userId,
}: MinimalTemplateProps) {
  const { token } = useAuthStore();
  const stripe = useStripe();
  const elements = useElements();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  const openProductDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  const closeProductDialog = () => {
    setIsDialogOpen(false);
    setSelectedProduct(null);
  };

  // When the user clicks "Add to Cart", follow these steps:
  // 1. Create a Payment Intent on the backend.
  // 2. Confirm the card payment via Stripe.
  // 3. If payment succeeds, create the order.
  const handleAddToCart = async () => {
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
        shippingAddress: { address: "123 Main St", city: "City", country: "India" },
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
      const orderData = await orderRes.json();
      toast.success("Order created successfully!");
      closeProductDialog();
    } catch (error: any) {
      console.error("Error creating order:", error);
      toast.error(error.message || "Failed to create order");
    }
    setProcessing(false);
  };

  return (
    <div
      className="min-h-[600px]"
      style={{
        backgroundColor: themeCustomization?.backgroundColor || "#ffffff",
        fontFamily: themeCustomization?.fontFamily || "sans-serif",
        color: themeCustomization?.textColor || "#000000",
      }}
    >
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 shadow-md bg-white dark:bg-gray-900">
        <div className="flex items-center gap-4">
          <Image
            src={storeLogo || "/images/placeholder.png"}
            alt={storeName || "Store Logo"}
            width={50}
            height={50}
            className="rounded-full"
          />
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {storeName}
          </span>
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
        </nav>
        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-gray-900 dark:text-white"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
        {/* Mobile Menu */}
        {menuOpen && (
          <nav className="absolute top-16 left-0 w-full bg-white dark:bg-gray-900 shadow-md p-4 flex flex-col gap-4 md:hidden">
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
          </nav>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative flex flex-col items-center text-center py-20 px-6 md:px-12">
        {themeCustomization?.bannerImage && (
          <div className="absolute inset-0 w-full h-full">
            <Image
              src={themeCustomization.bannerImage}
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
                src={storeLogo || "/images/placeholder.png"}
                alt={storeName || "Store Logo"}
                width={150}
                height={150}
                className="rounded-full shadow-lg"
              />
            </div>
          )}
          {themeCustomization?.bannerText && (
            <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg mb-4">
              {themeCustomization.bannerText}
            </h1>
          )}
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-100 dark:text-gray-300 mb-6">
            {storeDescription}
          </p>
          <Button
            style={{ backgroundColor: themeCustomization?.buttonColor || "#3b82f6" }}
            className="px-8 py-3 text-lg font-medium text-white rounded-lg shadow-lg hover:opacity-90 transition"
          >
            Get Started
          </Button>
        </motion.div>
      </section>

      {/* About Section */}
      <section className="py-16 px-6 md:px-12 bg-gray-100 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            About {storeName}
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            {storeDescription}
          </p>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 md:px-8">
          <motion.h3
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12"
          >
            Featured Products
          </motion.h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="border rounded-lg bg-white dark:bg-gray-800 p-5 shadow-md hover:shadow-xl transition-all"
              >
                <div className="relative w-full aspect-[4/3] mb-4 overflow-hidden rounded-md">
                  <Image
                    src={product.image || "/images/placeholder.png"}
                    alt={product.name || "Product Image"}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {product.name}
                </h4>
                <p className="text-base text-gray-700 dark:text-gray-300 mb-4">
                  Rs.{product.price.toFixed(2)}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => openProductDialog(product)}
                >
                  View Details
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 px-6 md:px-8">
        <div className="container mx-auto">
          <h3 className="text-2xl font-bold text-center mb-8">Why Choose Us</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 border rounded-lg shadow-sm">
              <span className="text-4xl mb-4">🚀</span>
              <h4 className="text-xl font-semibold mb-2">Fast Delivery</h4>
              <p className="text-base">
                Experience speedy delivery with our efficient logistics.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 border rounded-lg shadow-sm">
              <span className="text-4xl mb-4">💎</span>
              <h4 className="text-xl font-semibold mb-2">Quality Assurance</h4>
              <p className="text-base">
                Our products are carefully curated to ensure the highest quality.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 border rounded-lg shadow-sm">
              <span className="text-4xl mb-4">📞</span>
              <h4 className="text-xl font-semibold mb-2">24/7 Support</h4>
              <p className="text-base">
                We provide round-the-clock customer support for all your needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Detail Popup */}
      {selectedProduct && (
        <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) closeProductDialog(); }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedProduct.name}</DialogTitle>
              <DialogDescription>
                {selectedProduct.description || "No description available."}
              </DialogDescription>
            </DialogHeader>
            <div className="relative h-64 w-full mb-4">
              <Image
                src={selectedProduct.image || "/images/placeholder.png"}
                alt={selectedProduct.name || "Product Image"}
                fill
                className="rounded-md object-cover"
              />
            </div>
            {selectedProduct.variants && selectedProduct.variants.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Variants:</h4>
                <ul className="list-disc list-inside">
                  {selectedProduct.variants.map((variant, index) => (
                    <li key={index}>{variant}</li>
                  ))}
                </ul>
              </div>
            )}
            {/* Payment Card Element */}
            <div className="mb-4">
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
            <DialogFooter>
              <Button variant="outline" onClick={closeProductDialog}>
                Close
              </Button>
              <Button className="ml-2" onClick={handleAddToCart} disabled={processing}>
                {processing ? "Processing..." : "Add to Cart"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Footer */}
      <footer className="border-t py-8 px-4 md:px-8 text-center">
        <p className="text-base text-muted">
          {themeCustomization?.footerText ||
            `© ${new Date().getFullYear()} ${storeName}. All rights reserved.`}
        </p>
      </footer>
    </div>
  );
}

// This component wraps the internal component with the Stripe Elements provider
export function MinimalTemplate(props: MinimalTemplateProps) {
  return (
    <Elements stripe={stripePromise}>
      <MinimalTemplateInternal {...props} />
    </Elements>
  );
}

// Default export for convenience
export default MinimalTemplate;