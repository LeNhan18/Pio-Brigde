import React, { Suspense, useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars, AdaptiveDpr, AdaptiveEvents } from '@react-three/drei'
import * as THREE from 'three'

function Planet({ color = '#7C3AED', position = [0,0,0], glow = '#22D3EE', isMain = false, planetType = 'earth' }){
  const meshRef = useRef()
  const glowRef = useRef()
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005
    }
    if (glowRef.current) {
      glowRef.current.rotation.y += 0.003
    }
  })

  // Tạo texture thật cho các hành tinh
  const createRealisticPlanetTexture = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 512
    const ctx = canvas.getContext('2d')
    
    if (planetType === 'earth') {
      // Trái Đất thật với đại dương xanh và lục địa
      // Đại dương
      ctx.fillStyle = '#1e3a8a'
      ctx.fillRect(0, 0, 1024, 512)
      
      // Thêm các đại dương khác nhau
      const oceanColors = ['#1e40af', '#1d4ed8', '#2563eb', '#3b82f6']
      for (let i = 0; i < 20; i++) {
        ctx.fillStyle = oceanColors[Math.floor(Math.random() * oceanColors.length)]
        ctx.beginPath()
        ctx.arc(
          Math.random() * 1024, 
          Math.random() * 512, 
          Math.random() * 200 + 50, 
          0, 
          Math.PI * 2
        )
        ctx.fill()
      }
      
      // Lục địa với màu xanh lá và nâu
      const landColors = ['#166534', '#15803d', '#16a34a', '#22c55e', '#4ade80', '#8b5cf6', '#a855f7']
      for (let i = 0; i < 15; i++) {
        ctx.fillStyle = landColors[Math.floor(Math.random() * landColors.length)]
        ctx.beginPath()
        ctx.arc(
          Math.random() * 1024, 
          Math.random() * 512, 
          Math.random() * 80 + 20, 
          0, 
          Math.PI * 2
        )
        ctx.fill()
      }
      
      // Thêm sa mạc và núi
      const terrainColors = ['#a3a3a3', '#737373', '#525252', '#fbbf24', '#f59e0b']
      for (let i = 0; i < 10; i++) {
        ctx.fillStyle = terrainColors[Math.floor(Math.random() * terrainColors.length)]
        ctx.beginPath()
        ctx.arc(
          Math.random() * 1024, 
          Math.random() * 512, 
          Math.random() * 40 + 10, 
          0, 
          Math.PI * 2
        )
        ctx.fill()
      }
      
    } else if (planetType === 'mars') {
      // Sao Hỏa với màu đỏ cam
      ctx.fillStyle = '#dc2626'
      ctx.fillRect(0, 0, 1024, 512)
      
      const marsColors = ['#b91c1c', '#dc2626', '#ef4444', '#f87171', '#fca5a5', '#fecaca']
      for (let i = 0; i < 25; i++) {
        ctx.fillStyle = marsColors[Math.floor(Math.random() * marsColors.length)]
        ctx.beginPath()
        ctx.arc(
          Math.random() * 1024, 
          Math.random() * 512, 
          Math.random() * 100 + 30, 
          0, 
          Math.PI * 2
        )
        ctx.fill()
      }
      
    } else if (planetType === 'jupiter') {
      // Sao Mộc với dải màu cam và nâu
      ctx.fillStyle = '#ea580c'
      ctx.fillRect(0, 0, 1024, 512)
      
      // Tạo các dải ngang như Sao Mộc thật
      for (let i = 0; i < 8; i++) {
        const y = (i * 512) / 8
        const height = 512 / 8 + Math.random() * 20
        ctx.fillStyle = i % 2 === 0 ? '#ea580c' : '#dc2626'
        ctx.fillRect(0, y, 1024, height)
      }
      
      // Thêm Great Red Spot
      ctx.fillStyle = '#b91c1c'
      ctx.beginPath()
      ctx.arc(300, 200, 60, 0, Math.PI * 2)
      ctx.fill()
      
    } else {
      // Hành tinh khác với màu tương ứng
      ctx.fillStyle = color
      ctx.fillRect(0, 0, 1024, 512)
      
      const variations = [
        color,
        new THREE.Color(color).lerp(new THREE.Color(glow), 0.3).getHexString(),
        new THREE.Color(color).lerp(new THREE.Color('#000000'), 0.2).getHexString()
      ]
      for (let i = 0; i < 30; i++) {
        ctx.fillStyle = '#' + variations[Math.floor(Math.random() * variations.length)]
        ctx.beginPath()
        ctx.arc(
          Math.random() * 1024, 
          Math.random() * 512, 
          Math.random() * 50 + 20, 
          0, 
          Math.PI * 2
        )
        ctx.fill()
      }
    }
    
    return new THREE.CanvasTexture(canvas)
  }

  // Tạo bump map thực tế hơn
  const createRealisticBumpMap = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    
    // Tạo Perlin-like noise
    const imageData = ctx.createImageData(512, 256)
    for (let i = 0; i < imageData.data.length; i += 4) {
      const x = (i / 4) % 512
      const y = Math.floor((i / 4) / 512)
      
      // Tạo noise với nhiều tần số
      let noise = 0
      noise += Math.sin(x * 0.01) * Math.cos(y * 0.01) * 50
      noise += Math.sin(x * 0.05) * Math.cos(y * 0.05) * 25
      noise += Math.sin(x * 0.1) * Math.cos(y * 0.1) * 12
      noise += Math.random() * 20
      
      const value = Math.max(0, Math.min(255, 128 + noise))
      
      imageData.data[i] = value     // R
      imageData.data[i + 1] = value // G
      imageData.data[i + 2] = value // B
      imageData.data[i + 3] = 255   // A
    }
    ctx.putImageData(imageData, 0, 0)
    
    return new THREE.CanvasTexture(canvas)
  }

  const planetTexture = createRealisticPlanetTexture()
  const bumpMap = createRealisticBumpMap()

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.2, 128, 128]} />
        <meshStandardMaterial 
          map={planetTexture}
          bumpMap={bumpMap}
          bumpScale={0.2}
          metalness={0.05} 
          roughness={0.9}
          emissive={color}
          emissiveIntensity={0.02}
        />
      </mesh>
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.25, 64, 64]} />
        <meshBasicMaterial color={glow} transparent opacity={0.15} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.35, 64, 64]} />
        <meshBasicMaterial color={glow} transparent opacity={0.08} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.45, 64, 64]} />
        <meshBasicMaterial color={glow} transparent opacity={0.04} />
      </mesh>
    </group>
  )
}

