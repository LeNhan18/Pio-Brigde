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
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setActiveTab('bridge')}
              style={{
                padding: '8px 16px',
                background: activeTab === 'bridge' ? '#7C3AED' : 'transparent',
                border: '1px solid #7C3AED',
                borderRadius: '6px',
                color: 'white',
                fontSize: 14,
                cursor: 'pointer'
              }}
            >
              Bridge
            </button>
            <button
              onClick={() => setActiveTab('validator')}
              style={{
                padding: '8px 16px',
                background: activeTab === 'validator' ? '#7C3AED' : 'transparent',
                border: '1px solid #7C3AED',
                borderRadius: '6px',
                color: 'white',
                fontSize: 14,
                cursor: 'pointer'
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


