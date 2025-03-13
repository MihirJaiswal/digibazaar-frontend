"use client"

import { useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import { Box, Torus, RoundedBox, Sphere, Text, Cylinder } from "@react-three/drei"
import { DoubleSide } from "three"
import type { Group, Mesh } from "three"
import { useMobile } from "./use-mobile"
import AnimatedForklift from "./AnimatedForklift"

const LetterD = ({ position, isDarkMode }: { position: [number, number, number]; isDarkMode: boolean }) => {
  const ref = useRef<Group>(null)
  const primaryColor = isDarkMode ? "#9274fc" : "#4f46e5"
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
          metalness={0.9}
          roughness={0.2}
          clearcoat={1}
          clearcoatRoughness={0.1}
          reflectivity={1}
          transmission={0.2}
          side={DoubleSide}
        />
      </RoundedBox>
      <RoundedBox args={[1, 0.8, 0.3]} radius={0.1} position={[0.1, 0.6, 0]}>
        <meshPhysicalMaterial
          color={primaryColor}
          metalness={0.9}
          roughness={0.2}
          clearcoat={1}
          clearcoatRoughness={0.1}
          reflectivity={1}
          transmission={0.2}
          side={DoubleSide}
        />
      </RoundedBox>
      <RoundedBox args={[1, 0.8, 0.3]} radius={0.1} position={[0.1, -0.6, 0]}>
        <meshPhysicalMaterial
          color={primaryColor}
          metalness={0.9}
          roughness={0.2}
          clearcoat={1}
          clearcoatRoughness={0.1}
          reflectivity={1}
          transmission={0.2}
          side={DoubleSide}
        />
      </RoundedBox>
      <RoundedBox args={[0.8, 0.8, 0.3]} radius={0.1} position={[0.5, 0, 0]}>
        <meshPhysicalMaterial
          color={primaryColor}
          metalness={0.9}
          roughness={0.2}
          clearcoat={1}
          clearcoatRoughness={0.1}
          reflectivity={1}
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
            emissiveIntensity={0.9}
            transmission={0.5}
            clearcoat={1}
            clearcoatRoughness={0.05}
            reflectivity={1}
            side={DoubleSide}
          />
        </Sphere>
        <Box args={[0.6, 0.6, 0.6]} position={[0, 0, 0]}>
          <meshPhysicalMaterial
            color={isDarkMode ? "#F72585" : "#8b5cf6"}
            transparent
            opacity={0.65}
            wireframe
            metalness={0.7}
            reflectivity={0.8}
            side={DoubleSide}
          />
        </Box>
      </group>
    </group>
  )
}

const LetterI = ({ position, isDarkMode }: { position: [number, number, number]; isDarkMode: boolean }) => {
  const robotArmRef = useRef<Group>(null)
  const primaryColor = isDarkMode ? "#9274fc" : "#7c3aed" 
  const metalColor = isDarkMode ? "#9274fc" : "#64748b"
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
        <meshPhysicalMaterial 
          color={primaryColor} 
          metalness={0.9} 
          roughness={0.2} 
          clearcoat={1}
          clearcoatRoughness={0.1}
          reflectivity={1}
          side={DoubleSide} 
        />
      </RoundedBox>

      {/* Digital effect: robotic arm placing dot */}
      <group ref={robotArmRef} position={[0.5, 1, 0.2]}>
        <Box args={[0.8, 0.1, 0.1]} position={[0.4, 0, 0]}>
          <meshPhysicalMaterial 
            color={metalColor} 
            metalness={0.9} 
            roughness={0.1} 
            clearcoat={1}
            clearcoatRoughness={0.05}
            reflectivity={1}
            side={DoubleSide} 
          />
        </Box>
        <Box args={[0.1, 0.4, 0.1]} position={[0.8, -0.2, 0]}>
          <meshPhysicalMaterial 
            color={metalColor} 
            metalness={0.9} 
            roughness={0.1} 
            clearcoat={1}
            clearcoatRoughness={0.05}
            reflectivity={1}
            side={DoubleSide} 
          />
        </Box>
        <Sphere args={[0.15, 16, 16]} position={[0, 1.2, 0]}>
          <meshPhysicalMaterial 
            color={accentColor} 
            emissive={accentColor} 
            emissiveIntensity={1.2}
            clearcoat={0.8}
            clearcoatRoughness={0.1}
            reflectivity={0.9}
            side={DoubleSide} 
          />
        </Sphere>
      </group>
    </group>
  )
}

