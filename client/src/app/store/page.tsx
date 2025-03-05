"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const CreateStorePage = () => {
  const { token } = useAuthStore();
  const router = useRouter();

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    theme: "default",
    logo: "",
    domain: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:8800/api/stores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("Failed to create store");
      }

      const data = await res.json();
      setMessage("Store created successfully!");
      setLoading(false);

      // Redirect to store dashboard after creation
      setTimeout(() => {
        router.push(`/store/${data.id}`);
      }, 1500);
    } catch (error: any) {
      setMessage(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-lg shadow-md">
        <CardHeader>
          <CardTitle>Create Your Store</CardTitle>
        </CardHeader>
        <CardContent>
          {message && (
            <div className={`mb-4 p-3 rounded ${message.includes("success") ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"}`}>
              {message}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Store Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter your store name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe your store"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="logo">Logo URL</Label>
              <Input
                id="logo"
                name="logo"
                placeholder="Store logo URL"
                value={formData.logo}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="domain">Custom Domain (Optional)</Label>
              <Input
                id="domain"
                name="domain"
                placeholder="example.com"
                value={formData.domain}
                onChange={handleChange}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating Store..." : "Create Store"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateStorePage;
