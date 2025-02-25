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

export default function Login() {
  const { register, handleSubmit, reset } = useForm()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { login } = useAuthStore()

  const onSubmit = async (data: any) => {
    setLoading(true)
    setError(null)
    try {
      await login(data.username, data.password)
      console.log("Login successful")
      reset()
    } catch (err: any) {
      console.error("Error:", err)
      setError(err.response?.data?.message || "Invalid credentials")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-100 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="username"
                  placeholder="johndoe"
                  {...register("username", { required: true })}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register("password", { required: true })}
                  className="pl-10"
                />
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
            <Link href="/signup" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

