"use client"

import { useForm } from "react-hook-form"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import Link from "next/link"
import { useAuthStore } from "@/store/authStore"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, User, Mail, Lock, Image, Globe, Phone, FileText } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import axios from "axios"
import { toast } from "sonner"
import { useRouter } from "next/navigation"


export default function SignUp() {
  const { register: registerField, handleSubmit, reset } = useForm()
  const { user, setUser, token } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const onSubmit = async (data: any) => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.post("http://localhost:8800/api/auth/register", {
        username: data.username,
        email: data.email,
        password: data.password,
        profilePic: data.profilePic, // ✅ Fixed field name
        country: data.country,
        phone: data.phone,
        bio: data.desc, // ✅ Fixed field name
        isSeller: data.isSeller === "on", // ✅ Convert string "on" to boolean
      })
      console.log("Registration successful", response.data)
      console.log("Full API response:", response);
  console.log("API response.data:", response.data);
  // Check if user data exists and has the right structure
  console.log("User data structure:", response.data.user);
      setUser(response.data.user) // ✅ Update global user state
      console.log("Auth store after update:", useAuthStore.getState());
      if (response.data && !response.data.user) {
        console.log("Setting user with direct response data");
        setUser(response.data); // Use the data directly if there's no user property
      } else {
        console.log("Setting user with response.data.user");
        setUser(response.data.user, response.data.token); 
      }
      
      // Check the store state again after setting
      console.log("Auth store after proper update:", useAuthStore.getState());
      toast.success("Account created successfully!") // ✅ Show success toas
      reset()
      setTimeout(() => {
        router.push("/"); // ✅ Wait a bit before redirecting
      }, 500);
    } catch (err: any) {
      console.error("Error:", err)
      setError(err.response?.data?.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center max-w-7xl mx-auto md:mt-4 md:p-6 p-2">
      <Card className="flex flex-row w-full bg-white rounded-none overflow-hidden">
        {/* Left Side - Image */}
        <div className="hidden md:flex w-1/2 bg-cover bg-center" style={{ backgroundImage: "url('/signup-bg.jpg')" }}>
          <div className="w-full h-full bg-black/40 flex items-center justify-center text-white p-6">
            <h2 className="text-3xl font-bold text-center">Join Us Today</h2>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 md:p-8 md:border border-gray-400 ">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold text-center">Create an Account</CardTitle>
            <CardDescription className="text-center">Fill in the details below to sign up</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input id="username" placeholder="johndoe" {...registerField("username", { required: true })} className="pl-10" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input id="email" type="email" placeholder="john@example.com" {...registerField("email", { required: true })} className="pl-10" />
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input id="password" type="password" placeholder="••••••••" {...registerField("password", { required: true })} className="pl-10" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="profilePic">Profile Image URL</Label>
                  <div className="relative">
                    <Image className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input id="profilePic" placeholder="https://example.com/image.jpg" {...registerField("profilePic")} className="pl-10" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input id="country" placeholder="India" {...registerField("country", { required: true })} className="pl-10" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input id="phone" placeholder="+91 123-4567" {...registerField("phone", { required: true })} className="pl-10" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="desc">Description</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input id="desc" placeholder="Tell us about yourself" {...registerField("desc")} className="pl-10" />
                  </div>
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
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-blue-600 hover:underline">
                Login
              </Link>
            </p>
          </CardFooter>
        </div>
      </Card>
    </div>
  )
}