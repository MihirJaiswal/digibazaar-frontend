"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, User, Mail, Lock, Globe, Phone, FileText, Loader2, ArrowRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import dynamic from "next/dynamic";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Dynamically load Framer Motion components so they don't bloat the initial bundle
const MotionDiv = dynamic(() =>
  import("framer-motion").then((mod) => mod.motion.div), { ssr: false }
);
const AnimatePresenceDynamic = dynamic(() =>
  import("framer-motion").then((mod) => mod.AnimatePresence), { ssr: false }
);

export default function SignUp() {
  const { register: registerField, handleSubmit, watch, reset } = useForm();
  const { setUser, token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const router = useRouter();

  const watchedFields = watch();

  // State for profile image file and preview URL
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>("");

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImageFile(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      // Build a FormData payload for file upload
      const formPayload = new FormData();
      formPayload.append("username", data.username);
      formPayload.append("email", data.email);
      formPayload.append("password", data.password);
      formPayload.append("country", data.country);
      formPayload.append("phone", data.phone);
      formPayload.append("bio", data.desc);
      formPayload.append("isSeller", data.isSeller === "on" ? "true" : "false");

      if (profileImageFile) {
        formPayload.append("profilePic", profileImageFile);
      } else if (data.profilePic) {
        formPayload.append("profilePic", data.profilePic);
      }

      const response = await axios.post("http://localhost:8800/api/auth/register", formPayload, {
        headers: {
          // Let the browser set the multipart boundary automatically
          Authorization: `Bearer ${token}`,
        },
      });
      
      // In case API returns user info differently
      if (response.data && !response.data.user) {
        setUser(response.data);
      } else {
        setUser(response.data.user, response.data.token);
      }
      
      toast.success("Account created successfully!");
      reset();
      setTimeout(() => {
        router.push("/");
      }, 500);
    } catch (err: any) {
      console.error("Error:", err);
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const prevStep = () => setStep(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-background relative overflow-hidden">
      {/* Lightweight background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl transform rotate-12 animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-primary/10 to-transparent rounded-full blur-3xl transform -rotate-12 animate-pulse" />
      </div>

      <div className="container relative flex items-center justify-center min-h-screen py-20 px-4">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl"
        >
          <Card className="border-0 shadow-2xl bg-background/80 backdrop-blur-xl">
            <div className="md:grid md:grid-cols-5 divide-x divide-border">
              {/* Left side – Progress & Navigation */}
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
                        <span className="text-primary">{step}/2</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <MotionDiv
                          className="h-full bg-primary"
                          initial={{ width: "0%" }}
                          animate={{ width: `${(step / 2) * 100}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <button
                        onClick={() => setStep(1)}
                        className={`w-full p-4 rounded-lg text-left transition-all ${
                          step === 1 ? "bg-primary text-primary-foreground" : "hover:bg-muted"
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
                        onClick={() =>
                          watchedFields.username && watchedFields.email && watchedFields.password && setStep(2)
                        }
                        className={`w-full p-4 rounded-lg text-left transition-all ${
                          step === 2 ? "bg-primary text-primary-foreground" : "hover:bg-muted"
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
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <AnimatePresenceDynamic mode="wait">
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
                              {...registerField("username", { required: true })}
                              className="pl-10"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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
                          <Label htmlFor="profilePic">Profile Image</Label>
                          <div className="relative">
                            <Image
                              src="/icons/profile-upload.svg"
                              alt="Upload"
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
                            <img
                              src={profileImagePreview}
                              alt="Profile Preview"
                              className="mt-2 h-24 w-24 rounded-full object-cover"
                            />
                          )}
                        </div>

                        <Button
                          type="button"
                          onClick={() => setStep(2)}
                          disabled={!watchedFields.username || !watchedFields.email || !watchedFields.password}
                          className="w-full"
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
                                {...registerField("country", { required: true })}
                                className="pl-10"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="phone"
                                placeholder="+91 123-4567"
                                {...registerField("phone", { required: true })}
                                className="pl-10"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="desc">Description</Label>
                            <div className="relative">
                              <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="desc"
                                placeholder="Tell us about yourself"
                                {...registerField("desc")}
                                className="pl-10"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 bg-muted/50 p-4 rounded-lg">
                          <Checkbox id="isSeller" {...registerField("isSeller")} />
                          <Label htmlFor="isSeller" className="text-sm">
                            Register as a Seller
                          </Label>
                        </div>

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
                          <Button type="submit" disabled={loading} className="flex-1">
                            {loading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                              </>
                            ) : (
                              "Create Account"
                            )}
                          </Button>
                        </div>
                      </MotionDiv>
                    )}
                  </AnimatePresenceDynamic>
                </form>
              </div>
            </div>
          </Card>
        </MotionDiv>
      </div>
    </div>
  );
}
