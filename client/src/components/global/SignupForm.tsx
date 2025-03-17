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
  CheckCircle,
  RefreshCw,
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

// OTP validation schema
const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits")
});

type SignupFormData = z.infer<typeof signupSchema>;
type OtpFormData = z.infer<typeof otpSchema>;

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

  const {
    register: registerOtp,
    handleSubmit: handleSubmitOtp,
    formState: { errors: otpErrors },
    reset: resetOtp,
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    mode: "onChange",
  });

  const { setUser, token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);
  const [formData, setFormData] = useState<SignupFormData | null>(null);
  const [countdown, setCountdown] = useState(60);
  const [isCountdownActive, setIsCountdownActive] = useState(false);
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

  // Start countdown timer
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCountdownActive && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      setIsCountdownActive(false);
    }
    return () => clearTimeout(timer);
  }, [countdown, isCountdownActive]);

  // Initial form submission - Request OTP
  const onSubmit = async (data: SignupFormData) => {
    setLoading(true);
    setError(null);
    setFormData(data);

    try {
      // Create FormData for file upload if needed
      const formPayload = new FormData();
      
      // Add all form data fields to payload
      formPayload.append("username", data.username);
      formPayload.append("email", data.email);
      formPayload.append("password", data.password);
      formPayload.append("country", data.country);
      if (data.phone) formPayload.append("phone", data.phone);
      if (data.desc) formPayload.append("desc", data.desc);
      formPayload.append("isSeller", data.isSeller || "on");
      if (profileImageFile) formPayload.append("profilePic", profileImageFile);

      // Initiate OTP request with all user data
      const response = await axios.post(
        "http://localhost:8800/api/auth/register/initiate",
        formPayload,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      );

      setOtpSent(true);
      setShowOtpForm(true);
      setIsCountdownActive(true);
      setCountdown(60);
      toast.success("OTP sent to your email!");
    } catch (err: any) {
      console.error("Error initiating registration:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to send OTP. Please try again.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // OTP verification submission
  const verifyOtp = async (otpData: OtpFormData) => {
    if (!formData) return;
    
    setLoading(true);
    setError(null);

    try {
      // Verify OTP - only sending email and OTP as needed
      const verifyResponse = await axios.post(
        "http://localhost:8800/api/auth/register/verify",
        {
          email: formData.email,
          otp: otpData.otp
        }
      );

      const { token: authToken, user } = verifyResponse.data;
      
      // Set user data in auth store
      setUser(user, authToken);
      
      toast.success("Account created successfully!");
      reset();
      resetOtp();
      setTimeout(() => {
        router.push("/");
      }, 500);
    } catch (err: any) {
      console.error("Verification error:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "OTP verification failed. Please try again.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!formData?.email) return;
    
    setResendingOtp(true);
    setError(null);

    try {
      await axios.post(
        "http://localhost:8800/api/auth/register/resend-otp",
        { email: formData.email }
      );
      
      toast.success("OTP resent successfully!");
      setIsCountdownActive(true);
      setCountdown(60);
    } catch (err: any) {
      console.error("Error resending OTP:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to resend OTP. Please try again.";
      setError(errorMsg);
    } finally {
      setResendingOtp(false);
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

  const prevStep = () => {
    if (showOtpForm) {
      setShowOtpForm(false);
    } else {
      setStep(1);
    }
  };

  return (
    <div className="flex justify-center mt-2 md:mt-16 items-center overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl transform rotate-12 animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-cyan-500/10 to-transparent rounded-full blur-3xl transform -rotate-12 animate-pulse" />
      </div>
      <div className="relative flex items-center justify-center pt-8 md:pt-0 px-4">
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
                        <span className="text-primary">
                          {showOtpForm ? "3/3" : `${step}/3`}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <MotionDiv
                          className="h-full bg-purple-600"
                          initial={{ width: "0%" }}
                          animate={{ 
                            width: showOtpForm ? "100%" : `${(step / 3) * 100}%` 
                          }}
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
                      <button
                        className={`w-full p-4 rounded-lg text-left transition-all ${
                          showOtpForm ? "bg-purple-600 text-primary-foreground" : "hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                            showOtpForm ? "border-primary-foreground" : "border-muted-foreground"
                          }`}>
                            3
                          </div>
                          <div>
                            <p className="font-medium">Verification</p>
                            <p className="text-sm opacity-80">Confirm your email</p>
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
                <AnimatePresenceDynamic mode="wait">
                  {showOtpForm ? (
                    <MotionDiv
                      key="otp-verification"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="text-center">
                        <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-2" />
                        <h3 className="text-xl font-medium">Verify Your Email</h3>
                        <p className="text-muted-foreground mt-1">
                          We've sent a 6-digit code to {formData?.email}
                        </p>
                      </div>

                      <form onSubmit={handleSubmitOtp(verifyOtp)} className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="otp">Enter 6-digit OTP</Label>
                          <Input
                            id="otp"
                            placeholder="123456"
                            maxLength={6}
                            className={`text-center text-lg tracking-widest ${otpErrors.otp ? "border-red-500" : ""}`}
                            {...registerOtp("otp")}
                          />
                          {otpErrors.otp && (
                            <p className="text-red-500 text-sm mt-1">{otpErrors.otp.message}</p>
                          )}
                        </div>

                        {error && (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                          </Alert>
                        )}

                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">
                            Didn't receive the code? 
                            {isCountdownActive ? (
                              <span className="ml-1">Resend in {countdown}s</span>
                            ) : (
                              <button
                                type="button"
                                onClick={handleResendOtp}
                                disabled={resendingOtp || isCountdownActive}
                                className="ml-1 text-primary hover:text-primary/80 font-medium"
                              >
                                Resend OTP
                              </button>
                            )}
                          </p>
                        </div>

                        <div className="flex gap-3">
                          <Button type="button" variant="outline" onClick={prevStep} className="flex-1">
                            Back
                          </Button>
                          <Button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-purple-500 to-cyan-500">
                            {loading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Verifying...
                              </>
                            ) : (
                              "Verify & Create Account"
                            )}
                          </Button>
                        </div>
                      </form>
                    </MotionDiv>
                  ) : (
                    <>
                      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                                    Sending OTP...
                                  </>
                                ) : (
                                  "Get Verification Code"
                                )}
                              </Button>
                            </div>
                          </MotionDiv>
                        )}
                      </form>
                    </>
                  )}
                </AnimatePresenceDynamic>
              </div>
            </div>
          </Card>
        </MotionDiv>
      </div>
    </div>
  );
}