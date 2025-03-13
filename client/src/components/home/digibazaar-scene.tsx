"use client"

import { useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import { Box, Torus, RoundedBox, Sphere, Text, Cylinder } from "@react-three/drei"
import { DoubleSide } from "three"
import type { Group, Mesh } from "three"
import { useMobile } from "./use-mobile"

const LetterD = ({ position, isDarkMode }: { position: [number, number, number]; isDarkMode: boolean }) => {
  const ref = useRef<Group>(null)
  const primaryColor = isDarkMode ? "#BB86FC" : "#4f46e5"
  const accentColor = isDarkMode ? "#F72585" : "#7c3aed"

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.1
    }
  })

  return (
    <group ref={ref} position={position}>
      <RoundedBox args={[0.8, 2, 0.3]} radius={0.1} position={[-0.4, 0, 0]}>
        <meshPhysicalMaterial
          color={primaryColor}
          metalness={0.7}
          roughness={0.2}
          clearcoat={1}
          clearcoatRoughness={0.1}
          transmission={0.2}
          side={DoubleSide}
        />
      </RoundedBox>
      <RoundedBox args={[1, 0.8, 0.3]} radius={0.1} position={[0.1, 0.6, 0]}>
        <meshPhysicalMaterial
          color={primaryColor}
          metalness={0.7}
          roughness={0.2}
          clearcoat={1}
          clearcoatRoughness={0.1}
          transmission={0.2}
          side={DoubleSide}
        />
      </RoundedBox>
      <RoundedBox args={[1, 0.8, 0.3]} radius={0.1} position={[0.1, -0.6, 0]}>
        <meshPhysicalMaterial
          color={primaryColor}
          metalness={0.7}
          roughness={0.2}
          clearcoat={1}
          clearcoatRoughness={0.1}
          transmission={0.2}
          side={DoubleSide}
        />
      </RoundedBox>
      <RoundedBox args={[0.8, 0.8, 0.3]} radius={0.1} position={[0.5, 0, 0]}>
        <meshPhysicalMaterial
          color={primaryColor}
          metalness={0.7}
          roughness={0.2}
          clearcoat={1}
          clearcoatRoughness={0.1}
          transmission={0.2}
          side={DoubleSide}
        />
      </RoundedBox>

      {/* Holographic storefront with physical material */}
      <group position={[0.5, 0, 0.5]} scale={0.4}>
        <Sphere args={[0.5, 16, 16]}>
          <meshPhysicalMaterial
            color={accentColor}
            transparent
            opacity={0.65}
            emissive={accentColor}
            emissiveIntensity={0.7}
            transmission={0.5}
            clearcoat={1}
            clearcoatRoughness={0.05}
            side={DoubleSide}
          />
        </Sphere>
        <Box args={[0.6, 0.6, 0.6]} position={[0, 0, 0]}>
          <meshPhysicalMaterial
            color={isDarkMode ? "#F72585" : "#8b5cf6"}
            transparent
            opacity={0.65}
            wireframe
            side={DoubleSide}
          />
        </Box>
      </group>
    </group>
  )
}

const LetterI = ({ position, isDarkMode }: { position: [number, number, number]; isDarkMode: boolean }) => {
  const robotArmRef = useRef<Group>(null)
  const primaryColor = isDarkMode ? "#BB86FC" : "#7c3aed" 
  const metalColor = isDarkMode ? "#7DF9FF" : "#64748b"
  const accentColor = isDarkMode ? "#F72585" : "#9333ea"

  useFrame((state) => {
    if (robotArmRef.current) {
      const t = state.clock.getElapsedTime()
      robotArmRef.current.rotation.z = Math.sin(t) * 0.2 - 0.2
    }
  })

  return (
    <group position={position}>
      <RoundedBox args={[0.4, 2, 0.3]} radius={0.1}>
        <meshStandardMaterial color={primaryColor} metalness={0.8} roughness={0.2} side={DoubleSide} />
      </RoundedBox>

      {/* Digital effect: robotic arm placing dot */}
      <group ref={robotArmRef} position={[0.5, 1, 0.2]}>
        <Box args={[0.8, 0.1, 0.1]} position={[0.4, 0, 0]}>
          <meshStandardMaterial color={metalColor} metalness={0.9} roughness={0.1} side={DoubleSide} />
        </Box>
        <Box args={[0.1, 0.4, 0.1]} position={[0.8, -0.2, 0]}>
          <meshStandardMaterial color={metalColor} metalness={0.9} roughness={0.1} side={DoubleSide} />
        </Box>
        <Sphere args={[0.15, 16, 16]} position={[0, 1.2, 0]}>
          <meshStandardMaterial 
            color={accentColor} 
            emissive={accentColor} 
            emissiveIntensity={1.0}
            side={DoubleSide} 
          />
        </Sphere>
      </group>
    </group>
  )
}

