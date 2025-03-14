"use client"

import { useState, useEffect, useRef } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import axios from "axios"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthStore } from "@/store/authStore"
import { Switch } from "@/components/ui/switch"
import { motion, AnimatePresence } from "framer-motion"
import { AlertCircle, ArrowLeft, ArrowRight, Check, CheckCircle2, Globe, Image as ImageIcon, Info, Loader2, Lock, Shield, Tag, Upload, Users, X } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"
import Header from "@/components/global/Header"

// Modified form schema to handle file uploads
const formSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(50, "Name must be less than 50 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(500, "Description must be less than 500 characters"),
  image: z.any().optional(), // Changed to handle File object
  imageUrl: z.string().optional(), // For preview and existing URLs
  coverImage: z.any().optional(), // Changed to handle File object
  coverImageUrl: z.string().optional(), // For preview and existing URLs
  isPublic: z.boolean().default(true),
  allowNSFW: z.boolean().default(false),
  tags: z.string().optional(),
  rules: z.string().optional(),
})

export default function CreateCommunityPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)

  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const totalSteps = 3
  
  // References for file inputs
  const imageInputRef = useRef<HTMLInputElement>(null)
  const coverImageInputRef = useRef<HTMLInputElement>(null)
  
  // State for image previews
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      image: undefined,
      imageUrl: "",
      coverImage: undefined,
      coverImageUrl: "",
      isPublic: true,
      allowNSFW: false,
      tags: "",
      rules: "",
    },
    mode: "onChange",
  })

  const watchedValues = form.watch()
  const isCurrentStepValid = () => {
    if (step === 1) {
      return !form.formState.errors.name && !form.formState.errors.description && 
             watchedValues.name && watchedValues.description;
    }
    return true;
  }

  // Handle file selection for community image
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      form.setValue('image', file);
      
      // Create a preview URL
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
      form.setValue('imageUrl', objectUrl);
    }
  };
  
  // Handle file selection for cover image
  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      form.setValue('coverImage', file);
      
      // Create a preview URL
      const objectUrl = URL.createObjectURL(file);
      setCoverImagePreview(objectUrl);
      form.setValue('coverImageUrl', objectUrl);
    }
  };
  
  // Clear image selection
  const clearImage = () => {
    form.setValue('image', undefined);
    form.setValue('imageUrl', '');
    setImagePreview(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };
  
  // Clear cover image selection
  const clearCoverImage = () => {
    form.setValue('coverImage', undefined);
    form.setValue('coverImageUrl', '');
    setCoverImagePreview(null);
    if (coverImageInputRef.current) {
      coverImageInputRef.current.value = '';
    }
  };

  // Cleanup preview URLs when component unmounts
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      if (coverImagePreview) URL.revokeObjectURL(coverImagePreview);
    };
  }, [imagePreview, coverImagePreview]);

  if (!user) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-12 w-12 rounded-full bg-muted mb-4"></div>
        <div className="h-4 w-48 bg-muted rounded mb-2"></div>
        <div className="h-3 w-32 bg-muted rounded"></div>
      </div>
    </div>
  );

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);
      
      // Create FormData object for handling files
      const formData = new FormData();
      
      // Important: Make sure all string values are explicitly converted to strings
      formData.append('name', values.name);
      formData.append('description', values.description);
      formData.append('isPublic', String(values.isPublic));
      formData.append('allowNSFW', String(values.allowNSFW));
      
      if (values.tags) formData.append('tags', values.tags);
      if (values.rules) formData.append('rules', values.rules);
      
      // Append files if they exist - make sure you're appending the actual File objects
      if (values.image instanceof File) {
        formData.append('image', values.image);
      }
      
      if (values.coverImage instanceof File) {
        formData.append('coverImage', values.coverImage);
      }
      
      // Log the formData entries to verify what's being sent
      console.log("FormData contents:");
      for (const pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }
      
      const response = await axios.post(
        "http://localhost:8800/api/communities",
        formData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            // Don't set Content-Type manually, let axios set it with the boundary
            // 'Content-Type': 'multipart/form-data'
          },
        }
      );
      
      console.log("FormData contents:");
