import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, ScrollControls, useScroll } from '@react-three/drei';
import { Book } from './Book';

function AnimatedScene() {
  const scroll = useScroll();
  
  return (
    <group>
      <Book />
    </group>
  );
}

export function Scene() {
  return (
    <Canvas className="absolute inset-0 -z-10">
      <ScrollControls pages={3} damping={0.1}>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
        />
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ffffff" />
        <AnimatedScene />
      </ScrollControls>
    </Canvas>
  );
}