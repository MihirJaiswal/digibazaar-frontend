'use client'
import React from 'react';
import { motion } from 'framer-motion';
import WarehouseSceneWrapper from '@/components/inventoryLanding/WarehouseSceneWrapper';
import { cn } from '@/lib/utils';
import Header from '@/components/global/Header';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
const Landing = () => {
  const router = useRouter();
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  };

  const features = [
    {
      title: "Real-time Tracking",
      description: "Track inventory movement from arrival to shipping with precision",
      icon: "📦",
      color: "from-blue-500/70 to-blue-600/60"
    },
    {
      title: "Smart Inventory",
      description: "AI-powered inventory management for optimal stock levels",
      icon: "📊",
      color: "from-purple-500/70 to-purple-600/60"
    },
    {
      title: "Advanced Analytics",
      description: "Gain actionable insights from comprehensive data analysis",
      icon: "📈",
      color: "from-emerald-500/70 to-emerald-600/60"
    }
  ];

  return (
   <>
   <Header/>
    <div className="min-h-screen text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
        {/* Hero Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="text-center mb-8"
        >
      
        </motion.div>
        
        {/* Warehouse Animation */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative border-b border-gray-500 overflow-hidden mb-16 "
        >
          <WarehouseSceneWrapper />
          
          {/* Glass overlay with description */}
          <div className="absolute bottom-0 left-0 right-0 glass-effect p-4 backdrop-blur-md">
            <p className="text-sm text-center text-white/90">
              Experience our intelligent warehouse logistics system in action
            </p>
          </div>
        </motion.div>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="text-center mb-8"
        >
          <h1 className='text-3xl text-black'>
            Smart Warehouse Management
          </h1>
          <p className='text-md mt-2 text-gray-500'> Streamline your warehouse operations with cutting-edge technology and intelligent automation.</p>
          <Button className='text-white rounded-md mt-4' onClick={() => router.push('/inventory/your-inventory')}>Launch App</Button>
        </motion.div>
        
        {/* Features Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className={cn(
                "group relative p-6 rounded-xl backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300",
                "bg-gradient-to-br " + feature.color
              )}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="text-4xl mb-4 opacity-90">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
              <p className="text-white/70">{feature.description}</p>
              
              {/* Subtle hover effect */}
              <div className="absolute inset-0 rounded-xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
   </>
  );
};

export default Landing;
