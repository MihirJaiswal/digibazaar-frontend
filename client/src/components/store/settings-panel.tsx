"use client";

import { useState } from "react";
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
  // State for customization fields
  const [customization, setCustomization] = useState<Customization>({
    theme: initialCustomization?.theme || "",
    bannerText: initialCustomization?.bannerText || "",
    // We still store an initial URL (if any) but it can be overridden by file upload
    bannerImage: initialCustomization?.bannerImage || "",
    footerText: initialCustomization?.footerText || "",
    backgroundColor: initialCustomization?.backgroundColor || "#ffffff",
    buttonColor: initialCustomization?.buttonColor || "#3b82f6",
    textColor: initialCustomization?.textColor || "#000000",
    fontFamily: initialCustomization?.fontFamily || "",
    fontSize: initialCustomization?.fontSize || "",
    fontColor: initialCustomization?.fontColor || "#000000",
  });

  // State for banner image file upload
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
  const [bannerImagePreview, setBannerImagePreview] = useState<string>(
    initialCustomization?.bannerImage || ""
  );

 
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setCustomization((prev) => ({ ...prev, [id]: value }));
  };

  // Handler for banner image file input change
  const handleBannerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBannerImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setBannerImagePreview(previewUrl);
      // Optionally clear the text URL if a file is chosen
      setCustomization((prev) => ({ ...prev, bannerImage: "" }));
    }
  };

  // Handler for footer image file input change
  

  const handleSaveChanges = async () => {
    try {
      // Determine whether to use POST or PUT based on existence of initialCustomization
      const method = initialCustomization ? "PUT" : "POST";
      const url = "http://localhost:8800/api/stores/theme-customization";
      
      // Build FormData payload so that we can include file uploads
      const formPayload = new FormData();
      // Append text fields from customization
      for (const key in customization) {
        formPayload.append(key, (customization as any)[key] || "");
      }
      // Append storeId
      formPayload.append("storeId", storeId);
      // Append banner image file if one was selected
      if (bannerImageFile) {
        formPayload.append("bannerImage", bannerImageFile);
      }
  
      
      const response = await fetch(url, {
        method,
        headers: {
          // Let the browser set the Content-Type with proper boundary.
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
                value={customization.bannerText}
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
                <img
                  src={bannerImagePreview}
                  alt="Banner Preview"
                  className="mt-2 w-full rounded-md object-cover"
                />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="footerText">Footer Text</Label>
              <Input
                id="footerText"
                value={customization.footerText}
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
                  value={customization.backgroundColor}
                  onChange={handleInputChange}
                  className="h-10 w-10 p-1"
                />
                <Input
                  id="backgroundColor"
                  value={customization.backgroundColor}
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
                  value={customization.buttonColor}
                  onChange={handleInputChange}
                  className="h-10 w-10 p-1"
                />
                <Input
                  id="buttonColor"
                  value={customization.buttonColor}
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
                  value={customization.textColor}
                  onChange={handleInputChange}
                  className="h-10 w-10 p-1"
                />
                <Input
                  id="textColor"
                  value={customization.textColor}
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
                value={customization.fontFamily}
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
                value={customization.fontSize}
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
                  value={customization.fontColor}
                  onChange={handleInputChange}
                  className="h-10 w-10 p-1"
                />
                <Input
                  id="fontColor"
                  value={customization.fontColor}
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
