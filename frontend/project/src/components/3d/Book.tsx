import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

export function Book() {
  const bookRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (!bookRef.current) return;
    bookRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    bookRef.current.rotation.y += 0.005;
    bookRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
  });

  return (
    <group ref={bookRef}>
      {/* Book Cover */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2, 0.2, 3]} />
        <meshStandardMaterial color="#ffffff" metalness={0.2} roughness={0.8} />
      </mesh>
      
      {/* Pages */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[1.9, 0.1, 2.9]} />
        <meshStandardMaterial color="#f0f0f0" metalness={0.1} roughness={0.9} />
      </mesh>
      
      {/* Bookmark */}
      <mesh position={[0.8, 0.15, -0.5]} rotation={[0, 0.2, 0]}>
        <boxGeometry args={[0.1, 0.3, 0.5]} />
        <meshStandardMaterial color="#ffffff" metalness={0.3} roughness={0.6} />
      </mesh>
    </group>
  );
}