"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
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
import { AlertCircle, Mail, Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import dynamic from "next/dynamic";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";

// Dynamically import framer-motion's motion.div to reduce initial bundle size.
const MotionDiv = dynamic(
  () => import("framer-motion").then((mod) => mod.motion.div),
  { ssr: false }
);

export default function ForgotPassword() {
  const { register, handleSubmit, reset } = useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const onSubmit = async (data: any) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      await axios.post("http://localhost:8800/api/auth/forgot-password", {
        email: data.email,
      });
      setSuccess(true);
      toast.success("Password reset link sent to your email!");
      reset();
    } catch (err: any) {
      console.error("Error:", err);
      setError(err.response?.data?.message || "Failed to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
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
                  Reset Password
                </CardTitle>
                <CardDescription className="text-center text-base">
                  Enter your email to receive a password reset link
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
                        Reset link sent successfully!
                      </p>
                      <p className="text-xs text-green-700 dark:text-green-300">
                        Please check your email inbox and follow the instructions to reset your password.
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => setSuccess(false)}
                    className="w-full h-12 bg-gradient-to-r from-purple-500 to-cyan-600 text-white font-medium rounded-md shadow-md hover:from-purple-600 hover:to-cyan-700 transition-colors"
                  >
                    Send another link
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </Label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email address"
                        {...register("email", { required: true })}
                        className="pl-10 h-12 bg-muted/50 border-muted-foreground/20 transition-all group-hover:bg-muted group-hover:border-primary"
                      />
                    </div>
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
                        Sending...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        Send Reset Link
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