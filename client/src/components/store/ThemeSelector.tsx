"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Image from "next/image";

interface ThemeOption {
  id: string;
  name: string;
  thumbnail: string;
}

interface ThemeSelectorProps {
  initialTheme: string;
  storeId: string;
  token: string;
  onThemeUpdate: (theme: string) => void;
}

export function ThemeSelector({ initialTheme, storeId, token, onThemeUpdate }: ThemeSelectorProps) {
  const [selectedTheme, setSelectedTheme] = useState(initialTheme);

  const themeOptions: ThemeOption[] = [
    { id: "default", name: "Default", thumbnail: "/default.png" },
    { id: "modern", name: "Modern", thumbnail: "/modern.png" },
    { id: "classic", name: "Classic", thumbnail: "/classic.png" },
    { id: "minimal", name: "Minimal", thumbnail: "/minimal.png" },
  ];

  const handleThemeChange = async (theme: string) => {
    setSelectedTheme(theme);
    try {
      // Update the theme customization record for the store.
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stores`, {
        method: "PUT", // Assume an update; use POST if creating a new record
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ storeId, theme }),
      });
      if (!response.ok) {
        throw new Error("Failed to update theme");
      }
      const data = await response.json();
      toast.success("Theme updated successfully!");
      onThemeUpdate(data.theme);
    } catch (error) {
      console.error("Error updating theme:", error);
      toast.error("Failed to update theme");
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold mb-2">Select a Theme</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {themeOptions.map((option) => (
          <div
            key={option.id}
            className={`border rounded-lg p-4 cursor-pointer transition-colors hover:border-primary ${
              selectedTheme === option.id ? "border-primary" : "border-gray-300"
            }`}
            onClick={() => handleThemeChange(option.id)}
          >
            <Image
              src={option.thumbnail}
              alt={option.name}
              width={200}
              height={100}
              loading="lazy"
              quality={100}
              className="w-full h-32 object-cover rounded-md mb-2"
            />
            <div className="text-center font-medium">{option.name}</div>
          </div>
        ))}
      </div>
      <Button onClick={() => handleThemeChange(selectedTheme)} className="mt-4">
        Save Theme
      </Button>
    </div>
  );
}
