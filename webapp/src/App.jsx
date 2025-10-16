import React, { useState, useEffect } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import CosmicScene from './components/CosmicScene'
import Bridge from './features/bridge/Bridge'
import ValidatorPanel from './components/ValidatorPanel'
import AIAssistant from './components/AIAssistant'

export default function App() {
  const [activeTab, setActiveTab] = useState('bridge')
  const [particles, setParticles] = useState([])

  // Tạo particle trail effect khi click
  const createParticleTrail = (e) => {
    const rect = e.target.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const newParticle = {
      id: Date.now() + Math.random(),
      x: x,
      y: y,
      timestamp: Date.now()
    }
    
    setParticles(prev => [...prev, newParticle])
    
    // Remove particle after animation
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== newParticle.id))
    }, 1000)
  }

  // Auto-remove old particles
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => prev.filter(p => Date.now() - p.timestamp < 1000))
    }, 100)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="app-root">
      <CosmicScene />
      <header className="topbar">
        <div className="brand">PIO Bridge</div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <button
              onClick={(e) => {
                setActiveTab('bridge')
                createParticleTrail(e)
              }}
              style={{
                padding: '10px 20px',
                background: activeTab === 'bridge' ? 'linear-gradient(135deg, #7C3AED, #22D3EE)' : 'transparent',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: activeTab === 'bridge' ? '0 4px 12px rgba(124, 58, 237, 0.3)' : 'none',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              Bridge
            </button>
            <button
              onClick={(e) => {
                setActiveTab('validator')
                createParticleTrail(e)
              }}
              style={{
                padding: '10px 20px',
                background: activeTab === 'validator' ? 'linear-gradient(135deg, #7C3AED, #22D3EE)' : 'transparent',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: activeTab === 'validator' ? '0 4px 12px rgba(124, 58, 237, 0.3)' : 'none',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              Validator
            </button>
          </div>
          <ConnectButton />
        </div>
      </header>
      <main className="content">
        {activeTab === 'bridge' ? <Bridge /> : <ValidatorPanel />}
      </main>
      
      {/* Particle Trail Effects */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="particle-trail"
          style={{
            left: particle.x,
            top: particle.y,
          }}
        />
      ))}

      {/* AI Assistant */}
      <AIAssistant />
    </div>
  )
}


