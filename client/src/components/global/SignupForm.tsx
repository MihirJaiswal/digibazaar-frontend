"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  User,
  Mail,
  Lock,
  Globe,
  Phone,
  FileText,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";

// Dynamically import framer-motion components for animations
const MotionDiv = dynamic(
  () => import("framer-motion").then((mod) => mod.motion.div),
  { ssr: false }
);
const AnimatePresenceDynamic = dynamic(
  () => import("framer-motion").then((mod) => mod.AnimatePresence),
  { ssr: false }
);

// Define the validation schema using Zod
const signupSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be less than 50 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  country: z
    .string()
    .min(2, "Country must be at least 2 characters")
    .max(100, "Country must be less than 100 characters"),
  phone: z
    .string()
    .optional()
    .refine(val => !val || /^\+?[0-9\s-]{7,15}$/.test(val), {
      message: "Please enter a valid phone number",
    }),
  desc: z.string().max(500, "Bio must be less than 500 characters").optional(),
  isSeller: z.literal("on").optional(),
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignUp() {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
  });

  const { setUser, token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const router = useRouter();
  const watchedFields = watch();

  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImageFile(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: SignupFormData) => {
    setLoading(true);
    setError(null);

    try {
      const formPayload = new FormData();
      formPayload.append("username", data.username);
      formPayload.append("email", data.email);
      formPayload.append("password", data.password);
      formPayload.append("country", data.country);
      if (data.phone) formPayload.append("phone", data.phone);
      if (data.desc) formPayload.append("bio", data.desc);
      formPayload.append("isSeller", "true");
      if (profileImageFile) formPayload.append("profilePic", profileImageFile);

      const response = await axios.post(
        "http://localhost:8800/api/auth/register",
        formPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && !response.data.user) {
        setUser(response.data);
      } else {
        setUser(response.data.user, response.data.token);
      }
      toast.success("Account created successfully!");
      reset();
      setTimeout(() => {
        router.push("/");
      }, 500);
    } catch (err: any) {
      console.error("Axios error response:", err.response);
      if (err.response && err.response.data) {
        console.log("Server response data:", err.response.data);
      }
      // Check for both 'message' and 'error' keys in the response data
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Something went wrong. Please try again later.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const moveToStep2 = () => {
    if (
      watchedFields.username &&
      watchedFields.email &&
      watchedFields.password &&
      !errors.username &&
      !errors.email &&
      !errors.password
    ) {
      setStep(2);
    }
  };

  const prevStep = () => setStep(1);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl transform rotate-12 animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-cyan/10 to-transparent rounded-full blur-3xl transform -rotate-12 animate-pulse" />
      </div>
      <div className="container relative flex items-center justify-center pt-24 pb-20 px-4">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl"
        >
          <Card className="border shadow-2xl bg-background/80 backdrop-blur-xl">
            <div className="md:grid md:grid-cols-5 divide-x divide-border">
              {/* Left side – Navigation & Progress */}
              <div className="col-span-2 p-6 bg-muted/30">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold">Create Account</h2>
                    <p className="text-muted-foreground mt-1">Join our community today</p>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span className="text-primary">{step}/2</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <MotionDiv
                          className="h-full bg-purple-600"
                          initial={{ width: "0%" }}
                          animate={{ width: `${(step / 2) * 100}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <button
                        onClick={() => setStep(1)}
                        className={`w-full p-4 rounded-lg text-left transition-all ${
                          step === 1 ? "bg-purple-600 text-primary-foreground" : "hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                            step === 1 ? "border-primary-foreground" : "border-muted-foreground"
                          }`}>
                            1
                          </div>
                          <div>
                            <p className="font-medium">Account Details</p>
                            <p className="text-sm opacity-80">Basic information</p>
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={moveToStep2}
                        className={`w-full p-4 rounded-lg text-left transition-all ${
                          step === 2 ? "bg-purple-600 text-primary-foreground" : "hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                            step === 2 ? "border-primary-foreground" : "border-muted-foreground"
                          }`}>
                            2
                          </div>
                          <div>
                            <p className="font-medium">Profile Setup</p>
                            <p className="text-sm opacity-80">Personalize your profile</p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm">Already have an account?</p>
                    <Link
                      href="/auth/login"
                      className="inline-flex items-center text-sm text-primary hover:text-primary/80 font-medium mt-1"
                    >
                      Login to your account
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
              {/* Right side – Form */}
              <div className="col-span-3 p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <AnimatePresenceDynamic mode="wait">
                    {step === 1 && (
                      <MotionDiv
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <Label htmlFor="username">Username</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="username"
                              placeholder="johndoe"
                              {...register("username")}
                              className={`pl-10 ${errors.username ? "border-red-500" : ""}`}
                            />
                          </div>
                          {errors.username && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.username.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="email"
                              type="email"
                              placeholder="john@example.com"
                              {...register("email")}
                              className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                            />
                          </div>
                          {errors.email && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.email.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="password"
                              type="password"
                              placeholder="••••••••"
                              {...register("password")}
                              className={`pl-10 ${errors.password ? "border-red-500" : ""}`}
                            />
                          </div>
                          {errors.password && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.password.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="profilePic">Profile Image</Label>
                          <div className="relative">
                            <Image
                              src="/placeholder.svg"
                              alt="Placeholder"
                              width={16}
                              height={16}
                              className="absolute left-3 top-3"
                            />
                            <Input
                              id="profilePic"
                              type="file"
                              accept="image/*"
                              onChange={handleProfileImageChange}
                              className="pl-10"
                            />
                          </div>
                          {profileImagePreview && (
                            <Image
                              src={profileImagePreview}
                              alt="Profile Preview"
                              width={100}
                              height={100}
                              loading="lazy"
                              quality={100}
                              className="mt-2 h-24 w-24 rounded-full object-cover"
                            />
                          )}
                        </div>
                        <Button
                          type="button"
                          onClick={moveToStep2}
                          disabled={
                            !watchedFields.username ||
                            !watchedFields.email ||
                            !watchedFields.password ||
                            !!errors.username ||
                            !!errors.email ||
                            !!errors.password
                          }
                          className="w-full bg-gradient-to-r from-purple-500 to-cyan-500"
                        >
                          Continue
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </MotionDiv>
                    )}
                    {step === 2 && (
                      <MotionDiv
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="country">Country</Label>
                            <div className="relative">
                              <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="country"
                                placeholder="India"
                                {...register("country")}
                                className={`pl-10 ${errors.country ? "border-red-500" : ""}`}
                              />
                            </div>
                            {errors.country && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors.country.message}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone (Optional)</Label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="phone"
                                placeholder="+91 123-4567"
                                {...register("phone")}
                                className={`pl-10 ${errors.phone ? "border-red-500" : ""}`}
                              />
                            </div>
                            {errors.phone && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors.phone.message}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="desc">Description (Optional)</Label>
                          <div className="relative">
                            <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="desc"
                              placeholder="Tell us about yourself"
                              {...register("desc")}
                              className={`pl-10 ${errors.desc ? "border-red-500" : ""}`}
                            />
                          </div>
                          {errors.desc && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.desc.message}
                            </p>
                          )}
                        </div>
                        <input type="hidden" {...register("isSeller")} value="on" />
                        {error && (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                          </Alert>
                        )}
                        <div className="flex gap-3">
                          <Button type="button" variant="outline" onClick={prevStep} className="flex-1">
                            Back
                          </Button>
                          <Button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-purple-500 to-cyan-500">
                            {loading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                              </>
                            ) : (
                              "Create Account"
                            )}
                          </Button>
                        </div>
                      </MotionDiv>
                    )}
                  </AnimatePresenceDynamic>
                </form>
              </div>
            </div>
          </Card>
        </MotionDiv>
      </div>
    </div>
  );
}
