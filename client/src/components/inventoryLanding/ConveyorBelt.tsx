'use client'
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ConveyorBeltProps {
  className?: string;
}

const ConveyorBelt: React.FC<ConveyorBeltProps> = ({ className }) => {
  return (
    <div className={cn("relative h-8 bg-warehouse-conveyor rounded-sm overflow-hidden", className)}>
      {/* Conveyor belt texture */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-black/5" />
      
      {/* Conveyor belt segments */}
      <div className="h-full w-full relative overflow-hidden">
        <motion.div 
          className="absolute top-0 left-0 h-full w-[200%] flex"
          animate={{ x: "-50%" }}
          transition={{ 
            repeat: Infinity, 
            duration: 8, 
            ease: "linear"
          }}
        >
          {Array.from({ length: 40 }).map((_, i) => (
            <div 
              key={i} 
              className="h-full border-r border-black/10 flex-1"
            />
          ))}
        </motion.div>
      </div>
      
      {/* Highlights for 3D effect */}
      <div className="absolute top-0 left-0 w-full h-1 bg-white/10" />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-black/20" />
    </div>
  );
};

export default ConveyorBelt;