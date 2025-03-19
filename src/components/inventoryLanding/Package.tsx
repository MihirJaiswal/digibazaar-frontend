'use client'
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PackageProps {
  color: string;
  size?: "small" | "medium" | "large";
  className?: string;
  delay?: number;
  animate?: "enter" | "process" | "exit";
  style?: React.CSSProperties;
}

const Package: React.FC<PackageProps> = ({ 
  color, 
  size = "medium", 
  className,
  delay = 0,
  animate = "enter",
  style
}) => {
  // Size map for different package sizes
  const sizeMap = {
    small: "w-10 h-10",
    medium: "w-14 h-14",
    large: "w-16 h-16"
  };

  // Animation variants
  const animationVariants = {
    enter: {
      x: ["calc(-100% - 50px)", 0],
      opacity: [0, 1],
      transition: { 
        duration: 1, 
        delay,
        ease: "easeOut"
      }
    },
    process: {
      y: [0, -15, 0],
      opacity: [1, 0.8, 1],
      transition: { 
        duration: 1.5, 
        delay,
        repeat: 1,
        repeatType: "reverse" as const,
        ease: "easeInOut"
      }
    },
    exit: {
      x: [0, "calc(100% + 50px)"],
      opacity: [1, 0],
      transition: { 
        duration: 1, 
        delay,
        ease: "easeIn"
      }
    }
  };

  return (
    <motion.div
      className={cn(
        sizeMap[size], 
        "package-shadow rounded-lg relative", 
        className
      )}
      style={{ backgroundColor: color, ...style }}
      initial={{ opacity: 0 }}
      animate={animationVariants[animate]}
    >
      {/* Package tape */}
      <div className="absolute top-0 left-1/2 w-2 h-full -translate-x-1/2 bg-white/20" />
      <div className="absolute top-1/2 left-0 h-2 w-full -translate-y-1/2 bg-white/20" />
      
      {/* Barcode (simplified) */}
      <div className="absolute bottom-2 right-2 w-6 h-4 flex flex-col justify-between">
        {Array.from({ length: 3 }).map((_, i) => (
          <div 
            key={i} 
            className="h-[2px] bg-black/60" 
            style={{ width: `${Math.random() * 40 + 60}%` }} 
          />
        ))}
      </div>
    </motion.div>
  );
};

export default Package;