for (const [key, value] of formData.entries()) {
  console.log(key, value);
}

      const community = response.data;
      toast.success(`Community ${values.name} created successfully!`);
      router.push(`/community/communities/${community.id}`);
    } catch (error: string | any) {
      toast.error("Failed to create community: " + (error.response?.data?.message || error.message));
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Progress indicator component
  const ProgressIndicator = () => (
    <div className="w-full mb-8">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium">Progress</span>
        <span className="text-sm text-muted-foreground">{step}/{totalSteps}</span>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${(step / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );

  // Community preview component
  const CommunityPreview = () => (
    <div className="rounded-xl overflow-hidden border shadow-lg bg-card">
      <div className="h-32 bg-muted relative">
        {(watchedValues.coverImageUrl || coverImagePreview) ? (
          <Image
            src={coverImagePreview || watchedValues.coverImageUrl || "/placeholder.svg"} 
            alt="Cover" 
            width={300} height={150} 
            loading="lazy"
            quality={100}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg?height=128&width=400";
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary/10 to-primary/30"></div>
        )}
        
        <div className="absolute -bottom-10 left-4">
          <div className="h-20 w-20 rounded-full border-4 border-background bg-muted overflow-hidden">
            {(watchedValues.imageUrl || imagePreview) ? (
              <Image
                src={imagePreview || watchedValues.imageUrl || "/placeholder.svg"} 
                alt="Community" 
                width={80} height={80}
                loading="lazy"
                quality={100}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.svg?height=80&width=80";
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/20">
                {watchedValues.name ? (
                  <span className="text-xl font-bold">{watchedValues.name.charAt(0).toUpperCase()}</span>
                ) : (
                  <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="absolute top-3 right-3 flex gap-2">
          {watchedValues.isPublic ? (
            <Badge variant="secondary" className="bg-background/80 hover:bg-background/80">
              <Globe className="h-3 w-3 mr-1" />
              Public
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-background/80 hover:bg-background/80">
              <Lock className="h-3 w-3 mr-1" />
              Private
            </Badge>
          )}
          
          {watchedValues.allowNSFW && (
            <Badge variant="destructive" className="bg-destructive/80 hover:bg-destructive/80">
              NSFW
            </Badge>
          )}
        </div>
      </div>
      
      <div className="pt-12 p-4">
        <h3 className="font-bold text-lg">
          {watchedValues.name || "community"}
        </h3>
        
        <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
          {watchedValues.description || "Community description will appear here..."}
        </p>
        
        {watchedValues.tags && (
          <div className="flex flex-wrap gap-1 mt-3">
            {watchedValues.tags.split(',').map((tag, index) => (
              tag.trim() && (
                <Badge key={index} variant="outline" className="text-xs bg-primary/5">
                  {tag.trim()}
                </Badge>
              )
            ))}
          </div>
        )}
        
        <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>0 members</span>
          <span>•</span>
          <span>Created just now</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
    <Header/>
    <div className="min-h-screen bg-white dark:bg-zinc-900 py-8 px-4">
      <div className="container max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Create a Community</h1>
            <p className="text-muted-foreground mt-2">Build a space for people with similar interests</p>
          </div>
          
          <ProgressIndicator />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="border shadow-xl overflow-hidden">
                <CardHeader className="bg-white dark:bg-black border-b">
                  <CardTitle>
                    {step === 1 && "Basic Information"}
                    {step === 2 && "Community Settings"}
                    {step === 3 && "Finalize Your Community"}
                  </CardTitle>
                  <CardDescription>
                    {step === 1 && "Let's start with the essentials"}
                    {step === 2 && "Configure how your community will work"}
                    {step === 3 && "Add the finishing touches"}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="p-6">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <AnimatePresence mode="wait">
                        {step === 1 && (
                          <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                          >
                            <FormField
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base font-medium">
                                    Community Name <span className="text-destructive">*</span>
                                  </FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"></span>
                                      <Input 
                                        placeholder="community-name" 
                                        className="pl-8 h-12" 
                                        {...field} 
                                      />
                                    </div>
                                  </FormControl>
                                  <FormDescription>
                                    This will be the unique identifier for your community
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="description"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base font-medium">
                                    Description <span className="text-destructive">*</span>
                                  </FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="What is your community about?" 
                                      className="min-h-[120px] resize-y" 
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Briefly describe your community to help others understand its purpose
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </motion.div>
                        )}

                        {step === 2 && (
                          <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                          >
                            <FormField
                              control={form.control}
                              name="isPublic"
                              render={({ field }) => (
                                <FormItem className="flex flex-col">
                                  <div className="flex items-center justify-between mb-2">
                                    <div>
                                      <FormLabel className="text-base font-medium">Community Type</FormLabel>
                                      <FormDescription>
                                        Choose whether your community is open to everyone or invite-only
                                      </FormDescription>
                                    </div>
                                    <FormControl>
                                      <Switch 
                                        checked={field.value} 
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4 mt-2">
                                    <div className={`p-3 rounded-lg border ${field.value ? 'bg-primary/5 border-primary/30' : 'bg-muted/30'}`}>
                                      <div className="flex items-center gap-2">
                                        <Globe className={`h-4 w-4 ${field.value ? 'text-primary' : 'text-muted-foreground'}`} />
                                        <span className="font-medium">Public</span>
                                      </div>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        Anyone can view, post, and comment
                                      </p>
                                    </div>
                                    <div className={`p-3 rounded-lg border ${!field.value ? 'bg-primary/5 border-primary/30' : 'bg-muted/30'}`}>
                                      <div className="flex items-center gap-2">
                                        <Lock className={`h-4 w-4 ${!field.value ? 'text-primary' : 'text-muted-foreground'}`} />
                                        <span className="font-medium">Private</span>
                                      </div>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        Only approved users can view and post
                                      </p>
                                    </div>
                                  </div>
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="allowNSFW"
                              render={({ field }) => (
                                <FormItem className="flex items-center justify-between space-y-0 rounded-lg border p-4">
                                  <div className="space-y-0.5">
                                    <FormLabel className="text-base font-medium">Allow NSFW Content</FormLabel>
                                    <FormDescription>
                                      NSFW content is not suitable for all audiences
                                    </FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch 
                                      checked={field.value} 
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="tags"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base font-medium flex items-center gap-2">
                                    <Tag className="h-4 w-4" />
                                    Tags
                                  </FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="tech, coding, javascript" 
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Add comma-separated tags to help people discover your community
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </motion.div>
                        )}

                        {step === 3 && (
                          <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                          >
                            {/* Community Icon Upload */}
                            <FormField
                              control={form.control}
                              name="image"
                              render={() => (
                                <FormItem>
                                  <FormLabel className="text-base font-medium">Community Icon</FormLabel>
                                  <div className="flex items-center gap-4 mb-2">
                                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center overflow-hidden border">
                                      {imagePreview ? (
                                        <Image 
                                          src={imagePreview} 
                                          alt="Preview" 
                                          height={64}
                                          width={64}
                                          loading="lazy"
                                          quality={100}
                                          className="h-full w-full object-cover"
                                        />
                                      ) : (
                                        <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex gap-2">
                                        <Button 
                                          type="button" 
                                          variant="outline" 
                                          onClick={() => imageInputRef.current?.click()}
                                          className="gap-2"
                                        >
                                          <Upload className="h-4 w-4" />
                                          {imagePreview ? 'Change' : 'Upload'} Image
                                        </Button>
                                        {imagePreview && (
                                          <Button 
                                            type="button" 
                                            variant="outline" 
                                            onClick={clearImage}
                                            size="icon"
                                            className="text-destructive"
                                          >
                                            <X className="h-4 w-4" />
                                          </Button>
                                        )}
                                      </div>
                                      <input
                                        type="file"
                                        ref={imageInputRef}
                                        onChange={handleImageChange}
                                        className="hidden"
                                        accept="image/*"
                                      />
                                      <FormDescription className="mt-1">
                                        A square image that represents your community (recommended size: 256x256px)
                                      </FormDescription>
                                    </div>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            {/* Cover Image Upload */}
                            <FormField
                              control={form.control}
                              name="coverImage"
                              render={() => (
                                <FormItem>
                                  <FormLabel className="text-base font-medium">Cover Image</FormLabel>
                                  <div className="mb-2">
                                    <div className="h-32 rounded-lg bg-muted flex items-center justify-center overflow-hidden mb-3 border">
                                      {coverImagePreview ? (
                                        <Image 
                                          src={coverImagePreview} 
                                          alt="Cover Preview" 
                                          height={128}
                                          width={400}
                                          loading="lazy"
                                          quality={100}
                                          className="h-full w-full object-cover"
                                        />
                                      ) : (
                                        <div className="flex flex-col items-center text-muted-foreground/70">
                                          <ImageIcon className="h-8 w-8 mb-1" />
                                          <span className="text-sm">Cover image</span>
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex gap-2">
                                      <Button 
                                        type="button" 
                                        variant="outline" 
                                        onClick={() => coverImageInputRef.current?.click()}
                                        className="gap-2"
                                      >
                                        <Upload className="h-4 w-4" />
                                        {coverImagePreview ? 'Change' : 'Upload'} Cover
                                      </Button>
                                      {coverImagePreview && (
                                        <Button 
                                          type="button" 
                                          variant="outline" 
                                          onClick={clearCoverImage}
                                          size="icon"
                                          className="text-destructive"
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      )}
                                    </div>
                                    <input
                                      type="file"
                                      ref={coverImageInputRef}
                                      onChange={handleCoverImageChange}
                                      className="hidden"
                                      accept="image/*"
                                    />
                                    <FormDescription className="mt-1">
                                      A banner image for your community (recommended size: 1200x400px)
                                    </FormDescription>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="rules"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base font-medium flex items-center gap-2">
                                    <Shield className="h-4 w-4" />
                                    Community Rules
                                  </FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="1. Be respectful to others
                                      2. No spam or self-promotion
                                      3. Stay on topic" 
                                      className="min-h-[120px] resize-y" 
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Set guidelines for members to follow (one rule per line)
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <Alert className="bg-primary/5 border-primary/20">
                              <Info className="h-4 w-4" />
                              <AlertDescription className="text-sm">
                                You can edit all these settings later from the community management page.
                              </AlertDescription>
                            </Alert>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </form>
                  </Form>
                </CardContent>
                
                <CardFooter className="px-6 py-4 bg-muted/20 border-t flex justify-between">
                  {step > 1 ? (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setStep(step - 1)}
                      className="gap-1"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </Button>
                  ) : (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => router.back()}
                    >
                      Cancel
                    </Button>
                  )}
                  
                  {step < totalSteps ? (
                    <Button 
                      type="button" 
                      onClick={() => setStep(step + 1)}
                      disabled={!isCurrentStepValid()}
                      className="gap-1"
                    >
                      Next
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button 
                      type="button" 
                      onClick={form.handleSubmit(onSubmit)}
                      disabled={isSubmitting}
                      className="gap-1"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          Create Community
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
                  <Check className="h-5 w-5 text-primary" />
                  Community Preview
                </h3>
                
                <CommunityPreview />
                
                <div className="mt-6 p-4 bg-muted/30 border rounded-lg">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Community Guidelines</h4>
                      <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc pl-4">
                        <li>Choose a descriptive name</li>
                        <li>Set clear rules and guidelines</li>
                        <li>Be active and engage with members</li>
                        <li>Use high-quality images for your community</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
    </>
  )
}