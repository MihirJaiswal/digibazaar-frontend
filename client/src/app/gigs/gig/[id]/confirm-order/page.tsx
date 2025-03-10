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

// Feature item component with animation
function FeatureItem({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
  return (
    <motion.div 
      className="flex items-start gap-3 text-sm"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-muted-foreground text-xs">{description}</p>
      </div>
    </motion.div>
  );
}

// Payment status steps
function PaymentSteps({ currentStep }: { currentStep: number }) {
  const steps = [
    { title: "Review Order", icon: FileText },
    { title: "Payment", icon: CreditCard, active: true },
    { title: "Confirmation", icon: CheckCircle2 }
  ];
  
  return (
    <div className="flex items-center justify-between w-full mb-8 max-w-md mx-auto">
      {steps.map((step, index) => (
        <div key={index} className="flex flex-col items-center">
          <div className={`
            flex items-center justify-center w-10 h-10 rounded-full mb-2
            ${index < currentStep ? "bg-green-100 text-green-600" : 
              index === currentStep ? "bg-primary text-primary-foreground" : 
              "bg-muted text-muted-foreground"}
          `}>
            <step.icon className="h-5 w-5" />
          </div>
          <span className={`text-xs font-medium ${index === currentStep ? "text-primary" : "text-muted-foreground"}`}>
            {step.title}
          </span>
          {index < steps.length - 1 && (
            <div className="hidden sm:block absolute h-0.5 w-12 bg-muted left-0 top-0 transform translate-x-full translate-y-5" />
          )}
        </div>
      ))}
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

  if (!gig) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-12 w-12 rounded-full bg-muted mb-4"></div>
        <div className="h-4 w-48 bg-muted rounded mb-2"></div>
        <div className="h-3 w-32 bg-muted rounded"></div>
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
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6">
      <PaymentSteps currentStep={paymentStep} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order details */}
        <motion.div 
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border shadow-lg overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-zinc-900 dark:to-zinc-950">
            <CardHeader className="bg-primary/5 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Complete Your Order</CardTitle>
                  <CardDescription>You&apos;re almost there! Just a few more details.</CardDescription>
                </div>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  ${gig.price}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                    <Image
                      src={gig.cover || "/placeholder.svg?height=64&width=64"} 
                      alt={gig.title}
                      width={64}
                      height={64}
                      loading="lazy"
                      quality={100}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{gig.title}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-2">{gig.shortDesc || "Professional service tailored to your needs"}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Your Requirements
                  </h4>
                  <Textarea
                    className="min-h-[120px] bg-muted/30 border-muted focus-visible:ring-primary/50"
                    placeholder="Describe your project requirements in detail. The more specific you are, the better results you'll get..."
                    value={requirement}
                    onChange={(e) => setRequirement(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Payment summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="border-0 shadow-lg sticky top-6">
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle className="text-xl">Payment Summary</CardTitle>
            </CardHeader>
            
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service price</span>
                  <span className="font-medium">${gig.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service fee</span>
                  <span className="font-medium">$0</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-lg">${gig.price}</span>
                </div>
              </div>
              
              <div className="bg-muted/30 rounded-lg p-4 space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  Payment Method
                </h4>
                <div className="p-3 bg-white dark:bg-zinc-800 rounded-md border shadow-sm">
                  <CardElement 
                    options={{
                      style: {
                        base: {
                          fontSize: '16px',
                          color: '#424770',
                          '::placeholder': {
                            color: '#aab7c4',
                          },
                        },
                        invalid: {
                          color: '#9e2146',
                        },
                      },
                    }}
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <FeatureItem 
                  icon={ShieldCheck} 
                  title="Secure Payment" 
                  description="Your payment information is encrypted and secure"
                />
                <FeatureItem 
                  icon={Package} 
                  title="Money-back Guarantee" 
                  description="Not satisfied? Get a full refund within 7 days"
                />
                <FeatureItem 
                  icon={Clock} 
                  title="Delivery Time" 
                  description={`Estimated delivery: ${gig.deliveryTime || 3} days`}
                />
              </div>
            </CardContent>
            
            <CardFooter className="px-6 pb-6 pt-0">
              <Button 
                className="w-full h-12 text-base font-medium shadow-md hover:shadow-lg transition-all"
                onClick={handlePlaceOrder} 
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing Payment...
                  </span>
                ) : (
                  "Pay & Place Order"
                )}
              </Button>
            </CardFooter>
          </Card>
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
