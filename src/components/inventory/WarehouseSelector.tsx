import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Warehouse, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export interface WarehouseOption {
  id: string;
  name: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  distance?: number;
}

interface WarehouseSelectorProps {
  warehouses: WarehouseOption[];
  selectedWarehouse: string;
  onWarehouseSelect: (warehouseId: string) => void;
  onAssignInventory: () => void;
  hasInventory: boolean;
}

const WarehouseSelector: React.FC<WarehouseSelectorProps> = ({
  warehouses,
  selectedWarehouse,
  onWarehouseSelect,
  onAssignInventory,
  hasInventory,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleAssign = () => {
    if (!selectedWarehouse) {
      toast.error("Please select a warehouse");
      return;
    }

    setIsLoading(true);
    // Simulate loading for better UX
    setTimeout(() => {
      setIsLoading(false);
      onAssignInventory();
    }, 600);
  };

  return (
    <Card className="overflow-hidden shadow-card animate-entrance">
      <CardHeader className="bg-secondary/30 pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Warehouse className="h-5 w-5 text-primary" />
          Assign Warehouse
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 pb-4">
        <Select
          value={selectedWarehouse}
          onValueChange={onWarehouseSelect}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a warehouse" />
          </SelectTrigger>
          <SelectContent>
            {warehouses.length > 0 ? (
              warehouses.map((warehouse) => (
                <SelectItem 
                  key={warehouse.id} 
                  value={warehouse.id}
                  className="cursor-pointer py-3 px-3"
                >
                  <div className="flex justify-between items-center w-full">
                    <span>{warehouse.name}</span>
                    {warehouse.distance !== undefined && (
                      <span className="text-xs text-muted-foreground">
                        {warehouse.distance.toFixed(1)} km
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))
            ) : (
              <div className="p-2 text-center text-muted-foreground">
                No warehouse has inventory for this product
              </div>
            )}
          </SelectContent>
        </Select>
      </CardContent>
      {hasInventory && (
        <CardFooter className="pt-2 pb-6">
          <Button 
            onClick={handleAssign} 
            className="w-full gap-2 hover:shadow-md transition-shadow" 
            disabled={!selectedWarehouse || isLoading}
          >
            <CheckCircle className="h-4 w-4" />
            {isLoading ? "Processing..." : "Confirm Inventory Assignment"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default WarehouseSelector;