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

// Move static data outside the component to prevent recreation on each render
const categories = [
  { value: "WEB_DEVELOPMENT", label: "Web Development", icon: "💻" },
  { value: "GRAPHIC_DESIGN", label: "Graphic Design", icon: "🎨" },
  { value: "DIGITAL_MARKETING", label: "Digital Marketing", icon: "📱" },
  { value: "CONTENT_WRITING", label: "Content Writing", icon: "✍️" },
  { value: "VIDEO_ANIMATION", label: "Video & Animation", icon: "🎬" },
  { value: "SOFTWARE_DEVELOPMENT", label: "Software Development", icon: "⚙️" },
  { value: "MOBILE_DEVELOPMENT", label: "Mobile Development", icon: "📱" },
  { value: "DATA_ANALYTICS", label: "Data Analytics", icon: "📊" },
  { value: "BUSINESS", label: "Business Consulting", icon: "💼" },
  { value: "AUDIO_PRODUCTION", label: "Audio Production", icon: "🎵" },
  { value: "PHOTOGRAPHY", label: "Photography", icon: "📷" },
  { value: "VIRTUAL_ASSISTANTS", label: "Virtual Assistants", icon: "🤖" },
];

// Define a memoized FeatureCard component to prevent unnecessary re-renders
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

// Memoize progress indicator to prevent re-renders
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

// Memoize step indicator to prevent re-renders
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

