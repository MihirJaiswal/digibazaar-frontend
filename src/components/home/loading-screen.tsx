"use client"

import { useEffect, useState } from "react"

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0)
  const [isClient, setIsClient] = useState(false) // Prevents hydration mismatch

  useEffect(() => {
    setIsClient(true) // Ensures rendering only on the client

    const interval = setInterval(() => {
      setProgress((prev) => Math.min(prev + Math.random() * 10, 100))
    }, 200)

    return () => clearInterval(interval)
  }, [])

  if (!isClient) return null // Prevents mismatched SSR output

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-black">
      <div className="mb-8 text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-cyan-600 dark:from-purple-400 dark:to-cyan-400">
        DigiBazaar
      </div>

      <div className="w-64 h-2 mb-4 overflow-hidden bg-gray-800 rounded-full">
        <div
          className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"
          style={{ width: `${progress}%`, transition: "width 0.2s ease-out" }}
        />
      </div>

      <div className="text-gray-700 dark:text-gray-400">Loading digital warehouse... {Math.floor(progress)}%</div>
    </div>
  )
}
