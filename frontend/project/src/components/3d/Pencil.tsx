import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

export function Pencil() {
  const pencilRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (!pencilRef.current) return;
    pencilRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    pencilRef.current.rotation.y += 0.002;
    pencilRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
  });

  return (
    <group ref={pencilRef}>
      {/* Pencil Body */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 2, 6]} />
        <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.8} />
      </mesh>
      
      {/* Pencil Tip */}
      <mesh position={[0, -1.1, 0]}>
        <coneGeometry args={[0.1, 0.3, 6]} />
        <meshStandardMaterial color="#666666" metalness={0.3} roughness={0.4} />
      </mesh>
      
      {/* Eraser */}
      <mesh position={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.11, 0.11, 0.2, 6]} />
        <meshStandardMaterial color="#cccccc" metalness={0.1} roughness={0.6} />
      </mesh>
    </group>
  );
}