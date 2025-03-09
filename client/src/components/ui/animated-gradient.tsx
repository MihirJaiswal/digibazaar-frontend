"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface AnimatedGradientProps {
  className?: string
}

export default function AnimatedGradient({ className }: AnimatedGradientProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    let particles: Particle[] = []
    const particleCount = 20
    const colors = ["#9333ea", "#4f46e5", "#0ea5e9", "#10b981", "#f59e0b"]

    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initParticles()
    }

    class Particle {
      x: number
      y: number
      radius: number
      color: string
      velocity: { x: number; y: number }
      alpha: number
      alphaDirection: number

      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.radius = Math.random() * 100 + 50
        this.color = colors[Math.floor(Math.random() * colors.length)]
        this.velocity = {
          x: (Math.random() - 0.5) * 0.2,
          y: (Math.random() - 0.5) * 0.2,
        }
        this.alpha = Math.random() * 0.5 + 0.1
        this.alphaDirection = Math.random() > 0.5 ? 0.001 : -0.001
      }

      draw() {
        if (!ctx) return

        ctx.beginPath()
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius)
        gradient.addColorStop(
          0,
          `${this.color}${Math.floor(this.alpha * 255)
            .toString(16)
            .padStart(2, "0")}`,
        )
        gradient.addColorStop(1, `${this.color}00`)
        ctx.fillStyle = gradient
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.fill()
      }

      update() {
        this.x += this.velocity.x
        this.y += this.velocity.y

        // Bounce off edges
        if (this.x < -this.radius) this.x = canvas.width + this.radius
        if (this.x > canvas.width + this.radius) this.x = -this.radius
        if (this.y < -this.radius) this.y = canvas.height + this.radius
        if (this.y > canvas.height + this.radius) this.y = -this.radius

        // Pulse alpha
        this.alpha += this.alphaDirection
        if (this.alpha <= 0.1 || this.alpha >= 0.5) {
          this.alphaDirection *= -1
        }

        this.draw()
      }
    }

    const initParticles = () => {
      particles = []
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle())
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((particle) => particle.update())
      animationFrameId = requestAnimationFrame(animate)
    }

    window.addEventListener("resize", resizeCanvas)
    resizeCanvas()
    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return <canvas ref={canvasRef} className={cn("bg-background", className)} />
}