// Main component with optimizations
export default function CreateGigPage() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [previewMode, setPreviewMode] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  // Reduce state updates by combining related fields
  const [formData, setFormData] = useState({
    title: "",
    shortDesc: "",
    desc: "",
    categoryId: "",
    price: "",
    deliveryTime: 1,
    revisionNumber: 1,
    features: [""],
    resume: "",
    yearsOfExp: "",
  });

  // Separate media state for better performance
  const [mediaState, setMediaState] = useState({
    coverFile: null as File | null,
    coverPreview: "",
    imageFiles: [] as File[],
    imagePreviews: [] as string[],
  });

  // Memoize steps configuration to prevent recreation on re-renders
  const steps = useMemo(() => [
    {
      title: "Basic Info",
      icon: <Tag className="h-5 w-5" />,
      fields: ["title", "shortDesc", "desc"],
    },
    {
      title: "Pricing",
      icon: <Coins className="h-5 w-5" />,
      fields: ["categoryId", "price", "deliveryTime", "revisionNumber"],
    },
    {
      title: "Media & Experience",
      icon: <FileImage className="h-5 w-5" />,
      fields: ["cover", "images", "resume", "yearsOfExp", "features"],
    },
  ], []);

  // Optimize scrolling effect with debounce for performance
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [step]);

  // Use useCallback for event handlers to prevent recreation on re-renders
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSelectChange = useCallback((value: string) => {
    setFormData((prev) => ({ ...prev, categoryId: value }));
  }, []);

  // Memoized feature handlers
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

  // Navigation handlers
  const handleNext = useCallback(() => setStep((s) => Math.min(s + 1, steps.length)), [steps.length]);
  const handleBack = useCallback(() => setStep((s) => Math.max(s - 1, 1)), []);
  const handleStepClick = useCallback((newStep: number) => {
    setStep((current) => (newStep <= current ? newStep : current));
  }, []);

  // Optimize validation by memoizing it
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

  // File handling with better memory management
  const handleCoverChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Revoke previous object URL to prevent memory leaks
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
      // Revoke previous object URLs to prevent memory leaks
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

  // Properly clean up preview URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (mediaState.coverPreview) URL.revokeObjectURL(mediaState.coverPreview);
      mediaState.imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  // Optimized form submission with better error handling
  const handleSubmitGig = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const formPayload = new FormData();

      // Append text fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "features") {
          formPayload.append(key, JSON.stringify(value));
        } else {
          formPayload.append(key, String(value));
        }
      });
      
      // Append userId if needed
      if (user?.id) formPayload.append("userId", user.id);

      // Append files if available
      if (mediaState.coverFile) formPayload.append("cover", mediaState.coverFile);
      if (mediaState.imageFiles.length > 0) {
        mediaState.imageFiles.forEach((file) => {
          formPayload.append("images", file);
        });
      }

      const response = await fetch("http://localhost:8800/api/gigs", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formPayload,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to create a service");
      }

      toast.success("service created successfully!");
      router.push("/gigs/gig");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
      console.error("Error creating service:", error);
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
              src={mediaState.coverPreview || "./placeholder.svg" }
              alt={formData.title || "service preview"}
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
              {categoryItem?.icon || "🔍"}{" "}
              {categoryItem?.label || "Category"}
            </Badge>
          )}
        </div>
        <div className="p-5">
          <h3 className="font-semibold text-lg line-clamp-2 mb-2">
            {formData.title || "Your service Title"}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {formData.shortDesc || "Short description of your service goes here..."}
          </p>

          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Delivers in {formData.deliveryTime || 1} day{String(formData.deliveryTime) !== "1" ? "s" : ""}
            </span>
          </div>

          <Separator className="my-4" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span className="text-xs">{formData.yearsOfExp || "0"}+ years exp</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-muted-foreground">STARTING AT</span>
              <p className="font-bold text-lg">${formData.price || "0"}</p>
            </div>
          </div>
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
                  <h1 className="text-3xl font-bold">Create a New Service</h1>
                  <p className="text-muted-foreground mt-1">
                    Showcase your skills and start earning
                  </p>
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
                        {step === 1 && "Tell us about your service"}
                        {step === 2 && "Set your pricing and delivery terms"}
                        {step === 3 && "Add media and showcase your experience"}
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
                                  placeholder="I will create a professional website for your business"
                                  className="h-12"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="shortDesc" className="text-base font-medium">
                                  Short Description
                                </Label>
                                <Input
                                  name="shortDesc"
                                  value={formData.shortDesc}
                                  onChange={handleChange}
                                  placeholder="A brief summary of your service (100 characters max)"
                                  className="h-12"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="desc" className="text-base font-medium">
                                  Full Description
                                </Label>
                                <Textarea
                                  name="desc"
                                  value={formData.desc}
                                  onChange={handleChange}
                                  placeholder="Describe your service in detail. What makes it unique? What will buyers receive?"
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
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="price" className="text-base font-medium">
                                    Price ($)
                                  </Label>
                                  <Input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    placeholder="50"
                                    className="h-12"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="deliveryTime" className="text-base font-medium">
                                    Delivery (days)
                                  </Label>
                                  <Input
                                    type="number"
                                    name="deliveryTime"
                                    value={String(formData.deliveryTime)}
                                    onChange={handleChange}
                                    placeholder="1"
                                    className="h-12"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="revisionNumber" className="text-base font-medium">
                                    Revisions
                                  </Label>
                                  <Input
                                    type="number"
                                    name="revisionNumber"
                                    value={String(formData.revisionNumber)}
                                    onChange={handleChange}
                                    placeholder="1"
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
                                    src={mediaState.coverPreview || "./placeholder.svg" }
                                    alt="Cover Image"
                                    width={400}
                                    height={200}
                                    loading="lazy"
                                    quality={100}
                                    className="w-full h-48 object-cover mt-2 rounded"
                                  />
                                )}
                                <p className="text-xs text-muted-foreground">
                                  This will be the main image displayed for your service
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
                                <Label htmlFor="yearsOfExp" className="text-base font-medium">
                                  Years of Experience
                                </Label>
                                <Input
                                  type="number"
                                  name="yearsOfExp"
                                  value={formData.yearsOfExp}
                                  onChange={handleChange}
                                  placeholder="3"
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
                              Create Service
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
                      Service Preview
                    </h3>
                    <GigPreview />
                    <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <div className="flex gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-amber-800 dark:text-amber-400">
                            Tips for a great Service
                          </h4>
                          <ul className="text-sm text-amber-700 dark:text-amber-300 mt-2 space-y-1 list-disc pl-4">
                            <li>Use high-quality images</li>
                            <li>Be specific about what you offer</li>
                            <li>Highlight your unique skills</li>
                            <li>Set competitive pricing</li>
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