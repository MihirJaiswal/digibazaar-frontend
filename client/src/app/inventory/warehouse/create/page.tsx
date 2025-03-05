"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, MapPin, Building2, Phone, Package, ArrowLeft } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const API_KEY = process.env.NEXT_PUBLIC_OPENCAGE_API_KEY;

interface WarehouseFormData {
  name: string;
  location: string;
  capacity: number;
  usedCapacity: number;
  contactInfo: string;
  latitude: number;
  longitude: number;
  description?: string;
}

const CreateWarehousePage = () => {
  const { token } = useAuthStore();
  const router = useRouter();
  const { register, handleSubmit, watch, setValue, formState: { errors, isValid } } = useForm<WarehouseFormData>({
    defaultValues: {
      capacity: 1000,
      usedCapacity: 0,
    },
    mode: "onChange"
  });

  // State for search input & location suggestions
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<{name: string, lat: number, lng: number}[]>([]);
  const [activeTab, setActiveTab] = useState("details");

  const totalCapacity = watch("capacity") || 0;
  const usedCapacity = watch("usedCapacity") || 0;
  const availableCapacity = Math.max(totalCapacity - usedCapacity, 0);
  const capacityPercentage = totalCapacity > 0 ? (usedCapacity / totalCapacity) * 100 : 0;

  // Fetch city details using OpenCage API
  const fetchCityDetails = useCallback(async (city: string) => {
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
  }, [setValue]); // Dependency array ensures it's not recreated on every render
  


  const selectLocation = (suggestion: {name: string, lat: number, lng: number}) => {
    setValue("location", suggestion.name, { shouldValidate: true });
    setValue("latitude", suggestion.lat, { shouldValidate: true });
    setValue("longitude", suggestion.lng, { shouldValidate: true });
    setSearch(suggestion.name);
    setSuggestions([]);
  };

  // Handle city input change with debounce
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (search.trim()) fetchCityDetails(search);
    }, 500);
  
    return () => clearTimeout(delayDebounce);
  }, [search]); // Removed `fetchCityDetails` from dependencies
  

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
      description: data.description || "",
    };

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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
          onClick={() => router.push("/warehouses")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Warehouses
        </Button>
        
        <Card className="shadow-lg border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 mr-3" />
              <div>
                <CardTitle className="text-2xl font-bold">Create New Warehouse</CardTitle>
                <CardDescription className="text-blue-100 mt-1">
                  Add a new storage location to your inventory network
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-6 pt-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Basic Details</TabsTrigger>
                <TabsTrigger value="capacity">Capacity & Location</TabsTrigger>
              </TabsList>
            </div>
            
            <CardContent className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <TabsContent value="details" className="space-y-6 mt-0">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Warehouse Name
                    </Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <Input 
                        id="name" 
                        className="pl-10" 
                        placeholder="Enter warehouse name" 
                        {...register("name", { required: "Warehouse name is required" })} 
                      />
                    </div>
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium">
                      Description (Optional)
                    </Label>
                    <textarea
                      id="description"
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Brief description of this warehouse"
                      {...register("description")}
                    />
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2">
                    <Label htmlFor="contactInfo" className="text-sm font-medium">
                      Contact Phone
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <Input 
                        id="contactInfo" 
                        className="pl-10" 
                        type="text" 
                        placeholder="Enter contact phone" 
                        {...register("contactInfo", { required: "Contact phone is required" })} 
                      />
                    </div>
                    {errors.contactInfo && <p className="text-red-500 text-sm mt-1">{errors.contactInfo.message}</p>}
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      type="button" 
                      className="w-full" 
                      onClick={() => setActiveTab("capacity")}
                    >
                      Continue to Capacity & Location
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="capacity" className="space-y-6 mt-0">
                  {/* Location Search */}
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-sm font-medium">
                      Warehouse Location
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <Input
                        id="location"
                        className="pl-10"
                        placeholder="Search for city or address..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                      {searchLoading && (
                        <Loader2 className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 animate-spin" />
                      )}
                    </div>
                    
                    {/* Location suggestions */}
                    {suggestions.length > 0 && (
                      <div className="absolute z-10 mt-1 w-full max-w-md bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
                        <ul className="py-1">
                          {suggestions.map((suggestion, index) => (
                            <li 
                              key={index}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                              onClick={() => selectLocation(suggestion)}
                            >
                              <MapPin className="h-4 w-4 text-gray-500 mr-2 flex-shrink-0" />
                              <span className="text-sm truncate">{suggestion.name}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Auto-filled Latitude & Longitude */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="latitude" className="text-sm font-medium">Latitude</Label>
                      <Input 
                        id="latitude" 
                        type="number" 
                        step="any" 
                        {...register("latitude", { required: true })} 
                        disabled 
                        className="bg-gray-50" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="longitude" className="text-sm font-medium">Longitude</Label>
                      <Input 
                        id="longitude" 
                        type="number" 
                        step="any" 
                        {...register("longitude", { required: true })} 
                        disabled 
                        className="bg-gray-50" 
                      />
                    </div>
                  </div>

                  {/* Capacity Inputs */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="capacity" className="text-sm font-medium">Total Capacity</Label>
                        <Badge variant="outline" className="font-normal">
                          <Package className="h-3 w-3 mr-1" />
                          Units
                        </Badge>
                      </div>
                      <Input 
                        id="capacity" 
                        type="number" 
                        placeholder="Enter total capacity" 
                        {...register("capacity", { 
                          required: "Capacity is required", 
                          valueAsNumber: true,
                          min: { value: 1, message: "Capacity must be greater than 0" }
                        })} 
                      />
                      {errors.capacity && <p className="text-red-500 text-sm mt-1">{errors.capacity.message}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="usedCapacity" className="text-sm font-medium">Initial Used Capacity</Label>
                      <Input 
                        id="usedCapacity" 
                        type="number" 
                        placeholder="Enter used capacity" 
                        {...register("usedCapacity", { 
                          required: "Used capacity is required", 
                          valueAsNumber: true,
                          min: { value: 0, message: "Used capacity cannot be negative" },
                          validate: value => value <= totalCapacity || "Used capacity cannot exceed total capacity"
                        })} 
                      />
                      {errors.usedCapacity && <p className="text-red-500 text-sm mt-1">{errors.usedCapacity.message}</p>}
                    </div>
                  </div>

                  {/* Available Capacity (Auto-calculated) */}
                  <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-medium">Available Capacity</Label>
                      <span className="text-sm font-medium">{availableCapacity} units</span>
                    </div>
                    <Progress value={capacityPercentage} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Used: {usedCapacity} ({Math.round(capacityPercentage)}%)</span>
                      <span>Total: {totalCapacity}</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 flex flex-col sm:flex-row gap-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1" 
                      onClick={() => setActiveTab("details")}
                    >
                      Back to Details
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1" 
                      disabled={loading || !isValid}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Warehouse"
                      )}
                    </Button>
                  </div>
                </TabsContent>
              </form>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default CreateWarehousePage;
