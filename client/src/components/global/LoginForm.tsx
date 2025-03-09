"use client"

import { useForm } from "react-hook-form"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { useAuthStore } from "@/store/authStore"
import { Label } from "@/components/ui/label"
import { AlertCircle, User, Lock, Loader2, ArrowRight } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { motion } from "framer-motion"
import Link from "next/link"
import axios from "axios"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function Login() {
  const { register, handleSubmit, reset } = useForm()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const {  setUser, token } = useAuthStore()
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
      console.log(response.data.token)
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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 w-[1000px] h-[1000px] bg-primary/5 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="container relative flex items-center justify-center min-h-screen py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border-0 shadow-2xl bg-background/80 backdrop-blur-xl">
            <CardHeader className="space-y-1 pb-8">
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <CardTitle className="text-3xl font-bold text-center bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">
                  Welcome Back
                </CardTitle>
                <CardDescription className="text-center text-base">
                  Sign in to your account to continue
                </CardDescription>
              </motion.div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium">
                    Username
                  </Label>
                  <div className="relative group">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
                    <Input
                      id="username"
                      placeholder="Enter your username"
                      {...register("username", { required: true })}
                      className="pl-10 h-12 bg-muted/50 border-muted-foreground/20 transition-all group-hover:bg-muted group-hover:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      {...register("password", { required: true })}
                      className="pl-10 h-12 bg-muted/50 border-muted-foreground/20 transition-all group-hover:bg-muted group-hover:border-primary"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                {error && (
                  <Alert variant="destructive" className="animate-in fade-in-50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 text-base font-medium"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing in...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      Sign In
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 text-center">
              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-muted-foreground/20"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">or</span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  href="/auth/signup"
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Create one now
                </Link>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
