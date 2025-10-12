import React, { useState } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import CosmicScene from './components/CosmicScene'
import Bridge from './features/bridge/Bridge'
import ValidatorPanel from './components/ValidatorPanel'

export default function App() {
  const [activeTab, setActiveTab] = useState('bridge')

  return (
    <div className="app-root">
      <CosmicScene />
      <header className="topbar">
        <div className="brand">PIO Bridge</div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <button
              onClick={() => setActiveTab('bridge')}
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
                boxShadow: activeTab === 'bridge' ? '0 4px 12px rgba(124, 58, 237, 0.3)' : 'none'
              }}
            >
              Bridge
            </button>
            <button
              onClick={() => setActiveTab('validator')}
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
                boxShadow: activeTab === 'validator' ? '0 4px 12px rgba(124, 58, 237, 0.3)' : 'none'
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
    </div>
  )
}


