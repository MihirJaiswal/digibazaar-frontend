'use client'
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TruckProps {
  className?: string;
  direction?: "left" | "right";
  delay?: number;
}

const Truck: React.FC<TruckProps> = ({ 
  className,
  direction = "left",
  delay = 0
}) => {
  const isLeft = direction === "left";
  
  return (
    <motion.div
      className={cn(
        "relative h-16 w-32",
        isLeft ? "origin-left" : "origin-right",
        className
      )}
      initial={{ 
        x: isLeft ? "-150%" : "150%", 
        scaleX: isLeft ? 1 : -1 
      }}
      animate={{ x: "0%" }}
      exit={{ x: isLeft ? "150%" : "-150%" }}
      transition={{ 
        duration: 2,
        delay,
        ease: "easeInOut"
      }}
    >
      {/* Truck cab */}
    
      
      {/* Truck body */}
      <div className="absolute bottom-0 left-0 w-24 h-14 bg-blue-500 rounded-sm">
        {/* Truck logo */}
        <div className="absolute top-2 left-2 right-2 bottom-2 flex items-center justify-center">
          <div className="text-white text-xs font-bold">
            SHIP-IT
          </div>
        </div>
        
      </div>
      <div className="absolute bottom-0 left-24 w-10 h-10 bg-blue-600 rounded-sm">
        {/* Windshield */}
        <div className="absolute top-1 right-1 w-8 h-5 bg-sky-300/80 rounded-sm" />
      </div>
      
      {/* Wheels */}
      <motion.div 
        className="absolute bottom-0 left-8 w-4 h-4 bg-gray-800 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ 
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <div className="absolute inset-[25%] bg-gray-600 rounded-full" />
      </motion.div>
      
      <motion.div 
        className="absolute bottom-0 left-2 w-4 h-4 bg-gray-800 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ 
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <div className="absolute inset-[25%] bg-gray-600 rounded-full" />
      </motion.div>
      
      <motion.div 
        className="absolute bottom-0 right-0 w-4 h-4 bg-gray-800 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ 
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <div className="absolute inset-[25%] bg-gray-600 rounded-full" />
      </motion.div>
    </motion.div>
  );
};

export default Truck;