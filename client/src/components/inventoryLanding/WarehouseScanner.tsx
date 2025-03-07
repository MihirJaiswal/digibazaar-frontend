'use client'
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface WarehouseScannerProps {
  className?: string;
  active?: boolean;
}

const WarehouseScanner: React.FC<WarehouseScannerProps> = ({ 
  className,
  active = true
}) => {
  return (
    <div 
      className={cn(
        "relative h-20 w-6 flex flex-col items-center",
        className
      )}
    >
      {/* Scanner base */}
      <div className="bg-gray-700 h-4 w-full rounded-t-md" />
      
      {/* Scanner arm */}
      <div className="bg-gray-600 w-2 h-12 relative">
        {/* Scanner light */}
        {active && (
          <motion.div 
            className="absolute top-10 -left-3 h-1 w-8 bg-blue-400 rounded-full blur-[2px]"
            animate={{ 
              opacity: [0.6, 1, 0.6],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </div>
      
      {/* Scanner base */}
      <div className="bg-gray-700 h-4 w-full rounded-b-md" />
      
      {/* Scanning laser beam */}
      {active && (
        <div className="absolute top-12 left-1/2 w-24 h-1 -translate-x-1/2 scanning-animation">
          <motion.div 
            className="h-full w-full bg-blue-500/30"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}
    </div>
  );
};

export default WarehouseScanner;