const LetterG = ({ position, isDarkMode }: { position: [number, number, number]; isDarkMode: boolean }) => {
  const gearRef = useRef<Mesh>(null)
  const primaryColor = isDarkMode ? "#9274fc" : "#4f46e5"  
  const metalColor = isDarkMode ? "#7DF9FF" : "#64748b"

  useFrame(() => {
    if (gearRef.current) {
      gearRef.current.rotation.z -= 0.01
    }
  })

  return (
    <group position={position}>
      <RoundedBox args={[0.8, 2, 0.3]} radius={0.1} position={[-0.4, 0, 0]}>
        <meshPhysicalMaterial 
          color={primaryColor} 
          metalness={0.9} 
          roughness={0.2} 
          clearcoat={1}
          clearcoatRoughness={0.1}
          reflectivity={1}
          side={DoubleSide} 
        />
      </RoundedBox>
      <RoundedBox args={[1, 0.8, 0.3]} radius={0.1} position={[0.1, -0.6, 0]}>
        <meshPhysicalMaterial 
          color={primaryColor} 
          metalness={0.9} 
          roughness={0.2} 
          clearcoat={1}
          clearcoatRoughness={0.1}
          reflectivity={1}
          side={DoubleSide} 
        />
      </RoundedBox>
      <RoundedBox args={[1, 0.8, 0.3]} radius={0.1} position={[0.1, 0.6, 0]}>
        <meshPhysicalMaterial 
          color={primaryColor} 
          metalness={0.9} 
          roughness={0.2} 
          clearcoat={1}
          clearcoatRoughness={0.1}
          reflectivity={1}
          side={DoubleSide} 
        />
      </RoundedBox>
      <RoundedBox args={[0.8, 0.8, 0.3]} radius={0.1} position={[0.5, -0.2, 0]}>
        <meshPhysicalMaterial 
          color={primaryColor} 
          metalness={0.9} 
          roughness={0.2} 
          clearcoat={1}
          clearcoatRoughness={0.1}
          reflectivity={1}
          side={DoubleSide} 
        />
      </RoundedBox>

      {/* Digital effect: spinning gear */}
      <Torus args={[0.4, 0.1, 16, 8, Math.PI * 2]} position={[0, 0, 0.3]} ref={gearRef}>
        <meshPhysicalMaterial 
          color={metalColor} 
          metalness={0.9} 
          roughness={0.1}
          emissive={metalColor}
          emissiveIntensity={0.6}
          clearcoat={1}
          clearcoatRoughness={0.05}
          reflectivity={1}
          side={DoubleSide} 
        />
      </Torus>
    </group>
  )
}

