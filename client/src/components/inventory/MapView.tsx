'use client'
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Warehouse, ZoomIn, ZoomOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Custom icons using SVG for better quality
const createCustomIcon = (IconComponent: React.ElementType, color: string): L.DivIcon => {
  // Create a DOM element to render our React component
  const customIcon = L.divIcon({
    className: 'custom-marker-icon',
    html: `
      <div style="display: flex; align-items: center; justify-content: center; height: 100%; width: 100%;">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          ${IconComponent === MapPin ? 
            '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle>' : 
            '<path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"></path><path d="M6 18h12"></path><path d="M6 14h12"></path><rect x="6" y="10" width="12" height="12"></rect><path d="M12 10v12"></path>'}
        </svg>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -34],
  });
  
  return customIcon;
};

// Custom Zoom Controls Component
const CustomZoomControl = () => {
  const map = useMap();
  
  const handleZoomIn = () => {
    map.zoomIn();
  };
  
  const handleZoomOut = () => {
    map.zoomOut();
  };
  
  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
      <Button 
        size="sm" 
        variant="secondary" 
        className="h-8 w-8 p-0 rounded-full bg-white shadow-md hover:bg-gray-100"
        onClick={handleZoomIn}
        aria-label="Zoom in"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button 
        size="sm" 
        variant="secondary" 
        className="h-8 w-8 p-0 rounded-full bg-white shadow-md hover:bg-gray-100"
        onClick={handleZoomOut}
        aria-label="Zoom out"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
    </div>
  );
};

// Set map view to specific coordinates
interface MapViewUpdaterProps {
  center: [number, number];
  zoom: number;
}

const MapViewUpdater: React.FC<MapViewUpdaterProps> = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  
  return null;
};

export interface MapLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type: 'warehouse' | 'customer';
  distance?: number;
}

interface MapViewProps {
  center: [number, number];
  zoom: number;
  locations: MapLocation[];
  selectedLocation?: string;
}

const MapView: React.FC<MapViewProps> = ({ 
  center, 
  zoom, 
  locations,
  selectedLocation 
}) => {
  const [isMapReady, setIsMapReady] = useState(false);
  
  const deliveryIcon = createCustomIcon(MapPin, '#ef4444');
  const warehouseIcon = createCustomIcon(Warehouse, '#3b82f6');
  const selectedWarehouseIcon = createCustomIcon(Warehouse, '#8b5cf6');
  
  useEffect(() => {
    // Small delay to ensure smooth animation when map first loads
    const timer = setTimeout(() => {
      setIsMapReady(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`w-full h-full overflow-hidden transition-opacity duration-500 ${isMapReady ? 'opacity-100' : 'opacity-0'} relative`}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        zoomControl={false} // Disable the default zoom control
        className="h-full w-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        
        <MapViewUpdater center={center} zoom={zoom} />
        <CustomZoomControl />
        
        {locations.map((location) => (
          <Marker
            key={location.id}
            position={[location.latitude, location.longitude]}
            icon={
              location.type === 'customer' 
                ? deliveryIcon 
                : location.id === selectedLocation 
                  ? selectedWarehouseIcon
                  : warehouseIcon
            }
            zIndexOffset={location.id === selectedLocation ? 1000 : 0}
          >
            <Popup>
              <div className="px-1 py-1">
                <div className="font-medium mb-1">{location.name}</div>
                {location.type === 'warehouse' && location.distance !== undefined && (
                  <Badge variant="outline" className="bg-primary/10 text-primary text-xs">
                    {location.distance.toFixed(1)} km away
                  </Badge>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;