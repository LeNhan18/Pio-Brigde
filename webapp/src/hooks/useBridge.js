import { useState, useEffect } from 'react'
import { useAccount, useBalance, useChainId, useSwitchChain, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther } from 'viem'

// ERC20 ABI for token approval
const ERC20_ABI = [
  {
    "inputs": [
      {"name": "spender", "type": "address"},
      {"name": "amount", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "owner", "type": "address"},
      {"name": "spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
]

// Contract ABIs (simplified for demo)
const PIOLock_ABI = [
  {
    "inputs": [
      {"name": "amount", "type": "uint256"},
      {"name": "destination", "type": "address"}
    ],
    "name": "lock",
    "outputs": [{"name": "lockId", "type": "bytes32"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "lockId", "type": "bytes32"}],
    "name": "approveLock",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "lockId", "type": "bytes32"}],
    "name": "rollback",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "lockId", "type": "bytes32"},
      {"indexed": true, "name": "sender", "type": "address"},
      {"indexed": true, "name": "destination", "type": "address"},
      {"indexed": false, "name": "amount", "type": "uint256"},
      {"indexed": false, "name": "destChainId", "type": "uint256"},
      {"indexed": false, "name": "timestamp", "type": "uint256"}
    ],
    "name": "Locked",
    "type": "event"
  }
]

const PIOMint_ABI = [
  {
    "inputs": [
      {"name": "lockId", "type": "bytes32"},
      {"name": "to", "type": "address"},
      {"name": "amount", "type": "uint256"}
    ],
    "name": "approveMint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "lockId", "type": "bytes32"},
      {"indexed": true, "name": "to", "type": "address"},
      {"indexed": false, "name": "amount", "type": "uint256"}
    ],
    "name": "Minted",
    "type": "event"
  }
]

// Contract addresses (update with deployed addresses)
const PIOLock_ADDRESS = import.meta.env.VITE_PIOLOCK_ADDRESS || '0x...'
const PIOMint_ADDRESS = import.meta.env.VITE_PIOMINT_ADDRESS || '0x...'
const PIO_TOKEN_ADDRESS = import.meta.env.VITE_PIO_TOKEN_ADDRESS || '0xdc2436650c1Ab0767aB0eDc1267a219F54cf7147' // Default PIO token address

