"use client"

import { useForm } from "react-hook-form"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useAuthStore } from "@/store/authStore"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, User, Mail, Lock, Image, Globe, Phone, FileText } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SignUp() {
  const { register: registerField, handleSubmit, reset } = useForm()
  const { register: authRegister } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (data: any) => {
    setLoading(true)
    setError(null)
    try {
      await authRegister(
        data.username,
        data.email,
        data.password,
        data.img,
        data.country,
        data.phone,
        data.desc,
        data.isSeller,
      )
      reset()
    } catch (err: any) {
      console.error("Error:", err)
      setError(err.response?.data?.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-100 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
          <CardDescription className="text-center">Enter your details below to create your account</CardDescription>
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
                  {...registerField("username", { required: true })}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  {...registerField("email", { required: true })}
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
                  {...registerField("password", { required: true })}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="img">Profile Image URL</Label>
              <div className="relative">
                <Image className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="img"
                  placeholder="https://example.com/image.jpg"
                  {...registerField("img")}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="country"
                  placeholder="United States"
                  {...registerField("country", { required: true })}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  placeholder="+1 (555) 123-4567"
                  {...registerField("phone", { required: true })}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Description</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input id="desc" placeholder="Tell us about yourself" {...registerField("desc")} className="pl-10" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="isSeller" {...registerField("isSeller")} />
              <Label htmlFor="isSeller">Register as Seller</Label>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Creating Account..." : "Sign Up"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

