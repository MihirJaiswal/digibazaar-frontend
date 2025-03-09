"use client"

import { useRef, useState } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { Box, Torus, RoundedBox, Sphere } from "@react-three/drei"
import type { Group, Mesh } from "three"
import { useMobile } from "./use-mobile"

const LetterD = ({ position, isDarkMode }: { position: [number, number, number]; isDarkMode: boolean }) => {
  const ref = useRef<Group>(null)
  const primaryColor = isDarkMode ? "#6366f1" : "#4f46e5"
  const accentColor = isDarkMode ? "#8b5cf6" : "#7c3aed"

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.1
    }
  })

  return (
    <group ref={ref} position={position}>
      <RoundedBox args={[0.8, 2, 0.3]} radius={0.1} position={[-0.4, 0, 0]}>
        <meshStandardMaterial color={primaryColor} metalness={0.8} roughness={0.2} />
      </RoundedBox>
      <RoundedBox args={[1, 0.8, 0.3]} radius={0.1} position={[0.1, 0.6, 0]}>
        <meshStandardMaterial color={primaryColor} metalness={0.8} roughness={0.2} />
      </RoundedBox>
      <RoundedBox args={[1, 0.8, 0.3]} radius={0.1} position={[0.1, -0.6, 0]}>
        <meshStandardMaterial color={primaryColor} metalness={0.8} roughness={0.2} />
      </RoundedBox>
      <RoundedBox args={[0.8, 0.8, 0.3]} radius={0.1} position={[0.5, 0, 0]}>
        <meshStandardMaterial color={primaryColor} metalness={0.8} roughness={0.2} />
      </RoundedBox>

      {/* Holographic storefront */}
      <group position={[0.5, 0, 0.5]} scale={0.4}>
        <Sphere args={[0.5, 16, 16]}>
          <meshStandardMaterial color={accentColor} transparent opacity={0.6} emissive={accentColor} emissiveIntensity={0.5} />
        </Sphere>
        <Box args={[0.6, 0.6, 0.6]} position={[0, 0, 0]}>
          <meshStandardMaterial color={isDarkMode ? "#a78bfa" : "#8b5cf6"} transparent opacity={0.4} wireframe />
        </Box>
      </group>
    </group>
  )
}

const LetterI = ({ position, isDarkMode }: { position: [number, number, number]; isDarkMode: boolean }) => {
  const robotArmRef = useRef<Group>(null)
  const primaryColor = isDarkMode ? "#8b5cf6" : "#7c3aed"
  const metalColor = isDarkMode ? "#94a3b8" : "#64748b"
  const accentColor = isDarkMode ? "#a855f7" : "#9333ea"

  useFrame((state) => {
    if (robotArmRef.current) {
      const t = state.clock.getElapsedTime()
      robotArmRef.current.rotation.z = Math.sin(t) * 0.2 - 0.2
    }
  })

  return (
    <group position={position}>
      <RoundedBox args={[0.4, 2, 0.3]} radius={0.1}>
        <meshStandardMaterial color={primaryColor} metalness={0.8} roughness={0.2} />
      </RoundedBox>

      {/* Robotic arm placing dot */}
      <group ref={robotArmRef} position={[0.5, 1, 0.2]}>
        <Box args={[0.8, 0.1, 0.1]} position={[0.4, 0, 0]}>
          <meshStandardMaterial color={metalColor} metalness={0.9} roughness={0.1} />
        </Box>
        <Box args={[0.1, 0.4, 0.1]} position={[0.8, -0.2, 0]}>
          <meshStandardMaterial color={metalColor} metalness={0.9} roughness={0.1} />
        </Box>
        <Sphere args={[0.15, 16, 16]} position={[0, 1.2, 0]}>
          <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.5} />
        </Sphere>
      </group>
    </group>
  )
}

const LetterG = ({ position, isDarkMode }: { position: [number, number, number]; isDarkMode: boolean }) => {
  const gearRef = useRef<Mesh>(null)
  const primaryColor = isDarkMode ? "#6366f1" : "#4f46e5"
  const metalColor = isDarkMode ? "#94a3b8" : "#64748b"

  useFrame(() => {
    if (gearRef.current) {
      gearRef.current.rotation.z -= 0.01
    }
  })

  return (
    <group position={position}>
      <RoundedBox args={[0.8, 2, 0.3]} radius={0.1} position={[-0.4, 0, 0]}>
        <meshStandardMaterial color={primaryColor} metalness={0.8} roughness={0.2} />
      </RoundedBox>
      <RoundedBox args={[1, 0.8, 0.3]} radius={0.1} position={[0.1, -0.6, 0]}>
        <meshStandardMaterial color={primaryColor} metalness={0.8} roughness={0.2} />
      </RoundedBox>
      <RoundedBox args={[1, 0.8, 0.3]} radius={0.1} position={[0.1, 0.6, 0]}>
        <meshStandardMaterial color={primaryColor} metalness={0.8} roughness={0.2} />
      </RoundedBox>
      <RoundedBox args={[0.8, 0.8, 0.3]} radius={0.1} position={[0.5, -0.2, 0]}>
        <meshStandardMaterial color={primaryColor} metalness={0.8} roughness={0.2} />
      </RoundedBox>

      {/* Gear */}
      <Torus args={[0.4, 0.1, 16, 8, Math.PI * 2]} position={[0, 0, 0.3]} ref={gearRef}>
        <meshStandardMaterial color={metalColor} metalness={0.9} roughness={0.1} />
      </Torus>
    </group>
  )
}

