"use client";

import { useEffect, useRef } from "react";

interface WarehouseMapProps {
  latitude: number;
  longitude: number;
  name: string;
}

export default function WarehouseMap({ latitude, longitude, name }: WarehouseMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize map here
    // This is a placeholder - you'll need to implement actual map functionality
    console.log(`Map initialized for ${name} at ${latitude}, ${longitude}`);
  }, [latitude, longitude, name]);

  return <div ref={mapRef} className="w-full h-full" />;
} 