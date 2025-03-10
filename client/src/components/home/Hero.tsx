"use client"

import { Suspense, useState, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { useMobile } from "./use-mobile"
import DigiBazaarScene from "./digibazaar-scene"
import LoadingScreen from "./loading-screen"
import { useTheme } from "next-themes"

export default function Hero() {
  const [loaded, setLoaded] = useState(false)
  const isMobile = useMobile()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Set mounted to true when component mounts
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Simulate loading assets
    const timer = setTimeout(() => {
      setLoaded(true)
    }, 2000)
    
    return () => clearTimeout(timer)
  }, [])


  // Determine if we're in dark mode
  const isDarkMode = mounted && theme === "dark"

  // Environment preset based on theme
  const environmentPreset = isDarkMode ? "night" : "park"

  // Background color based on theme
  const bgColor = isDarkMode ? "bg-gradient-to-b from-black to-purple-600" : "bg-gradient-to-b from-white to-purple-200"

  // Heading text colors based on theme
  const headingClass = isDarkMode 
    ? "text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400" 
    : "text-transparent bg-clip-text bg-gradient-to-r from-purple-800 to-blue-800"

  // Text color based on theme
  const textColor = isDarkMode ? "text-gray-200" : "text-gray-800"

  // Primary button styles based on theme
  const primaryButtonClass = isDarkMode
    ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
    : "bg-gradient-to-r from-purple-700 to-blue-700 hover:from-purple-600 hover:to-blue-600 text-white"

  // Secondary button styles based on theme
  const secondaryButtonClass = isDarkMode
    ? "border-purple-500 text-purple-400 hover:bg-purple-950/30"
    : "border-purple-600 text-purple-600 hover:bg-purple-100/50"

  return (
    <main className={`relative w-full h-screen overflow-hidden ${bgColor} transition-colors duration-300`}>
      {!loaded && <LoadingScreen />}
      
      <div className="absolute z-10 max-w-xl p-8 top-12 md:top-14 md:left-16">
        <h1 className={`pb-4 text-4xl font-bold md:text-6xl text-center md:text-left ${headingClass}`}>
          DIGI-BAZAAR
        </h1>
        <p className={`mb-6 text-lg md:text-lg text-center md:text-left ${textColor}`}>
        Build your online store, manage inventory effortlessly, and connect with customers – No hassle, just growth!
        </p>
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
          <Button className={primaryButtonClass}>
            Get Started
          </Button>
          <Button variant="outline" className={secondaryButtonClass}>
            Learn More
          </Button>
        </div>
      </div>
      
      <Canvas className="w-full h-screen" shadows camera={{ position: isMobile ? [0, 2, 8] : [-5, 2, 10], fov: 60 }}>
        <Suspense fallback={null}>
          <DigiBazaarScene isDarkMode={isDarkMode} />
          <Environment preset={environmentPreset} />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.5}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 3}
          />
        </Suspense>
      </Canvas>
    </main>
  )
}