const LetterB = ({ position, isDarkMode }: { position: [number, number, number]; isDarkMode: boolean }) => {
  const bubbleRefs = useRef<Group[]>([])
  const primaryColor = isDarkMode ? "#8b5cf6" : "#7c3aed"
  const accentColor = isDarkMode ? "#a78bfa" : "#8b5cf6"

  useFrame((state) => {
    bubbleRefs.current.forEach((bubble, i) => {
      if (bubble) {
        const t = state.clock.getElapsedTime()
        bubble.position.y = Math.sin(t * 0.5 + i) * 0.1
        bubble.position.x = 0.8 + Math.sin(t * 0.3 + i * 0.5) * 0.1
      }
    })
  })

  return (
    <group position={position}>
      <RoundedBox args={[0.8, 2, 0.3]} radius={0.1} position={[-0.4, 0, 0]}>
        <meshStandardMaterial color={primaryColor} metalness={0.8} roughness={0.2} />
      </RoundedBox>
      <RoundedBox args={[1, 0.8, 0.3]} radius={0.1} position={[0.1, 0.6, 0]}>
        <meshStandardMaterial color={primaryColor} metalness={0.8} roughness={0.2} />
      </RoundedBox>
      <RoundedBox args={[1, 0.8, 0.3]} radius={0.1} position={[0.1, -0.6, 0]}>
        <meshStandardMaterial color={primaryColor} metalness={0.8} roughness={0.2} />
      </RoundedBox>
      <RoundedBox args={[0.8, 0.8, 0.3]} radius={0.1} position={[0.5, 0, 0]}>
        <meshStandardMaterial color={primaryColor} metalness={0.8} roughness={0.2} />
      </RoundedBox>

      {/* Reddit-like chat bubbles */}
      {[0, 1, 2].map((i) => (
        <group
          key={i}
          position={[0.8, 0.3 - i * 0.3, 0.3]}
          ref={(el) => {
            if (el) bubbleRefs.current[i] = el
          }}
        >
          <RoundedBox args={[0.4, 0.2, 0.1]} radius={0.05}>
            <meshStandardMaterial color={accentColor} transparent opacity={0.8} />
          </RoundedBox>
        </group>
      ))}
    </group>
  )
}

const FloatingBox = ({
  position,
  color,
  delay = 0,
  isDarkMode,
}: { position: [number, number, number]; color: string; delay?: number; isDarkMode: boolean }) => {
  const ref = useRef<Mesh>(null)
  const [startTime] = useState(delay)
  const boxColor = isDarkMode ? color : color.replace("f", "e").replace("b", "a")

  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.getElapsedTime() + startTime
      ref.current.position.y = position[1] + Math.sin(t) * 0.2
      ref.current.rotation.y += 0.01
    }
  })

  return (
    <Box ref={ref} args={[0.5, 0.5, 0.5]} position={position}>
      <meshStandardMaterial color={boxColor} metalness={0.5} roughness={0.2} />
    </Box>
  )
}

const ConveyorBelt = ({ position, length, isDarkMode }: { position: [number, number, number]; length: number; isDarkMode: boolean }) => {
  const ref = useRef<Group>(null)
  const boxRefs = useRef<Mesh[]>([])
  const beltColor = isDarkMode ? "#475569" : "#334155"
  const rollerColor = isDarkMode ? "#94a3b8" : "#64748b"
  const primaryColor = isDarkMode ? "#8b5cf6" : "#7c3aed"
  const secondaryColor = isDarkMode ? "#6366f1" : "#4f46e5"

  useFrame(() => {
    boxRefs.current.forEach((box) => {
      if (box) {
        box.position.x += 0.02
        if (box.position.x > length / 2) {
          box.position.x = -length / 2
        }
      }
    })
  })

  return (
    <group position={position} ref={ref}>
      <Box args={[length, 0.1, 1]} position={[0, -0.05, 0]}>
        <meshStandardMaterial color={beltColor} metalness={0.7} roughness={0.2} />
      </Box>

      {/* Rollers */}
      {Array.from({ length: Math.floor(length) * 2 }).map((_, i) => (
        <Box key={i} args={[0.1, 0.1, 0.9]} position={[-length / 2 + i * 0.5, 0, 0]}>
          <meshStandardMaterial color={rollerColor} metalness={0.8} roughness={0.2} />
        </Box>
      ))}

      {/* Boxes on conveyor */}
      {Array.from({ length: 3 }).map((_, i) => (
        <Box
          key={i}
          args={[0.3, 0.3, 0.3]}
          position={[-length / 2 + i * 2, 0.2, 0]}
          ref={(el) => {
            if (el) boxRefs.current[i] = el
          }}
        >
          <meshStandardMaterial color={i % 2 === 0 ? primaryColor : secondaryColor} metalness={0.5} roughness={0.2} />
        </Box>
      ))}
    </group>
  )
}

