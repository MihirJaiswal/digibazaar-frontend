"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/store/authStore";
import type { Gig } from "@/app/gigs/types/gig";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import StripeProvider from "@/components/gigs/StripeProvider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Clock, CreditCard, FileText, type LucideIcon, Package, ShieldCheck } from 'lucide-react';
import { motion } from "framer-motion";
import Image from "next/image";

// Feature item component with improved animation
function FeatureItem({ icon: Icon, title }: { icon: LucideIcon; title: string;}) {
  return (
    <motion.div 
      className="flex flex-col items-center gap-4 p-3 rounded-lg hover:bg-primary/5 transition-colors"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-primary/10 p-2 rounded-full">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="flex items-center justify-center">
        <p className="font-medium text-sm">{title}</p>
      </div>
    </motion.div>
  );
}

// Improved payment steps with animation
function PaymentSteps({ currentStep }: { currentStep: number }) {
  const steps = [
    { title: "Review Order", icon: FileText },
    { title: "Payment", icon: CreditCard },
    { title: "Confirmation", icon: CheckCircle2 }
  ];
  
  return (
    <div className="relative max-w-2xl mx-auto mb-12">
      {/* Connecting line */}
      <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted" />
      
      <div className="flex items-center justify-between w-full relative">
        {steps.map((step, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex flex-col items-center relative z-10"
          >
            <div className={`
              flex items-center justify-center w-10 h-10 rounded-full mb-2 transition-all duration-300
              ${index < currentStep ? "bg-green-500 text-white scale-110" : 
                index === currentStep ? "bg-primary text-primary-foreground scale-110 ring-4 ring-primary/20" : 
                "bg-muted text-muted-foreground"}
            `}>
              <step.icon className="h-5 w-5" />
            </div>
            <span className={`text-xs font-medium ${index === currentStep ? "text-primary" : "text-muted-foreground"}`}>
              {step.title}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ConfirmOrderContent() {
  const router = useRouter();
  const params = useParams();
  const { token } = useAuthStore();
  const [gig, setGig] = useState<Gig | null>(null);
  const [requirement, setRequirement] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState(1);

  // Stripe hooks
  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    if (!params?.id) return;

    fetch(`http://localhost:8800/api/gigs/${params.id}`)
      .then((res) => res.json())
      .then((data) => setGig(data))
      .catch((err) => console.error("❌ Error fetching gig:", err));
  }, [params?.id, token, router]);

  // Modern loading skeleton
  if (!gig) return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="flex flex-col items-center space-y-6 w-full max-w-md">
        <div className="w-full space-y-4">
          <div className="h-6 w-3/4 mx-auto bg-muted rounded-full animate-pulse"></div>
          <div className="h-4 w-1/2 mx-auto bg-muted rounded-full animate-pulse"></div>
        </div>
        <div className="w-full space-y-3">
          <div className="h-20 w-full bg-muted rounded-lg animate-pulse"></div>
          <div className="h-20 w-full bg-muted rounded-lg animate-pulse"></div>
          <div className="h-20 w-full bg-muted rounded-lg animate-pulse"></div>
        </div>
        <div className="h-12 w-full bg-muted rounded-full animate-pulse"></div>
      </div>
    </div>
  );

  const handlePlaceOrder = async () => {
    if (!requirement.trim()) {
      alert("❌ Please enter your requirement.");
      return;
    }

    if (!stripe || !elements) {
      console.error("❌ Stripe.js has not loaded properly.");
      alert("Stripe failed to load. Please refresh and try again.");
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      console.error("❌ CardElement is not available.");
      alert("Payment method not found. Please refresh and try again.");
      return;
    }

    setLoading(true);

    try {
      console.log("📌 Step 1: Requesting Payment Intent...");
      const paymentIntentRes = await fetch("http://localhost:8800/api/gig-orders/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ gigId: gig.id }),
      });

      if (!paymentIntentRes.ok) throw new Error("❌ Failed to create payment intent");

      const { clientSecret, paymentIntentId } = await paymentIntentRes.json();
      console.log("✅ Step 1: Received Payment Intent:", { clientSecret, paymentIntentId });

      console.log("📌 Step 2: Confirming Payment with Stripe...");
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement },
      });

      if (error) {
        console.error("❌ Payment Error:", error);
        alert(`Payment failed: ${error.message}`);
        setLoading(false);
        return;
      }

      setPaymentStep(2);
      console.log("✅ Payment successful:", paymentIntent);

      console.log("📌 Step 3: Confirming Order with Backend...");
      const confirmOrderRes = await fetch("http://localhost:8800/api/gig-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          gigId: gig.id,
          paymentIntentId,
          requirement,
        }),
      });

      if (!confirmOrderRes.ok) throw new Error("❌ Failed to confirm order");

      console.log("✅ Order confirmed! Redirecting to dashboard...");
      
      // Show success state briefly before redirecting
      setTimeout(() => {
        router.push("/gigs/orders");
      }, 1500);
      
    } catch (error: any) {
      console.error("❌ Error placing order:", error);
      alert(`❌ Failed to place order: ${error.message || "Unknown error"}`);
    }

    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-b from-white to-gray-50 dark:from-zinc-900 dark:to-zinc-950 py-16 px-4 sm:px-6 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <PaymentSteps currentStep={paymentStep} />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Order details */}
          <motion.div 
            className="lg:col-span-7"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="border shadow-xl overflow-hidden bg-white dark:bg-zinc-950 rounded-xl">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b px-6 py-5">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold">Complete Your Order</CardTitle>
                    <CardDescription className="text-sm mt-1">You&apos;re just moments away from getting started</CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-3 py-1 text-sm font-semibold">
                    ${gig.price}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="p-6 space-y-8">
                <motion.div 
                  className="flex items-start gap-5 p-4 bg-muted/20 rounded-xl"
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="h-20 w-20 rounded-lg overflow-hidden bg-muted flex-shrink-0 shadow-md">
                    <Image
                      src={gig.cover || "/placeholder.svg?height=80&width=80"} 
                      alt={gig.title}
                      width={80}
                      height={80}
                      loading="lazy"
                      quality={100}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{gig.title}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 mt-1">{gig.shortDesc || "Professional service tailored to your needs"}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Delivery in {gig.deliveryTime || 3} days</span>
                    </div>
                  </div>
                </motion.div>
                
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5 text-primary" />
                    Project Requirements
                  </h4>
                  <p className="text-sm text-muted-foreground">Describe your project in detail to help the seller understand your needs</p>
                  <Textarea
                    className="min-h-[180px] bg-muted/10 border-muted rounded-xl resize-none focus-visible:ring-primary/30 focus-visible:ring-offset-2 transition-all duration-200"
                    placeholder="Please provide specific details about your project requirements. The more information you provide, the better the seller can meet your expectations..."
                    value={requirement}
                    onChange={(e) => setRequirement(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Payment summary */}
          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="border shadow-xl sticky top-6 rounded-xl overflow-hidden bg-white dark:bg-zinc-950">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b px-6 py-5">
                <CardTitle className="text-xl font-bold">Payment Summary</CardTitle>
              </CardHeader>
              
              <CardContent className="p-6 space-y-6">
                <div className="space-y-3 bg-muted/10 p-4 rounded-xl">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service price</span>
                    <span className="font-medium">${gig.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service fee</span>
                    <span className="font-medium">$0</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-lg">${gig.price}</span>
                  </div>
                </div>
                
                <div className="bg-muted/10 rounded-xl p-5 space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Payment Method
                  </h4>
                  <div className="p-4 bg-white dark:bg-zinc-800 rounded-xl border shadow-sm">
                    <CardElement 
                      options={{
                        style: {
                          base: {
                            fontSize: '16px',
                            color: '#424770',
                            '::placeholder': {
                              color: '#aab7c4',
                            },
                            iconColor: '#6366f1',
                          },
                          invalid: {
                            color: '#ef4444',
                            iconColor: '#ef4444',
                          },
                        },
                        hidePostalCode: true,
                      }}
                    />
                  </div>
                </div>
                
                <div className="flex">
                  <FeatureItem 
                    icon={ShieldCheck} 
                    title="Secure Payment" 
                  />
                  <FeatureItem 
                    icon={Package} 
                    title="Money-back Guarantee" 
                  />
                  <FeatureItem 
                    icon={Clock} 
                    title="Delivery Time" 
                  />
                </div>
              </CardContent>
              
              <CardFooter className="px-6 pb-6 pt-0">
                <Button 
                  className="w-full h-14 text-base font-medium shadow-lg hover:shadow-xl transition-all rounded-xl"
                  onClick={handlePlaceOrder} 
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing Payment...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Pay & Place Order
                    </span>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
        
        {/* Trust badges */}
        <motion.div 
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border shadow-md inline-flex gap-8 items-center">
            <div className="flex flex-col items-center">
              <ShieldCheck className="h-8 w-8 text-primary mb-2" />
              <span className="text-xs font-medium">Secure Payments</span>
            </div>
            <div className="h-10 w-px bg-muted" />
            <div className="flex flex-col items-center">
              <CheckCircle2 className="h-8 w-8 text-primary mb-2" />
              <span className="text-xs font-medium">Quality Guarantee</span>
            </div>
            <div className="h-10 w-px bg-muted" />
            <div className="flex flex-col items-center">
              <Package className="h-8 w-8 text-primary mb-2" />
              <span className="text-xs font-medium">Full Support</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Wrap the component inside StripeProvider
export default function WrappedConfirmOrder() {
  return (
    <StripeProvider>
      <ConfirmOrderContent />
    </StripeProvider>
  );
}