"use client";

import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AlertCircle, Lock, Loader2, ArrowLeft, CheckCircle, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import dynamic from "next/dynamic";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";

// Dynamically import framer-motion's motion.div to reduce initial bundle size.
const MotionDiv = dynamic(
  () => import("framer-motion").then((mod) => mod.motion.div),
  { ssr: false }
);

export default function ResetPassword() {
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const params = useParams();
  const token = params.id as string;
  
  const password = watch("password", "");
  
  useEffect(() => {
    if (!token) {
      setError("Invalid reset link. Please request a new password reset.");
    }
  }, [token]);

  const onSubmit = async (data: any) => {
    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await axios.post("http://localhost:8800/api/auth/reset-password", {
        token: token,
        newPassword: data.password
      });
      
      setSuccess(true);
      toast.success("Password reset successfully!");
      reset();
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
      
    } catch (err: any) {
      console.error("Error:", err);
      setError(err.response?.data?.message || "Failed to reset password. This link may be expired or invalid.");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 w-[1000px] h-[1000px] bg-purple-500/5 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/2 w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="container relative flex items-center justify-center pt-28 pb-20">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border shadow-2xl backdrop-blur-xl">
            <CardHeader className="space-y-1 pb-6">
              <MotionDiv
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <CardTitle className="text-3xl font-bold text-center bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">
                  Create New Password
                </CardTitle>
                <CardDescription className="text-center text-base">
                  Please enter your new password
                </CardDescription>
              </MotionDiv>
            </CardHeader>

            <CardContent>
              {success ? (
                <div className="space-y-4">
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-3 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm text-green-800 dark:text-green-200">
                        Password reset successfully!
                      </p>
                      <p className="text-xs text-green-700 dark:text-green-300">
                        You will be redirected to the login page shortly.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      New Password
                    </Label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create new password"
                        {...register("password", { 
                          required: "Password is required", 
                          minLength: { value: 6, message: "Password must be at least 6 characters" } 
                        })}
                        className="pl-10 pr-10 h-12 bg-muted/50 border-muted-foreground/20 transition-all group-hover:bg-muted group-hover:border-primary"
                      />
                      <button 
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-primary transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-xs text-red-500 mt-1">{errors.password.message as string}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">
                      Confirm Password
                    </Label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        {...register("confirmPassword", {
                          required: "Please confirm your password",
                          validate: value => value === password || "Passwords do not match"
                        })}
                        className="pl-10 pr-10 h-12 bg-muted/50 border-muted-foreground/20 transition-all group-hover:bg-muted group-hover:border-primary"
                      />
                      <button 
                        type="button"
                        onClick={toggleConfirmPasswordVisibility}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-primary transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message as string}</p>
                    )}
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
                    className="w-full h-12 bg-gradient-to-r from-purple-500 to-cyan-600 text-white font-medium rounded-md shadow-md hover:from-purple-600 hover:to-cyan-700 transition-colors"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Resetting Password...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        Reset Password
                      </div>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>

            <CardFooter className="flex justify-center">
              <Link
                href="/auth/login"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Link>
            </CardFooter>
          </Card>
        </MotionDiv>
      </div>
    </div>
  );
}