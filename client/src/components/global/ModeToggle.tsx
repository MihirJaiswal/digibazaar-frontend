"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ModeToggle() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  
  // Handle hydration
  React.useEffect(() => {
    setMounted(true)
  }, [])
  
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }
  
  if (!mounted) return null
  
  return (
    <button
      onClick={toggleTheme}
      className="relative h-10 w-10 rounded-full border-2 border-slate-100 dark:border-zinc-700 bg-white dark:bg-zinc-900 transition-colors duration-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-zinc-600"
      aria-label="Toggle theme"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <Sun className="h-5 w-5 text-amber-500 absolute transform transition-all duration-500 rotate-0 scale-100 dark:rotate-90 dark:scale-0" />
        <Moon className="h-5 w-5 text-indigo-400 absolute transform transition-all duration-500 -rotate-90 scale-0 dark:rotate-0 dark:scale-100" />
      </div>
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}