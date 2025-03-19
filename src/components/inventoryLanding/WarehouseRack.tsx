'use client'
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface WarehouseRackProps {
  className?: string;
}

const WarehouseRack: React.FC<WarehouseRackProps> = ({ className }) => {
  return (
    <div 
      className={cn(
        "relative h-64 w-full transform-style-preserve-3d",
        className
      )}
    >
      {/* Main rack structure */}
      <div className="absolute inset-0 bg-warehouse-rack transform-style-preserve-3d rotate-x-60 origin-bottom">
        {/* Rack shelves */}
        <div className="absolute inset-0 grid grid-rows-3 gap-2 p-2">
          {Array.from({ length: 3 }).map((_, shelfIndex) => (
            <div 
              key={`shelf-${shelfIndex}`}
              className="relative bg-warehouse-accent/20 border border-warehouse-accent/40"
            >
              {/* Shelf columns */}
              <div className="absolute inset-0 grid grid-cols-4 gap-1">
                {Array.from({ length: 4 }).map((_, colIndex) => (
                  <motion.div
                    key={`shelf-${shelfIndex}-col-${colIndex}`}
                    className="relative bg-warehouse-accent/20 flex items-center justify-center overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: (shelfIndex * 4 + colIndex) * 0.1, duration: 0.5 }}
                  >
                    {/* Random packages on shelves */}
                    {Math.random() > 0.3 && (
                      <div 
                        className="w-[80%] h-[80%] rounded-sm" 
                        style={{ 
                          backgroundColor: ['#E2A0FF', '#90B8F8', '#FFD166', '#06D6A0'][Math.floor(Math.random() * 4)],
                          opacity: 0.8
                        }}
                      />
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rack vertical supports */}
      <div className="absolute top-0 left-0 w-1 h-full bg-warehouse-accent/70 transform-gpu origin-bottom translate-z-4" />
      <div className="absolute top-0 right-0 w-1 h-full bg-warehouse-accent/70 transform-gpu origin-bottom translate-z-4" />
    </div>
  );
};

export default WarehouseRack;