const LetterG = ({ position, isDarkMode }: { position: [number, number, number]; isDarkMode: boolean }) => {
  const gearRef = useRef<Mesh>(null)
  const primaryColor = isDarkMode ? "#BB86FC" : "#4f46e5"  
  const metalColor = isDarkMode ? "#7DF9FF" : "#64748b"

  useFrame(() => {
    if (gearRef.current) {
      gearRef.current.rotation.z -= 0.01
    }
  })

  return (
    <group position={position}>
      <RoundedBox args={[0.8, 2, 0.3]} radius={0.1} position={[-0.4, 0, 0]}>
        <meshStandardMaterial color={primaryColor} metalness={0.8} roughness={0.2} side={DoubleSide} />
      </RoundedBox>
      <RoundedBox args={[1, 0.8, 0.3]} radius={0.1} position={[0.1, -0.6, 0]}>
        <meshStandardMaterial color={primaryColor} metalness={0.8} roughness={0.2} side={DoubleSide} />
      </RoundedBox>
      <RoundedBox args={[1, 0.8, 0.3]} radius={0.1} position={[0.1, 0.6, 0]}>
        <meshStandardMaterial color={primaryColor} metalness={0.8} roughness={0.2} side={DoubleSide} />
      </RoundedBox>
      <RoundedBox args={[0.8, 0.8, 0.3]} radius={0.1} position={[0.5, -0.2, 0]}>
        <meshStandardMaterial color={primaryColor} metalness={0.8} roughness={0.2} side={DoubleSide} />
      </RoundedBox>

      {/* Digital effect: spinning gear */}
      <Torus args={[0.4, 0.1, 16, 8, Math.PI * 2]} position={[0, 0, 0.3]} ref={gearRef}>
        <meshStandardMaterial 
          color={metalColor} 
          metalness={0.9} 
          roughness={0.1}
          emissive={metalColor}
          emissiveIntensity={0.4}
          side={DoubleSide} 
        />
      </Torus>
    </group>
  )
}

const LetterB = ({ position, isDarkMode }: { position: [number, number, number]; isDarkMode: boolean }) => {
  const bubbleRefs = useRef<Group[]>([])
  const primaryColor = isDarkMode ? "#BB86FC" : "#7c3aed" 
  const accentColor = isDarkMode ? "#F72585" : "#8b5cf6"

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
        <meshStandardMaterial color={primaryColor} metalness={0.8} roughness={0.2} side={DoubleSide} />
      </RoundedBox>
      <RoundedBox args={[1, 0.8, 0.3]} radius={0.1} position={[0.1, 0.6, 0]}>
        <meshStandardMaterial color={primaryColor} metalness={0.8} roughness={0.2} side={DoubleSide} />
      </RoundedBox>
      <RoundedBox args={[1, 0.8, 0.3]} radius={0.1} position={[0.1, -0.6, 0]}>
        <meshStandardMaterial color={primaryColor} metalness={0.8} roughness={0.2} side={DoubleSide} />
      </RoundedBox>
      <RoundedBox args={[0.8, 0.8, 0.3]} radius={0.1} position={[0.5, 0, 0]}>
        <meshStandardMaterial color={primaryColor} metalness={0.8} roughness={0.2} side={DoubleSide} />
      </RoundedBox>

      {/* Digital effect: chat bubbles */}
      {[0, 1, 2].map((i) => (
        <group
          key={i}
          position={[0.8, 0.3 - i * 0.3, 0.3]}
          ref={(el) => {
            if (el) bubbleRefs.current[i] = el
          }}
        >
          <RoundedBox args={[0.4, 0.2, 0.1]} radius={0.05}>
            <meshStandardMaterial 
              color={accentColor} 
              transparent 
              opacity={0.8} 
              emissive={accentColor}
              emissiveIntensity={0.6}
              side={DoubleSide} 
            />
          </RoundedBox>
        </group>
      ))}
    </group>
  )
}

const LetterA = ({ position, isDarkMode }: { position: [number, number, number]; isDarkMode: boolean }) => {
  const primaryColor = isDarkMode ? "#BB86FC" : "#4f46e5"
  return (
    <group position={position}>
      <RoundedBox args={[0.8, 2, 0.3]} radius={0.1} position={[-0.4, 0, 0]} rotation={[0, 0, -0.1]}>
        <meshStandardMaterial color={primaryColor} metalness={0.8} roughness={0.4} side={DoubleSide} />
      </RoundedBox>
      <RoundedBox args={[0.8, 2, 0.3]} radius={0.1} position={[0.4, 0, 0]} rotation={[0, 0, 0.1]}>
        <meshStandardMaterial color={primaryColor} metalness={0.8} roughness={0.4} side={DoubleSide} />
      </RoundedBox>
      <RoundedBox args={[1, 0.3, 0.3]} radius={0.1} position={[0, 0, 0]}>
        <meshStandardMaterial color={primaryColor} metalness={0.8} roughness={0.2} side={DoubleSide} />
      </RoundedBox>
    </group>
  )
}

const LetterZ = ({ position, isDarkMode }: { position: [number, number, number]; isDarkMode: boolean }) => {
  // LetterZ retains its unique neon palette even in dark mode.
  const primaryColor = isDarkMode ? "#00F0FF" : "#A855F7" 
  const emissiveColor = isDarkMode ? "#00E5FF" : "#9333EA"

  return (
    <group position={position}>
      {/* Top Bar */}
      <RoundedBox args={[1.2, 0.3, 0.3]} radius={0.1} position={[0, 0.85, 0]}>
        <meshStandardMaterial
          color={primaryColor}
          metalness={1}
          roughness={0.3}
          emissive={emissiveColor}
          emissiveIntensity={0.6}
          side={DoubleSide}
        />
      </RoundedBox>

      {/* Bottom Bar */}
      <RoundedBox args={[1.2, 0.3, 0.3]} radius={0.1} position={[0, -0.85, 0]}>
        <meshStandardMaterial
          color={primaryColor}
          metalness={1}
          roughness={0.3}
          emissive={emissiveColor}
          emissiveIntensity={0.6}
          side={DoubleSide}
        />
      </RoundedBox>

      {/* Diagonal Bar */}
      <RoundedBox args={[1.7, 0.3, 0.3]} radius={0.1} position={[0, 0, 0]} rotation={[0, 0, -0.6]}>
        <meshStandardMaterial
          color={primaryColor}
          metalness={1}
          roughness={0.3}
          emissive={emissiveColor}
          emissiveIntensity={0.6}
          side={DoubleSide}
        />
      </RoundedBox>

      {/* Light Source for Highlight Effect */}
      <pointLight position={[0, 2, 2]} intensity={1.5} color={primaryColor} />
    </group>
  )
}