const LetterB = ({ position, isDarkMode }: { position: [number, number, number]; isDarkMode: boolean }) => {
  const bubbleRefs = useRef<Group[]>([])
  const primaryColor = isDarkMode ? "#9274fc" : "#7c3aed"
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
      {/* Vertical stem */}
      <RoundedBox args={[0.8, 2, 0.3]} radius={0.1} position={[-0.4, 0, 0]}>
        <meshPhysicalMaterial 
          color={primaryColor} 
          metalness={0.9} 
          roughness={0.2} 
          clearcoat={1}
          clearcoatRoughness={0.1}
          reflectivity={1}
          side={DoubleSide} 
        />
      </RoundedBox>
      
      {/* Top horizontal part */}
      <RoundedBox args={[1, 0.8, 0.3]} radius={0.1} position={[0.1, 0.6, 0]}>
        <meshPhysicalMaterial 
          color={primaryColor} 
          metalness={0.9} 
          roughness={0.2} 
          clearcoat={1}
          clearcoatRoughness={0.1}
          reflectivity={1}
          side={DoubleSide} 
        />
      </RoundedBox>
      
      {/* Bottom horizontal part */}
      <RoundedBox args={[1, 0.8, 0.3]} radius={0.1} position={[0.1, -0.6, 0]}>
        <meshPhysicalMaterial 
          color={primaryColor} 
          metalness={0.9} 
          roughness={0.2} 
          clearcoat={1}
          clearcoatRoughness={0.1}
          reflectivity={1}
          side={DoubleSide} 
        />
      </RoundedBox>
      
      {/* Middle part */}
      <RoundedBox args={[0.8, 0.8, 0.3]} radius={0.1} position={[0.5, 0, 0]}>
        <meshPhysicalMaterial 
          color={primaryColor} 
          metalness={0.9} 
          roughness={0.2} 
          clearcoat={1}
          clearcoatRoughness={0.1}
          reflectivity={1}
          side={DoubleSide} 
        />
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
            <meshPhysicalMaterial
              color={accentColor}
              transparent
              opacity={0.8}
              emissive={accentColor}
              emissiveIntensity={0.8}
              clearcoat={0.8}
              clearcoatRoughness={0.1}
              reflectivity={0.8}
              side={DoubleSide}
            />
          </RoundedBox>
        </group>
      ))}
    </group>
  )
}

