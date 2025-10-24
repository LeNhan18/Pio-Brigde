import React from 'react'

export default function DebugInfo({ PIOLock_ADDRESS, PIOMint_ADDRESS, isConnected, chainId, address, lockHash, isLockPending, isLockSuccess, pendingTransaction, transactions, approveHash, isApprovePending, isApproveSuccess }) {
  return (
    <div style={{
      padding: '12px',
      background: 'rgba(0, 0, 0, 0.8)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      fontSize: '10px',
      color: '#fff',
      marginBottom: '16px',
      fontFamily: 'monospace'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#22D3EE' }}>
        🔧 Debug Info
      </div>
      
      <div style={{ marginBottom: '4px' }}>
        <strong>Connected:</strong> {isConnected ? '✅ Yes' : '❌ No'}
      </div>
      
      <div style={{ marginBottom: '4px' }}>
        <strong>Chain ID:</strong> {chainId || 'Unknown'}
      </div>
      
      <div style={{ marginBottom: '4px' }}>
        <strong>Address:</strong> {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}
      </div>
      
      <div style={{ marginBottom: '4px' }}>
        <strong>PIOLock:</strong> {PIOLock_ADDRESS === '0x...' ? '❌ Not set' : '✅ Set'}
      </div>
      
      <div style={{ marginBottom: '4px' }}>
        <strong>PIOMint:</strong> {PIOMint_ADDRESS === '0x...' ? '❌ Not set' : '✅ Set'}
      </div>
      
      {PIOLock_ADDRESS !== '0x...' && (
        <div style={{ marginTop: '8px', fontSize: '9px', opacity: 0.7 }}>
          PIOLock: {PIOLock_ADDRESS}
        </div>
      )}
      
      {PIOMint_ADDRESS !== '0x...' && (
        <div style={{ fontSize: '9px', opacity: 0.7 }}>
          PIOMint: {PIOMint_ADDRESS}
        </div>
      )}
      
      <div style={{ marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '8px' }}>
        <div style={{ marginBottom: '4px' }}>
          <strong>Lock Hash:</strong> {lockHash ? `${lockHash.slice(0, 10)}...` : 'None'}
        </div>
        
        <div style={{ marginBottom: '4px' }}>
          <strong>Lock Pending:</strong> {isLockPending ? '⏳ Yes' : '❌ No'}
        </div>
        
        <div style={{ marginBottom: '4px' }}>
          <strong>Lock Success:</strong> {isLockSuccess ? '✅ Yes' : '❌ No'}
        </div>
        
        <div style={{ marginBottom: '4px' }}>
          <strong>Pending TX:</strong> {pendingTransaction ? '⏳ Yes' : '❌ No'}
        </div>
        
        <div style={{ marginBottom: '4px' }}>
          <strong>TX Count:</strong> {transactions?.length || 0}
        </div>
        
        <div style={{ marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '8px' }}>
          <div style={{ marginBottom: '4px' }}>
            <strong>Approve Hash:</strong> {approveHash ? `${approveHash.slice(0, 10)}...` : 'None'}
          </div>
          
          <div style={{ marginBottom: '4px' }}>
            <strong>Approve Pending:</strong> {isApprovePending ? '⏳ Yes' : '❌ No'}
          </div>
          
          <div style={{ marginBottom: '4px' }}>
            <strong>Approve Success:</strong> {isApproveSuccess ? '✅ Yes' : '❌ No'}
          </div>
        </div>
      </div>
    </div>
  )
}
