import React, { useState, useEffect, useRef } from 'react'
import { formatEther } from 'viem'
import { useBridge } from '../../hooks/useBridge'
import TransactionStatus from '../../components/TransactionStatus'
import AISecurityMonitor from '../../components/AISecurityMonitor'
import NetworkStatus from '../../components/NetworkStatus'
import ContractStatus from '../../components/ContractStatus'
import DebugInfo from '../../components/DebugInfo'
import SecurityDashboard from '../../components/SecurityDashboard'
import BridgeStatus from '../../components/BridgeStatus'
import BridgeDebugPanel from '../../components/BridgeDebugPanel'
import ApprovalTimeoutHandler from '../../components/ApprovalTimeoutHandler'

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
    PIOMint_ADDRESS,
    lockHash,
    isLockPending,
    isLockSuccess,
    pendingTransaction,
    approveHash,
    isApprovePending,
    isApproveSuccess,
    isApproveReceiptSuccess,
    approveError,
    lockError,
    bridgeState,
    isListeningForEvents,
    resetBridgeState,
    forceApprovalProceed,
    checkTransactionStatus,
    transactionHistory,
    clearTransactionHistory,
    getTransactionStats,
    forceUpdateTransactionStatus
  } = useBridge()

  const [amount, setAmount] = useState('')
  const [destination, setDestination] = useState('')
  const [selectedToken, setSelectedToken] = useState('PZO') // PZO or USDT
    const [selectedDestinationNetwork, setSelectedDestinationNetwork] = useState('sepolia') // sepolia, arbitrum-sepolia, avalanche-fuji
  const [showNetworkDropdown, setShowNetworkDropdown] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNetworkDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const onBridge = async () => {
    try {
      if (!isConnected) {
        alert('Vui lòng kết nối ví trước!')
        return
      }
      
      if (!amount || !destination) {
        alert('Vui lòng nhập đầy đủ thông tin!')
        return
      }
      
      if (Number(amount) <= 0) {
        alert('Số lượng phải lớn hơn 0!')
        return
      }
      
      if (balance && Number(amount) > parseFloat(formatEther(balance.value))) {
        alert('Số dư không đủ!')
        return
      }

      // Đảm bảo ở đúng mạng Pione Zero trước khi bridge
      if (chainId !== 5080) {
        console.log('🔄 Switching to Pione Zero network...')
        await switchChain({ chainId: 5080 })
        return // Dừng lại để user tương tác với MetaMask
      }

      console.log('🚀 Starting bridge transaction - MetaMask popup sẽ hiển thị...')
      console.log('📝 Bridge parameters:', { amount, destination, chainId })
      
      // Reset bridge state trước khi bridge mới
      resetBridgeState()
      
      // Real bridge transaction - sẽ trigger MetaMask popup
      const result = await bridgePZO(amount, destination)
      
      if (result === 'pending') {
        console.log('⏳ Transaction submitted, waiting for hash...')
        setAmount('')
        setDestination('')
        alert('Giao dịch đã được gửi! Đang chờ xác nhận...')
      }
    } catch (error) {
      console.error('❌ Bridge error:', error)
      
      // Hiển thị lỗi chi tiết hơn
      let errorMessage = error.message
      
      if (error.message.includes('Contract chưa được deploy')) {
        errorMessage = 'Contract chưa được deploy. Vui lòng tạo file .env với contract addresses!'
      } else if (error.message.includes('User rejected')) {
        errorMessage = 'Bạn đã từ chối giao dịch trong MetaMask'
      } else if (error.message.includes('Insufficient funds')) {
        errorMessage = 'Số dư không đủ. Vui lòng lấy PZO từ faucet!'
      } else if (error.message.includes('Network not supported')) {
        errorMessage = 'Mạng không được hỗ trợ. Vui lòng chuyển sang Pione Zero!'
      }
      
      alert(` Lỗi: ${errorMessage}`)
    }
  }

  const onViewExplorer = (hash) => {
    const explorerUrl = chainId === 5080 
      ? `https://zeroscan.org/tx/${hash}`
      : `https://sepolia.etherscan.io/tx/${hash}`
    window.open(explorerUrl, '_blank')
  }

  const onRetryTransaction = async (transaction) => {
    try {
      console.log('🔄 Retrying transaction:', transaction)
      
      // Extract amount from transaction
      const amount = parseFloat(transaction.amount.replace(' PZO', ''))
      
      if (!amount || amount <= 0) {
        alert('Không thể lấy số lượng từ transaction cũ')
        return
      }
      
      // Retry the bridge with same parameters
      await bridgePZO(amount, transaction.destination)
      
      console.log('✅ Retry transaction submitted')
    } catch (error) {
      console.error('❌ Retry failed:', error)
      alert(`Retry thất bại: ${error.message}`)
    }
  }

  const quickAmounts = [0.25, 0.5, 0.75, 1.0]

  const destinationNetworks = [
    { 
      "id": "sepolia", 
      "name": "Ethereum Sepolia", 
      "chainId": 11155111, 
      "symbol": "ETH", 
      "faucet": "https://sepoliafaucet.io",
      "icon": "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color/eth.svg"
    },
    { 
      "id": "arbitrum-sepolia",
      "name": "Arbitrum Sepolia", 
      "chainId": 421614, 
      "symbol": "ETH", 
      "faucet": "https://faucet.arbitrum.io", 
      "icon": "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color/arb.svg"
    },
    { 
      "id": "avalanche-fuji",
      "name": "Avalanche Fuji", 
      "chainId": 43113, 
      "symbol": "AVAX", 
      "faucet": "https://faucet.avax.network", 
      "icon": "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color/avax.svg"
    }
  ]

  const currentDestinationNetwork = destinationNetworks.find(net => net.id === selectedDestinationNetwork)

  return (
    <div className="bridge-wrap">
      {/* Bridge Form */}
      <div className="panel bridge-card" style={{ flex: 1, minWidth: 500 }}>
        <div className="bridge-header">
          <div style={{fontWeight:800,fontSize:24,letterSpacing:.3}}>
            {selectedToken} → w{selectedToken} Bridge
          </div>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <div className="segmented">
              <button 
                className={`segmented-btn ${selectedToken==='PZO'?'active':''}`}
                onClick={()=>setSelectedToken('PZO')}
              >PZO</button>
              <button 
                className={`segmented-btn ${selectedToken==='USDT'?'active':''}`}
                onClick={()=>setSelectedToken('USDT')}
              >USDT</button>
            </div>
      
          </div>
        </div>
        
        {/* Network Status */}
        <NetworkStatus />
        
        {/* Contract Status */}
        <ContractStatus 
          PIOLock_ADDRESS={PIOLock_ADDRESS}
          PIOMint_ADDRESS={PIOMint_ADDRESS}
        />
        
        {/* Bridge Status */}
        <BridgeStatus 
          bridgeState={bridgeState}
          isProcessing={isProcessing}
        />

        {/* Bridge Debug Panel */}
        <BridgeDebugPanel
          bridgeState={bridgeState}
          approveHash={approveHash}
          isApproveSuccess={isApproveSuccess}
          isApproveReceiptSuccess={isApproveReceiptSuccess}
          approveError={approveError}
          lockHash={lockHash}
          isLockSuccess={isLockSuccess}
          lockError={lockError}
          resetBridgeState={resetBridgeState}
          checkTransactionStatus={checkTransactionStatus}
        />
        
        {/* Debug Info */}
        <DebugInfo 
          PIOLock_ADDRESS={PIOLock_ADDRESS}
          PIOMint_ADDRESS={PIOMint_ADDRESS}
          isConnected={isConnected}
          chainId={chainId}
          address={address}
          lockHash={lockHash}
          isLockPending={isLockPending}
          isLockSuccess={isLockSuccess}
          pendingTransaction={pendingTransaction}
          transactions={transactions}
          approveHash={approveHash}
          isApprovePending={isApprovePending}
          isApproveSuccess={isApproveSuccess}
        />
        
        {/* Test Approve Button */}
        <div style={{ marginTop: '12px', textAlign: 'center' }}>
          <button
            onClick={async () => {
              try {
                console.log('🧪 Testing approve transaction...')
                const result = await bridgePZO('0.001', address) // Use own address as destination
                if (result === 'pending') {
                  alert('Test approve đã được gửi! Kiểm tra Debug Info...')
                }
              } catch (error) {
                console.error('❌ Test approve error:', error)
                alert(`❌ Test approve lỗi: ${error.message}`)
              }
            }}
            style={{
              padding: '8px 16px',
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '8px',
              color: '#22C55E',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            🧪 Test Approve (0.001 PZO)
          </button>
        </div>

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
          <label className="form-label">Số lượng {selectedToken}</label>
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

         {/* Destination Network Selector */}
         <div className="form-group">
           <label className="form-label">To this network</label>
           <div className="network-dropdown-container" ref={dropdownRef}>
             <button 
               className="network-dropdown-trigger"
               onClick={() => setShowNetworkDropdown(!showNetworkDropdown)}
             >
               <div className="network-trigger-content">
                 <img 
                   src={currentDestinationNetwork?.icon} 
                   alt={currentDestinationNetwork?.name}
                   className="network-icon"
                   onError={(e) => {
                     e.target.style.display = 'none'
                     e.target.nextSibling.style.marginLeft = '0'
                   }}
                 />
                 <span className="network-name">{currentDestinationNetwork?.name}</span>
               </div>
               <span className="dropdown-arrow">▼</span>
             </button>
             
             {showNetworkDropdown && (
               <div className="network-dropdown-list">
                 {destinationNetworks.map(network => (
                   <button
                     key={network.id}
                     className={`network-dropdown-item ${selectedDestinationNetwork === network.id ? 'selected' : ''}`}
                     onClick={() => {
                       setSelectedDestinationNetwork(network.id)
                       setShowNetworkDropdown(false)
                     }}
                   >
                     <img 
                       src={network.icon} 
                       alt={network.name}
                       className="network-item-icon"
                       onError={(e) => {
                         e.target.style.display = 'none'
                         e.target.nextSibling.style.marginLeft = '0'
                       }}
                     />
                     <span className="network-item-name">{network.name}</span>
                   </button>
                 ))}
               </div>
             )}
           </div>
         </div>

         {/* Destination Address */}
         <div className="form-group">
           <label className="form-label">Địa chỉ đích ({currentDestinationNetwork?.name})</label>
           <input 
             className="form-input"
             placeholder="0x..." 
             value={destination} 
             onChange={e => setDestination(e.target.value)}
           />
           <div className="helper-text">
             Địa chỉ ví trên mạng {currentDestinationNetwork?.name} để nhận w{selectedToken}
           </div>
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
        
        {/* Bridge Process Explanation */}
        <div style={{ 
          background: 'rgba(59, 130, 246, 0.1)', 
          border: '1px solid rgba(59, 130, 246, 0.3)', 
          borderRadius: '8px', 
          padding: '12px', 
          marginTop: '16px',
          fontSize: '12px',
          lineHeight: '1.4'
        }}>
          <div style={{ fontWeight: 600, marginBottom: '8px', color: '#3B82F6' }}>
             Cơ chế Bridge hoạt động:
          </div>
          <div style={{ marginBottom: '4px' }}>
            <span style={{ color: '#F59E0B' }}>👤 Gửi (Lock):</span> Bạn ký trong MetaMask → PZO bị khóa
          </div>
          <div>
            <span style={{ color: '#10B981' }}>🤖 Nhận (Mint):</span> Validator tự động mint wPZO → MetaMask KHÔNG bật
          </div>
        </div>
        <div className="divider"/>
       
        {/* Contract Info */}
        <div className="contract-info">
          PIOLock: {PIOLock_ADDRESS.slice(0, 6)}...{PIOLock_ADDRESS.slice(-4)} | 
          PIOMint: {PIOMint_ADDRESS.slice(0, 6)}...{PIOMint_ADDRESS.slice(-4)}
        </div>

        {/* AI Security Monitor */}
        <AISecurityMonitor 
          transactions={transactions} 
          isActive={isConnected && transactions.length > 0}
        />

        {/* Security Dashboard */}
        <SecurityDashboard 
          transactions={transactions}
          validators={[
            { address: '0x167bdc31866eE7a4BfACCb22f42712729bC19212', approvalCount: 0 },
            { address: '0xf46Ada76EE5952F9E7306123d88442092F62D630', approvalCount: 0 },
            { address: '0x8918f188F18c6F50B548fdF753EF3cA80E34d355', approvalCount: 0 },
            { address: '0x449FD950c2F417784e1b99A0EB80822DeA7E2e49', approvalCount: 0 },
            { address: '0x39a89C61baDae6cbE8db23d09a58D03Ffeeb4cac', approvalCount: 0 }
          ]}
        />
      </div>

      {/* Transaction History - New Enhanced Version */}
      <div className="panel bridge-card" style={{ flex: 1, minWidth: 500 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 20 }}>
            📚 Lịch sử giao dịch {transactionHistory.length > 0 && `(${transactionHistory.length})`}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {/* View Bridge Contract Button */}
            <button 
              onClick={() => {
                const explorerUrl = `https://zeroscan.org/address/${PIOLock_ADDRESS}`
                window.open(explorerUrl, '_blank')
              }}
              style={{ 
                padding: '5px 10px', 
                fontSize: 12, 
                background: '#6366f1', 
                color: 'white', 
                border: 'none', 
                borderRadius: 4,
                cursor: 'pointer'
              }}
              title="Xem Bridge Contract trên Zeroscan"
            >
              🔗 Contract
            </button>
            
            {/* Force Update Button - khi bridge đã hoàn thành nhưng lịch sử chưa cập nhật */}
            {bridgeState.step === 'success' && transactionHistory.some(tx => tx.status !== 'hoàn thành') && (
              <button 
                onClick={forceUpdateTransactionStatus}
                style={{ 
                  padding: '5px 10px', 
                  fontSize: 12, 
                  background: '#10b981', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: 4,
                  cursor: 'pointer'
                }}
                title="Cập nhật status thành hoàn thành"
              >
                🔧 Fix Status
              </button>
            )}
            
            {/* Clear History Button */}
            {transactionHistory.length > 0 && (
              <button 
                onClick={clearTransactionHistory}
                style={{ 
                  padding: '5px 10px', 
                  fontSize: 12, 
                  background: '#ff4444', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: 4,
                  cursor: 'pointer'
                }}
              >
                🗑️ Xóa tất cả
              </button>
            )}
          </div>
        </div>

        {/* Statistics */}
        {transactionHistory.length > 0 && (
          <div style={{ 
            display: 'flex', 
            gap: 10, 
            marginBottom: 15,
            padding: '10px',
            background: 'rgba(0,255,0,0.1)',
            borderRadius: 8,
            fontSize: 12
          }}>
            {(() => {
              const stats = getTransactionStats()
              return (
                <>
                  <span>✅ Thành công: {stats.completed}</span>
                  <span>❌ Thất bại: {stats.failed}</span>
                  <span>⏳ Đang xử lý: {stats.processing}</span>
                </>
              )
            })()}
          </div>
        )}
        
        {transactionHistory.length === 0 ? (
          <div style={{ textAlign: 'center', opacity: 0.6, padding: '40px 20px' }}>
            Chưa có giao dịch nào
          </div>
        ) : (
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {transactionHistory.map((tx) => (
              <div 
                key={tx.id} 
                style={{ 
                  padding: '15px', 
                  margin: '10px 0',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  fontSize: 13
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: 8 }}>
                      <strong>{tx.amount} PZO</strong> → {tx.destination?.slice(0,6)}...{tx.destination?.slice(-4)}
                    </div>
                    <div style={{ opacity: 0.7, fontSize: 11 }}>
                      📅 {tx.date} | ⚡ {tx.method || 'standard'}
                    </div>
                    {tx.lockId && (
                      <div style={{ marginTop: 5, opacity: 0.6, fontSize: 11 }}>
                        🔒 Lock ID: {tx.lockId}
                      </div>
                    )}
                    {tx.lockHash && tx.lockHash !== 'timeout_fallback' && (
                      <div style={{ 
                        marginTop: 3, 
                        opacity: 0.6, 
                        fontSize: 10, 
                        wordBreak: 'break-all',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        navigator.clipboard.writeText(tx.lockHash)
                        alert('Hash đã copy!')
                      }}
                      title="Click để copy hash">
                        📝 Hash: {tx.lockHash.slice(0, 10)}...{tx.lockHash.slice(-8)}
                      </div>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
                    <div style={{ 
                      padding: '3px 8px',
                      borderRadius: 12,
                      fontSize: 10,
                      background: tx.status === 'hoàn thành' ? '#4ade80' : 
                                 tx.status === 'thất bại' ? '#ef4444' : '#fbbf24',
                      color: 'black',
                      fontWeight: 'bold'
                    }}>
                      {tx.status}
                    </div>
                    
                    {/* View Transaction Button */}
                    <button
                      onClick={() => {
                        if (tx.lockHash && tx.lockHash !== 'timeout_fallback') {
                          // Có hash cụ thể, mở transaction trên Zeroscan
                          const explorerUrl = `https://zeroscan.org/tx/${tx.lockHash}`
                          console.log('🔍 Opening Zeroscan for transaction:', tx.lockHash)
                          window.open(explorerUrl, '_blank')
                        } else {
                          // Không có hash, mở address để xem tất cả transactions
                          const explorerUrl = `https://zeroscan.org/address/${tx.destination}`
                          console.log('🔍 Opening Zeroscan for address:', tx.destination)
                          window.open(explorerUrl, '_blank')
                        }
                      }}
                      style={{
                        padding: '4px 8px',
                        fontSize: 10,
                        background: tx.lockHash && tx.lockHash !== 'timeout_fallback' ? '#10b981' : '#64748b',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                        fontWeight: 'bold'
                      }}
                      onMouseOver={(e) => e.target.style.background = tx.lockHash && tx.lockHash !== 'timeout_fallback' ? '#059669' : '#475569'}
                      onMouseOut={(e) => e.target.style.background = tx.lockHash && tx.lockHash !== 'timeout_fallback' ? '#10b981' : '#64748b'}
                      title={tx.lockHash && tx.lockHash !== 'timeout_fallback' ? 
                        `Xem transaction ${tx.lockHash.slice(0,10)}... trên Zeroscan` : 
                        'Xem address trên Zeroscan'
                      }
                    >
                      {tx.lockHash && tx.lockHash !== 'timeout_fallback' ? (
                        <>🔗 View TX</>
                      ) : (
                        <>👤 Address</>
                      )}
                    </button>
                    
                    {/* Retry Button for failed transactions */}
                    {tx.status === 'thất bại' && (
                      <button
                        onClick={() => onRetryTransaction({
                          amount: tx.amount,
                          destination: tx.destination
                        })}
                        style={{
                          padding: '4px 8px',
                          fontSize: 10,
                          background: '#f59e0b',
                          color: 'white',
                          border: 'none',
                          borderRadius: 4,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 3
                        }}
                        onMouseOver={(e) => e.target.style.background = '#d97706'}
                        onMouseOut={(e) => e.target.style.background = '#f59e0b'}
                      >
                        🔄 Retry
                      </button>
                    )}
                    
                    {/* Debug: Show transaction details */}
                    {(tx.status === 'đang chờ xác nhận lock' || tx.status === 'đang chờ hash từ wagmi') && (
                      <button
                        onClick={() => {
                          console.log('🔍 Transaction Debug Info:', tx)
                          alert(`Transaction ID: ${tx.id}\nStatus: ${tx.status}\nLock Hash: ${tx.lockHash || 'None'}\nTimestamp: ${new Date(tx.timestamp).toLocaleString()}`)
                        }}
                        style={{
                          padding: '4px 8px',
                          fontSize: 10,
                          background: '#8b5cf6',
                          color: 'white',
                          border: 'none',
                          borderRadius: 4,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 3
                        }}
                      >
                        🔍 Debug
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Approval Timeout Handler */}
      <ApprovalTimeoutHandler
        bridgeState={bridgeState}
        approveHash={approveHash}
        onForceProceeed={() => forceApprovalProceed(amount, destination)}
        onRetry={resetBridgeState}
      />
    </div>
  )
}


