"use client";
import React from "react";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Coins,
  FileImage,
  Loader2,
  Plus,
  Sparkles,
  Tag,
  Trash2,
  Trophy,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import dynamic from "next/dynamic";
import Image from "next/image";

// Dynamically import components that aren't needed on initial load
const Header = dynamic(() => import("@/components/global/Header"), { ssr: false });
const GigsSidebar = dynamic(() => import("@/components/gigs/GigsSidebar"), { ssr: false });

// Sample categories (make sure these align with your new StoreCategory enum)
const categories = [
  { value: "FASHION", label: "Fashion", icon: "👗" },
  { value: "ELECTRONICS", label: "Electronics", icon: "📱" },
  { value: "GROCERY", label: "Grocery", icon: "🛒" },
  { value: "HOME_DECOR", label: "Home Decor", icon: "🏠" },
  // add additional product categories as needed
];

const FeatureCard = React.memo(function FeatureCard({
  value,
  onChange,
  onRemove,
  index,
}: {
  value: string;
  onChange: (value: string) => void;
  onRemove: () => void;
  index: number;
}) {
  return (
    <motion.div
      className="relative group"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex gap-2 p-3 border rounded-lg bg-card">
        <div className="flex-1">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Feature ${index + 1}`}
            className="border-0 shadow-none bg-transparent px-0 h-auto py-0 focus-visible:ring-0"
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
    </motion.div>
  );
});

const ProgressIndicator = React.memo(function ProgressIndicator({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) {
  return (
    <div className="w-full mb-8">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium">Progress</span>
        <span className="text-sm text-muted-foreground">
          {currentStep}/{totalSteps}
        </span>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );
});

const StepIndicator = React.memo(function StepIndicator({
  steps,
  currentStep,
  onStepClick,
}: {
  steps: { title: string; icon: React.ReactNode }[];
  currentStep: number;
  onStepClick: (step: number) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row justify-between mb-8 gap-4">
      {steps.map((step, index) => (
        <button
          key={index}
          onClick={() => onStepClick(index + 1)}
          disabled={index + 1 > currentStep}
          className={`
            flex items-center gap-3 p-3 rounded-lg transition-all
            ${
              index + 1 === currentStep
                ? "bg-primary text-primary-foreground"
                : index + 1 < currentStep
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }
          `}
        >
          <div className="flex-shrink-0">{step.icon}</div>
          <span className="font-medium">{step.title}</span>
        </button>
      ))}
    </div>
  );
});

export default function CreateGigPage() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [previewMode, setPreviewMode] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  // Updated form data for supplier listing
  const [formData, setFormData] = useState({
    title: "",
    description: "", // Full product description
    categoryId: "",
    bulkPrice: "", // Price per unit for bulk orders
    minOrderQty: "", // Minimum Order Quantity
    leadTime: "", // Fulfillment time in days
    supplyCapacity: "", // Optional: Maximum units per month
    features: [""],
  });

  const [mediaState, setMediaState] = useState({
    coverFile: null as File | null,
    coverPreview: "",
    imageFiles: [] as File[],
    imagePreviews: [] as string[],
  });

  // Updated steps
  const steps = useMemo(() => [
    {
      title: "Basic Info",
      icon: <Tag className="h-5 w-5" />,
      fields: ["title", "description"],
    },
    {
      title: "Pricing & Terms",
      icon: <Coins className="h-5 w-5" />,
      fields: ["categoryId", "bulkPrice", "minOrderQty", "leadTime"],
    },
    {
      title: "Media & Supply",
      icon: <FileImage className="h-5 w-5" />,
      fields: ["cover", "images", "supplyCapacity", "features"],
    },
  ], []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [step]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSelectChange = useCallback((value: string) => {
    setFormData((prev) => ({ ...prev, categoryId: value }));
  }, []);

  const addFeature = useCallback(() => {
    setFormData((prev) => ({ ...prev, features: [...prev.features, ""] }));
  }, []);

  const updateFeature = useCallback((index: number, value: string) => {
    setFormData((prev) => {
      const updatedFeatures = [...prev.features];
      updatedFeatures[index] = value;
      return { ...prev, features: updatedFeatures };
    });
  }, []);

  const removeFeature = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  }, []);

  const handleNext = useCallback(() => setStep((s) => Math.min(s + 1, steps.length)), [steps.length]);
  const handleBack = useCallback(() => setStep((s) => Math.max(s - 1, 1)), []);
  const handleStepClick = useCallback((newStep: number) => {
    setStep((current) => (newStep <= current ? newStep : current));
  }, []);

  const isCurrentStepValid = useCallback(() => {
    const currentStepFields = steps[step - 1].fields;
    return currentStepFields.every((field) => {
      if (field === "features") {
        return formData.features.length > 0 && formData.features[0].trim() !== "";
      }
      if (field === "cover" || field === "images") {
        return step !== 3 || mediaState.coverFile !== null;
      }
      // @ts-ignore - Dynamic access
      const value = formData[field];
      return value !== undefined && value !== "";
    });
  }, [step, steps, formData, mediaState.coverFile]);

  const handleCoverChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (mediaState.coverPreview) {
        URL.revokeObjectURL(mediaState.coverPreview);
      }
      const preview = URL.createObjectURL(file);
      setMediaState((prev) => ({
        ...prev,
        coverFile: file,
        coverPreview: preview,
      }));
    }
  }, [mediaState.coverPreview]);

  const handleImagesChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      mediaState.imagePreviews.forEach((url) => URL.revokeObjectURL(url));
      const files = Array.from(e.target.files);
      const previews = files.map((file) => URL.createObjectURL(file));
      setMediaState((prev) => ({
        ...prev,
        imageFiles: files,
        imagePreviews: previews,
      }));
    }
  }, [mediaState.imagePreviews]);

  useEffect(() => {
    return () => {
      if (mediaState.coverPreview) URL.revokeObjectURL(mediaState.coverPreview);
      mediaState.imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const handleSubmitGig = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const formPayload = new FormData();

      // Append updated text fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "features") {
          formPayload.append(key, JSON.stringify(value));
        } else {
          formPayload.append(key, String(value));
        }
      });
      
      // Append userId if available
      if (user?.id) formPayload.append("userId", user.id);

      // Append media files
      if (mediaState.coverFile) formPayload.append("cover", mediaState.coverFile);
      if (mediaState.imageFiles.length > 0) {
        mediaState.imageFiles.forEach((file) => {
          formPayload.append("images", file);
        });
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gigs`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formPayload,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to create supplier listing");
      }

      toast.success("Supplier listing created successfully!");
      router.push("/gigs/gig");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
      console.error("Error creating supplier listing:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, mediaState, user, token, router]);

  const GigPreview = useMemo(() => () => {
    const categoryItem = categories.find((c) => c.value === formData.categoryId);
    
    return (
      <div className="rounded-xl overflow-hidden border shadow-lg bg-card">
        <div className="h-48 bg-muted relative">
          {mediaState.coverPreview ? (
            <Image
              src={mediaState.coverPreview || "./placeholder.svg"}
              alt={formData.title || "listing preview"}
              quality={100}
              height={1920}
              width={1080}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/5 to-primary/20">
              <FileImage className="h-12 w-12 text-muted-foreground/50" />
            </div>
          )}
          {formData.categoryId && (
            <Badge className="absolute top-3 left-3 bg-black/70 text-white hover:bg-black/70">
              {categoryItem?.icon || "🔍"} {categoryItem?.label || "Category"}
            </Badge>
          )}
        </div>
        <div className="p-5">
          <h3 className="font-semibold text-lg line-clamp-2 mb-2">
            {formData.title || "Your product title"}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {formData.description || "Detailed description of your product..."}
          </p>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Lead Time: {formData.leadTime || "0"} day{formData.leadTime !== "1" ? "s" : ""}
            </span>
          </div>
          <Separator className="my-4" />
          <div className="flex items-center justify-between">
            <div className="text-right">
              <span className="text-xs text-muted-foreground">BULK PRICE</span>
              <p className="font-bold text-lg">₹{formData.bulkPrice || "0"}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-muted-foreground">MOQ</span>
              <p className="font-bold text-lg">{formData.minOrderQty || "0"} units</p>
            </div>
          </div>
          {formData.supplyCapacity && (
            <div className="mt-4 text-right">
              <span className="text-xs text-muted-foreground">Supply Capacity</span>
              <p className="font-bold text-lg">{formData.supplyCapacity} units/month</p>
            </div>
          )}
        </div>
      </div>
    );
  }, [formData, mediaState.coverPreview]);

  return (
    <>
      <Header />
      <div className="flex bg-white dark:bg-zinc-900">
        <GigsSidebar />
        <div className="min-h-screen mx-auto">
          <div className="container py-8" ref={formRef}>
            <div className="max-w-5xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                <h1 className="text-3xl font-bold">List Your Product for Wholesale</h1>
                <p className="text-muted-foreground mt-1">Connect with bulk buyers and grow your business</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm">Preview</span>
                  <Switch checked={previewMode} onCheckedChange={setPreviewMode} />
                </div>
              </div>

              <ProgressIndicator currentStep={step} totalSteps={steps.length} />
              <StepIndicator steps={steps} currentStep={step} onStepClick={handleStepClick} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <Card className="border shadow-lg overflow-hidden">
                    <CardHeader className="bg-white dark:bg-black border-b">
                      <CardTitle>
                        <div className="flex items-center gap-2">
                          {steps[step - 1].icon}
                          <span>{steps[step - 1].title}</span>
                        </div>
                      </CardTitle>
                      <CardDescription>
                        {step === 1 && "Tell us about your product"}
                        {step === 2 && "Set your pricing and order terms"}
                        {step === 3 && "Add media and supply information"}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="p-6">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={`step-${step}`}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-6"
                        >
                          {step === 1 && (
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="title" className="text-base font-medium">
                                  Title
                                </Label>
                                <Input
                                  name="title"
                                  value={formData.title}
                                  onChange={handleChange}
                                  placeholder="E.g., Men's Cotton T-Shirts (Pack of 50)"
                                  className="h-12"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="description" className="text-base font-medium">
                                  Description
                                </Label>
                                <Textarea
                                  name="description"
                                  value={formData.description}
                                  onChange={handleChange}
                                  placeholder="Describe your product in detail..."
                                  className="min-h-[200px] resize-y"
                                />
                              </div>
                            </div>
                          )}
                          {step === 2 && (
                            <div className="space-y-6">
                              <div className="space-y-2">
                                <Label htmlFor="category" className="text-base font-medium">
                                  Category
                                </Label>
                                <Select value={formData.categoryId} onValueChange={handleSelectChange}>
                                  <SelectTrigger className="h-12">
                                    <SelectValue placeholder="Select a category" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {categories.map((category, index) => (
                                      <SelectItem key={index} value={category.value}>
                                        <span className="flex items-center gap-2">
                                          <span>{category.icon}</span>
                                          <span>{category.label}</span>
                                        </span>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="bulkPrice" className="text-base font-medium">
                                  Price(₹ per unit)
                                  </Label>
                                  <Input
                                    type="number"
                                    name="bulkPrice"
                                    value={formData.bulkPrice}
                                    onChange={handleChange}
                                    placeholder="5"
                                    className="h-12"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="minOrderQty" className="text-base font-medium">
                                    Minimum Order
                                  </Label>
                                  <Input
                                    type="number"
                                    name="minOrderQty"
                                    value={formData.minOrderQty}
                                    onChange={handleChange}
                                    placeholder="100"
                                    className="h-12"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="leadTime" className="text-base font-medium">
                                    Lead Time (days)
                                  </Label>
                                  <Input
                                    type="number"
                                    name="leadTime"
                                    value={formData.leadTime}
                                    onChange={handleChange}
                                    placeholder="7"
                                    className="h-12"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                          {step === 3 && (
                            <div className="space-y-6">
                              <div className="space-y-2">
                                <Label htmlFor="cover" className="text-base font-medium">
                                  Cover Image
                                </Label>
                                <Input
                                  id="cover"
                                  type="file"
                                  accept="image/*"
                                  onChange={handleCoverChange}
                                />
                                {mediaState.coverPreview && (
                                  <Image
                                    src={mediaState.coverPreview || "./placeholder.svg"}
                                    alt="Cover Image"
                                    width={400}
                                    height={200}
                                    loading="lazy"
                                    quality={100}
                                    className="w-full h-48 object-cover mt-2 rounded"
                                  />
                                )}
                                <p className="text-xs text-muted-foreground">
                                  This will be the main image for your product
                                </p>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="images" className="text-base font-medium">
                                  Additional Images
                                </Label>
                                <Input
                                  id="images"
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  onChange={handleImagesChange}
                                />
                                <div className="flex flex-wrap mt-2 gap-2">
                                  {mediaState.imagePreviews.map((preview, index) => (
                                    <Image
                                      key={index}
                                      src={preview}
                                      alt={`Image preview ${index + 1}`}
                                      width={100}
                                      height={100}
                                      loading="lazy"
                                      quality={100}
                                      className="w-24 h-24 object-cover rounded"
                                    />
                                  ))}
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="supplyCapacity" className="text-base font-medium">
                                  Supply Capacity (units/month)
                                </Label>
                                <Input
                                  type="number"
                                  name="supplyCapacity"
                                  value={formData.supplyCapacity}
                                  onChange={handleChange}
                                  placeholder="10000"
                                  className="h-12"
                                />
                              </div>
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <Label className="text-base font-medium">Features</Label>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addFeature}
                                    className="h-8"
                                  >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add Feature
                                  </Button>
                                </div>
                                <div className="space-y-2">
                                  <AnimatePresence>
                                    {formData.features.map((feature, index) => (
                                      <FeatureCard
                                        key={`feature-${index}`}
                                        value={feature}
                                        onChange={(value) => updateFeature(index, value)}
                                        onRemove={() => removeFeature(index)}
                                        index={index}
                                      />
                                    ))}
                                  </AnimatePresence>
                                </div>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </CardContent>

                    <CardFooter className="px-6 py-4 bg-muted/20 border-t flex justify-between">
                      <Button
                        variant="outline"
                        onClick={handleBack}
                        disabled={step === 1}
                        className="gap-1"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                      </Button>

                      {step < steps.length ? (
                        <Button onClick={handleNext} disabled={!isCurrentStepValid()} className="gap-1">
                          Next
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button onClick={handleSubmitGig} disabled={isSubmitting} className="gap-2">
                          {isSubmitting ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4" />
                              Create Listing
                            </>
                          )}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                </div>

                <div className="hidden lg:block">
                  <div className="sticky top-6">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      Listing Preview
                    </h3>
                    <GigPreview />
                    <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <div className="flex gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-amber-800 dark:text-amber-400">
                            Tips for a great listing
                          </h4>
                          <ul className="text-sm text-amber-700 dark:text-amber-300 mt-2 space-y-1 list-disc pl-4">
                            <li>Use high-quality images</li>
                            <li>Be specific about your product details</li>
                            <li>Highlight bulk pricing and MOQ</li>
                            <li>Showcase product features clearly</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
