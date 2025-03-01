"use client"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { useAuthStore } from "@/store/authStore"
import { Label } from "@/components/ui/label"
import { AlertCircle, User, Lock } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import axios from "axios"
import { toast } from "sonner"
import { useRouter } from "next/navigation"


export default function Login() {
  const { register, handleSubmit, reset } = useForm()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user, setUser, token } = useAuthStore()
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
      setUser(response.data.user, response.data.token) // ✅ Setting global user state
      console.log(response.data.token)
      toast.success("Logged in successfully!") // ✅ Display success toast
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
    <div className="flex justify-center items-center max-w-7xl mx-auto md:mt-20 md:p-6 p-2">
      <Card className="flex flex-row w-full max-w-5xl bg-white overflow-hidden rounded-none">
        {/* Left Side - Image */}
        <div className="hidden md:flex w-1/2 bg-cover bg-center" style={{ backgroundImage: "url('/login-bg.jpg')" }}>
          <div className="w-full h-full bg-black/40 flex items-center justify-center text-white p-6">
            <h2 className="text-3xl font-bold text-center">Welcome Back</h2>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-8">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold text-center">Log In</CardTitle>
            <CardDescription className="text-center">Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input id="username" placeholder="johndoe" {...register("username", { required: true })} className="pl-10" />
                </div>
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input id="password" type="password" placeholder="••••••••" {...register("password", { required: true })} className="pl-10" />
                </div>
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Logging in..." : "Log In"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link href="/auth/signup" className="text-blue-600 hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </div>
      </Card>
    </div>
  )
}
