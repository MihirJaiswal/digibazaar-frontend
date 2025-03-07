'use client'
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProcessMachineProps {
  className?: string;
  active?: boolean;
}

const ProcessMachine: React.FC<ProcessMachineProps> = ({ 
  className,
  active = false
}) => {
  return (
    <motion.div 
      className={cn(
        "relative w-24 h-20 bg-gray-700 rounded-md",
        className
      )}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {/* Machine details */}
      <div className="absolute top-2 left-2 right-2 h-6 bg-gray-600 rounded-sm overflow-hidden">
        {/* Status lights */}
        <div className="absolute top-1 right-1 flex space-x-1">
          <motion.div 
            className="w-2 h-2 rounded-full bg-red-500"
            animate={{ opacity: active ? [0.6, 1] : 0.4 }}
            transition={{ duration: 0.5, repeat: active ? Infinity : 0, repeatType: "reverse" }}
          />
          <motion.div 
            className="w-2 h-2 rounded-full bg-green-500"
            animate={{ opacity: active ? [0.6, 1] : 0.4 }}
            transition={{ duration: 0.5, delay: 0.2, repeat: active ? Infinity : 0, repeatType: "reverse" }}
          />
        </div>
        
        {/* Display */}
        <div className="absolute top-1 left-1 w-10 h-4 bg-black/60 rounded-sm overflow-hidden">
          {active && (
            <motion.div 
              className="h-full w-full bg-green-400/20"
              animate={{ opacity: [0.3, 0.7] }}
              transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
            />
          )}
        </div>
      </div>
      
      {/* Machine processing area */}
      <div className="absolute bottom-2 left-2 right-2 h-8 bg-gray-800 rounded-sm">
        {active && (
          <motion.div 
            className="absolute inset-0 bg-blue-500/10"
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          />
        )}
      </div>
      
      {/* Machine top elements */}
      <motion.div
        className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-8 bg-gray-600"
        animate={active ? { 
          y: [0, -4, 0],
          rotateZ: [0, 5, -5, 0]
        } : {}}
        transition={{ 
          duration: 1.5, 
          repeat: active ? Infinity : 0,
          repeatType: "reverse"
        }}
      />
    </motion.div>
  );
};

export default ProcessMachine;
