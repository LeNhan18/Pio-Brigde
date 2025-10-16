import React, { useState } from 'react'
import { formatEther } from 'viem'
import { useBridge } from '../../hooks/useBridge'
import TransactionStatus from '../../components/TransactionStatus'
import AISecurityMonitor from '../../components/AISecurityMonitor'

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
        <div className={`status-alert ${isConnected ? 'success' : 'error'}`}>
          {isConnected ? (
            <div>
              <div>✅ Đã kết nối ví</div>
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
            <div>❌ Chưa kết nối ví</div>
          )}
        </div>

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
          <label className="form-label">Địa chỉ đích (Goerli)</label>
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

        <div className="form-info">
          Multisig 3/5 | Timelock 24h | AI Security
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


