"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { Loader2, Trash2 } from "lucide-react";

const categories = [
  { value: "WEB_DEVELOPMENT", label: "Web Development" },
  { value: "GRAPHIC_DESIGN", label: "Graphic Design" },
  { value: "DIGITAL_MARKETING", label: "Digital Marketing" },
  { value: "CONTENT_WRITING", label: "Content Writing" },
  { value: "VIDEO_ANIMATION", label: "Video & Animation" },
  { value: "SOFTWARE_DEVELOPMENT", label: "Software Development" },
  { value: "MOBILE_DEVELOPMENT", label: "Mobile Development" },
  { value: "DATA_ANALYTICS", label: "Data Analytics" },
  { value: "BUSINESS", label: "Business Consulting" },
  { value: "AUDIO_PRODUCTION", label: "Audio Production" },
  { value: "PHOTOGRAPHY", label: "Photography" },
  { value: "VIRTUAL_ASSISTANTS", label: "Virtual Assistants" },
];

export default function CreateGigPage() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    title: "",
    shortDesc: "",
    desc: "",
    categoryId: "",
    price: "",
    deliveryTime: 1,
    revisionNumber: 1,
    features: [""],
    cover: "",
    images: [""],
    resume: "",
    yearsOfExp: "",
  });

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, categoryId: value }));
  };

  // Handle feature addition
  const addFeature = () => {
    setFormData((prev) => ({ ...prev, features: [...prev.features, ""] }));
  };

  // Handle updating feature
  const updateFeature = (index: number, value: string) => {
    const updatedFeatures = [...formData.features];
    updatedFeatures[index] = value;
    setFormData((prev) => ({ ...prev, features: updatedFeatures }));
  };

  // Handle removing feature
  const removeFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  // Submit gig to API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      const response = await fetch("http://localhost:8800/api/gigs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user?.id,
          ...formData,
        }),
      });

      if (!response.ok) throw new Error("Failed to create gig");

      toast.success("Gig created successfully!");
      router.push("/my-gigs");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <main className="container py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Create a New Gig</h1>
          <Card>
            <CardHeader>
              <CardTitle>Step {step} of 3</CardTitle>
              <CardDescription>Fill in the details to create your gig.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input name="title" value={formData.title} onChange={handleChange} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shortDesc">Short Description</Label>
                    <Input name="shortDesc" value={formData.shortDesc} onChange={handleChange} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="desc">Full Description</Label>
                    <Textarea name="desc" value={formData.desc} onChange={handleChange} />
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.categoryId} onValueChange={handleSelectChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category, index) => (
                          <SelectItem key={index} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <Input type="number" name="price" value={formData.price} onChange={handleChange} />
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="cover">Cover Image URL</Label>
                    <Input name="cover" value={formData.cover} onChange={handleChange} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="yearsOfExp">Years of Experience</Label>
                    <Input type="number" name="yearsOfExp" value={formData.yearsOfExp} onChange={handleChange} />
                  </div>
                </>
              )}

              <div className="flex justify-between mt-4">
                {step > 1 && <Button onClick={handleBack}>Back</Button>}
                {step < 3 ? (
                  <Button onClick={handleNext}>Next</Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Gig"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
