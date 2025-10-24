import React from 'react'

export default function ContractStatus({ PIOLock_ADDRESS, PIOMint_ADDRESS }) {
  const isDeployed = PIOLock_ADDRESS && PIOLock_ADDRESS !== '0x...' && PIOLock_ADDRESS !== '0x0000000000000000000000000000000000000000'
  
  if (isDeployed) {
    return (
      <div style={{
        padding: '12px',
        background: 'rgba(16, 185, 129, 0.1)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: '8px',
        fontSize: '12px',
        color: '#10B981',
        marginBottom: '16px'
      }}>
        ✅ Contracts đã được deploy
        <div style={{ marginTop: '4px', fontSize: '10px', opacity: 0.8 }}>
          PIOLock: {PIOLock_ADDRESS.slice(0, 6)}...{PIOLock_ADDRESS.slice(-4)}
        </div>
      </div>
    )
  }

  return (
    <div style={{
      padding: '12px',
      background: 'rgba(239, 68, 68, 0.1)',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      borderRadius: '8px',
      fontSize: '12px',
      color: '#EF4444',
      marginBottom: '16px'
    }}>
      ⚠️ Contracts chưa được deploy
      <div style={{ marginTop: '8px', fontSize: '10px', opacity: 0.8 }}>
        Vui lòng deploy contracts trước khi sử dụng bridge:
      </div>
      <div style={{ marginTop: '4px', fontSize: '10px', opacity: 0.8 }}>
        <code>npm run deploy:pionezero</code> (cho PIOLock)
      </div>
      <div style={{ marginTop: '2px', fontSize: '10px', opacity: 0.8 }}>
        <code>npm run deploy:bscTestnet</code> (cho PIOMint)
      </div>
    </div>
  )
}
