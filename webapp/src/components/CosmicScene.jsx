import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'

function Planet({ color = '#7C3AED', position = [0,0,0], glow = '#22D3EE' }){
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[1.2, 64, 64]} />
        <meshStandardMaterial color={color} metalness={0.2} roughness={0.3} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.28, 64, 64]} />
        <meshBasicMaterial color={glow} transparent opacity={0.08} />
      </mesh>
    </group>
  )
}

export default function CosmicScene(){
  return (
    <div style={{position:'fixed',inset:0,zIndex:0}}>
      <Canvas camera={{ position: [0,0,6], fov: 60 }}>
        <color attach="background" args={["#05070F"]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[5,5,5]} intensity={1.2} color="#22D3EE" />
        <Suspense fallback={null}>
          <Planet position={[0,0,0]} />
          <Planet position={[3,1,-2]} color="#22D3EE" glow="#7C3AED" />
          <Stars radius={80} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        </Suspense>
        <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  )
}


