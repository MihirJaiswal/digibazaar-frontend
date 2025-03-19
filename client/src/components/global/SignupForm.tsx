"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import { useRouter } from "next/navigation"
import Image from "next/image"
import dynamic from "next/dynamic"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
  Upload,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"
import { useAuthStore } from "@/store/authStore"
import { useTheme } from "next-themes"

// Dynamically import framer-motion components for animations
const MotionDiv = dynamic(() => import("framer-motion").then((mod) => mod.motion.div), { ssr: false })

const MotionPath = dynamic(() => import("framer-motion").then((mod) => mod.motion.path), { ssr: false })

const MotionSVG = dynamic(() => import("framer-motion").then((mod) => mod.motion.svg), { ssr: false })

const AnimatePresenceDynamic = dynamic(() => import("framer-motion").then((mod) => mod.AnimatePresence), { ssr: false })

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
    .refine((val) => !val || /^\+?[0-9\s-]{7,15}$/.test(val), {
      message: "Please enter a valid phone number",
    }),
  desc: z.string().max(500, "Bio must be less than 500 characters").optional(),
  isSeller: z.literal("on").optional(),
})

// OTP validation schema
const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
})

type SignupFormData = z.infer<typeof signupSchema>
type OtpFormData = z.infer<typeof otpSchema>

