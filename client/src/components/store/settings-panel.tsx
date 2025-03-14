"use client";

import { useState, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import Image from "next/image";

interface Customization {
  fontFamily?: string;
  fontSize?: string;
  fontColor?: string;
  backgroundColor?: string;
  textColor?: string;
  buttonColor?: string;
  bannerImage?: string;
  bannerText?: string;
  footerText?: string;
  theme?: string;
  id?: string;
  storeId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SettingsPanelProps {
  storeId: string;
  initialCustomization?: Customization;
  token: string;
  onCustomizationUpdate: (data: Customization) => void;
}

export function SettingsPanel({
  storeId,
  initialCustomization,
  token,
  onCustomizationUpdate,
}: SettingsPanelProps) {
  // Define default values
  const defaultValues = {
    theme: "",
    bannerText: "",
    bannerImage: "",
    footerText: "",
    backgroundColor: "#ffffff",
    buttonColor: "#3b82f6",
    textColor: "#000000",
    fontFamily: "",
    fontSize: "",
    fontColor: "#000000",
  };

  // State for customization fields - use initialCustomization values if they exist, otherwise use defaults
  const [customization, setCustomization] = useState<Customization>(() => {
    // Create a new object with defaults first
    const initialState = { ...defaultValues };
    
    // Then override with any existing values from initialCustomization
    if (initialCustomization) {
      Object.keys(initialState).forEach((key) => {
        const typedKey = key as keyof Customization;
        if (initialCustomization[typedKey] !== undefined && initialCustomization[typedKey] !== null) {
          (initialState as any)[key] = initialCustomization[typedKey];
        }
      });
    }
    
    return initialState;
  });

  // State for banner image file upload
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
  const [bannerImagePreview, setBannerImagePreview] = useState<string>(() => {
    return initialCustomization?.bannerImage || "";
  });

  // Update state if initialCustomization changes
  useEffect(() => {
    if (initialCustomization) {
      setCustomization(prevState => {
        const newState = { ...prevState };
        Object.keys(initialCustomization).forEach(key => {
          const typedKey = key as keyof Customization;
          if (initialCustomization[typedKey] !== undefined && initialCustomization[typedKey] !== null) {
            (newState as any)[key] = initialCustomization[typedKey];
          }
        });
        return newState;
      });

      if (initialCustomization.bannerImage) {
        setBannerImagePreview(initialCustomization.bannerImage);
      }
    }
  }, [initialCustomization]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setCustomization(prev => ({ ...prev, [id]: value }));
  };

  // Handler for banner image file input change
  const handleBannerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBannerImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setBannerImagePreview(previewUrl);
      // Optionally clear the text URL if a file is chosen
      setCustomization(prev => ({ ...prev, bannerImage: "" }));
    }
  };

  const handleSaveChanges = async () => {
    try {
      // Determine whether to use POST or PUT based on existence of initialCustomization
      const method = initialCustomization ? "PUT" : "POST";
      const url = "http://localhost:8800/api/stores/theme-customization";
      
      // Build FormData payload
      const formPayload = new FormData();
      
      // IMPORTANT: Make sure to NOT include storeId in the customization object
      // First append the storeId separately
      formPayload.append("storeId", storeId);
      
      // Then append other customization fields, excluding any that might be in initialCustomization but not in our state
      const customizationToSend = { ...customization };
      
      // Remove any fields that might cause issues
      delete customizationToSend.id;
      delete customizationToSend.storeId;
      delete customizationToSend.createdAt;
      delete customizationToSend.updatedAt;
      
      // Append the remaining fields
      for (const key in customizationToSend) {
        if (customizationToSend[key as keyof Customization] !== undefined) {
          formPayload.append(key, String(customizationToSend[key as keyof Customization]));
        }
      }
      
      // Append banner image file if one was selected
      if (bannerImageFile) {
        formPayload.append("bannerImage", bannerImageFile);
      }
  
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formPayload,
      });

      if (!response.ok) {
        throw new Error("Failed to save customization");
      }
      const data = await response.json();
      toast.success("Customization saved!");
      onCustomizationUpdate(data);
    } catch (error) {
      console.error("Error saving customization", error);
      toast.error("Error saving customization");
    }
  };

  return (
    <Accordion type="multiple" defaultValue={["general", "colors", "typography"]} className="px-4 py-2">
      {/* General Settings */}
      <AccordionItem value="general">
        <AccordionTrigger>General Settings</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bannerText">Banner Text</Label>
              <Input
                id="bannerText"
                value={customization.bannerText || ""}
                onChange={handleInputChange}
                placeholder="Enter banner text"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bannerImage">Banner Image</Label>
              {/* File input for banner image */}
              <Input
                id="bannerImage"
                type="file"
                accept="image/*"
                onChange={handleBannerImageChange}
              />
              {/* Display preview if available */}
              {bannerImagePreview && (
                <div className="mt-2">
                  <Image
                    src={bannerImagePreview}
                    alt="Banner Preview"
                    width={200}
                    height={100}
                    loading="lazy"
                    quality={100}
                    className="w-full rounded-md object-cover"
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="footerText">Footer Text</Label>
              <Input
                id="footerText"
                value={customization.footerText || ""}
                onChange={handleInputChange}
                placeholder="Enter footer text"
              />
            </div>
            <Separator className="my-4" />
            <Button onClick={handleSaveChanges}>Save Changes</Button>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Colors & Branding */}
      <AccordionItem value="colors">
        <AccordionTrigger>Colors & Branding</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="backgroundColor">Background Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="backgroundColor"
                  type="color"
                  value={customization.backgroundColor || defaultValues.backgroundColor}
                  onChange={handleInputChange}
                  className="h-10 w-10 p-1"
                />
                <Input
                  id="backgroundColor"
                  value={customization.backgroundColor || defaultValues.backgroundColor}
                  onChange={handleInputChange}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="buttonColor">Button Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="buttonColor"
                  type="color"
                  value={customization.buttonColor || defaultValues.buttonColor}
                  onChange={handleInputChange}
                  className="h-10 w-10 p-1"
                />
                <Input
                  id="buttonColor"
                  value={customization.buttonColor || defaultValues.buttonColor}
                  onChange={handleInputChange}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="textColor">Text Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="textColor"
                  type="color"
                  value={customization.textColor || defaultValues.textColor}
                  onChange={handleInputChange}
                  className="h-10 w-10 p-1"
                />
                <Input
                  id="textColor"
                  value={customization.textColor || defaultValues.textColor}
                  onChange={handleInputChange}
                  className="flex-1"
                />
              </div>
            </div>
            <Separator className="my-4" />
            <Button onClick={handleSaveChanges}>Save Changes</Button>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Typography */}
      <AccordionItem value="typography">
        <AccordionTrigger>Typography</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fontFamily">Font Family</Label>
              <select
                id="fontFamily"
                className="w-full rounded-md border p-2"
                value={customization.fontFamily || ""}
                onChange={handleInputChange}
              >
                <option value="">Select font</option>
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
                <option value="Open Sans">Open Sans</option>
                <option value="Montserrat">Montserrat</option>
                <option value="Poppins">Poppins</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fontSize">Font Size</Label>
              <Input
                id="fontSize"
                value={customization.fontSize || ""}
                onChange={handleInputChange}
                placeholder="e.g., 16px"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fontColor">Font Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="fontColor"
                  type="color"
                  value={customization.fontColor || defaultValues.fontColor}
                  onChange={handleInputChange}
                  className="h-10 w-10 p-1"
                />
                <Input
                  id="fontColor"
                  value={customization.fontColor || defaultValues.fontColor}
                  onChange={handleInputChange}
                  className="flex-1"
                />
              </div>
            </div>
            <Separator className="my-4" />
            <Button onClick={handleSaveChanges}>Save Changes</Button>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}