const LetterR = ({ position, isDarkMode }: { position: [number, number, number]; isDarkMode: boolean }) => {
  const primaryColor = isDarkMode ? "#BB86FC" : "#4f46e5"
  return (
    <group position={position}>
      <RoundedBox args={[0.8, 2, 0.3]} radius={0.1} position={[-0.4, 0, 0]}>
        <meshStandardMaterial color={primaryColor} metalness={0.8} roughness={0.2} side={DoubleSide} />
      </RoundedBox>
      <RoundedBox args={[1, 0.8, 0.3]} radius={0.1} position={[0.1, 0.6, 0]}>
        <meshStandardMaterial color={primaryColor} metalness={0.8} roughness={0.2} side={DoubleSide} />
      </RoundedBox>
      <RoundedBox args={[0.8, 0.8, 0.3]} radius={0.1} position={[0.5, 0.6, 0]}>
        <meshStandardMaterial color={primaryColor} metalness={0.8} roughness={0.2} side={DoubleSide} />
      </RoundedBox>
      <RoundedBox args={[1, 0.3, 0.3]} radius={0.1} position={[0.1, 0.1, 0]}>
        <meshStandardMaterial color={primaryColor} metalness={0.8} roughness={0.2} side={DoubleSide} />
      </RoundedBox>
      <RoundedBox args={[0.8, 1, 0.3]} radius={0.1} position={[0.5, -0.5, 0]} rotation={[0, 0, 0.3]}>
        <meshStandardMaterial color={primaryColor} metalness={0.8} roughness={0.2} side={DoubleSide} />
      </RoundedBox>
    </group>
  )
}


// New MessageBox component (replacing FloatingBox)
const MessageBox = ({
  position,
  color,
  delay = 0,
  isDarkMode,
}: {
  position: [number, number, number]
  color: string
  delay?: number
  isDarkMode: boolean
}) => {
  const ref = useRef<Group>(null)
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
    <group ref={ref} position={position}>
      {/* Rounded chat bubble box */}
      <RoundedBox args={[0.6, 0.6, 0.6]} radius={0.1}>
        <meshStandardMaterial color={boxColor} metalness={0.5} roughness={0.2} side={DoubleSide} />
      </RoundedBox>
      {/* Message icon on top */}
      <Text
        position={[0, 0, 0.35]}
        fontSize={0.3}
        color={"#000000"}
        anchorX="center"
        anchorY="middle"
      >
        💬
      </Text>
    </group>
  )
}