const HolographicPanel = ({
  position,
  size,
  color,
  isDarkMode,
}: { position: [number, number, number]; size: [number, number]; color: string; isDarkMode: boolean }) => {
  const ref = useRef<Mesh>(null)
  const panelColor = isDarkMode ? color : color.replace("f", "e").replace("b", "a")

  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.getElapsedTime()
      // Check if material is a single material or cast it appropriately
      if (ref.current.material && !Array.isArray(ref.current.material)) {
        ref.current.material.opacity = 0.5 + Math.sin(t * 2) * 0.2
      }
    }
  })

  return (
    <Box ref={ref} args={[size[0], size[1], 0.05]} position={position}>
      <meshStandardMaterial
        color={panelColor}
        transparent
        opacity={0.7}
        emissive={panelColor}
        emissiveIntensity={0.5}
        wireframe
      />
    </Box>
  )
}

// Additional letter components
const LetterA = ({ position, isDarkMode }: { position: [number, number, number]; isDarkMode: boolean }) => {
  const primaryColor = isDarkMode ? "#6366f1" : "#4f46e5"
  
  return (
    <group position={position}>
      <RoundedBox args={[0.8, 2, 0.3]} radius={0.1} position={[-0.4, 0, 0]} rotation={[0, 0, -0.1]}>
        <meshStandardMaterial color={primaryColor} metalness={0.8} roughness={0.2} />
      </RoundedBox>
      <RoundedBox args={[0.8, 2, 0.3]} radius={0.1} position={[0.4, 0, 0]} rotation={[0, 0, 0.1]}>
        <meshStandardMaterial color={primaryColor} metalness={0.8} roughness={0.2} />
      </RoundedBox>
      <RoundedBox args={[1, 0.3, 0.3]} radius={0.1} position={[0, 0, 0]}>
        <meshStandardMaterial color={primaryColor} metalness={0.8} roughness={0.2} />
      </RoundedBox>
    </group>
  )
}

const LetterZ = ({ position, isDarkMode }: { position: [number, number, number]; isDarkMode: boolean }) => {
  const primaryColor = isDarkMode ? "#8b5cf6" : "#7c3aed"
  
  return (
    <group position={position}>
      <RoundedBox args={[1.2, 0.3, 0.3]} radius={0.1} position={[0, 0.85, 0]}>
        <meshStandardMaterial color={primaryColor} metalness={0.8} roughness={0.2} />
      </RoundedBox>
      <RoundedBox args={[1.2, 0.3, 0.3]} radius={0.1} position={[0, -0.85, 0]}>
        <meshStandardMaterial color={primaryColor} metalness={0.8} roughness={0.2} />
      </RoundedBox>
      <RoundedBox args={[1.7, 0.3, 0.3]} radius={0.1} position={[0, 0, 0]} rotation={[0, 0, -0.6]}>
        <meshStandardMaterial color={primaryColor} metalness={0.8} roughness={0.2} />
      </RoundedBox>
    </group>
  )
}

const LetterR = ({ position, isDarkMode }: { position: [number, number, number]; isDarkMode: boolean }) => {
  const primaryColor = isDarkMode ? "#6366f1" : "#4f46e5"
  
  return (
    <group position={position}>
      <RoundedBox args={[0.8, 2, 0.3]} radius={0.1} position={[-0.4, 0, 0]}>
        <meshStandardMaterial color={primaryColor} metalness={0.8} roughness={0.2} />
      </RoundedBox>
      <RoundedBox args={[1, 0.8, 0.3]} radius={0.1} position={[0.1, 0.6, 0]}>
        <meshStandardMaterial color={primaryColor} metalness={0.8} roughness={0.2} />
      </RoundedBox>
      <RoundedBox args={[0.8, 0.8, 0.3]} radius={0.1} position={[0.5, 0.6, 0]}>
        <meshStandardMaterial color={primaryColor} metalness={0.8} roughness={0.2} />
      </RoundedBox>
      <RoundedBox args={[1, 0.3, 0.3]} radius={0.1} position={[0.1, 0.1, 0]}>
        <meshStandardMaterial color={primaryColor} metalness={0.8} roughness={0.2} />
      </RoundedBox>
      <RoundedBox args={[0.8, 1, 0.3]} radius={0.1} position={[0.5, -0.5, 0]} rotation={[0, 0, 0.3]}>
        <meshStandardMaterial color={primaryColor} metalness={0.8} roughness={0.2} />
      </RoundedBox>
    </group>
  )
}

