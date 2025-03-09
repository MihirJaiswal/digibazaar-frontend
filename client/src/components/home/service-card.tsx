"use client"

import type React from "react"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import TracingBeam  from "@/components/ui/tracing-beam"

interface ServiceCardProps {
  icon: React.ReactNode
  title: string
  description: string
  gradientFrom: string
  gradientTo: string
  className?: string
}

export default function ServiceCard({
  icon,
  title,
  description,
  gradientFrom,
  gradientTo,
  className,
}: ServiceCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:shadow-lg",
        isHovered && "translate-y-[-8px]",
        className,
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={cn(
          "absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100",
          isHovered && "opacity-100",
        )}
      >
        <TracingBeam className="h-full w-full" />
      </div>
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r",
          gradientFrom,
          gradientTo,
          "transform origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100",
        )}
      />
      <CardHeader>
        <div
          className={cn(
            "mb-4 inline-flex rounded-lg p-3 bg-gradient-to-br",
            gradientFrom,
            gradientTo,
            "bg-opacity-10 text-primary",
          )}
        >
          {icon}
        </div>
        <CardTitle className="text-xl transition-colors duration-200 group-hover:text-primary">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardContent>
    </Card>
  )
}