const LetterA = ({ position, isDarkMode }: { position: [number, number, number]; isDarkMode: boolean }) => {
  const primaryColor = isDarkMode ? "#9274fc" : "#4f46e5"
  
  return (
    <group position={position}>
      {/* Left leg of the A */}
      <RoundedBox args={[0.8, 2, 0.3]} radius={0.1} position={[-0.4, 0, 0]} rotation={[0, 0, -0.1]}>
        <meshPhysicalMaterial 
          color={primaryColor} 
          metalness={0.9} 
          roughness={0.2} 
          clearcoat={1}
          clearcoatRoughness={0.1}
          reflectivity={1}
          side={DoubleSide} 
        />
      </RoundedBox>
      
      {/* Right leg of the A */}
      <RoundedBox args={[0.8, 2, 0.3]} radius={0.1} position={[0.4, 0, 0]} rotation={[0, 0, 0.1]}>
        <meshPhysicalMaterial 
          color={primaryColor} 
          metalness={0.9} 
          roughness={0.2} 
          clearcoat={1}
          clearcoatRoughness={0.1}
          reflectivity={1}
          side={DoubleSide} 
        />
      </RoundedBox>
      
      {/* Crossbar of the A */}
      <RoundedBox args={[1, 0.3, 0.3]} radius={0.1} position={[0, 0, 0]}>
        <meshPhysicalMaterial 
          color={primaryColor} 
          metalness={0.9} 
          roughness={0.2} 
          clearcoat={1}
          clearcoatRoughness={0.1}
          reflectivity={1}
          side={DoubleSide} 
        />
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
  const primaryColor = isDarkMode ? "#9274fc" : "#4f46e5"
  
  return (
    <group position={position}>
      {/* Vertical stem */}
      <RoundedBox args={[0.8, 2, 0.3]} radius={0.1} position={[-0.4, 0, 0]}>
        <meshPhysicalMaterial 
          color={primaryColor} 
          metalness={0.9} 
          roughness={0.2} 
          clearcoat={1}
          clearcoatRoughness={0.1}
          reflectivity={1}
          side={DoubleSide} 
        />
      </RoundedBox>
      
      {/* Top horizontal part */}
      <RoundedBox args={[1, 0.8, 0.3]} radius={0.1} position={[0.1, 0.6, 0]}>
        <meshPhysicalMaterial 
          color={primaryColor} 
          metalness={0.9} 
          roughness={0.2} 
          clearcoat={1}
          clearcoatRoughness={0.1}
          reflectivity={1}
          side={DoubleSide} 
        />
      </RoundedBox>
      
      {/* Top right curve */}
      <RoundedBox args={[0.8, 0.8, 0.3]} radius={0.1} position={[0.5, 0.6, 0]}>
        <meshPhysicalMaterial 
          color={primaryColor} 
          metalness={0.9} 
          roughness={0.2} 
          clearcoat={1}
          clearcoatRoughness={0.1}
          reflectivity={1}
          side={DoubleSide} 
        />
      </RoundedBox>
      
      {/* Middle horizontal part */}
      <RoundedBox args={[1, 0.3, 0.3]} radius={0.1} position={[0.1, 0.1, 0]}>
        <meshPhysicalMaterial 
          color={primaryColor} 
          metalness={0.9} 
          roughness={0.2} 
          clearcoat={1}
          clearcoatRoughness={0.1}
          reflectivity={1}
          side={DoubleSide} 
        />
      </RoundedBox>
      
      {/* Bottom leg */}
      <RoundedBox args={[0.8, 1, 0.3]} radius={0.1} position={[0.5, -0.5, 0]} rotation={[0, 0, 0.3]}>
        <meshPhysicalMaterial 
          color={primaryColor} 
          metalness={0.9} 
          roughness={0.2} 
          clearcoat={1}
          clearcoatRoughness={0.1}
          reflectivity={1}
          side={DoubleSide} 
        />
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
  position: [number, number, number];
  length: number;
  isDarkMode: boolean;
}) => {
  const ref = useRef<Group>(null);
  const boxRefs = useRef<Mesh[]>([]);
  const beltColor = isDarkMode ? "#E0E7FF" : "#334155"; // light, vibrant belt in dark mode
  const rollerColor = isDarkMode ? "#C7D2FE" : "#64748b";
  const primaryColor = isDarkMode ? "#60A5FA" : "#7c3aed";
  const secondaryColor = isDarkMode ? "#A78BFA" : "#4f46e5";

  useFrame(() => {
    boxRefs.current.forEach((box) => {
      if (box) {
        box.position.x += 0.02;
        if (box.position.x > length / 2) {
          box.position.x = -length / 2;
        }
      }
    });
  });

  return (
    <group position={position} ref={ref}>
      <Box args={[length, 0.1, 1]} position={[0, -0.05, 0]}>
        <meshStandardMaterial
          color={beltColor}
          metalness={0.7}
          roughness={0.2}
          side={DoubleSide}
        />
      </Box>

      {/* Rollers */}
      {Array.from({ length: Math.floor(length) * 2 }).map((_, i) => (
        <Box
          key={i}
          args={[0.1, 0.1, 0.9]}
          position={[-length / 2 + i * 0.5, 0, 0]}
        >
          <meshStandardMaterial
            color={rollerColor}
            metalness={0.8}
            roughness={0.2}
            side={DoubleSide}
          />
        </Box>
      ))}

      {/* Boxes on conveyor */}
      {Array.from({ length: 3 }).map((_, i) => (
        <Box
          key={i}
          args={[0.3, 0.3, 0.3]}
          position={[-length / 2 + i * 2, 0.2, 0]}
          ref={(el) => {
            if (el) boxRefs.current[i] = el;
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
  );
};


export default function DigiBazaarScene({ isDarkMode = true }) {
  const isMobile = useMobile()
  const scale = isMobile ? 0.6 : 1

  // Use a floor color that contrasts well with a Tailwind purple-900 background
  const floorColor = isDarkMode ? "#2D2D50" : "#f1f5f9"

  return (
    <>
      {/* Revised lighting setup for even illumination */}
      // Revised lighting setup to illuminate the front of the letters
        <ambientLight intensity={1.4} />
        <hemisphereLight groundColor="#2D2D50" intensity={1} />

        {/* Reposition point lights to front side */}
        <pointLight position={[0, 5, 15]} intensity={5} color="#8b5cf6" />
        <pointLight position={[-5, 5, 10]} intensity={5} color="#4f46e5" />

        {/* Reposition spotlight to shine from the front */}
        <spotLight
          position={[0, 5, 15]}
          intensity={1.5}
          angle={0.6}
          penumbra={0.5}
          color="#7c3aed"
          target-position={[0, 0, 0]}
        />

        {/* Additional front light for even illumination */}
        <pointLight position={[5, 5, 10]} intensity={1.5} color="#ffffff" />
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

  <AnimatedForklift/>
  </group>
    </>
  )
}
