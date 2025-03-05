"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const API_KEY = process.env.NEXT_PUBLIC_OPENCAGE_API_KEY; // Replace with your APIIP Key

interface WarehouseFormData {
  name: string;
  location: string;
  capacity: number;
  usedCapacity: number;
  contactInfo: string;
  latitude: number;
  longitude: number;
}

const CreateWarehousePage = () => {
  const { token } = useAuthStore();
  const router = useRouter();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<WarehouseFormData>();

  // State for search input & location suggestions
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const totalCapacity = watch("capacity") || 0;
  const usedCapacity = watch("usedCapacity") || 0;
  const availableCapacity = Math.max(totalCapacity - usedCapacity, 0);

  // Fetch city details using APIIP
  const fetchCityDetails = async (city: string) => {
    setSearchLoading(true);
    try {
      const res = await fetch(`https://apiip.net/api/check?accessKey=${API_KEY}&q=${city}`);
      const data = await res.json();
      console.log("City Data:", data); // Debugging

      if (data && data.latitude && data.longitude) {
        setValue("latitude", data.latitude, { shouldValidate: true });
        setValue("longitude", data.longitude, { shouldValidate: true });
        setValue("location", city, { shouldValidate: true });
      } else {
        toast.error("Could not fetch location data. Try another city.");
      }
    } catch (error) {
      console.error("Error fetching location:", error);
      toast.error("Failed to fetch location data.");
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle city input change with debounce
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (search.trim()) fetchCityDetails(search);
    }, 500); // Debounce API calls

    return () => clearTimeout(delayDebounce);
  }, [search]);

  const onSubmit = async (data: WarehouseFormData) => {
    setLoading(true);

    const payload = {
      name: data.name,
      location: data.location,
      capacity: data.capacity,
      usedCapacity: data.usedCapacity,
      availableCapacity,
      totalStock: 0,
      contactInfo: JSON.stringify({ phone: data.contactInfo }),
      coordinates: JSON.stringify({ latitude: data.latitude, longitude: data.longitude }),
    };

    console.log("🚀 Sending data:", payload); // Debugging: Log request payload

    try {
      const res = await fetch("http://localhost:8800/api/warehouses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create warehouse");
      toast.success("Warehouse created successfully!");
      router.push("/warehouses");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-10">
      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create a Warehouse</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name */}
            <div>
              <Label htmlFor="name">Warehouse Name</Label>
              <Input id="name" placeholder="Enter warehouse name" {...register("name", { required: "Warehouse name is required" })} />
              {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </div>

            {/* Location Search */}
            <div>
              <Label htmlFor="location">Enter City Name</Label>
              <Input
                id="location"
                placeholder="Type city name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {searchLoading && <p className="text-gray-500 text-sm">Fetching location...</p>}
            </div>

            {/* Auto-filled Latitude & Longitude */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latitude">Latitude</Label>
                <Input id="latitude" type="number" step="any" {...register("latitude")} disabled className="bg-gray-200" />
              </div>
              <div>
                <Label htmlFor="longitude">Longitude</Label>
                <Input id="longitude" type="number" step="any" {...register("longitude")} disabled className="bg-gray-200" />
              </div>
            </div>

            {/* Capacity Inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="capacity">Total Capacity</Label>
                <Input id="capacity" type="number" placeholder="Enter total capacity" {...register("capacity", { required: "Capacity is required", valueAsNumber: true })} />
              </div>
              <div>
                <Label htmlFor="usedCapacity">Used Capacity</Label>
                <Input id="usedCapacity" type="number" placeholder="Enter used capacity" {...register("usedCapacity", { required: "Used capacity is required", valueAsNumber: true })} />
              </div>
            </div>

            {/* Available Capacity (Auto-calculated) */}
            <div>
              <Label>Available Capacity</Label>
              <Input disabled value={availableCapacity} className="bg-gray-200 cursor-not-allowed" />
            </div>

            {/* Contact Info */}
            <div>
              <Label htmlFor="contactInfo">Contact Phone</Label>
              <Input id="contactInfo" type="text" placeholder="Enter contact phone" {...register("contactInfo", { required: "Contact phone is required" })} />
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Create Warehouse"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateWarehousePage;
