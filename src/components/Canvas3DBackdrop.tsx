'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

interface CryptoCoreProps {
  mousePos: { x: number; y: number };
  isAuthOpen: boolean;
}

function CryptoCoreMesh({ mousePos, isAuthOpen }: CryptoCoreProps) {
  const outerWireRef = useRef<THREE.Mesh>(null);
  const innerCrystalRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state, delta) => {
    if (outerWireRef.current) {
      outerWireRef.current.rotation.x += delta * 0.2;
      outerWireRef.current.rotation.y += delta * 0.35;
    }

    if (innerCrystalRef.current) {
      innerCrystalRef.current.rotation.x -= delta * 0.3;
      innerCrystalRef.current.rotation.z += delta * 0.4;
    }

    if (lightRef.current) {
      lightRef.current.position.x = THREE.MathUtils.lerp(
        lightRef.current.position.x,
        mousePos.x * 4,
        0.05
      );
      lightRef.current.position.y = THREE.MathUtils.lerp(
        lightRef.current.position.y,
        mousePos.y * 4,
        0.05
      );
    }
  });

  return (
    <group position={isAuthOpen ? [1.8, 0, 0] : [0, 0, 0]}>
      <pointLight ref={lightRef} position={[2, 3, 3]} intensity={12} color="#00f2fe" />
      <directionalLight position={[-2, -2, 4]} intensity={4} color="#7f00ff" />
      <ambientLight intensity={0.3} />

      <Float speed={1.5} rotationIntensity={0.6} floatIntensity={0.8}>
        {/* Cryptographic Outer Wireframe Mesh */}
        <mesh ref={outerWireRef} scale={1.2}>
          <icosahedronGeometry args={[1.3, 1]} />
          <meshStandardMaterial
            color="#00f2fe"
            wireframe
            wireframeLinewidth={1.5}
            emissive="#00f2fe"
            emissiveIntensity={0.4}
          />
        </mesh>

        {/* Cryptographic Inner Glowing Crystal Core */}
        <mesh ref={innerCrystalRef} scale={0.7}>
          <octahedronGeometry args={[1, 0]} />
          <meshPhysicalMaterial
            color="#ffffff"
            transmission={0.9}
            roughness={0.08}
            ior={1.6}
            emissive="#7f00ff"
            emissiveIntensity={0.6}
            clearcoat={1}
          />
        </mesh>
      </Float>

      <Sparkles count={60} scale={10} size={2} speed={0.3} color="#00f2fe" />
    </group>
  );
}

function CameraRig({ isAuthOpen }: { isAuthOpen: boolean }) {
  const { camera, size } = useThree();

  useEffect(() => {
    // Dynamically adjust FOV based on screen width to prevent mobile edge clipping
    const perspectiveCam = camera as THREE.PerspectiveCamera;
    if (size.width < 640) {
      perspectiveCam.fov = 65;
    } else if (size.width < 1024) {
      perspectiveCam.fov = 55;
    } else {
      perspectiveCam.fov = 45;
    }
    perspectiveCam.updateProjectionMatrix();
  }, [camera, size.width]);

  useFrame(() => {
    // Smooth camera pan when Auth Panel is open
    const targetX = isAuthOpen ? -1.5 : 0;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.05);
  });

  return null;
}

interface Canvas3DBackdropProps {
  isAuthOpen: boolean;
}

export const Canvas3DBackdrop: React.FC<Canvas3DBackdropProps> = ({ isAuthOpen }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 opacity-70">
      <Canvas camera={{ position: [0, 0, 5.5], fov: 45 }}>
        <CameraRig isAuthOpen={isAuthOpen} />
        <CryptoCoreMesh mousePos={mousePos} isAuthOpen={isAuthOpen} />
      </Canvas>
    </div>
  );
};
