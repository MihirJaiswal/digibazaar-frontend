'use client'
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ConveyorBelt from '@/components/inventoryLanding/ConveyorBelt';
import Package from '@/components/inventoryLanding/Package';
import WarehouseScanner from '@/components/inventoryLanding/WarehouseScanner';
import WarehouseRack from '@/components/inventoryLanding/WarehouseRack';
import ProcessMachine from '@/components/inventoryLanding/ProcessMachine';
import Truck from '@/components/inventoryLanding/Truck';

interface Package {
  id: number;
  color: string;
  status: 'enter' | 'process' | 'exit';
}

const packageColors = [
  '#FFD166', // yellow
  '#06D6A0', // green
  '#EF476F', // pink
  '#118AB2', // blue
  '#073B4C', // dark blue
  '#E2A0FF', // purple
];

// Custom hook to detect client-side mounting
function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}

const WarehouseScene = () => {
  const isMounted = useMounted();
  const [animationStep, setAnimationStep] = useState(0);
  const [packages, setPackages] = useState<Package[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showIncomingTruck, setShowIncomingTruck] = useState(false);
  const [showOutgoingTruck, setShowOutgoingTruck] = useState(false);

  // Animation sequence controller - only run on client side
  useEffect(() => {
    if (!isMounted) return;

    const sequence = async () => {
      // Reset animation
      setPackages([]);
      setIsProcessing(false);
      setShowIncomingTruck(false);
      setShowOutgoingTruck(false);
      
      // Step 1: Show incoming truck
      setShowIncomingTruck(true);
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Step 2: Truck leaves, packages enter
      setShowIncomingTruck(false);
      
      // Use stable IDs instead of Date.now()
      const newPackages: Package[] = Array.from({ length: 3 }).map((_, i) => ({
        id: animationStep * 100 + i, // stable ID based on animation step
        color: packageColors[Math.floor(Math.random() * packageColors.length)],
        status: 'enter' as const
      }));
      setPackages(newPackages);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Step 3: Processing
      setIsProcessing(true);
      setPackages(prevPackages => 
        prevPackages.map(pkg => ({ ...pkg, status: 'process' as const }))
      );
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Step 4: Packages exit
      setIsProcessing(false);
      setPackages(prevPackages => 
        prevPackages.map(pkg => ({ ...pkg, status: 'exit' as const }))
      );
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 5: Outgoing truck arrives
      setShowOutgoingTruck(true);
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Step 6: Truck leaves
      setShowOutgoingTruck(false);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset and repeat
      setAnimationStep(prev => prev + 1);
    };
    
    sequence();
  }, [animationStep, isMounted]);

  // Helper function to determine package position class
  const getPackagePositionClass = (status: Package['status']) => {
    switch (status) {
      case 'enter': return 'left-[20%]';
      case 'process': return 'left-[50%]';
      case 'exit': return 'left-[80%]';
      default: return 'left-[20%]';
    }
  };

  // If not mounted yet, return a simple placeholder to avoid hydration mismatch
  if (!isMounted) {
    return <div className="relative h-96 w-full bg-warehouse-floor"></div>;
  }

  return (
    <div className="relative h-96 w-full perspective-2000 overflow-hidden bg-warehouse-floor">
      {/* Warehouse background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-warehouse-wall to-warehouse-floor opacity-90" />
      
      {/* 3D Warehouse environment */}
      <div className="absolute inset-0 transform-style-preserve-3d">
        {/* Ceiling grid (subtle) */}
        <div className="absolute top-0 left-0 right-0 h-20 opacity-30">
          <div className="w-full h-full grid grid-cols-8 grid-rows-2">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="border border-white/10" />
            ))}
          </div>
        </div>
        
        {/* Floor grid */}
        <div className="absolute bottom-0 left-0 right-0 h-40 rotate-x-70 origin-bottom opacity-40">
          <div className="w-full h-full grid grid-cols-10 grid-rows-5">
            {Array.from({ length: 50 }).map((_, i) => (
              <div key={i} className="border border-white/5" />
            ))}
          </div>
        </div>
        
        {/* Warehouse racks - left side */}
        <div className="absolute left-8 top-8 w-1/4 h-48">
          <WarehouseRack />
        </div>
        
        {/* Warehouse racks - right side */}
        <div className="absolute right-8 top-8 w-1/4 h-48">
          <WarehouseRack />
        </div>
        
        {/* Conveyor belt system */}
        <div className="absolute bottom-16 left-0 right-0 mx-auto w-3/4">
          {/* Incoming dock */}
          <div className="absolute -left-4 bottom-6 w-16 h-20">
            <AnimatePresence>
              {showIncomingTruck && <Truck direction="left" />}
            </AnimatePresence>
          </div>
          
          {/* Main conveyor belt */}
          <ConveyorBelt className="mx-auto w-full h-6" />
          
          {/* Process machine above belt */}
          <ProcessMachine 
            className="absolute top-[-76px] left-1/2 transform -translate-x-1/2" 
            active={isProcessing}
          />
          
          {/* Entry scanner */}
          <WarehouseScanner 
            className="absolute top-[-24px] left-[20%] transform -translate-x-1/2" 
            active={packages.some(p => p.status === 'enter')}
          />
          
          {/* Exit scanner */}
          <WarehouseScanner 
            className="absolute top-[-24px] left-[80%] transform -translate-x-1/2" 
            active={packages.some(p => p.status === 'exit')}
          />
          
          {/* Packages on conveyor */}
          <div className="absolute top-[-16px] left-0 right-0 h-8">
            <AnimatePresence>
              {packages.map((pkg, index) => (
                <Package
                  key={pkg.id}
                  color={pkg.color}
                  size="medium"
                  className={`absolute -translate-x-1/2 ${getPackagePositionClass(pkg.status)}`}
                  delay={index * 0.3}
                  animate={pkg.status}
                />
              ))}
            </AnimatePresence>
          </div>
          
          {/* Outgoing dock */}
          <div className="absolute -right-4 bottom-6 w-16 h-20">
            <AnimatePresence>
              {showOutgoingTruck && <Truck delay={0.5} />}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      {/* Ambient lighting effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      
      {/* Dynamic lighting for processing */}
      <motion.div
        className="absolute inset-0 bg-blue-500/5 pointer-events-none"
        animate={{ opacity: isProcessing ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      />
    </div>
  );
};

export default WarehouseScene;