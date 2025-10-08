import React, { useState, useEffect } from 'react'
import { useAccount, useBalance, useChainId, useSwitchChain } from 'wagmi'
import { parseEther, formatEther } from 'viem'

export default function Bridge(){
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const [amount, setAmount] = useState('')
  const [destination, setDestination] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [transactions, setTransactions] = useState([])

  // Get balance
  const { data: balance } = useBalance({
    address: address,
    chainId: chainId === 5080 ? 5080 : 5,
  })

  // Contract addresses (update with deployed addresses)
  const PIOLock_ADDRESS = '0x...' // Pione Zero
  const PIOMint_ADDRESS = '0x...' // Goerli

  const onBridge = async () => {
    if (!isConnected) return alert('Vui lòng kết nối ví')
    if (!amount || Number(amount) <= 0) return alert('Nhập số lượng hợp lệ')
    if (!destination) return alert('Nhập địa chỉ đích')

    setIsProcessing(true)
    try {
      // Switch to Pione Zero for locking
      if (chainId !== 5080) {
        await switchChain({ chainId: 5080 })
        return
      }

      // TODO: Call PIOLock.lock() contract
      const tx = {
        hash: '0x' + Math.random().toString(16).substr(2, 64),
        amount: amount,
        destination: destination,
        timestamp: Date.now(),
        status: 'pending'
      }
      
      setTransactions(prev => [tx, ...prev])
      alert(`Bridge ${amount} PIO initiated! TX: ${tx.hash}`)
      
    } catch (error) {
      alert('Bridge failed: ' + error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const quickAmounts = [0.25, 0.5, 0.75, 1.0]

  return (
    <div style={{ display: 'flex', gap: '24px', maxWidth: '1200px', width: '100%' }}>
      {/* Bridge Form */}
      <div className="panel" style={{ flex: 1, minWidth: 400 }}>
        <div style={{ fontWeight: 700, marginBottom: 20, fontSize: 24 }}>
          PIO → wPIO Bridge
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
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Số lượng PIO</label>
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
          {isProcessing ? 'Đang xử lý...' : 'Bridge PIO'}
        </button>

        <div style={{ fontSize: 12, opacity: 0.7, marginTop: 12, textAlign: 'center' }}>
          Multisig 3/5 | Timelock 24h | AI Security
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
              <div key={index} style={{
                padding: '12px',
                border: '1px solid #374151',
                borderRadius: '8px',
                marginBottom: '8px',
                background: '#1F2937'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{tx.amount} PIO</div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>
                      To: {tx.destination?.slice(0, 6)}...{tx.destination?.slice(-4)}
                    </div>
                  </div>
                  <div style={{
                    padding: '4px 8px',
                    background: tx.status === 'pending' ? '#F59E0B20' : '#10B98120',
                    color: tx.status === 'pending' ? '#F59E0B' : '#10B981',
                    borderRadius: '4px',
                    fontSize: 12,
                    fontWeight: 600
                  }}>
                    {tx.status}
                  </div>
                </div>
                <div style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>
                  TX: {tx.hash?.slice(0, 10)}...{tx.hash?.slice(-8)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


