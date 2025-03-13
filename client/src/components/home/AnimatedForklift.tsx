'use client'
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Cylinder, Torus, Sphere } from '@react-three/drei';
import { DoubleSide, Group, Mesh, MeshStandardMaterial } from 'three';

const AnimatedForklift: React.FC<{ isDarkMode?: boolean }> = ({ isDarkMode = false }) => {
  // Refs for animated parts
  const forkliftRef = useRef<Group>(null);
  const forksRef = useRef<Group>(null);
  const wheelsRef = useRef<Mesh[]>([]);
  const warningLightRef = useRef<MeshStandardMaterial>(null);
  const steeringWheelRef = useRef<Group>(null);

  // New refs and constants for movement control
  const effectiveMovementTime = useRef(0); // Only increases when not paused
  const isPaused = useRef(false);
  const pauseStartTime = useRef(0);
  const containerSpacing = 5; // Containers every 5 units along z
  const pauseDuration = 3;    // Pause for 3 seconds at each container

  // Animation parameters
  const driveSpeed = 0.2; // Controls forward speed
  const forkSpeed = 0.2;
  const forkMaxHeight = 0.8;
  const forkMinHeight = 0.15;

  useFrame((state) => {
    const delta = state.clock.getDelta();
    const currentTime = state.clock.getElapsedTime();

    if (forkliftRef.current) {
      if (!isPaused.current) {
        // Increase effective movement time when not paused
        effectiveMovementTime.current += delta;
        const newZ = effectiveMovementTime.current * driveSpeed;

        // Set the forklift position in a straight line along z; y=0 so wheels touch ground; x remains 0.
        forkliftRef.current.position.set(0, 0, newZ);
        forkliftRef.current.rotation.y = 0; // Face forward

        // Check if we are near a container position (after the first container)
        const containerIndex = Math.floor(newZ / containerSpacing);
        if (containerIndex > 0 && Math.abs(newZ - containerIndex * containerSpacing) < 0.1) {
          isPaused.current = true;
          pauseStartTime.current = currentTime;
        }
      } else {
        // If paused, check if the pause duration has elapsed
        if (currentTime - pauseStartTime.current >= pauseDuration) {
          isPaused.current = false;
        }
        // During pause, position remains constant.
      }
    }

    // Animate spinning wheels (slower rotation)
    wheelsRef.current.forEach((wheel) => {
      if (wheel) wheel.rotation.y -= 0.05;
    });

    // Animate forklift forks up and down
    if (forksRef.current) {
      const forkHeight = ((Math.sin(currentTime * forkSpeed) + 1) / 2) *
        (forkMaxHeight - forkMinHeight) + forkMinHeight;
      forksRef.current.position.y = forkHeight;
    }

    // Animate warning light by adjusting emissiveIntensity on the material
    if (warningLightRef.current) {
      warningLightRef.current.emissiveIntensity = 0.8 + Math.sin(currentTime * 6) * 0.4;
    }

    // Animate steering wheel
    if (steeringWheelRef.current) {
      steeringWheelRef.current.rotation.z = Math.sin(currentTime * 2) * 0.3;
    }
  });

  return (
    <group ref={forkliftRef}>
      {/* Forklift base */}
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
      <group ref={steeringWheelRef} position={[-0.1, 0.5, 0.2]}>
        <Torus args={[0.15, 0.03, 16, 16]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial
            color={isDarkMode ? "#94A3B8" : "#64748b"}
            metalness={0.8}
            roughness={0.2}
            side={DoubleSide}
          />
        </Torus>
        {/* Steering wheel spokes */}
        <Box args={[0.03, 0.03, 0.3]} rotation={[0, 0, 0]}>
          <meshStandardMaterial
            color={isDarkMode ? "#94A3B8" : "#64748b"}
            metalness={0.8}
            roughness={0.2}
            side={DoubleSide}
          />
        </Box>
        <Box args={[0.03, 0.03, 0.3]} rotation={[0, Math.PI / 2, 0]}>
          <meshStandardMaterial
            color={isDarkMode ? "#94A3B8" : "#64748b"}
            metalness={0.8}
            roughness={0.2}
            side={DoubleSide}
          />
        </Box>
      </group>

      {/* Seat with padding */}
      <Box args={[0.4, 0.1, 0.5]} position={[-0.3, 0.3, -0.35]}>
        <meshStandardMaterial
          color={isDarkMode ? "#475569" : "#64748b"}
          metalness={0.3}
          roughness={0.7}
          side={DoubleSide}
        />
      </Box>

      {/* Seat back */}
      <Box args={[0.4, 0.5, 0.1]} position={[-0.3, 0.5, -0.55]}>
        <meshStandardMaterial
          color={isDarkMode ? "#475569" : "#64748b"}
          metalness={0.3}
          roughness={0.7}
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

      {/* Additional cage supports */}
      <Box args={[0.05, 0.05, 1.3]} position={[0.1, 1.2, 0]}>
        <meshStandardMaterial
          color={isDarkMode ? "#94A3B8" : "#64748b"}
          metalness={0.8}
          roughness={0.2}
          side={DoubleSide}
        />
      </Box>
      <Box args={[0.6, 0.05, 0.05]} position={[-0.15, 1.2, 0.6]}>
        <meshStandardMaterial
          color={isDarkMode ? "#94A3B8" : "#64748b"}
          metalness={0.8}
          roughness={0.2}
          side={DoubleSide}
        />
      </Box>
      <Box args={[0.6, 0.05, 0.05]} position={[-0.15, 1.2, -0.6]}>
        <meshStandardMaterial
          color={isDarkMode ? "#94A3B8" : "#64748b"}
          metalness={0.8}
          roughness={0.2}
          side={DoubleSide}
        />
      </Box>

      {/* Wheels with rims and details */}
      {[
        [0.3, 0, 0.5],
        [0.3, 0, -0.5],
        [-0.3, 0, 0.5],
        [-0.3, 0, -0.5]
      ].map((wheelPosition, index) => (
        <group
          key={index}
          position={wheelPosition as [number, number, number]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <Cylinder
            args={[0.2, 0.2, 0.15, 16]}
            ref={(el) => {
              if (el) wheelsRef.current[index] = el;
            }}
          >
            <meshStandardMaterial
              color={"#000000"}
              metalness={0.5}
              roughness={0.5}
              side={DoubleSide}
            />
          </Cylinder>
          <Cylinder args={[0.1, 0.1, 0.16, 16]}>
            <meshStandardMaterial
              color={isDarkMode ? "#e5e7eb" : "#9ca3af"}
              metalness={0.8}
              roughness={0.2}
              side={DoubleSide}
            />
          </Cylinder>
        </group>
      ))}

      {/* Forklift lift mechanism */}
      <Box args={[0.1, 1.2, 0.1]} position={[0.3, 0.7, 0.5]}>
        <meshStandardMaterial
          color={isDarkMode ? "#94A3B8" : "#64748b"}
          metalness={0.8}
          roughness={0.2}
          side={DoubleSide}
        />
      </Box>
      <Box args={[0.1, 1.2, 0.1]} position={[0.3, 0.7, -0.5]}>
        <meshStandardMaterial
          color={isDarkMode ? "#94A3B8" : "#64748b"}
          metalness={0.8}
          roughness={0.2}
          side={DoubleSide}
        />
      </Box>

      {/* Hydraulic cylinders */}
      <Cylinder args={[0.05, 0.05, 0.6, 8]} position={[0.4, 0.5, 0.3]} rotation={[0, 0, Math.PI / 4]}>
        <meshStandardMaterial
          color={isDarkMode ? "#cbd5e1" : "#94a3b8"}
          metalness={0.9}
          roughness={0.1}
          side={DoubleSide}
        />
      </Cylinder>
      <Cylinder args={[0.05, 0.05, 0.6, 8]} position={[0.4, 0.5, -0.3]} rotation={[0, 0, Math.PI / 4]}>
        <meshStandardMaterial
          color={isDarkMode ? "#cbd5e1" : "#94a3b8"}
          metalness={0.9}
          roughness={0.1}
          side={DoubleSide}
        />
      </Cylinder>

      {/* Fork base */}
      <Box args={[0.6, 0.1, 1.1]} position={[0.3, 0.2, 0]}>
        <meshStandardMaterial
          color={isDarkMode ? "#94A3B8" : "#64748b"}
          metalness={0.8}
          roughness={0.2}
          side={DoubleSide}
        />
      </Box>

      {/* Animated forks and box */}
      <group ref={forksRef} position={[0.3, 0.15, 0]}>
        {/* Forklift forks */}
        <Box args={[0.8, 0.05, 0.1]} position={[0, 0, 0.3]}>
          <meshStandardMaterial
            color={isDarkMode ? "#94A3B8" : "#64748b"}
            metalness={0.8}
            roughness={0.2}
            side={DoubleSide}
          />
        </Box>
        <Box args={[0.8, 0.05, 0.1]} position={[0, 0, -0.3]}>
          <meshStandardMaterial
            color={isDarkMode ? "#94A3B8" : "#64748b"}
            metalness={0.8}
            roughness={0.2}
            side={DoubleSide}
          />
        </Box>
        
        {/* Box on forks with details */}
        <group position={[0.4, 0.2, 0]}>
          <Box args={[0.7, 0.4, 0.6]}>
            <meshStandardMaterial
              color={isDarkMode ? "#60A5FA" : "#3b82f6"}
              metalness={0.3}
              roughness={0.7}
              side={DoubleSide}
            />
          </Box>
          {/* Box labels/details */}
          <Box args={[0.4, 0.1, 0.61]} position={[0, 0, 0]}>
            <meshStandardMaterial
              color={isDarkMode ? "#f1f5f9" : "#e2e8f0"}
              metalness={0.1}
              roughness={0.9}
              side={DoubleSide}
            />
          </Box>
        </group>
      </group>

      {/* Warning light with emissive glow */}
      <Sphere args={[0.1, 16, 16]} position={[0, 0.7, 0]}>
        <meshStandardMaterial
          color={"#fde047"}
          emissive={"#fde047"}
          emissiveIntensity={0.8}
          toneMapped={false}
          ref={warningLightRef}
          metalness={0.3}
          roughness={0.7}
          side={DoubleSide}
        />
      </Sphere>

      {/* Driver with safety helmet */}
      <group>
        {/* Body */}
        <Box args={[0.25, 0.3, 0.2]} position={[-0.1, 0.4, -0.3]}>
          <meshStandardMaterial
            color={isDarkMode ? "#A78BFA" : "#8b5cf6"}
            metalness={0.3}
            roughness={0.7}
            side={DoubleSide}
          />
        </Box>
        {/* Head */}
        <Sphere args={[0.15, 16, 16]} position={[-0.1, 0.7, -0.3]}>
          <meshStandardMaterial
            color={isDarkMode ? "#E0E7FF" : "#f8fafc"}
            metalness={0.3}
            roughness={0.7}
            side={DoubleSide}
          />
        </Sphere>
        {/* Safety helmet */}
        <Sphere args={[0.17, 16, 16]} position={[-0.1, 0.75, -0.3]} scale={[1, 0.7, 1]}>
          <meshStandardMaterial
            color={"#fcd34d"}
            metalness={0.4}
            roughness={0.6}
            side={DoubleSide}
          />
        </Sphere>
        {/* Arms */}
        <Box args={[0.1, 0.2, 0.1]} position={[-0.05, 0.5, -0.05]}>
          <meshStandardMaterial
            color={isDarkMode ? "#A78BFA" : "#8b5cf6"}
            metalness={0.3}
            roughness={0.7}
            side={DoubleSide}
          />
        </Box>
      </group>

      {/* Exhaust pipe */}
      <Cylinder args={[0.05, 0.03, 0.3, 8]} position={[-0.4, 0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
        <meshStandardMaterial
          color={isDarkMode ? "#64748b" : "#475569"}
          metalness={0.7}
          roughness={0.3}
          side={DoubleSide}
        />
      </Cylinder>

      {/* Headlights */}
      <Sphere args={[0.06, 8, 8]} position={[0.4, 0.3, 0.4]}>
        <meshStandardMaterial
          color={"#f8fafc"}
          emissive={"#f8fafc"}
          emissiveIntensity={0.5}
          toneMapped={false}
          metalness={0.9}
          roughness={0.1}
          side={DoubleSide}
        />
      </Sphere>
      <Sphere args={[0.06, 8, 8]} position={[0.4, 0.3, -0.4]}>
        <meshStandardMaterial
          color={"#f8fafc"}
          emissive={"#f8fafc"}
          emissiveIntensity={0.5}
          toneMapped={false}
          metalness={0.9}
          roughness={0.1}
          side={DoubleSide}
        />
      </Sphere>
    </group>
  );
};

export default AnimatedForklift;
