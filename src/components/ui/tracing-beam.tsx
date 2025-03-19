"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface TracingBeamProps {
  className?: string
}

export default function TracingBeam({ className }: TracingBeamProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [opacity, setOpacity] = useState(0)
  const [size, setSize] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      setPosition({ x, y })
      setOpacity(1)
      setSize(100)
    }

    const handleMouseLeave = () => {
      setOpacity(0)
    }

    container.addEventListener("mousemove", handleMouseMove)
    container.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      container.removeEventListener("mousemove", handleMouseMove)
      container.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [])

  return (
    <div ref={containerRef} className={cn("relative h-full w-full overflow-hidden", className)}>
      <div className="pointer-events-none absolute -inset-px z-0 transition-opacity duration-300" style={{ opacity }}>
        <div
          className="absolute bg-gradient-to-r from-primary/20 to-primary/40 blur-[50px]"
          style={{
            width: `${size * 2}px`,
            height: `${size * 2}px`,
            borderRadius: "50%",
            transform: `translate(${position.x - size}px, ${position.y - size}px)`,
            transition: "width 0.2s, height 0.2s",
          }}
        />
      </div>
    </div>
  )
}

