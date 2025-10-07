import React from 'react'
import CosmicScene from './components/CosmicScene'
import Bridge from './features/bridge/Bridge'

export default function App() {
  return (
    <div className="app-root">
      <CosmicScene />
      <header className="topbar">
        <div className="brand">PIO Bridge</div>
      </header>
      <main className="content">
        <Bridge />
      </main>
    </div>
  )
}


