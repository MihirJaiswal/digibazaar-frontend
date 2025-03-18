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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import Image from "next/image";

interface Customization {
  // Basic fields
  theme?: string;
  id?: string;
  storeId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  
  // Font settings
  fontFamily?: string;
  fontSize?: string;
  fontColor?: string;
  headingFontFamily?: string;
  headingFontSize?: string;
  headingFontColor?: string;
  
  // Color scheme
  backgroundColor?: string;
  backgroundColor2?: string;
  textColor?: string;
  accentColor?: string;
  borderColor?: string;
  cardBackgroundColor?: string;
  
  // Button styling
  buttonColor?: string;
  buttonTextColor?: string;
  buttonHoverColor?: string;
  buttonHoverTextColor?: string;
  buttonBorderRadius?: string;
  
  // Navigation styling
  navBarColor?: string;
  navBarTextColor?: string;
  navBarHoverColor?: string;
  
  // Link styling
  linkColor?: string;
  linkHoverColor?: string;
  
  // Message styling
  errorColor?: string;
  successColor?: string;
  warningColor?: string;
  
  // Layout settings
  borderRadius?: string;
  productGridLayout?: string;
  containerWidth?: string;
  
  // Images
  aboutImage?: string;
  bannerImage?: string;
  footerImage?: string;
  logoImage?: string;
  favicon?: string;
  
  // Text content
  bannerText?: string;
  footerText?: string;
  
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
    
    // Font settings
    fontFamily: "",
    fontSize: "",
    fontColor: "#000000",
    headingFontFamily: "",
    headingFontSize: "",
    headingFontColor: "#000000",
    
    // Color scheme
    backgroundColor: "#ffffff",
    backgroundColor2: "#f8f8f8",
    textColor: "#000000",
    accentColor: "#4f46e5",
    borderColor: "#e5e7eb",
    cardBackgroundColor: "#ffffff",
    
    // Button styling
    buttonColor: "#3b82f6",
    buttonTextColor: "#ffffff",
    buttonHoverColor: "#2563eb",
    buttonHoverTextColor: "#ffffff",
    buttonBorderRadius: "0.25rem",
    
    // Navigation styling
    navBarColor: "#ffffff",
    navBarTextColor: "#000000",
    navBarHoverColor: "#f3f4f6",
    
    // Link styling
    linkColor: "#3b82f6",
    linkHoverColor: "#2563eb",
    
    // Message styling
    errorColor: "#ef4444",
    successColor: "#22c55e",
    warningColor: "#f59e0b",
    
    // Layout settings
    borderRadius: "0.25rem",
    productGridLayout: "grid",
    containerWidth: "1200px",
    
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

  // State for image file uploads
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
  const [logoImageFile, setLogoImageFile] = useState<File | null>(null);
  const [footerImageFile, setFooterImageFile] = useState<File | null>(null);
  const [aboutImageFile, setAboutImageFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);

