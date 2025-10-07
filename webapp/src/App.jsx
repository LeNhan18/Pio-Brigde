import React from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import CosmicScene from './components/CosmicScene'
import Bridge from './features/bridge/Bridge'

export default function App() {
  return (
    <div className="app-root">
      <CosmicScene />
      <header className="topbar">
        <div className="brand">PIO Bridge</div>
        <ConnectButton />
      </header>
      <main className="content">
        <Bridge />
      </main>
    </div>
  )
}


