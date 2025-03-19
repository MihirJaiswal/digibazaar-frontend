"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, TruckIcon, PackageIcon, CheckIcon, ArrowRightIcon, AlertTriangleIcon, BuildingIcon, ClipboardCheckIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/global/Header";

interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDeliveryDays: number;
}

export default function ShippingSelection() {
  const { id: orderId } = useParams();
  const router = useRouter();
  const {  token } = useAuthStore();

  const [warehouseId, setWarehouseId] = useState<string | null>(null);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Retrieve warehouseId from LocalStorage when component loads
  useEffect(() => {
    const storedWarehouseId = localStorage.getItem("selectedWarehouseId");
    if (storedWarehouseId) {
      setWarehouseId(storedWarehouseId);
      console.log("🏬 Retrieved Warehouse ID from LocalStorage:", storedWarehouseId);
    } else {
      console.error("❌ Warehouse ID not found in LocalStorage.");
    }
  }, []);

  // Fetch available shipping methods from the API
  useEffect(() => {
    const fetchShippingMethods = async () => {
      try {
        console.log("📡 Fetching shipping methods...");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/shipments/shipping-methods`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to fetch shipping methods");

        const data = await res.json();
        console.log("✅ Shipping Methods Fetched:", data);
        setShippingMethods(data);
      } catch (error) {
        console.error("❌ Error fetching shipping methods:", error);
        toast.error("Error fetching shipping methods.");
      } finally {
        setLoading(false);
      }
    };

    fetchShippingMethods();
  }, []);

  // Assign shipping method to the order
  const handleAssignShippingMethod = async () => {
    if (!selectedMethod) {
      toast.error("Please select a shipping method.");
      return;
    }
  
    if (!orderId) {
      toast.error("Order ID is missing!");
      return;
    }
  
    if (!warehouseId) {
      toast.error("Warehouse ID is missing! Please go back and assign a warehouse first.");
      return;
    }
  
    setIsProcessing(true);
  
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/shipments/orders/${orderId}/ship`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${token}` 
        },
        credentials: "include",
        body: JSON.stringify({ orderId, warehouseId, shippingMethodId: selectedMethod }),
      });
  
      if (!res.ok) throw new Error("Failed to assign shipping method");
  
      const data = await res.json(); // ✅ Extract tracking number
      console.log("✅ Shipping Method Assigned:", data);
  
      if (data.shipment && data.shipment.trackingNumber) {
        setTrackingNumber(data.shipment.trackingNumber); // ✅ Store tracking number
        toast.success(`Shipping assigned! Tracking: ${data.shipment.trackingNumber}`);
      } else {
        toast.error("Shipping assigned, but tracking number not found.");
      }
  
      setCurrentStep(3); // ✅ Move to next step (Shipment Confirmation)
    } catch (error) {
      console.error("❌ Error assigning shipping method:", error);
      toast.error("Failed to assign shipping method.");
    } finally {
      setIsProcessing(false);
    }
  };
  

  // Generate tracking number for the order

  // Mark order as shipped
  const handleMarkAsShipped = async () => {
    router.push('/inventory/orders')
  };

  // Get selected shipping method details
  const getSelectedShippingMethod = () => {
    return shippingMethods.find(m => m.id === selectedMethod);
  };

  return (
    <div className=" bg-white dark:bg-zinc-900">
    <Header/>
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <Card className="shadow-xl border overflow-hidden">
        <CardHeader className="bg-white dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-700 pb-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <TruckIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Shipping Configuration</CardTitle>
              <CardDescription className="text-slate-500">
                Configure shipping details for order <span className="font-medium text-primary">{orderId}</span>
              </CardDescription>
            </div>
          </div>
          
          {/* Progress indicator */}
          <div className="mt-6">
            <Progress value={currentStep * 33.33} className="h-2" />
            <div className="flex justify-between mt-2 text-xs text-slate-500">
              <div className={`flex flex-col items-center ${currentStep >= 1 ? "text-primary font-medium" : ""}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${
                  currentStep >= 1 ? "bg-primary text-white dark:text-black" : "bg-slate-200 dark:bg-zinc-600"
                }`}>1</div>
                <span>Select Method</span>
              </div>
              <div className={`flex flex-col items-center ${currentStep >= 2 ? "text-primary font-medium" : ""}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${
                  currentStep >= 2 ? "bg-primary text-white dark:text-black" : "bg-slate-200 dark:bg-zinc-600"
                }`}>2</div>
                <span>Generate Tracking</span>
              </div>
              <div className={`flex flex-col items-center ${currentStep >= 3 ? "text-primary font-medium" : ""}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${
                  currentStep >= 3 ? "bg-primary text-white dark:text-black" : "bg-slate-200 dark:bg-zinc-600"
                }`}>3</div>
                <span>Ship Order</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6 pb-2 space-y-6">
          {!warehouseId && (
            <Alert variant="destructive" className="mb-4 border-red-200 bg-red-50">
              <AlertTriangleIcon className="h-4 w-4" />
              <AlertTitle className="font-semibold">Warehouse not selected</AlertTitle>
              <AlertDescription>
                Please go back and select a warehouse before configuring shipping.
              </AlertDescription>
            </Alert>
          )}

          {warehouseId && (
            <Alert className="mb-4 border-green-200">
              <BuildingIcon className="h-4 w-4 text-green-600" />
              <AlertTitle className="font-semibold text-green-700">Warehouse Selected</AlertTitle>
              <AlertDescription className="text-green-600">
                Warehouse ID: {warehouseId}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-8">
            {/* Step 1: Select Shipping Method */}
            <div className={`transition-all duration-300 ${currentStep === 1 ? "opacity-100" : "opacity-70"}`}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  currentStep === 1 ? "bg-primary text-white dark:text-black" : "bg-slate-200 text-slate-600 dark:bg-zinc-900 dark:text-gray-200"
                }`}>1</div>
                <h3 className="text-lg font-semibold">Select Shipping Method</h3>
              </div>
              
              {loading ? (
                <div className="flex items-center gap-2 text-slate-500 p-4 bg-slate-50 dark:bg-zinc-900 rounded-lg">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading shipping methods...</span>
                </div>
              ) : shippingMethods.length === 0 ? (
                <Alert variant="destructive" className="mb-4">
                  <AlertTriangleIcon className="h-4 w-4" />
                  <AlertTitle>No shipping methods available</AlertTitle>
                  <AlertDescription>
                    Please contact system administrator to set up shipping methods.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="p-4 rounded-lg">
                  <Select onValueChange={(value) => setSelectedMethod(value)}>
                    <SelectTrigger className="w-full border-slate-300 dark:border-zinc-700">
                      <SelectValue placeholder="Choose a shipping method" />
                    </SelectTrigger>
                    <SelectContent>
                      {shippingMethods.map((method) => (
                        <SelectItem key={method.id} value={method.id} className="py-3">
                          <div className="flex items-center justify-between w-full gap-4">
                            <span className="font-medium">{method.name}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                                ${method.price}
                              </Badge>
                              <Badge variant="secondary" className="bg-slate-100 dark:bg-blue-800">
                                {method.estimatedDeliveryDays} days
                              </Badge>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedMethod && (
                    <div className="mt-4 p-4 rounded-md border border-slate-200 dark:border-zinc-700 shadow-sm">
                      <h4 className="font-medium text-primary mb-2 flex items-center gap-2">
                        <CheckIcon className="h-4 w-4" /> Selected Method:
                      </h4>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-800">{getSelectedShippingMethod()?.name}</p>
                          <p className="text-sm text-slate-500 mt-1">{getSelectedShippingMethod()?.description}</p>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          <Badge className="bg-primary/10 text-primary border-primary/30 px-3 py-1">
                            ${getSelectedShippingMethod()?.price}
                          </Badge>
                          <Badge variant="outline" className="px-3 py-1">
                            {getSelectedShippingMethod()?.estimatedDeliveryDays} days delivery
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-4">
                    <Button 
                      onClick={handleAssignShippingMethod} 
                      className="w-full" 
                      disabled={isProcessing || !selectedMethod || !warehouseId}
                      size="lg"
                    >
                      {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckIcon className="mr-2 h-4 w-4" />}
                      Assign Shipping Method
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <Separator className="my-6" />

            {/* Step 2: Generate Tracking Information */}
            <div className={`transition-all duration-300 ${currentStep === 2 ? "opacity-100" : "opacity-70"}`}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  currentStep === 2 ? "bg-primary text-white" : currentStep > 2 ? "bg-green-500 text-white" : "bg-slate-200 text-slate-600"
                }`}>2</div>
                <h3 className="text-lg font-semibold">Generate Tracking Information</h3>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
              {trackingNumber && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 dark:border-zinc-700 rounded-md">
                  <h4 className="font-medium text-green-700 mb-2 flex items-center gap-2">
                    <ClipboardCheckIcon className="h-4 w-4" /> Tracking Information:
                  </h4>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <PackageIcon className="text-green-600 mr-2 h-4 w-4" />
                      <code className="font-mono bg-white px-3 py-2 rounded border border-green-200 dark:border-zinc-700 text-green-800 flex-1 text-center">
                        {trackingNumber}
                      </code>
                    </div>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(trackingNumber);
                        toast.success("Tracking number copied!");
                      }}
                      className="ml-2 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-all"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                
                )}
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col bg-slate-50 dark:bg-black rounded-b-lg pt-6 pb-4 border-t border-slate-200 dark:border-zinc-700 mt-6">
          <Button 
            onClick={handleMarkAsShipped} 
            className="w-full gap-2 bg-primary hover:bg-primary/90" 
            variant="default" 
            size="lg"
            disabled={isProcessing || !trackingNumber || currentStep < 3}
          >
            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TruckIcon className="mr-2 h-5 w-5" />}
            Mark as Shipped & Continue
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </Button>
          <p className="text-xs text-center text-slate-500 mt-3">
            This will update the order status and notify the customer.
          </p>
        </CardFooter>
      </Card>
    </div>
    </div>
  );
}