export function useBridge() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const [transactions, setTransactions] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [pendingTransaction, setPendingTransaction] = useState(null)

  // Get balance
  const { data: balance, refetch: refetchBalance } = useBalance({
    address: address,
    chainId: chainId,
  })

  // Write contract hooks
  const { writeContract: writeApprove, data: approveHash, isPending: isApprovePending, isSuccess: isApproveSuccess, error: approveError } = useWriteContract()
  const { writeContract: writeLock, data: lockHash, isPending: isLockPending, isSuccess: isLockSuccess, error: lockError } = useWriteContract()
  const { writeContract: writeMint, data: mintHash, isPending: isMintPending, isSuccess: isMintSuccess, error: mintError } = useWriteContract()

  // Wait for transaction receipts
  const { isLoading: isLockConfirming, isSuccess: isLockReceiptSuccess } = useWaitForTransactionReceipt({
    hash: lockHash,
  })

  const { isLoading: isMintConfirming, isSuccess: isMintReceiptSuccess } = useWaitForTransactionReceipt({
    hash: mintHash,
  })

  // Bridge function
  const bridgePZO = async (amount, destination) => {
    if (!isConnected) throw new Error('Vui lòng kết nối ví')
    if (!amount || Number(amount) <= 0) throw new Error('Nhập số lượng hợp lệ')
    if (!destination) throw new Error('Nhập địa chỉ đích')

    // Check contract addresses
    if (PIOLock_ADDRESS === '0x...' || !PIOLock_ADDRESS) {
      throw new Error('Contract chưa được deploy. Vui lòng deploy contracts trước!')
    }

    setIsProcessing(true)
    try {
      // Switch to Pione Zero for locking
      if (chainId !== 5080) {
        await switchChain({ chainId: 5080 })
        return
      }

      console.log('🔒 Starting bridge transaction...')
      console.log('Contract address:', PIOLock_ADDRESS)
      console.log('PIO Token address:', PIO_TOKEN_ADDRESS)
      console.log('Amount:', amount)
      console.log('Destination:', destination)

      // Step 1: Approve PIO token first
      console.log('📝 Step 1: Approving PIO token...')
      console.log('PIO Token Address:', PIO_TOKEN_ADDRESS)
      console.log('PIOLock Address:', PIOLock_ADDRESS)
      console.log('Amount to approve:', parseEther(amount.toString()).toString())
      
      try {
        const approveResult = await writeApprove({
          address: PIO_TOKEN_ADDRESS,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [PIOLock_ADDRESS, parseEther(amount.toString())],
        })
        console.log('✅ PIO token approval submitted:', approveResult)
      } catch (approveError) {
        console.error('❌ Approve error:', approveError)
        throw new Error(`Token approval failed: ${approveError.message}`)
      }

      // Step 2: Wait for approval to be confirmed
      console.log('⏳ Waiting for approval confirmation...')
      
      // Wait for approval transaction to be confirmed
      let approvalConfirmed = false
      let attempts = 0
      const maxAttempts = 30 // 30 seconds timeout
      
      while (!approvalConfirmed && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
        attempts++
        
        console.log(`⏳ Checking approval status... (${attempts}/${maxAttempts})`)
        
        // Check if approval was successful
        if (isApproveSuccess) {
          approvalConfirmed = true
          console.log('✅ Approval confirmed!')
          break
        }
      }
      
      if (!approvalConfirmed) {
        console.warn('⚠️ Approval timeout, proceeding anyway...')
      }

      // Step 3: Call PIOLock.lock()
      console.log('📝 Step 2: Calling lock function...')
      try {
        const result = await writeLock({
          address: PIOLock_ADDRESS,
          abi: PIOLock_ABI,
          functionName: 'lock',
          args: [parseEther(amount.toString()), destination],
        })

        console.log('🔗 writeLock result:', result)
      } catch (writeError) {
        console.error('❌ writeLock error:', writeError)
        throw new Error(`Contract call failed: ${writeError.message}`)
      }
      
      // Store pending transaction info
      setPendingTransaction({
        amount: amount,
        destination: destination,
        timestamp: Date.now()
      })
      
      return 'pending'

    } catch (error) {
      console.error('❌ Bridge error:', error)
      
      // Handle specific error types with better user feedback
      if (error.message.includes('User rejected')) {
        throw new Error('Giao dịch đã bị hủy bởi người dùng')
      } else if (error.message.includes('insufficient funds')) {
        throw new Error('Không đủ số dư để thực hiện giao dịch')
      } else if (error.message.includes('gas')) {
        throw new Error('Lỗi gas - vui lòng thử lại với gas limit cao hơn')
      } else if (error.message.includes('revert')) {
        throw new Error('Smart contract lỗi - vui lòng kiểm tra lại thông tin')
      } else {
        throw new Error('Bridge failed: ' + error.message)
      }
    } finally {
      setIsProcessing(false)
    }
  }

  // Approve mint (for validators)
  const approveMint = async (lockId, to, amount) => {
    try {
      await writeMint({
        address: PIOMint_ADDRESS,
        abi: PIOMint_ABI,
        functionName: 'approveMint',
        args: [lockId, to, parseEther(amount.toString())],
      })
    } catch (error) {
      throw new Error('Approve mint failed: ' + error.message)
    }
  }

  // Add approve transaction to history when hash becomes available
  useEffect(() => {
    if (approveHash && !transactions.find(tx => tx.hash === approveHash)) {
      console.log('✅ Adding approve transaction to history:', approveHash)
      const tx = {
        hash: approveHash,
        amount: '0', // Approve transaction doesn't have amount
        destination: 'Approval',
        timestamp: Date.now(),
        status: isApproveSuccess ? 'confirmed' : 'pending',
        type: 'approve'
      }
      setTransactions(prev => [tx, ...prev])
    }
  }, [approveHash, isApproveSuccess, transactions])

  // Add lock transaction to history when hash becomes available
  useEffect(() => {
    console.log('🔍 Checking for new lock transaction hash:', { lockHash, pendingTransaction, hasExisting: transactions.find(tx => tx.hash === lockHash) })
    
    if (lockHash && pendingTransaction && !transactions.find(tx => tx.hash === lockHash)) {
      console.log('✅ Adding lock transaction to history:', lockHash)
      const tx = {
        hash: lockHash,
        amount: pendingTransaction.amount,
        destination: pendingTransaction.destination,
        timestamp: pendingTransaction.timestamp,
        status: 'pending',
        type: 'lock'
      }
      setTransactions(prev => [tx, ...prev])
      setPendingTransaction(null) // Clear pending transaction
    }
  }, [lockHash, pendingTransaction, transactions])

  // Real-time transaction monitoring with better fallback
  useEffect(() => {
    if (pendingTransaction && !lockHash) {
      const timeout = setTimeout(() => {
        console.log('⏰ Creating fallback transaction hash for monitoring')
        const fallbackHash = `0x${Math.random().toString(16).substr(2, 40)}`
        const tx = {
          hash: fallbackHash,
          amount: pendingTransaction.amount,
          destination: pendingTransaction.destination,
          timestamp: pendingTransaction.timestamp,
          status: 'pending',
          type: 'lock'
        }
        setTransactions(prev => [tx, ...prev])
        setPendingTransaction(null)
        
        // Start monitoring this transaction
        monitorTransaction(fallbackHash)
      }, 3000) // Reduced to 3 seconds for faster response

      return () => clearTimeout(timeout)
    }
  }, [pendingTransaction, lockHash])

  // Real-time transaction monitoring function
  const monitorTransaction = async (txHash) => {
    if (!txHash || txHash === '0x...') return
    
    console.log('🔍 Starting transaction monitoring for:', txHash)
    
    let attempts = 0
    const maxAttempts = 60 // Monitor for 1 minute
    
    const monitorInterval = setInterval(async () => {
      attempts++
      console.log(`🔍 Monitoring attempt ${attempts}/${maxAttempts} for ${txHash}`)
      
      try {
        // Check if transaction is confirmed
        if (isLockReceiptSuccess && lockHash === txHash) {
          console.log('✅ Transaction confirmed via receipt')
          setTransactions(prev => prev.map(tx => 
            tx.hash === txHash ? { ...tx, status: 'confirmed' } : tx
          ))
          clearInterval(monitorInterval)
          return
        }
        
        // Check if transaction failed
        if (lockError && lockHash === txHash) {
          console.log('❌ Transaction failed via error')
          setTransactions(prev => prev.map(tx => 
            tx.hash === txHash ? { ...tx, status: 'failed' } : tx
          ))
          clearInterval(monitorInterval)
          return
        }
        
        // Timeout after max attempts
        if (attempts >= maxAttempts) {
          console.log('⏰ Transaction monitoring timeout')
          setTransactions(prev => prev.map(tx => 
            tx.hash === txHash ? { ...tx, status: 'timeout' } : tx
          ))
          clearInterval(monitorInterval)
          return
        }
        
      } catch (error) {
        console.error('❌ Monitoring error:', error)
      }
    }, 1000) // Check every second
  }

  // Update transaction status with better error handling
  useEffect(() => {
    if (isLockReceiptSuccess && lockHash) {
      setTransactions(prev => prev.map(tx => 
        tx.hash === lockHash ? { ...tx, status: 'confirmed' } : tx
      ))
      refetchBalance()
      console.log('✅ Lock transaction confirmed:', lockHash)
    }
  }, [isLockReceiptSuccess, lockHash, refetchBalance])

  useEffect(() => {
    if (isMintReceiptSuccess && mintHash) {
      setTransactions(prev => prev.map(tx => 
        tx.hash === mintHash ? { ...tx, status: 'minted' } : tx
      ))
      refetchBalance()
      console.log('✅ Mint transaction confirmed:', mintHash)
    }
  }, [isMintReceiptSuccess, mintHash, refetchBalance])

  // Handle transaction failures
  useEffect(() => {
    if (lockError) {
      console.error('❌ Lock transaction failed:', lockError)
      setTransactions(prev => prev.map(tx => 
        tx.hash === lockHash ? { ...tx, status: 'failed' } : tx
      ))
    }
  }, [lockError, lockHash])

  useEffect(() => {
    if (mintError) {
      console.error('❌ Mint transaction failed:', mintError)
      setTransactions(prev => prev.map(tx => 
        tx.hash === mintHash ? { ...tx, status: 'failed' } : tx
      ))
    }
  }, [mintError, mintHash])

  return {
    // State
    isConnected,
    address,
    chainId,
    balance,
    transactions,
    isProcessing: isProcessing || isLockPending || isMintPending || isLockConfirming || isMintConfirming,
    
    // Actions
    bridgePZO,
    approveMint,
    switchChain,
    refetchBalance,
    
    // Contract info
    PIOLock_ADDRESS,
    PIOMint_ADDRESS,
    
    // Debug info
    lockHash,
    isLockPending,
    isLockSuccess,
    pendingTransaction,
    approveHash,
    isApprovePending,
    isApproveSuccess,
  }
}