const ConveyorBelt = ({
  position,
  length,
  isDarkMode,
}: {
  position: [number, number, number]
  length: number
  isDarkMode: boolean
}) => {
  const ref = useRef<Group>(null)
  const boxRefs = useRef<Mesh[]>([])
  const beltColor = isDarkMode ? "#E0E7FF" : "#334155" // light, vibrant belt in dark mode
  const rollerColor = isDarkMode ? "#C7D2FE" : "#64748b"
  const primaryColor = isDarkMode ? "#60A5FA" : "#7c3aed"
  const secondaryColor = isDarkMode ? "#A78BFA" : "#4f46e5"

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
        <meshStandardMaterial color={beltColor} metalness={0.7} roughness={0.2} side={DoubleSide} />
      </Box>

      {/* Rollers */}
      {Array.from({ length: Math.floor(length) * 2 }).map((_, i) => (
        <Box key={i} args={[0.1, 0.1, 0.9]} position={[-length / 2 + i * 0.5, 0, 0]}>
          <meshStandardMaterial color={rollerColor} metalness={0.8} roughness={0.2} side={DoubleSide} />
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
          <meshStandardMaterial
            color={i % 2 === 0 ? primaryColor : secondaryColor}
            metalness={0.5}
            roughness={0.2}
            side={DoubleSide}
          />
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
}: {
  position: [number, number, number]
  size: [number, number]
  color: string
  isDarkMode: boolean
}) => {
  const ref = useRef<Mesh>(null)
  const panelColor = isDarkMode ? color : color.replace("f", "e").replace("b", "a")

  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.getElapsedTime()
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
        side={DoubleSide}
      />
    </Box>
  )
}


export default function DigiBazaarScene({ isDarkMode = true }) {
  const isMobile = useMobile()
  const scale = isMobile ? 0.6 : 1

  // Use a floor color that contrasts well with a Tailwind purple-900 background
  const floorColor = isDarkMode ? "#2D2D50" : "#f1f5f9"

  return (
    <>
      {/* Revised lighting setup for even illumination */}
      <ambientLight intensity={1.4} />
      <hemisphereLight  groundColor="#2D2D50" intensity={1} />
      <pointLight position={[10, 10, 10]} intensity={5} color="#8b5cf6" />
      <pointLight position={[10, 10, 10]} intensity={5} color="#4f46e5" />
      <spotLight
        position={[10, 10, 0]}
        intensity={1}
        angle={0.6}
        penumbra={0.5}
        color="#7c3aed"
      />
      <pointLight position={[0, 10, 10]} intensity={1} color="#ffffff" />

      <group position={[0, -1, 0]} scale={scale}>
        {/* Main warehouse floor */}
        <Box args={[20, 0.2, 20]} position={[0, -1, 0]}>
          <meshStandardMaterial color={floorColor} metalness={0.8} roughness={0.2} side={DoubleSide} />
        </Box>

        {/* DigiBazaar Letters - More readable with backdrop and spacing */}
        <group position={[-6, 2, 0]}>
          {/* Keep the 3D letters but make them smaller and positioned behind the text */}
          <group position={[0, 0, -0.1]} scale={1}>
            <LetterD position={[-3, -2, 0]} isDarkMode={isDarkMode} />
            <LetterI position={[-1, -2, 0]} isDarkMode={isDarkMode} />
            <LetterG position={[1, -2, 0]} isDarkMode={isDarkMode} />
            <LetterI position={[3, -2, 0]} isDarkMode={isDarkMode} />
            <LetterB position={[5, -2, 0]} isDarkMode={isDarkMode} />
            <LetterA position={[7, -2, 0]} isDarkMode={isDarkMode} />
            <LetterZ position={[9, -2, 0]} isDarkMode={isDarkMode} />
            <LetterA position={[11, -2, 0]} isDarkMode={isDarkMode} />
            <LetterA position={[13, -2, 0]} isDarkMode={isDarkMode} />
            <LetterR position={[15, -2, 0]} isDarkMode={isDarkMode} />
          </group>
        </group>

        {/* Conveyor belts */}
        <ConveyorBelt position={[-5, -0.5, 3]} length={8} isDarkMode={isDarkMode} />
        <ConveyorBelt position={[3, -0.5, 3]} length={8} isDarkMode={isDarkMode} />
        <ConveyorBelt position={[-5, -0.5, -3]} length={8} isDarkMode={isDarkMode} />
        <ConveyorBelt position={[3, -0.5, -3]} length={8} isDarkMode={isDarkMode} />

        {/* Message boxes */}
        <MessageBox position={[-3, 1, 2]} color={isDarkMode ? "#A78BFA" : "#6366f1"} isDarkMode={isDarkMode} />
        <MessageBox position={[2, 1.5, -2]} color={isDarkMode ? "#60A5FA" : "#8b5cf6"} delay={1} isDarkMode={isDarkMode} />
        <MessageBox position={[4, 2, 1]} color={isDarkMode ? "#8EC9FF" : "#a78bfa"} delay={0.5} isDarkMode={isDarkMode} />
        <MessageBox position={[-2, 2.5, -1]} color={isDarkMode ? "#A78BFA" : "#6366f1"} delay={1.5} isDarkMode={isDarkMode} />
      </group>
      <group position={[0, 0, -5]}>
  {/* Warehouse structure */}
  {/* Main back wall */}
  <Box args={[10, 4, 0.2]} position={[0, -1, -3]}>
    <meshStandardMaterial
      color={isDarkMode ? "#334155" : "#e2e8f0"}
      metalness={0.2}
      roughness={0.8}
      side={DoubleSide}
    />
  </Box>
  
  {/* Side walls */}
  <Box args={[0.2, 4, 6]} position={[-5, 1, 0]}>
    <meshStandardMaterial
      color={isDarkMode ? "#334155" : "#e2e8f0"}
      metalness={0.2}
      roughness={0.8}
      side={DoubleSide}
    />
  </Box>
  <Box args={[0.2, 4, 6]} position={[5, 1, 0]}>
    <meshStandardMaterial
      color={isDarkMode ? "#334155" : "#e2e8f0"}
      metalness={0.2}
      roughness={0.8}
      side={DoubleSide}
    />
  </Box>
  
  {/* Ceiling with structural elements */}
  <Box args={[10, 0.1, 6]} position={[0, 3, 0]}>
    <meshStandardMaterial
      color={isDarkMode ? "#1e293b" : "#cbd5e1"}
      metalness={0.3}
      roughness={0.7}
      side={DoubleSide}
    />
  </Box>
  
  {/* Ceiling support beams */}
  {[-4, -2, 0, 2, 4].map((x) => (
    <Box key={`beam-${x}`} args={[0.2, 0.2, 6]} position={[x, 2.9, 0]}>
      <meshStandardMaterial
        color={isDarkMode ? "#475569" : "#94a3b8"}
        metalness={0.5}
        roughness={0.5}
        side={DoubleSide}
      />
    </Box>
  ))}
  
  {/* Floor with concrete texture */}
  <Box args={[10, 0.1, 6]} position={[0, -0.55, 0]}>
    <meshStandardMaterial
      color={isDarkMode ? "#334155" : "#94a3b8"}
      metalness={0.1}
      roughness={0.9}
      side={DoubleSide}
    />
  </Box>
  
  {/* Floor markings - yellow safety lines */}
  <Box args={[9.5, 0.01, 0.1]} position={[0, -0.5, 1.5]}>
    <meshStandardMaterial
      color={"#f59e0b"}
      emissive={"#fbbf24"}
      emissiveIntensity={0.3}
      side={DoubleSide}
    />
  </Box>
  <Box args={[9.5, 0.01, 0.1]} position={[0, -0.5, -1.5]}>
    <meshStandardMaterial
      color={"#f59e0b"}
      emissive={"#fbbf24"}
      emissiveIntensity={0.3}
      side={DoubleSide}
    />
  </Box>
  
  {/* Industrial ceiling lights */}
  {[-3, 0, 3].map((x) => (
    <group key={`light-${x}`} position={[x, 2.8, 0]}>
      <Box args={[0.8, 0.1, 0.8]}>
        <meshStandardMaterial
          color={isDarkMode ? "#94a3b8" : "#cbd5e1"}
          metalness={0.7}
          roughness={0.3}
          side={DoubleSide}
        />
      </Box>
      <Box args={[0.6, 0.05, 0.6]} position={[0, -0.07, 0]}>
        <meshStandardMaterial
          color={"#fef3c7"}
          emissive={"#fef3c7"}
          emissiveIntensity={0.8}
          side={DoubleSide}
        />
      </Box>
    </group>
  ))}

  {/* Warehouse shelves - enhanced with more detail */}
  {[-3, 0, 3].map((x) => (
    <group key={`shelf-${x}`} position={[x, 0, -2]}>
      {/* Metal shelf frame */}
      <Box args={[1.5, 3, 1]} position={[0, 0.5, 0]}>
        <meshStandardMaterial
          color={isDarkMode ? "#64748b" : "#94a3b8"}
          metalness={0.6}
          roughness={0.4}
          side={DoubleSide}
        />
      </Box>
      
      {/* Shelf support beams */}
      <Box args={[1.5, 0.05, 1]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color={isDarkMode ? "#475569" : "#64748b"}
          metalness={0.7}
          roughness={0.3}
          side={DoubleSide}
        />
      </Box>
      <Box args={[1.5, 0.05, 1]} position={[0, 0.9, 0]}>
        <meshStandardMaterial
          color={isDarkMode ? "#475569" : "#64748b"}
          metalness={0.7}
          roughness={0.3}
          side={DoubleSide}
        />
      </Box>
      <Box args={[1.5, 0.05, 1]} position={[0, 1.8, 0]}>
        <meshStandardMaterial
          color={isDarkMode ? "#475569" : "#64748b"}
          metalness={0.7}
          roughness={0.3}
          side={DoubleSide}
        />
      </Box>
      <Box args={[1.5, 0.05, 1]} position={[0, 2.7, 0]}>
        <meshStandardMaterial
          color={isDarkMode ? "#475569" : "#64748b"}
          metalness={0.7}
          roughness={0.3}
          side={DoubleSide}
        />
      </Box>

      {/* Boxes on shelves - more variety */}
      {[0, 1, 2].map((y) => (
        <group key={`shelf-items-${x}-${y}`}>
          {/* Primary box */}
          <Box 
            args={[1, 0.8, 0.8]} 
            position={[0, y * 0.9 + 0.1, 0]}
          >
            <meshStandardMaterial
              color={
                isDarkMode
                  ? ["#6366f1", "#8b5cf6", "#a78bfa"][Math.abs(x + y) % 3]
                  : ["#6366f1", "#8b5cf6", "#a78bfa"][Math.abs(x + y) % 3]
              }
              metalness={0.3}
              roughness={0.7}
              side={DoubleSide}
            />
          </Box>
          
          {/* Additional varied items */}
          {y === 0 && (
            <Cylinder 
              args={[0.2, 0.2, 0.7, 16]} 
              position={[-0.4, y * 0.9 + 0.45, 0.3]} 
              rotation={[Math.PI / 2, 0, 0]}
            >
              <meshStandardMaterial
                color={isDarkMode ? "#f43f5e" : "#f43f5e"}
                metalness={0.5}
                roughness={0.5}
                side={DoubleSide}
              />
            </Cylinder>
          )}
          
          {y === 1 && (
            <Box 
              args={[0.3, 0.3, 0.3]} 
              position={[0.3, y * 0.9 + 0.45, 0.3]}
              rotation={[0, Math.PI / 4, 0]}
            >
              <meshStandardMaterial
                color={isDarkMode ? "#10b981" : "#10b981"}
                metalness={0.3}
                roughness={0.7}
                side={DoubleSide}
              />
            </Box>
          )}
          
          {y === 2 && (
            <Sphere 
              args={[0.2, 16, 16]} 
              position={[-0.3, y * 0.9 + 0, 0.3]}
            >
              <meshStandardMaterial
                color={isDarkMode ? "#3b82f6" : "#3b82f6"}
                metalness={0.4}
                roughness={0.6}
                side={DoubleSide}
              />
            </Sphere>
          )}
        </group>
      ))}
    </group>
  ))}

  {/* Worker 1 - Moving boxes with improved animations */}
  <group position={[-2, -0.5, -1]}>
    {/* Body */}
    <Box args={[0.5, 0.8, 0.3]} position={[0, 0.4, 0]}>
      <meshStandardMaterial
        color={isDarkMode ? "#60A5FA" : "#3b82f6"}
        metalness={0.3}
        roughness={0.7}
        side={DoubleSide}
      />
    </Box>
    {/* Head with more detail */}
    <Sphere args={[0.2, 16, 16]} position={[0, 1, 0]}>
      <meshStandardMaterial
        color={isDarkMode ? "#E0E7FF" : "#f8fafc"}
        metalness={0.3}
        roughness={0.7}
        side={DoubleSide}
      />
    </Sphere>
    {/* Face features */}
    <Box args={[0.1, 0.02, 0.05]} position={[0, 1, 0.18]}>
      <meshStandardMaterial
        color={"#000000"}
        metalness={0.3}
        roughness={0.7}
        side={DoubleSide}
      />
    </Box>
    {/* Safety helmet */}
    <Sphere args={[0.22, 16, 16]} position={[0, 1.05, 0]} scale={[1, 0.7, 1]}>
      <meshStandardMaterial
        color={"#fcd34d"}
        metalness={0.4}
        roughness={0.6}
        side={DoubleSide}
      />
    </Sphere>
    {/* Arms with slight bend for realism */}
    <Box args={[0.2, 0.6, 0.2]} position={[0.35, 0.4, 0]} rotation={[0, 0, -0.3]}>
      <meshStandardMaterial
        color={isDarkMode ? "#60A5FA" : "#3b82f6"}
        metalness={0.3}
        roughness={0.7}
        side={DoubleSide}
      />
    </Box>
    <Box args={[0.2, 0.6, 0.2]} position={[-0.35, 0.4, 0]} rotation={[0, 0, 0.3]}>
      <meshStandardMaterial
        color={isDarkMode ? "#60A5FA" : "#3b82f6"}
        metalness={0.3}
        roughness={0.7}
        side={DoubleSide}
      />
    </Box>
    {/* Gloves */}
    <Sphere args={[0.1, 16, 16]} position={[0.56, 0.2, 0]}>
      <meshStandardMaterial
        color={"#fbbf24"}
        metalness={0.3}
        roughness={0.7}
        side={DoubleSide}
      />
    </Sphere>
    <Sphere args={[0.1, 16, 16]} position={[-0.56, 0.2, 0]}>
      <meshStandardMaterial
        color={"#fbbf24"}
        metalness={0.3}
        roughness={0.7}
        side={DoubleSide}
      />
    </Sphere>
    {/* Legs with slight stance */}
    <Box args={[0.2, 0.6, 0.2]} position={[0.2, -0.1, 0]} rotation={[0, 0, 0.1]}>
      <meshStandardMaterial
        color={isDarkMode ? "#334155" : "#64748b"}
        metalness={0.3}
        roughness={0.7}
        side={DoubleSide}
      />
    </Box>
    <Box args={[0.2, 0.6, 0.2]} position={[-0.2, -0.1, 0]} rotation={[0, 0, -0.1]}>
      <meshStandardMaterial
        color={isDarkMode ? "#334155" : "#64748b"}
        metalness={0.3}
        roughness={0.7}
        side={DoubleSide}
      />
    </Box>
    {/* Safety boots */}
    <Box args={[0.25, 0.1, 0.3]} position={[0.2, -0.4, 0.05]}>
      <meshStandardMaterial
        color={"#000000"}
        metalness={0.4}
        roughness={0.6}
        side={DoubleSide}
      />
    </Box>
    <Box args={[0.25, 0.1, 0.3]} position={[-0.2, -0.4, 0.05]}>
      <meshStandardMaterial
        color={"#000000"}
        metalness={0.4}
        roughness={0.6}
        side={DoubleSide}
      />
    </Box>
    {/* Box being carried with warning label */}
    <Box args={[0.6, 0.4, 0.4]} position={[0, 0.7, 0.4]}>
      <meshStandardMaterial
        color={isDarkMode ? "#A78BFA" : "#8b5cf6"}
        metalness={0.3}
        roughness={0.7}
        side={DoubleSide}
      />
    </Box>
    <Box args={[0.2, 0.2, 0.01]} position={[0, 0.7, 0.61]}>
      <meshStandardMaterial
        color={"#f59e0b"}
        emissive={"#fbbf24"}
        emissiveIntensity={0.2}
        metalness={0.3}
        roughness={0.7}
        side={DoubleSide}
      />
    </Box>
  </group>

  {/* Worker 2 - Operating forklift with enhanced details */}
  <group position={[2, -0.5, -1]}>
    {/* Forklift base with more detail */}
    <Box args={[0.8, 0.4, 1.2]} position={[0, 0.2, 0]}>
      <meshStandardMaterial
        color={isDarkMode ? "#FCD34D" : "#f59e0b"}
        metalness={0.6}
        roughness={0.4}
        side={DoubleSide}
      />
    </Box>
    {/* Control panel */}
    <Box args={[0.5, 0.1, 0.5]} position={[-0.1, 0.5, 0]}>
      <meshStandardMaterial
        color={isDarkMode ? "#1e293b" : "#334155"}
        metalness={0.7}
        roughness={0.3}
        side={DoubleSide}
      />
    </Box>
    {/* Steering wheel */}
    <Torus args={[0.15, 0.03, 16, 16]} position={[-0.1, 0.5, 0.2]} rotation={[Math.PI/2, 0, 0]}>
      <meshStandardMaterial
        color={isDarkMode ? "#94A3B8" : "#64748b"}
        metalness={0.8}
        roughness={0.2}
        side={DoubleSide}
      />
    </Torus>
    {/* Seat back */}
    <Box args={[0.4, 0.5, 0.1]} position={[-0.3, 0.5, -0.4]}>
      <meshStandardMaterial
        color={isDarkMode ? "#475569" : "#64748b"}
        metalness={0.5}
        roughness={0.5}
        side={DoubleSide}
      />
    </Box>
    {/* Safety cage */}
    <Box args={[0.05, 0.7, 0.05]} position={[-0.4, 0.85, 0.6]}>
      <meshStandardMaterial
        color={isDarkMode ? "#94A3B8" : "#64748b"}
        metalness={0.8}
        roughness={0.2}
        side={DoubleSide}
      />
    </Box>
    <Box args={[0.05, 0.7, 0.05]} position={[-0.4, 0.85, -0.6]}>
      <meshStandardMaterial
        color={isDarkMode ? "#94A3B8" : "#64748b"}
        metalness={0.8}
        roughness={0.2}
        side={DoubleSide}
      />
    </Box>
    <Box args={[0.05, 0.05, 1.3]} position={[-0.4, 1.2, 0]}>
      <meshStandardMaterial
        color={isDarkMode ? "#94A3B8" : "#64748b"}
        metalness={0.8}
        roughness={0.2}
        side={DoubleSide}
      />
    </Box>
    {/* Wheels */}
    <Cylinder args={[0.2, 0.2, 0.15, 16]} position={[0.3, 0, 0.5]} rotation={[Math.PI/2, 0, 0]}>
      <meshStandardMaterial
        color={"#000000"}
        metalness={0.5}
        roughness={0.5}
        side={DoubleSide}
      />
    </Cylinder>
    <Cylinder args={[0.2, 0.2, 0.15, 16]} position={[0.3, 0, -0.5]} rotation={[Math.PI/2, 0, 0]}>
      <meshStandardMaterial
        color={"#000000"}
        metalness={0.5}
        roughness={0.5}
        side={DoubleSide}
      />
    </Cylinder>
    <Cylinder args={[0.2, 0.2, 0.15, 16]} position={[-0.3, 0, 0.5]} rotation={[Math.PI/2, 0, 0]}>
      <meshStandardMaterial
        color={"#000000"}
        metalness={0.5}
        roughness={0.5}
        side={DoubleSide}
      />
    </Cylinder>
    <Cylinder args={[0.2, 0.2, 0.15, 16]} position={[-0.3, 0, -0.5]} rotation={[Math.PI/2, 0, 0]}>
      <meshStandardMaterial
        color={"#000000"}
        metalness={0.5}
        roughness={0.5}
        side={DoubleSide}
      />
    </Cylinder>
    {/* Forklift lift mechanism */}
    <Box args={[0.1, 1, 0.1]} position={[0.3, 0.7, 0.5]}>
      <meshStandardMaterial
        color={isDarkMode ? "#94A3B8" : "#64748b"}
        metalness={0.8}
        roughness={0.2}
        side={DoubleSide}
      />
    </Box>
    <Box args={[0.1, 1, 0.1]} position={[0.3, 0.7, -0.5]}>
      <meshStandardMaterial
        color={isDarkMode ? "#94A3B8" : "#64748b"}
        metalness={0.8}
        roughness={0.2}
        side={DoubleSide}
      />
    </Box>
    <Box args={[0.6, 0.1, 1.1]} position={[0.3, 0.2, 0]}>
      <meshStandardMaterial
        color={isDarkMode ? "#94A3B8" : "#64748b"}
        metalness={0.8}
        roughness={0.2}
        side={DoubleSide}
      />
    </Box>
    {/* Forklift forks */}
    <Box args={[0.8, 0.05, 0.1]} position={[0.3, 0.15, 0.3]}>
      <meshStandardMaterial
        color={isDarkMode ? "#94A3B8" : "#64748b"}
        metalness={0.8}
        roughness={0.2}
        side={DoubleSide}
      />
    </Box>
    <Box args={[0.8, 0.05, 0.1]} position={[0.3, 0.15, -0.3]}>
      <meshStandardMaterial
        color={isDarkMode ? "#94A3B8" : "#64748b"}
        metalness={0.8}
        roughness={0.2}
        side={DoubleSide}
      />
    </Box>
    {/* Warning light */}
    <Sphere args={[0.1, 16, 16]} position={[0, 0.7, 0]}>
      <meshStandardMaterial
        color={"#fde047"}
        emissive={"#fde047"}
        emissiveIntensity={0.8}
        metalness={0.3}
        roughness={0.7}
        side={DoubleSide}
      />
    </Sphere>
    {/* Driver with safety helmet */}
    <Sphere args={[0.15, 16, 16]} position={[-0.1, 0.7, 0]}>
      <meshStandardMaterial
        color={isDarkMode ? "#E0E7FF" : "#f8fafc"}
        metalness={0.3}
        roughness={0.7}
        side={DoubleSide}
      />
    </Sphere>
    <Sphere args={[0.17, 16, 16]} position={[-0.1, 0.75, 0]} scale={[1, 0.7, 1]}>
      <meshStandardMaterial
        color={"#fcd34d"}
        metalness={0.4}
        roughness={0.6}
        side={DoubleSide}
      />
    </Sphere>
    <Box args={[0.3, 0.3, 0.3]} position={[-0.1, 0.4, 0]}>
      <meshStandardMaterial
        color={isDarkMode ? "#A78BFA" : "#8b5cf6"}
        metalness={0.3}
        roughness={0.7}
        side={DoubleSide}
      />
    </Box>
    {/* Box on forks */}
    <Box args={[0.7, 0.4, 0.6]} position={[0.7, 0.35, 0]}>
      <meshStandardMaterial
        color={isDarkMode ? "#60A5FA" : "#3b82f6"}
        metalness={0.3}
        roughness={0.7}
        side={DoubleSide}
      />
    </Box>
  </group>

  {/* Worker 3 - Scanning inventory with enhanced equipment */}
  <group position={[0, -0.5, 0]}>
    {/* Body */}
    <Box args={[0.5, 0.8, 0.3]} position={[0, 0.4, 0]}>
      <meshStandardMaterial
        color={isDarkMode ? "#8EC9FF" : "#6366f1"}
        metalness={0.3}
        roughness={0.7}
        side={DoubleSide}
      />
    </Box>
    {/* High-visibility vest */}
    <Box args={[0.55, 0.82, 0.35]} position={[0, 0.4, 0]}>
      <meshStandardMaterial
        color={"#fde047"}
        emissive={"#fde047"}
        emissiveIntensity={0.2}
        metalness={0.3}
        roughness={0.7}
        opacity={0.7}
        transparent={true}
        side={DoubleSide}
      />
    </Box>
    {/* Head with safety helmet */}
    <Sphere args={[0.2, 16, 16]} position={[0, 1, 0]}>
      <meshStandardMaterial
        color={isDarkMode ? "#E0E7FF" : "#f8fafc"}
        metalness={0.3}
        roughness={0.7}
        side={DoubleSide}
      />
    </Sphere>
    <Sphere args={[0.22, 16, 16]} position={[0, 1.05, 0]} scale={[1, 0.7, 1]}>
      <meshStandardMaterial
        color={"#10b981"}
        metalness={0.4}
        roughness={0.6}
        side={DoubleSide}
      />
    </Sphere>
    {/* Face features */}
    <Box args={[0.1, 0.02, 0.05]} position={[0, 1, 0.18]}>
      <meshStandardMaterial
        color={"#000000"}
        metalness={0.3}
        roughness={0.7}
        side={DoubleSide}
      />
    </Box>
    {/* Arms - one extended with scanner */}
    <Box args={[0.2, 0.6, 0.2]} position={[0.35, 0.4, 0]} rotation={[0, 0, -0.8]}>
      <meshStandardMaterial
        color={isDarkMode ? "#8EC9FF" : "#6366f1"}
        metalness={0.3}
        roughness={0.7}
        side={DoubleSide}
      />
    </Box>
    <Box args={[0.2, 0.6, 0.2]} position={[-0.35, 0.4, 0]} rotation={[0, 0, 0.3]}>
      <meshStandardMaterial
        color={isDarkMode ? "#8EC9FF" : "#6366f1"}
        metalness={0.3}
        roughness={0.7}
        side={DoubleSide}
      />
    </Box>
    {/* Scanner device with visible screen and laser */}
    <Box args={[0.25, 0.15, 0.1]} position={[0.7, 0.6, 0]}>
      <meshStandardMaterial
        color={isDarkMode ? "#1e293b" : "#475569"}
        metalness={0.6}
        roughness={0.4}
        side={DoubleSide}
      />
    </Box>
    {/* Scanner screen */}
    <Box args={[0.15, 0.1, 0.01]} position={[0.7, 0.6, 0.06]}>
      <meshStandardMaterial
        color={"#a5f3fc"}
        emissive={"#67e8f9"}
        emissiveIntensity={0.8}
        metalness={0.6}
        roughness={0.4}
        side={DoubleSide}
      />
    </Box>
    {/* Scanner laser beam */}
    <Box args={[0.01, 0.01, 0.5]} position={[0.7, 0.6, 0.3]}>
      <meshStandardMaterial
        color={"#f43f5e"}
        emissive={"#f43f5e"}
        emissiveIntensity={1}
        metalness={0.6}
        roughness={0.4}
        opacity={0.8}
        transparent={true}
        side={DoubleSide}
      />
    </Box>
    {/* Legs with boots */}
    <Box args={[0.2, 0.6, 0.2]} position={[0.2, -0.1, 0]}>
      <meshStandardMaterial
        color={isDarkMode ? "#334155" : "#64748b"}
        metalness={0.3}
        roughness={0.7}
        side={DoubleSide}
      />
    </Box>
    <Box args={[0.2, 0.6, 0.2]} position={[-0.2, -0.1, 0]}>
      <meshStandardMaterial
        color={isDarkMode ? "#334155" : "#64748b"}
        metalness={0.3}
        roughness={0.7}
        side={DoubleSide}
      />
    </Box>
    <Box args={[0.25, 0.1, 0.3]} position={[0.2, -0.4, 0.05]}>
      <meshStandardMaterial
        color={"#000000"}
        metalness={0.4}
        roughness={0.6}
        side={DoubleSide}
      />
    </Box>
    <Box args={[0.25, 0.1, 0.3]} position={[-0.2, -0.4, 0.05]}>
      <meshStandardMaterial
        color={"#000000"}
        metalness={0.4}
        roughness={0.6}
        side={DoubleSide}
      />
    </Box>
    {/* Clipboard/tablet */}
    <Box args={[0.25, 0.3, 0.03]} position={[-0.45, 0.4, 0.2]} rotation={[0.2, 0, 0.3]}>
      <meshStandardMaterial
        color={isDarkMode ? "#475569" : "#94a3b8"}
        metalness={0.5}
        roughness={0.5}
        side={DoubleSide}
      />
    </Box>
    <Box args={[0.2, 0.25, 0.01]} position={[-0.45, 0.4, 0.22]} rotation={[0.2, 0, 0.3]}>
      <meshStandardMaterial
        color={"#e0f2fe"}
        emissive={"#e0f2fe"}
        emissiveIntensity={0.1}
        metalness={0.3}
        roughness={0.7}
        side={DoubleSide}
        />
      </Box>
    </group>
  </group>
    </>
  )
}