// Floating Particles Component
function FloatingParticles({ count = 100 }) {
  const meshRef = useRef()
  const particlesRef = useRef([])
  
  const particles = useMemo(() => {
    const temp = new Array(count).fill().map(() => ({
      position: [
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20
      ],
      velocity: [
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02
      ],
      size: Math.random() * 0.1 + 0.05,
      opacity: Math.random() * 0.5 + 0.2
    }))
    return temp
  }, [count])

  useFrame((state) => {
    if (particlesRef.current && particlesRef.current.length > 0) {
      particlesRef.current.forEach((particle, i) => {
        if (particle && particle.position) {
          particle.position[0] += particles[i].velocity[0]
          particle.position[1] += particles[i].velocity[1]
          particle.position[2] += particles[i].velocity[2]
          
          // Wrap around
          if (particle.position[0] > 10) particle.position[0] = -10
          if (particle.position[0] < -10) particle.position[0] = 10
          if (particle.position[1] > 10) particle.position[1] = -10
          if (particle.position[1] < -10) particle.position[1] = 10
          if (particle.position[2] > 10) particle.position[2] = -10
          if (particle.position[2] < -10) particle.position[2] = 10
        }
      })
    }
  })

  return (
    <group ref={meshRef}>
      {particles.map((particle, i) => (
        <mesh 
          key={i} 
          position={particle.position} 
          ref={el => {
            if (el) {
              particlesRef.current[i] = el
            }
          }}
        >
          <sphereGeometry args={[particle.size, 8, 8]} />
          <meshBasicMaterial 
            color="#7C3AED" 
            transparent 
            opacity={particle.opacity}
          />
        </mesh>
      ))}
    </group>
  )
}

