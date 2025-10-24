import React, { useState, useEffect, useRef } from 'react'
import { formatEther } from 'viem'
import { useBridge } from '../../hooks/useBridge'
import TransactionStatus from '../../components/TransactionStatus'
import AISecurityMonitor from '../../components/AISecurityMonitor'
import NetworkStatus from '../../components/NetworkStatus'
import ContractStatus from '../../components/ContractStatus'
import DebugInfo from '../../components/DebugInfo'

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
    isApproveSuccess
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
      
      console.log('🚀 Starting bridge transaction...')
      console.log('Amount:', amount)
      console.log('Destination:', destination)
      
      // Real bridge transaction
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
      
      alert(`❌ Lỗi: ${errorMessage}`)
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
            🔄 Cơ chế Bridge hoạt động:
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
      </div>

      {/* Transaction History */}
      <div className="panel bridge-card" style={{ flex: 1, minWidth: 500 }}>
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
                onRetry={onRetryTransaction}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