export default function SignUp() {
  const { theme } = useTheme()
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
  })

  const {
    register: registerOtp,
    handleSubmit: handleSubmitOtp,
    formState: { errors: otpErrors },
    reset: resetOtp,
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    mode: "onChange",
  })

  const { setUser, token } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState(1)
  const [showOtpForm, setShowOtpForm] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [resendingOtp, setResendingOtp] = useState(false)
  const [formData, setFormData] = useState<SignupFormData | null>(null)
  const [countdown, setCountdown] = useState(60)
  const [isCountdownActive, setIsCountdownActive] = useState(false)
  const router = useRouter()
  const watchedFields = watch()

  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState("")

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setProfileImageFile(file)
      setProfileImagePreview(URL.createObjectURL(file))
    }
  }

  // Start countdown timer
  React.useEffect(() => {
    let timer: NodeJS.Timeout
    if (isCountdownActive && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
    } else if (countdown === 0) {
      setIsCountdownActive(false)
    }
    return () => clearTimeout(timer)
  }, [countdown, isCountdownActive])

  // Initial form submission - Request OTP
  const onSubmit = async (data: SignupFormData) => {
    setLoading(true)
    setError(null)
    setFormData(data)

    try {
      // Create FormData for file upload if needed
      const formPayload = new FormData()

      // Add all form data fields to payload
      formPayload.append("username", data.username)
      formPayload.append("email", data.email)
      formPayload.append("password", data.password)
      formPayload.append("country", data.country)
      if (data.phone) formPayload.append("phone", data.phone)
      if (data.desc) formPayload.append("desc", data.desc)
      formPayload.append("isSeller", data.isSeller || "on")
      if (profileImageFile) formPayload.append("profilePic", profileImageFile)

      // Initiate OTP request with all user data
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/register/initiate` , formPayload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      setOtpSent(true)
      setShowOtpForm(true)
      setIsCountdownActive(true)
      setCountdown(60)
      toast.success("OTP sent to your email!")
    } catch (err: any) {
      console.error("Error initiating registration:", err)
      const errorMsg =
        err.response?.data?.message || err.response?.data?.error || "Failed to send OTP. Please try again."
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  // OTP verification submission
  const verifyOtp = async (otpData: OtpFormData) => {
    if (!formData) return

    setLoading(true)
    setError(null)

    try {
      // Verify OTP - only sending email and OTP as needed
      const verifyResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/register/verify`, {
        email: formData.email,
        otp: otpData.otp,
      })

      const { token: authToken, user } = verifyResponse.data

      // Set user data in auth store
      setUser(user, authToken)

      toast.success("Account created successfully!")
      reset()
      resetOtp()
      setTimeout(() => {
        router.push("/")
      }, 500)
    } catch (err: any) {
      console.error("Verification error:", err)
      const errorMsg =
        err.response?.data?.message || err.response?.data?.error || "OTP verification failed. Please try again."
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  // Resend OTP
  const handleResendOtp = async () => {
    if (!formData?.email) return

    setResendingOtp(true)
    setError(null)

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/register/resend-otp`, { email: formData.email })

      toast.success("OTP resent successfully!")
      setIsCountdownActive(true)
      setCountdown(60)
    } catch (err: any) {
      console.error("Error resending OTP:", err)
      const errorMsg =
        err.response?.data?.message || err.response?.data?.error || "Failed to resend OTP. Please try again."
      setError(errorMsg)
    } finally {
      setResendingOtp(false)
    }
  }

  const moveToStep2 = () => {
    if (
      watchedFields.username &&
      watchedFields.email &&
      watchedFields.password &&
      !errors.username &&
      !errors.email &&
      !errors.password
    ) {
      setStep(2)
    }
  }

  const prevStep = () => {
    if (showOtpForm) {
      setShowOtpForm(false)
    } else {
      setStep(1)
    }
  }

  return (
    <div className="min-h-screen relative flex items-start pt-8 justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-slate-100 to-blue-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Glowing orbs */}
        <MotionDiv
          initial={{ opacity: 0.5, x: "-10%", y: "10%" }}
          animate={{
            opacity: [0.5, 0.8, 0.5],
            x: ["-10%", "-5%", "-10%"],
            y: ["10%", "15%", "10%"],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="absolute top-0 left-0 w-[600px] h-[600px] bg-purple-600/10 dark:bg-purple-600/20 rounded-full blur-[120px]"
        />
        <MotionDiv
          initial={{ opacity: 0.5, x: "10%", y: "-10%" }}
          animate={{
            opacity: [0.5, 0.7, 0.5],
            x: ["10%", "15%", "10%"],
            y: ["-10%", "-15%", "-10%"],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 0.5,
          }}
          className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 dark:bg-cyan-500/20 rounded-full blur-[100px]"
        />

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMDIwMjAiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0aDR2MWgtNHYtMXptMC0yaDF2NGgtMXYtNHptMi0yaDF2MWgtMXYtMXptLTIgMmgxdjFoLTF2LTF6bS0yLTJoMXYxaC0xdi0xem0yLTJoMXYxaC0xdi0xem0tMiAyaDF2MWgtMXYtMXptLTItMmgxdjFoLTF2LTF6bTggMGgxdjFoLTF2LTF6bS0yIDBoMXYxaC0xdi0xem0tMi0yaDF2MWgtMXYtMXptLTIgMGgxdjFoLTF2LTF6bS0yIDBoMXYxaC0xdi0xem0xMC02aDFWMWgtMXYxem0yIDBoMVYxaC0xdjF6bTIgMGgxVjFoLTF2MXptLTIgMmgxdjFoLTF2LTF6bTIgMGgxdjFoLTF2LTF6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />
      </div>

      <div className="container relative flex items-center justify-center z-10 px-4 py-10">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="w-full max-w-4xl"
        >
          <Card className="relative border-0 shadow-[0_0_60px_-15px_rgba(139,92,246,0.3)] dark:shadow-[0_0_60px_-15px_rgba(139,92,246,0.3)] bg-white/80 dark:bg-black/40 backdrop-blur-xl overflow-hidden rounded-2xl">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/10 dark:from-purple-500/20 to-transparent rounded-bl-full" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-cyan-500/10 dark:from-cyan-500/20 to-transparent rounded-tr-full" />

            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-cyan-500 to-purple-600" />

            <div className="md:grid md:grid-cols-5 divide-x divide-slate-200 dark:divide-slate-700">
              {/* Left side – Navigation & Progress */}
              <div className="col-span-2 p-6 bg-slate-50/50 dark:bg-slate-900/30">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <MotionSVG
                      width="40"
                      height="40"
                      viewBox="0 0 60 60"
                      className="flex-shrink-0"
                      initial={{ opacity: 0, rotate: -10 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                    >
                      <defs>
                        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#a855f7" />
                          <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                      </defs>
                      <MotionPath
                        d="M30 5L40 15L50 25L40 35L30 45L20 35L10 25L20 15L30 5Z"
                        fill="none"
                        stroke="url(#logoGradient)"
                        strokeWidth="2"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
                      />
                      <MotionPath
                        d="M30 15L36 25L30 35L24 25L30 15Z"
                        fill="url(#logoGradient)"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 1.2 }}
                      />
                    </MotionSVG>
                    <div>
                      <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-cyan-600 dark:from-purple-400 dark:to-cyan-400">
                        Create Account
                      </h2>
                      <p className="text-slate-600 dark:text-slate-300 mt-1">Join our community today</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-300">Progress</span>
                        <span className="text-purple-600 dark:text-purple-400 font-medium">
                          {showOtpForm ? "3/3" : `${step}/3`}
                        </span>
                      </div>
                      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <MotionDiv
                          className="h-full bg-gradient-to-r from-purple-600 to-cyan-600"
                          initial={{ width: "0%" }}
                          animate={{
                            width: showOtpForm ? "100%" : `${(step / 3) * 100}%`,
                          }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <button
                        onClick={() => setStep(1)}
                        className={`w-full p-4 rounded-xl text-left transition-all ${
                          step === 1
                            ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                            : "hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                              step === 1 ? "border-white/70" : "border-slate-400 dark:border-slate-500"
                            }`}
                          >
                            1
                          </div>
                          <div>
                            <p className="font-medium">Account Details</p>
                            <p
                              className={`text-sm ${step === 1 ? "text-white/80" : "text-slate-500 dark:text-slate-400"}`}
                            >
                              Basic information
                            </p>
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={moveToStep2}
                        className={`w-full p-4 rounded-xl text-left transition-all ${
                          step === 2
                            ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                            : "hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                              step === 2 ? "border-white/70" : "border-slate-400 dark:border-slate-500"
                            }`}
                          >
                            2
                          </div>
                          <div>
                            <p className="font-medium">Profile Setup</p>
                            <p
                              className={`text-sm ${step === 2 ? "text-white/80" : "text-slate-500 dark:text-slate-400"}`}
                            >
                              Personalize your profile
                            </p>
                          </div>
                        </div>
                      </button>
                      <button
                        className={`w-full p-4 rounded-xl text-left transition-all ${
                          showOtpForm
                            ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                            : "hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                              showOtpForm ? "border-white/70" : "border-slate-400 dark:border-slate-500"
                            }`}
                          >
                            3
                          </div>
                          <div>
                            <p className="font-medium">Verification</p>
                            <p
                              className={`text-sm ${showOtpForm ? "text-white/80" : "text-slate-500 dark:text-slate-400"}`}
                            >
                              Confirm your email
                            </p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-100/80 dark:bg-slate-800/50 rounded-xl backdrop-blur-sm">
                    <p className="text-sm text-slate-600 dark:text-slate-300">Already have an account?</p>
                    <Link
                      href="/auth/login"
                      className="inline-flex items-center text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium mt-1 group"
                    >
                      Login to your account
                      <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                          <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-xl font-medium text-slate-900 dark:text-white">Verify Your Email</h3>
                        <p className="text-slate-600 dark:text-slate-300 mt-1">
                          We've sent a 6-digit code to {formData?.email}
                        </p>
                      </div>

                      <form onSubmit={handleSubmitOtp(verifyOtp)} className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="otp" className="text-slate-700 dark:text-slate-200">
                            Enter 6-digit OTP
                          </Label>
                          <Input
                            id="otp"
                            placeholder="123456"
                            maxLength={6}
                            className={`text-center text-lg tracking-widest bg-slate-100/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white ${otpErrors.otp ? "border-red-500 dark:border-red-500" : ""}`}
                            {...registerOtp("otp")}
                          />
                          {otpErrors.otp && (
                            <p className="text-red-500 dark:text-red-400 text-sm mt-1">{otpErrors.otp.message}</p>
                          )}
                        </div>

                        {error && (
                          <Alert
                            variant="destructive"
                            className="bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
                          >
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                          </Alert>
                        )}

                        <div className="text-center">
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            Didn't receive the code?
                            {isCountdownActive ? (
                              <span className="ml-1 text-slate-500 dark:text-slate-400">Resend in {countdown}s</span>
                            ) : (
                              <button
                                type="button"
                                onClick={handleResendOtp}
                                disabled={resendingOtp || isCountdownActive}
                                className="ml-1 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
                              >
                                Resend OTP
                              </button>
                            )}
                          </p>
                        </div>

                        <div className="flex gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={prevStep}
                            className="flex-1 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            Back
                          </Button>
                          <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-700 hover:via-indigo-700 hover:to-cyan-700 text-white shadow-lg shadow-purple-600/20 dark:shadow-purple-900/30"
                          >
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
                              <Label htmlFor="username" className="text-slate-700 dark:text-slate-200">
                                Username
                              </Label>
                              <div className="relative group">
                                <div className="absolute left-3 top-3 h-5 w-5 text-slate-400 transition-all duration-300 group-hover:text-purple-500 dark:group-hover:text-purple-400">
                                  <User className="h-5 w-5" />
                                </div>
                                <Input
                                  id="username"
                                  placeholder="johndoe"
                                  {...register("username")}
                                  className={`pl-10 h-12 bg-slate-100/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl transition-all duration-300 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 group-hover:border-purple-500 ${errors.username ? "border-red-500 dark:border-red-500" : ""}`}
                                />
                                <div className="absolute inset-0 rounded-xl border border-purple-500/0 group-hover:border-purple-500/50 pointer-events-none transition-all duration-300" />
                              </div>
                              {errors.username && (
                                <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.username.message}</p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="email" className="text-slate-700 dark:text-slate-200">
                                Email
                              </Label>
                              <div className="relative group">
                                <div className="absolute left-3 top-3 h-5 w-5 text-slate-400 transition-all duration-300 group-hover:text-purple-500 dark:group-hover:text-purple-400">
                                  <Mail className="h-5 w-5" />
                                </div>
                                <Input
                                  id="email"
                                  type="email"
                                  placeholder="john@example.com"
                                  {...register("email")}
                                  className={`pl-10 h-12 bg-slate-100/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl transition-all duration-300 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 group-hover:border-purple-500 ${errors.email ? "border-red-500 dark:border-red-500" : ""}`}
                                />
                                <div className="absolute inset-0 rounded-xl border border-purple-500/0 group-hover:border-purple-500/50 pointer-events-none transition-all duration-300" />
                              </div>
                              {errors.email && (
                                <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.email.message}</p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="password" className="text-slate-700 dark:text-slate-200">
                                Password
                              </Label>
                              <div className="relative group">
                                <div className="absolute left-3 top-3 h-5 w-5 text-slate-400 transition-all duration-300 group-hover:text-purple-500 dark:group-hover:text-purple-400">
                                  <Lock className="h-5 w-5" />
                                </div>
                                <Input
                                  id="password"
                                  type="password"
                                  placeholder="••••••••"
                                  {...register("password")}
                                  className={`pl-10 h-12 bg-slate-100/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl transition-all duration-300 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 group-hover:border-purple-500 ${errors.password ? "border-red-500 dark:border-red-500" : ""}`}
                                />
                                <div className="absolute inset-0 rounded-xl border border-purple-500/0 group-hover:border-purple-500/50 pointer-events-none transition-all duration-300" />
                              </div>
                              {errors.password && (
                                <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.password.message}</p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="profilePic" className="text-slate-700 dark:text-slate-200">
                                Profile Image
                              </Label>
                              <div className="relative group">
                                <div className="absolute left-3 top-3 h-5 w-5 text-slate-400 transition-all duration-300 group-hover:text-purple-500 dark:group-hover:text-purple-400">
                                  <Upload className="h-5 w-5" />
                                </div>
                                <Input
                                  id="profilePic"
                                  type="file"
                                  accept="image/*"
                                  onChange={handleProfileImageChange}
                                  className="pl-10 h-12 bg-slate-100/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl transition-all duration-300 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 group-hover:border-purple-500"
                                />
                                <div className="absolute inset-0 rounded-xl border border-purple-500/0 group-hover:border-purple-500/50 pointer-events-none transition-all duration-300" />
                              </div>
                              {profileImagePreview && (
                                <div className="mt-3 flex items-center justify-center">
                                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-purple-500 dark:border-purple-400 shadow-lg">
                                    <Image
                                      src={profileImagePreview || "/placeholder.svg"}
                                      alt="Profile Preview"
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                </div>
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
                              className="w-full h-12 mt-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-700 hover:via-indigo-700 hover:to-cyan-700 text-white font-medium rounded-xl shadow-lg shadow-purple-600/20 dark:shadow-purple-900/30 transition-all duration-300 relative overflow-hidden group"
                            >
                              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-600/40 via-indigo-600/40 to-cyan-600/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              <span className="relative z-10 flex items-center justify-center gap-2">
                                Continue
                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                              </span>
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="country" className="text-slate-700 dark:text-slate-200">
                                  Country
                                </Label>
                                <div className="relative group">
                                  <div className="absolute left-3 top-3 h-5 w-5 text-slate-400 transition-all duration-300 group-hover:text-purple-500 dark:group-hover:text-purple-400">
                                    <Globe className="h-5 w-5" />
                                  </div>
                                  <Input
                                    id="country"
                                    placeholder="India"
                                    {...register("country")}
                                    className={`pl-10 h-12 bg-slate-100/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl transition-all duration-300 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 group-hover:border-purple-500 ${errors.country ? "border-red-500 dark:border-red-500" : ""}`}
                                  />
                                  <div className="absolute inset-0 rounded-xl border border-purple-500/0 group-hover:border-purple-500/50 pointer-events-none transition-all duration-300" />
                                </div>
                                {errors.country && (
                                  <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                                    {errors.country.message}
                                  </p>
                                )}
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="phone" className="text-slate-700 dark:text-slate-200">
                                  Phone (Optional)
                                </Label>
                                <div className="relative group">
                                  <div className="absolute left-3 top-3 h-5 w-5 text-slate-400 transition-all duration-300 group-hover:text-purple-500 dark:group-hover:text-purple-400">
                                    <Phone className="h-5 w-5" />
                                  </div>
                                  <Input
                                    id="phone"
                                    placeholder="+91 123-4567"
                                    {...register("phone")}
                                    className={`pl-10 h-12 bg-slate-100/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl transition-all duration-300 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 group-hover:border-purple-500 ${errors.phone ? "border-red-500 dark:border-red-500" : ""}`}
                                  />
                                  <div className="absolute inset-0 rounded-xl border border-purple-500/0 group-hover:border-purple-500/50 pointer-events-none transition-all duration-300" />
                                </div>
                                {errors.phone && (
                                  <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.phone.message}</p>
                                )}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="desc" className="text-slate-700 dark:text-slate-200">
                                Description (Optional)
                              </Label>
                              <div className="relative group">
                                <div className="absolute left-3 top-3 h-5 w-5 text-slate-400 transition-all duration-300 group-hover:text-purple-500 dark:group-hover:text-purple-400">
                                  <FileText className="h-5 w-5" />
                                </div>
                                <Input
                                  id="desc"
                                  placeholder="Tell us about yourself"
                                  {...register("desc")}
                                  className={`pl-10 h-12 bg-slate-100/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl transition-all duration-300 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 group-hover:border-purple-500 ${errors.desc ? "border-red-500 dark:border-red-500" : ""}`}
                                />
                                <div className="absolute inset-0 rounded-xl border border-purple-500/0 group-hover:border-purple-500/50 pointer-events-none transition-all duration-300" />
                              </div>
                              {errors.desc && (
                                <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.desc.message}</p>
                              )}
                            </div>
                            <input type="hidden" {...register("isSeller")} value="on" />
                            {error && (
                              <Alert
                                variant="destructive"
                                className="bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
                              >
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                              </Alert>
                            )}
                            <div className="flex gap-3 pt-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={prevStep}
                                className="flex-1 h-12 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                              >
                                Back
                              </Button>
                              <Button
                                type="submit"
                                disabled={loading}
                                className="flex-1 h-12 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-700 hover:via-indigo-700 hover:to-cyan-700 text-white font-medium rounded-xl shadow-lg shadow-purple-600/20 dark:shadow-purple-900/30 transition-all duration-300 relative overflow-hidden group"
                              >
                                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-600/40 via-indigo-600/40 to-cyan-600/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                  {loading ? (
                                    <>
                                      <Loader2 className="h-5 w-5 animate-spin" />
                                      Sending OTP...
                                    </>
                                  ) : (
                                    "Get Verification Code"
                                  )}
                                </span>
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
  )
}

