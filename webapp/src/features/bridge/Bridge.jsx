import React, { useState } from 'react'
import { useBridge } from '../../hooks/useBridge'
import TransactionStatus from '../../components/TransactionStatus'

export default function Bridge(){
  const {
    isConnected,
    address,
    chainId,
    balance,
    transactions,
    isProcessing,
    bridgePZO,
    switchChain,
    PIOLock_ADDRESS,
    PIOMint_ADDRESS
  } = useBridge()

  const [amount, setAmount] = useState('')
  const [destination, setDestination] = useState('')

  const onBridge = async () => {
    try {
      await bridgePZO(amount, destination)
      setAmount('')
      setDestination('')
    } catch (error) {
      alert(error.message)
    }
  }

  const onViewExplorer = (hash) => {
    const explorerUrl = chainId === 5080 
      ? `https://zeroscan.org/tx/${hash}`
      : `https://goerli.etherscan.io/tx/${hash}`
    window.open(explorerUrl, '_blank')
  }

  const quickAmounts = [0.25, 0.5, 0.75, 1.0]

  return (
    <div style={{ display: 'flex', gap: '24px', maxWidth: '1200px', width: '100%' }}>
      {/* Bridge Form */}
      <div className="panel" style={{ flex: 1, minWidth: 400 }}>
        <div style={{ fontWeight: 700, marginBottom: 20, fontSize: 24 }}>
          PZO → wPZO Bridge
        </div>
        
        {/* Connection Status */}
        <div style={{ 
          padding: '12px 16px', 
          background: isConnected ? '#10B98120' : '#EF444420',
          border: `1px solid ${isConnected ? '#10B981' : '#EF4444'}`,
          borderRadius: '8px',
          marginBottom: 20
        }}>
          {isConnected ? (
            <div>
              <div style={{ fontWeight: 600, color: '#10B981' }}>✅ Đã kết nối ví</div>
              <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
                {address?.slice(0, 6)}...{address?.slice(-4)} | Chain: {chainId === 5080 ? 'Pione Zero' : 'Goerli'}
              </div>
              {balance && (
                <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>
                  Balance: {parseFloat(formatEther(balance.value)).toFixed(4)} {balance.symbol}
                </div>
              )}
            </div>
          ) : (
            <div style={{ color: '#EF4444' }}>❌ Chưa kết nối ví</div>
          )}
        </div>

        {/* Amount Input */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Số lượng PZO</label>
          <input 
            placeholder="0.0" 
            value={amount} 
            onChange={e => setAmount(e.target.value)}
            style={{ width: '100%', padding: '12px', fontSize: 16 }}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            {quickAmounts.map(ratio => (
              <button
                key={ratio}
                onClick={() => {
                  if (balance) {
                    const maxAmount = parseFloat(formatEther(balance.value))
                    setAmount((maxAmount * ratio).toFixed(4))
                  }
                }}
                style={{
                  padding: '6px 12px',
                  background: '#374151',
                  border: '1px solid #4B5563',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: 12,
                  cursor: 'pointer'
                }}
              >
                {ratio * 100}%
              </button>
            ))}
          </div>
        </div>

        {/* Destination Address */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Địa chỉ đích (Goerli)</label>
          <input 
            placeholder="0x..." 
            value={destination} 
            onChange={e => setDestination(e.target.value)}
            style={{ width: '100%', padding: '12px', fontSize: 16 }}
          />
        </div>

        {/* Bridge Button */}
        <button 
          className="action" 
          onClick={onBridge}
          disabled={isProcessing || !isConnected}
          style={{
            width: '100%',
            padding: '16px',
            fontSize: 16,
            fontWeight: 600,
            opacity: isProcessing || !isConnected ? 0.5 : 1,
            cursor: isProcessing || !isConnected ? 'not-allowed' : 'pointer'
          }}
        >
          {isProcessing ? 'Đang xử lý...' : 'Bridge PZO'}
        </button>

        <div style={{ fontSize: 12, opacity: 0.7, marginTop: 12, textAlign: 'center' }}>
          Multisig 3/5 | Timelock 24h | AI Security
        </div>
        
        {/* Contract Info */}
        <div style={{ fontSize: 10, opacity: 0.5, marginTop: 8, textAlign: 'center' }}>
          PIOLock: {PIOLock_ADDRESS?.slice(0, 6)}...{PIOLock_ADDRESS?.slice(-4)} | 
          PIOMint: {PIOMint_ADDRESS?.slice(0, 6)}...{PIOMint_ADDRESS?.slice(-4)}
        </div>
      </div>

      {/* Transaction History */}
      <div className="panel" style={{ flex: 1, minWidth: 400 }}>
        <div style={{ fontWeight: 700, marginBottom: 20, fontSize: 20 }}>
          Lịch sử giao dịch
        </div>
        
        {transactions.length === 0 ? (
          <div style={{ textAlign: 'center', opacity: 0.6, padding: '40px 20px' }}>
            Chưa có giao dịch nào
          </div>
        ) : (
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {transactions.map((tx, index) => (
              <TransactionStatus 
                key={index} 
                transaction={tx} 
                onViewExplorer={onViewExplorer}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


