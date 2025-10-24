import React, { useState } from 'react'
import { formatEther } from 'viem'
import { useBridge } from '../../hooks/useBridge'
import TransactionStatus from '../../components/TransactionStatus'
import AISecurityMonitor from '../../components/AISecurityMonitor'
import NetworkStatus from '../../components/NetworkStatus'

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
      : `https://sepolia.etherscan.io/tx/${hash}`
    window.open(explorerUrl, '_blank')
  }

  const quickAmounts = [0.25, 0.5, 0.75, 1.0]

  return (
    <div className="bridge-wrap">
      {/* Bridge Form */}
      <div className="panel bridge-card" style={{ flex: 1, minWidth: 400 }}>
        <div className="bridge-header">
          <div style={{fontWeight:800,fontSize:24,letterSpacing:.3}}>PZO → wPZO Bridge</div>
          <div style={{display:'flex',gap:8}}>
            <div className="network-chip"><span className="network-dot"/>Pione Zero (5080)</div>
            <button className="link-btn" onClick={()=>window.open('https://faucet.zeroscan.org','_blank')}>Faucet</button>
          </div>
        </div>
        
        {/* Network Status */}
        <NetworkStatus />

        {/* Connection Status */}
        {isConnected && (
          <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: 12, opacity: 0.8 }}>
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </div>
            {balance && (
              <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>
                Balance: {parseFloat(formatEther(balance.value)).toFixed(4)} {balance.symbol}
              </div>
            )}
          </div>
        )}

        {/* Amount Input */}
        <div className="form-group">
          <label className="form-label">Số lượng PZO</label>
          <input 
            className="form-input"
            placeholder="0.0" 
            value={amount} 
            onChange={e => setAmount(e.target.value)}
          />
          <div className="quick-amounts">
            {quickAmounts.map(ratio => (
              <button
                key={ratio}
                className="quick-amount-btn"
                onClick={() => {
                  if (balance) {
                    const maxAmount = parseFloat(formatEther(balance.value))
                    setAmount((maxAmount * ratio).toFixed(4))
                  }
                }}
              >
                {ratio * 100}%
              </button>
            ))}
          </div>
        </div>

        {/* Destination Address */}
        <div className="form-group">
          <label className="form-label">Địa chỉ đích (Sepolia)</label>
          <input 
            className="form-input"
            placeholder="0x..." 
            value={destination} 
            onChange={e => setDestination(e.target.value)}
          />
        </div>

        {/* Bridge Button */}
        <button 
          className="form-button" 
          onClick={onBridge}
          disabled={isProcessing || !isConnected}
        >
          {isProcessing ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              Đang xử lý...
            </span>
          ) : 'Bridge PZO'}
        </button>

        <div className="stat-grid">
          <div className="stat-item"><span className="stat-label">Security</span><span className="stat-value">Multisig 3/5</span></div>
          <div className="stat-item"><span className="stat-label">Safety</span><span className="stat-value">Timelock 24h</span></div>
          <div className="stat-item"><span className="stat-label">AI</span><span className="stat-value">Realtime Monitor</span></div>
        </div>
        <div className="divider"/>
        <div className="helper">Giao dịch testnet • Không dùng cho tài sản thật</div>

        {/* Testnet Info */}
        <div style={{
          marginTop: '16px',
          padding: '12px',
          background: 'rgba(34, 211, 238, 0.1)',
          border: '1px solid rgba(34, 211, 238, 0.3)',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#22D3EE'
        }}>
          <div style={{ fontWeight: 600, marginBottom: '4px' }}>
            🧪 Testnet Mode
          </div>
          <div>
            • Pione Zero: Chain ID 5080<br/>
            • Sepolia: Chain ID 11155111<br/>
            • Faucet: <a href="https://faucet.zeroscan.org" target="_blank" style={{ color: '#22D3EE' }}>Get PZO</a> | <a href="https://sepoliafaucet.com" target="_blank" style={{ color: '#22D3EE' }}>Get ETH</a>
          </div>
        </div>
        
        {/* Contract Info */}
        <div className="contract-info">
          PIOLock: {PIOLock_ADDRESS?.slice(0, 6)}...{PIOLock_ADDRESS?.slice(-4)} | 
          PIOMint: {PIOMint_ADDRESS?.slice(0, 6)}...{PIOMint_ADDRESS?.slice(-4)}
        </div>

        {/* AI Security Monitor */}
        <AISecurityMonitor 
          transactions={transactions} 
          isActive={isConnected && transactions.length > 0}
        />
      </div>

      {/* Transaction History */}
      <div className="panel bridge-card" style={{ flex: 1, minWidth: 400 }}>
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


