"use client"

import { useForm } from "react-hook-form"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { useAuthStore } from "@/store/authStore"
import { Label } from "@/components/ui/label"
import { AlertCircle, User, Lock, Loader2, ArrowRight, Sparkles } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import dynamic from "next/dynamic"
import Link from "next/link"
import axios from "axios"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

// Dynamically import framer-motion components
const MotionDiv = dynamic(() => import("framer-motion").then((mod) => mod.motion.div), { ssr: false })

const MotionPath = dynamic(() => import("framer-motion").then((mod) => mod.motion.path), { ssr: false })

const MotionSVG = dynamic(() => import("framer-motion").then((mod) => mod.motion.svg), { ssr: false })

export default function Login() {
  const { register, handleSubmit, reset } = useForm()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { setUser } = useAuthStore()
  const router = useRouter()

  const onSubmit = async (data: any) => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.post("http://localhost:8800/api/auth/login", {
        username: data.username,
        password: data.password,
      })
      console.log("Login successful", response.data)
      setUser(response.data.user, response.data.token)
      toast.success("Logged in successfully!")
      reset()
      router.push("/")
    } catch (err: any) {
      console.error("Error:", err)
      setError(err.response?.data?.message || "Invalid credentials")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-start justify-center overflow-hidden dark:bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-900 py-4">
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
          className="absolute top-0 left-0 w-[600px] h-[600px] dark:bg-purple-600/20 rounded-full blur-[120px]"
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
          className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[100px]"
        />

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMDIwMjAiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0aDR2MWgtNHYtMXptMC0yaDF2NGgtMXYtNHptMi0yaDF2MWgtMXYtMXptLTIgMmgxdjFoLTF2LTF6bS0yLTJoMXYxaC0xdi0xem0yLTJoMXYxaC0xdi0xem0tMiAyaDF2MWgtMXYtMXptLTItMmgxdjFoLTF2LTF6bTggMGgxdjFoLTF2LTF6bS0yIDBoMXYxaC0xdi0xem0tMi0yaDF2MWgtMXYtMXptLTIgMGgxdjFoLTF2LTF6bS0yIDBoMXYxaC0xdi0xem0xMC02aDFWMWgtMXYxem0yIDBoMVYxaC0xdjF6bTIgMGgxVjFoLTF2MXptLTIgMmgxdjFoLTF2LTF6bTIgMGgxdjFoLTF2LTF6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />
      </div>

      <div className="container relative flex items-center justify-center z-10 px-4 py-10">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <Card className="relative border-0 shadow-[0_0_60px_-15px_rgba(139,92,246,0.3)] dark:bg-black/40 backdrop-blur-2xl overflow-hidden rounded-2xl">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-600/20 to-transparent rounded-bl-full" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-cyan-600/20 to-transparent rounded-tr-full" />

            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-cyan-500 to-purple-600" />

            <CardHeader className="space-y-1 pb-8 pt-8 relative">
              <MotionDiv
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-col items-center"
              >
                <MotionSVG
                  width="60"
                  height="60"
                  viewBox="0 0 60 60"
                  className="mb-4"
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

                <CardTitle className="text-3xl font-bold text-center">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
                    Welcome Back
                  </span>
                </CardTitle>
                <CardDescription className="text-center text-base text-slate-500 dark:text-slate-300 mt-2">
                  Sign in to your account to continue
                </CardDescription>
              </MotionDiv>
            </CardHeader>

            <CardContent className="pb-4">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <MotionDiv
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="space-y-2"
                >
                  <Label htmlFor="username" className="text-sm font-medium text-slate-500 dark:text-slate-300 ">
                    Username
                  </Label>
                  <div className="relative group">
                    <div className="absolute left-3 top-3 h-5 w-5 text-slate-400 transition-all duration-300 group-hover:text-purple-400">
                      <User className="h-5 w-5" />
                    </div>
                    <Input
                      id="username"
                      placeholder="Enter your username"
                      {...register("username", { required: true })}
                      className="pl-10 h-12 dark:bg-slate-800/50 border-slate-700 dark:text-slate-200 rounded-xl transition-all duration-300 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 dark:group-hover:bg-slate-800/70"
                    />
                    <div className="absolute inset-0 rounded-xl border border-purple-500/0 group-hover:border-purple-500/50 pointer-events-none transition-all duration-300" />
                  </div>
                </MotionDiv>

                <MotionDiv
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="space-y-2"
                >
                  <Label htmlFor="password" className="text-sm font-medium text-slate-500 dark:text-slate-300">
                    Password
                  </Label>
                  <div className="relative group">
                    <div className="absolute left-3 top-3 h-5 w-5 text-slate-400 transition-all duration-300 group-hover:text-purple-400">
                      <Lock className="h-5 w-5" />
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      {...register("password", { required: true })}
                      className="pl-10 h-12 dark:bg-slate-800/50 border-slate-700 dark:text-slate-200 rounded-xl transition-all duration-300 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 dark:group-hover:bg-slate-800/70"
                    />
                    <div className="absolute inset-0 rounded-xl border border-purple-500/0 group-hover:border-purple-500/50 pointer-events-none transition-all duration-300" />
                  </div>
                </MotionDiv>

                <MotionDiv
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="flex items-center justify-between"
                >
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-slate-500 dark:text-slate-400  hover:text-purple-400 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </MotionDiv>

                {error && (
                  <MotionDiv
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert variant="destructive" className="bg-red-500/20 border-red-500/50 text-red-200">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </MotionDiv>
                )}

                <MotionDiv
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-700 hover:via-indigo-700 hover:to-cyan-700 text-white font-medium rounded-xl shadow-lg shadow-purple-600/20 transition-all duration-300 relative overflow-hidden group"
                  >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-600/40 via-indigo-600/40 to-cyan-600/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {loading ? (
                      <div className="flex items-center justify-center gap-2 relative z-10">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 relative z-10">
                        <span>Sign In</span>
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    )}
                  </Button>
                </MotionDiv>
              </form>
            </CardContent>

            <CardFooter className="flex flex-col gap-5 pt-2 pb-8">
              <MotionDiv
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="relative w-full"
              >
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700/50"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="dark:bg-black/30 backdrop-blur-sm px-2 text-slate-600 dark:text-slate-400">or</span>
                </div>
              </MotionDiv>

              <MotionDiv
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.9 }}
                className="text-center"
              >
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/auth/signup"
                    className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                  >
                    Create one now
                  </Link>
                </p>
              </MotionDiv>

              <MotionDiv
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 1 }}
                className="absolute -bottom-3 left-1/2 transform -translate-x-1/2"
              >
                <div className="flex items-center justify-center text-xs text-slate-500 gap-1">
                  <Sparkles className="h-3 w-3" />
                </div>
              </MotionDiv>
            </CardFooter>
          </Card>
        </MotionDiv>
      </div>
    </div>
  )
}

