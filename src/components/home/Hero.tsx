"use client"

import { Suspense, useState, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { useMobile } from "./use-mobile"
import LoadingScreen from "./loading-screen"
import { useTheme } from "next-themes"
import DigiBazaarScene from "./digibazaar-scene"
import Link from "next/link"

export default function Hero() {
  const [loaded, setLoaded] = useState(false)
  const isMobile = useMobile()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoaded(true)
    }, 2000)
    
    return () => clearTimeout(timer)
  }, [])

  const isDarkMode = mounted && theme === "dark"

  return (
    <main className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-white to-purple-200 dark:from-black dark:via-[#320546] dark:md:to-pink-900 dark:to-purple-950 transition-colors duration-300">
      {!loaded && <LoadingScreen />}
      
      <div className="absolute z-10 max-w-xl p-8 top-12 bg-gradient-to-b from-white via-white to-transparent dark:from-black dark:via-black dark:to-transparent md:bg-gradient-to-b md:from-transparent md:to-transparent  md:dark:bg-gradient-to-b md:dark:from-transparent md:dark:to-transparent">
        <h1 className="pb-4 text-4xl font-bold md:text-6xl text-center md:text-left text-transparent bg-clip-text bg-gradient-to-r from-purple-800 to-blue-800 dark:from-purple-400 dark:to-cyan-400">
          DIGI-BAZAAR
        </h1>
        <p className="mb-6 text-lg md:text-lg text-center md:text-left text-gray-800 dark:text-gray-200">
          Sell online or in bulk, manage your store, streamline wholesale orders, and grow your business effortlessly!
        </p>
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
          <Link href='/inventory'>
            <Button className={`bg-gradient-to-r ${isDarkMode ? "from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700" : "from-purple-700 to-blue-700 hover:from-purple-600 hover:to-blue-600"} text-white`}>
              Get Started
            </Button>
          </Link>
          <Link href='/about'>
            <Button variant="outline" className={`border ${isDarkMode ? "border-purple-500 text-purple-400 hover:bg-purple-950/30" : "border-purple-600 text-purple-600 hover:bg-purple-100/50"}`}>
              Learn More
            </Button>
          </Link>
        </div>
      </div>
      
      <Canvas className="w-full h-screen" shadows camera={{ position: isMobile ? [0, 2, 8] : [2, 0.1, 10], fov: 60 }}>
        <Suspense fallback={null}>
          <DigiBazaarScene isDarkMode={true} />
          <Environment preset={isDarkMode ? "night" : "park"} />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 3}
          />
        </Suspense>
      </Canvas>
    </main>
  )
}