// Energy Rings Component
function EnergyRings() {
  const ringRefs = useRef([])
  
  useFrame((state) => {
    ringRefs.current.forEach((ring, i) => {
      if (ring) {
        ring.rotation.y += 0.01 * (i + 1)
        ring.rotation.x += 0.005 * (i + 1)
      }
    })
  })

  return (
    <group>
      {[1, 1.5, 2, 2.5].map((radius, i) => (
        <mesh 
          key={i} 
          ref={el => {
            if (el) {
              ringRefs.current[i] = el
            }
          }}
        >
          <torusGeometry args={[radius, 0.02, 8, 100]} />
          <meshBasicMaterial 
            color={i % 2 === 0 ? "#7C3AED" : "#22D3EE"} 
            transparent 
            opacity={0.3 - i * 0.05}
          />
        </mesh>
      ))}
    </group>
  )
}

// Pulsing Orbs Component
function PulsingOrbs() {
  const orbRefs = useRef([])
  
  useFrame((state) => {
    orbRefs.current.forEach((orb, i) => {
      if (orb) {
        const time = state.clock.getElapsedTime()
        const scale = 1 + Math.sin(time * 2 + i) * 0.2
        orb.scale.setScalar(scale)
        orb.rotation.y += 0.01
      }
    })
  })

  const orbPositions = [
    [4, 2, -3],
    [-3, -1, -2],
    [2, -2, -4],
    [-4, 1, -1]
  ]

  return (
    <group>
      {orbPositions.map((pos, i) => (
        <mesh 
          key={i} 
          position={pos} 
          ref={el => {
            if (el) {
              orbRefs.current[i] = el
            }
          }}
        >
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshBasicMaterial 
            color={i % 2 === 0 ? "#7C3AED" : "#22D3EE"} 
            transparent 
            opacity={0.6}
          />
        </mesh>
      ))}
    </group>
  )
}

export default function CosmicScene(){
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'matchMedia' in window) {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
      const update = () => setPrefersReducedMotion(!!mq.matches)
      update()
      mq.addEventListener?.('change', update)
      return () => mq.removeEventListener?.('change', update)
    }
  }, [])

  const starsCount = prefersReducedMotion ? 2000 : 6000
  const particlesCount = prefersReducedMotion ? 60 : 150

  return (
    <div style={{position:'fixed',inset:0,zIndex:0}}>
      <Canvas 
        camera={{ position: [0,0,6], fov: 60 }}
        dpr={[1, prefersReducedMotion ? 1.25 : 1.75]}
        gl={{ antialias: false, powerPreference: 'high-performance', alpha: true }}
      >
        <color attach="background" args={["#05070F"]} />
        <ambientLight intensity={0.4} />
        <pointLight position={[5,5,5]} intensity={1.5} color="#22D3EE" />
        <pointLight position={[-5,-5,5]} intensity={0.8} color="#7C3AED" />
        <directionalLight position={[0,10,5]} intensity={0.3} color="#ffffff" />
        <Suspense fallback={null}>
          <Planet position={[0,0,0]} planetType="earth" />
          <Planet position={[3,1,-2]} planetType="mars" color="#dc2626" glow="#f87171" />
          <Planet position={[-2.5,0.8,-1]} planetType="jupiter" color="#ea580c" glow="#f97316" />
          <FloatingParticles count={particlesCount} />
          <EnergyRings />
          <PulsingOrbs />
          <Stars radius={100} depth={60} count={starsCount} factor={5} saturation={0} fade speed={prefersReducedMotion ? 1.0 : 1.4} />
        </Suspense>
        <OrbitControls enablePan={false} enableZoom={false} autoRotate={!prefersReducedMotion} autoRotateSpeed={0.25} />
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
      </Canvas>
    </div>
  )
}


