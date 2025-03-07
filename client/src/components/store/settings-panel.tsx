"use client"

import { useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

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

export function SettingsPanel({ storeId, initialCustomization, token, onCustomizationUpdate }: SettingsPanelProps) {
  const [customization, setCustomization] = useState<Customization>({
    theme: initialCustomization?.theme || "",
    bannerText: initialCustomization?.bannerText || "",
    bannerImage: initialCustomization?.bannerImage || "",
    footerText: initialCustomization?.footerText || "",
    backgroundColor: initialCustomization?.backgroundColor || "#ffffff",
    buttonColor: initialCustomization?.buttonColor || "#3b82f6",
    textColor: initialCustomization?.textColor || "#000000",
    fontFamily: initialCustomization?.fontFamily || "",
    fontSize: initialCustomization?.fontSize || "",
    fontColor: initialCustomization?.fontColor || "#000000",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target
    setCustomization((prev) => ({ ...prev, [id]: value }))
  }

  const handleSaveChanges = async () => {
    try {
      // Use PUT if customization exists; otherwise, use POST.
      const method = initialCustomization ? "PUT" : "POST"
      const url = `http://localhost:8800/api/stores/theme-customization`

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ ...customization, storeId }),
      })

      if (!response.ok) {
        throw new Error("Failed to save customization")
      }
      const data = await response.json()
      toast.success("Customization saved!")
      onCustomizationUpdate(data)
    } catch (error) {
      console.error("Error saving customization", error)
      toast.error("Error saving customization")
    }
  }

  return (
    <Accordion type="multiple" defaultValue={["general", "colors", "typography"]} className="px-4 py-2">
      {/* General Settings */}
      <AccordionItem value="general">
        <AccordionTrigger>General Settings</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bannerText">Banner Text</Label>
              <Input id="bannerText" value={customization.bannerText} onChange={handleInputChange} placeholder="Enter banner text" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bannerImage">Banner Image</Label>
              <Input id="bannerImage" value={customization.bannerImage} onChange={handleInputChange} placeholder="Enter banner image URL" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="footerText">Footer Text</Label>
              <Input id="footerText" value={customization.footerText} onChange={handleInputChange} placeholder="Enter footer text" />
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
                <Input id="backgroundColor" type="color" value={customization.backgroundColor} onChange={handleInputChange} className="h-10 w-10 p-1" />
                <Input id="backgroundColor" value={customization.backgroundColor} onChange={handleInputChange} className="flex-1" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="buttonColor">Button Color</Label>
              <div className="flex items-center gap-2">
                <Input id="buttonColor" type="color" value={customization.buttonColor} onChange={handleInputChange} className="h-10 w-10 p-1" />
                <Input id="buttonColor" value={customization.buttonColor} onChange={handleInputChange} className="flex-1" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="textColor">Text Color</Label>
              <div className="flex items-center gap-2">
                <Input id="textColor" type="color" value={customization.textColor} onChange={handleInputChange} className="h-10 w-10 p-1" />
                <Input id="textColor" value={customization.textColor} onChange={handleInputChange} className="flex-1" />
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
              <select id="fontFamily" className="w-full rounded-md border p-2" value={customization.fontFamily} onChange={handleInputChange}>
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
              <Input id="fontSize" value={customization.fontSize} onChange={handleInputChange} placeholder="Enter font size (e.g., 16px)" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fontColor">Font Color</Label>
              <div className="flex items-center gap-2">
                <Input id="fontColor" type="color" value={customization.fontColor} onChange={handleInputChange} className="h-10 w-10 p-1" />
                <Input id="fontColor" value={customization.fontColor} onChange={handleInputChange} className="flex-1" />
              </div>
            </div>
            <Separator className="my-4" />
            <Button onClick={handleSaveChanges}>Save Changes</Button>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