export default function DigiBazaarScene({ isDarkMode = true }) {
  const isMobile = useMobile()
  const scale = isMobile ? 0.6 : 1
  
  // Floor color based on theme
  const floorColor = isDarkMode ? "#1e293b" : "#f1f5f9"

  return (
    <>
      <ambientLight intensity={isDarkMode ? 0.5 : 0.7} />
      <pointLight position={[10, 10, 10]} intensity={isDarkMode ? 1 : 0.8} color={isDarkMode ? "#a78bfa" : "#8b5cf6"} />
      <pointLight position={[-10, -10, -10]} intensity={isDarkMode ? 0.5 : 0.4} color={isDarkMode ? "#6366f1" : "#4f46e5"} />
      <spotLight position={[0, 10, 0]} intensity={isDarkMode ? 1 : 0.8} angle={0.6} penumbra={0.5} color={isDarkMode ? "#8b5cf6" : "#7c3aed"} />

      <group position={[0, -1, 0]} scale={scale}>
        {/* Main warehouse floor */}
        <Box args={[20, 0.2, 20]} position={[0, -1, 0]}>
          <meshStandardMaterial color={floorColor} metalness={0.8} roughness={0.2} />
        </Box>

        {/* DigiBazaar Letters */}
        <group position={[-6, 0, 0]}>
          <LetterD position={[-3, 0, 0]} isDarkMode={isDarkMode} />
          <LetterI position={[-1, 0, 0]} isDarkMode={isDarkMode} />
          <LetterG position={[1, 0, 0]} isDarkMode={isDarkMode} />
          <LetterI position={[3, 0, 0]} isDarkMode={isDarkMode} />
          <LetterB position={[5, 0, 0]} isDarkMode={isDarkMode} />
          <LetterA position={[7, 0, 0]} isDarkMode={isDarkMode} />
          <LetterZ position={[9, 0, 0]} isDarkMode={isDarkMode} />
          <LetterA position={[11, 0, 0]} isDarkMode={isDarkMode} />
          <LetterA position={[13, 0, 0]} isDarkMode={isDarkMode} />
          <LetterR position={[15, 0, 0]} isDarkMode={isDarkMode} />
        </group>

        {/* Conveyor belts */}
        <ConveyorBelt position={[-5, -0.5, 3]} length={8} isDarkMode={isDarkMode} />
        <ConveyorBelt position={[3, -0.5, 3]} length={8} isDarkMode={isDarkMode} />
        <ConveyorBelt position={[-5, -0.5, -3]} length={8} isDarkMode={isDarkMode} />
        <ConveyorBelt position={[3, -0.5, -3]} length={8} isDarkMode={isDarkMode} />

        {/* Floating product boxes */}
        <FloatingBox position={[-3, 1, 2]} color="#6366f1" isDarkMode={isDarkMode} />
        <FloatingBox position={[2, 1.5, -2]} color="#8b5cf6" delay={1} isDarkMode={isDarkMode} />
        <FloatingBox position={[4, 2, 1]} color="#a78bfa" delay={0.5} isDarkMode={isDarkMode} />
        <FloatingBox position={[-2, 2.5, -1]} color="#6366f1" delay={1.5} isDarkMode={isDarkMode} />

        {/* Control panel with holographic displays */}
        <group position={[0, 0, -5]}>
          <Box args={[6, 2, 0.5]} position={[0, 0, 0]}>
            <meshStandardMaterial color={isDarkMode ? "#334155" : "#cbd5e1"} metalness={0.7} roughness={0.2} />
          </Box>
          <HolographicPanel position={[-1.5, 0.5, 0.3]} size={[1.5, 1]} color="#6366f1" isDarkMode={isDarkMode} />
          <HolographicPanel position={[0, 0.5, 0.3]} size={[1.5, 1]} color="#8b5cf6" isDarkMode={isDarkMode} />
          <HolographicPanel position={[1.5, 0.5, 0.3]} size={[1.5, 1]} color="#a78bfa" isDarkMode={isDarkMode} />
        </group>
      </group>
    </>
  )
}