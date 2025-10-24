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
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div className="tab-container">
            <button
              onClick={(e) => {
                setActiveTab('bridge')
                createParticleTrail(e)
              }}
              className={`tab-button ${activeTab === 'bridge' ? 'active' : ''}`}
            >
              Bridge
            </button>
            <button
              onClick={(e) => {
                setActiveTab('validator')
                createParticleTrail(e)
              }}
              className={`tab-button ${activeTab === 'validator' ? 'active' : ''}`}
            >
              Validator
            </button>
          </div>
          <div className="connect-button-wrapper">
            <ConnectButton />
          </div>
        </div>
      </header>
      <main className="content">
        <div className="page-transition">
          {activeTab === 'bridge' ? <Bridge /> : <ValidatorPanel />}
        </div>
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