  // State for image previews
  const [bannerImagePreview, setBannerImagePreview] = useState<string>(() => {
    return initialCustomization?.bannerImage || "";
  });
  const [logoImagePreview, setLogoImagePreview] = useState<string>(() => {
    return initialCustomization?.logoImage || "";
  });
  const [footerImagePreview, setFooterImagePreview] = useState<string>(() => {
    return initialCustomization?.footerImage || "";
  });
  const [aboutImagePreview, setAboutImagePreview] = useState<string>(() => {
    return initialCustomization?.aboutImage || "";
  });
  const [faviconPreview, setFaviconPreview] = useState<string>(() => {
    return initialCustomization?.favicon || "";
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
      if (initialCustomization.logoImage) {
        setLogoImagePreview(initialCustomization.logoImage);
      }
      if (initialCustomization.footerImage) {
        setFooterImagePreview(initialCustomization.footerImage);
      }
      if (initialCustomization.aboutImage) {
        setAboutImagePreview(initialCustomization.aboutImage);
      }
      if (initialCustomization.favicon) {
        setFaviconPreview(initialCustomization.favicon);
      }
    }
  }, [initialCustomization]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setCustomization(prev => ({ ...prev, [id]: value }));
  };

  const handleSwitchChange = (id: string, checked: boolean) => {
    setCustomization(prev => ({ ...prev, [id]: checked }));
  };

  // Handler for image file input changes
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: React.Dispatch<React.SetStateAction<File | null>>, setPreview: React.Dispatch<React.SetStateAction<string>>, fieldName: keyof Customization) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFile(file);
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      // Clear the text URL if a file is chosen
      setCustomization(prev => ({ ...prev, [fieldName]: "" }));
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
          // Handle boolean values specifically
          if (typeof customizationToSend[key as keyof Customization] === 'boolean') {
            formPayload.append(key, String(customizationToSend[key as keyof Customization]));
          } else {
            formPayload.append(key, String(customizationToSend[key as keyof Customization]));
          }
        }
      }
      
      // Append image files if selected
      if (bannerImageFile) {
        formPayload.append("bannerImage", bannerImageFile);
      }
      if (logoImageFile) {
        formPayload.append("logoImage", logoImageFile);
      }
      if (footerImageFile) {
        formPayload.append("footerImage", footerImageFile);
      }
      if (aboutImageFile) {
        formPayload.append("aboutImage", aboutImageFile);
      }
      if (faviconFile) {
        formPayload.append("favicon", faviconFile);
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
              <Input
                id="bannerImage"
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, setBannerImageFile, setBannerImagePreview, 'bannerImage')}
              />
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
              <Label htmlFor="logoImage">Logo Image</Label>
              <Input
                id="logoImage"
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, setLogoImageFile, setLogoImagePreview, 'logoImage')}
              />
              {logoImagePreview && (
                <div className="mt-2">
                  <Image
                    src={logoImagePreview}
                    alt="Logo Preview"
                    width={100}
                    height={100}
                    loading="lazy"
                    quality={100}
                    className="rounded-md object-contain"
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="favicon">Favicon</Label>
              <Input
                id="favicon"
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, setFaviconFile, setFaviconPreview, 'favicon')}
              />
              {faviconPreview && (
                <div className="mt-2">
                  <Image
                    src={faviconPreview}
                    alt="Favicon Preview"
                    width={32}
                    height={32}
                    loading="lazy"
                    quality={100}
                    className="rounded-md object-contain"
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
            <div className="space-y-2">
              <Label htmlFor="footerImage">Footer Image</Label>
              <Input
                id="footerImage"
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, setFooterImageFile, setFooterImagePreview, 'footerImage')}
              />
              {footerImagePreview && (
                <div className="mt-2">
                  <Image
                    src={footerImagePreview}
                    alt="Footer Preview"
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
              <Label htmlFor="aboutImage">About Image</Label>
              <Input
                id="aboutImage"
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, setAboutImageFile, setAboutImagePreview, 'aboutImage')}
              />
              {aboutImagePreview && (
                <div className="mt-2">
                  <Image
                    src={aboutImagePreview}
                    alt="About Preview"
                    width={200}
                    height={150}
                    loading="lazy"
                    quality={100}
                    className="w-full rounded-md object-cover"
                  />
                </div>
              )}
            </div>
            <Separator className="my-4" />
            <Button onClick={handleSaveChanges}>Save Changes</Button>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Layout Settings */}
      <AccordionItem value="layout">
        <AccordionTrigger>Layout Settings</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="containerWidth">Container Width</Label>
              <Input
                id="containerWidth"
                value={customization.containerWidth || ""}
                onChange={handleInputChange}
                placeholder="e.g., 1200px"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="borderRadius">Border Radius</Label>
              <Input
                id="borderRadius"
                value={customization.borderRadius || ""}
                onChange={handleInputChange}
                placeholder="e.g., 0.25rem"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="productGridLayout">Product Grid Layout</Label>
              <select
                id="productGridLayout"
                className="w-full rounded-md border p-2"
                value={customization.productGridLayout || ""}
                onChange={handleInputChange}
              >
                <option value="grid">Grid</option>
                <option value="list">List</option>
                <option value="masonry">Masonry</option>
                <option value="compact">Compact</option>
              </select>
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
              <Label htmlFor="backgroundColor2">Secondary Background Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="backgroundColor2"
                  type="color"
                  value={customization.backgroundColor2 || defaultValues.backgroundColor2}
                  onChange={handleInputChange}
                  className="h-10 w-10 p-1"
                />
                <Input
                  id="backgroundColor2"
                  value={customization.backgroundColor2 || defaultValues.backgroundColor2}
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
            <div className="space-y-2">
              <Label htmlFor="accentColor">Accent Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="accentColor"
                  type="color"
                  value={customization.accentColor || defaultValues.accentColor}
                  onChange={handleInputChange}
                  className="h-10 w-10 p-1"
                />
                <Input
                  id="accentColor"
                  value={customization.accentColor || defaultValues.accentColor}
                  onChange={handleInputChange}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="borderColor">Border Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="borderColor"
                  type="color"
                  value={customization.borderColor || defaultValues.borderColor}
                  onChange={handleInputChange}
                  className="h-10 w-10 p-1"
                />
                <Input
                  id="borderColor"
                  value={customization.borderColor || defaultValues.borderColor}
                  onChange={handleInputChange}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardBackgroundColor">Card Background Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="cardBackgroundColor"
                  type="color"
                  value={customization.cardBackgroundColor || defaultValues.cardBackgroundColor}
                  onChange={handleInputChange}
                  className="h-10 w-10 p-1"
                />
                <Input
                  id="cardBackgroundColor"
                  value={customization.cardBackgroundColor || defaultValues.cardBackgroundColor}
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

      {/* Button Styling */}
      <AccordionItem value="buttons">
        <AccordionTrigger>Button Styling</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
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
              <Label htmlFor="buttonTextColor">Button Text Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="buttonTextColor"
                  type="color"
                  value={customization.buttonTextColor || defaultValues.buttonTextColor}
                  onChange={handleInputChange}
                  className="h-10 w-10 p-1"
                />
                <Input
                  id="buttonTextColor"
                  value={customization.buttonTextColor || defaultValues.buttonTextColor}
                  onChange={handleInputChange}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="buttonHoverColor">Button Hover Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="buttonHoverColor"
                  type="color"
                  value={customization.buttonHoverColor || defaultValues.buttonHoverColor}
                  onChange={handleInputChange}
                  className="h-10 w-10 p-1"
                />
                <Input
                  id="buttonHoverColor"
                  value={customization.buttonHoverColor || defaultValues.buttonHoverColor}
                  onChange={handleInputChange}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="buttonHoverTextColor">Button Hover Text Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="buttonHoverTextColor"
                  type="color"
                  value={customization.buttonHoverTextColor || defaultValues.buttonHoverTextColor}
                  onChange={handleInputChange}
                  className="h-10 w-10 p-1"
                />
                <Input
                  id="buttonHoverTextColor"
                  value={customization.buttonHoverTextColor || defaultValues.buttonHoverTextColor}
                  onChange={handleInputChange}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="buttonBorderRadius">Button Border Radius</Label>
              <Input
                id="buttonBorderRadius"
                value={customization.buttonBorderRadius || ""}
                onChange={handleInputChange}
                placeholder="e.g., 0.25rem"
              />
            </div>
            <Separator className="my-4" />
            <Button onClick={handleSaveChanges}>Save Changes</Button>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Navigation Styling */}
      <AccordionItem value="navigation">
        <AccordionTrigger>Navigation Styling</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="navBarColor">Navigation Bar Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="navBarColor"
                  type="color"
                  value={customization.navBarColor || defaultValues.navBarColor}
                  onChange={handleInputChange}
                  className="h-10 w-10 p-1"
                />
                <Input
                  id="navBarColor"
                  value={customization.navBarColor || defaultValues.navBarColor}
                  onChange={handleInputChange}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="navBarTextColor">Navigation Text Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="navBarTextColor"
                  type="color"
                  value={customization.navBarTextColor || defaultValues.navBarTextColor}
                  onChange={handleInputChange}
                  className="h-10 w-10 p-1"
                />
                <Input
                  id="navBarTextColor"
                  value={customization.navBarTextColor || defaultValues.navBarTextColor}
                  onChange={handleInputChange}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="navBarHoverColor">Navigation Hover Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="navBarHoverColor"
                  type="color"
                  value={customization.navBarHoverColor || defaultValues.navBarHoverColor}
                  onChange={handleInputChange}
                  className="h-10 w-10 p-1"
                />
                <Input
                  id="navBarHoverColor"
                  value={customization.navBarHoverColor || defaultValues.navBarHoverColor}
                  onChange={handleInputChange}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkColor">Link Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="linkColor"
                  type="color"
                  value={customization.linkColor || defaultValues.linkColor}
                  onChange={handleInputChange}
                  className="h-10 w-10 p-1"
                />
                <Input
                  id="linkColor"
                  value={customization.linkColor || defaultValues.linkColor}
                  onChange={handleInputChange}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkHoverColor">Link Hover Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="linkHoverColor"
                  type="color"
                  value={customization.linkHoverColor || defaultValues.linkHoverColor}
                  onChange={handleInputChange}
                  className="h-10 w-10 p-1"
                />
                <Input
                  id="linkHoverColor"
                  value={customization.linkHoverColor || defaultValues.linkHoverColor}
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
              <Label htmlFor="fontFamily">Body Font Family</Label>
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
                <option value="Lato">Lato</option>
                <option value="Raleway">Raleway</option>
                <option value="Nunito">Nunito</option>
                <option value="Merriweather">Merriweather</option>
                <option value="Playfair Display">Playfair Display</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fontSize">Body Font Size</Label>
              <Input
                id="fontSize"
                value={customization.fontSize || ""}
                onChange={handleInputChange}
                placeholder="e.g., 16px"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fontColor">Body Font Color</Label>
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
            <div className="space-y-2">
              <Label htmlFor="headingFontFamily">Heading Font Family</Label>
              <select
                id="headingFontFamily"
                className="w-full rounded-md border p-2"
                value={customization.headingFontFamily || ""}
                onChange={handleInputChange}
              >
                <option value="">Select font</option>
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
                <option value="Open Sans">Open Sans</option>
                <option value="Montserrat">Montserrat</option>
                <option value="Poppins">Poppins</option>
                <option value="Lato">Lato</option>
                <option value="Raleway">Raleway</option>
                <option value="Nunito">Nunito</option>
                <option value="Merriweather">Merriweather</option>
                <option value="Playfair Display">Playfair Display</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="headingFontSize">Heading Font Size</Label>
              <Input
                id="headingFontSize"
                value={customization.headingFontSize || ""}
                onChange={handleInputChange}
                placeholder="e.g., 24px"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="headingFontColor">Heading Font Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="headingFontColor"
                  type="color"
                  value={customization.headingFontColor || defaultValues.headingFontColor}
                  onChange={handleInputChange}
                  className="h-10 w-10 p-1"
                />
                <Input
                  id="headingFontColor"
                  value={customization.headingFontColor || defaultValues.headingFontColor}
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
      {/* Preview & Save */}
      <div className="mt-4 space-y-4">
        <Button onClick={handleSaveChanges} className="w-full">Save All Changes</Button>
      </div>
    </Accordion>
  );
}