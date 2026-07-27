'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Cpu } from 'lucide-react';

function ChromeLogoMesh({ mousePos }: { mousePos: { x: number; y: number } }) {
  const outerRingRef = useRef<THREE.Mesh>(null);
  const innerKnotRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state, delta) => {
    if (outerRingRef.current) {
      outerRingRef.current.rotation.x += delta * 0.3;
      outerRingRef.current.rotation.y += delta * 0.5;
    }

    if (innerKnotRef.current) {
      innerKnotRef.current.rotation.x -= delta * 0.4;
      innerKnotRef.current.rotation.y += delta * 0.6;
    }

    if (lightRef.current) {
      lightRef.current.position.x = THREE.MathUtils.lerp(
        lightRef.current.position.x,
        mousePos.x * 5,
        0.05
      );
      lightRef.current.position.y = THREE.MathUtils.lerp(
        lightRef.current.position.y,
        mousePos.y * 5,
        0.05
      );
    }
  });

  return (
    <group>
      <pointLight ref={lightRef} position={[2, 2, 4]} intensity={15} color="#00f2fe" />
      <directionalLight position={[-3, -3, 2]} intensity={5} color="#7f00ff" />
      <ambientLight intensity={0.4} />

      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.8}>
        <mesh ref={outerRingRef} scale={1.4}>
          <torusGeometry args={[1.2, 0.15, 32, 100]} />
          <meshPhysicalMaterial
            color="#ffffff"
            transmission={0.85}
            opacity={1}
            transparent
            roughness={0.05}
            ior={1.5}
            thickness={0.5}
            specularIntensity={1}
            clearcoat={1}
          />
        </mesh>

        <mesh ref={innerKnotRef} scale={0.85}>
          <torusKnotGeometry args={[0.7, 0.22, 128, 32]} />
          <meshStandardMaterial
            color="#090d1a"
            metalness={0.95}
            roughness={0.1}
            emissive="#00f2fe"
            emissiveIntensity={0.25}
          />
        </mesh>
      </Float>

      <Sparkles count={80} scale={8} size={2.5} speed={0.4} color="#00f2fe" />
    </group>
  );
}

interface Splash3DProps {
  onEnter: () => void;
}

export const Splash3D: React.FC<Splash3DProps> = ({ onEnter }) => {
  const [progress, setProgress] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsDone(true);
          return 100;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 120);

    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = -(e.clientY / window.innerHeight) * 2 + 1;
    setMousePos({ x, y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const x = (touch.clientX / window.innerWidth) * 2 - 1;
      const y = -(touch.clientY / window.innerHeight) * 2 + 1;
      setMousePos({ x, y });
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#04060d] text-slate-100 selection:bg-cyan-500 overflow-hidden"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.1 }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      >
        <div className="absolute inset-0 z-0">
          <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
            <ChromeLogoMesh mousePos={mousePos} />
          </Canvas>
        </div>

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#04060d_85%)] pointer-events-none z-10" />

        <div className="relative z-20 flex flex-col items-center text-center p-6 max-w-lg w-full">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-cyan-500/30 text-cyan-400 text-xs font-mono mb-4 backdrop-blur-md shadow-lg"
          >
            <Cpu className="w-3.5 h-3.5 animate-pulse" />
            <span>INITIALIZING WEBGL CORE v2.5</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl sm:text-5xl font-extrabold tracking-tight gradient-text-cyan font-heading mb-2"
          >
            Mach-AI
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-sm font-semibold text-slate-300 font-heading mb-8"
          >
            உன் தோழன், உன் AI நண்பன்
          </motion.p>

          {!isDone ? (
            <div className="w-full max-w-xs space-y-2">
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: 'easeOut' }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Loading Assets...</span>
                <span>{progress}%</span>
              </div>
            </div>
          ) : (
            <motion.button
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onEnter}
              className="flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-bold text-sm tracking-wider shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all border border-cyan-400/40"
            >
              <span>ENTER MACH-AI</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
