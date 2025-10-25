import { useState, useEffect } from 'react'
import { useAccount, useBalance, useChainId, useSwitchChain, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { getPublicClient } from '@wagmi/core'
import PIOMintArtifact_ABI from '../ABI/PIOMint.json'
import PIOLockArtifact_ABI from '../ABI/PIOLock.json'
import PIOSimple from '../ABI/SimplePIO.json'
// ERC20 ABI for token approval
const ERC20_ABI = PIOSimple.abi;
// Contract ABIs (simplified for demo)
const PIOLock_ABI = PIOLockArtifact_ABI.abi;

const PIOMint_ABI = PIOMintArtifact_ABI.abi;
// Check if running locally
const isLocal = import.meta.env.DEV || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

// Contract addresses (update with deployed addresses)
const PIOLock_ADDRESS = import.meta.env.VITE_PIOLOCK_ADDRESS 
const PIOMint_ADDRESS = import.meta.env.VITE_PIOMINT_ADDRESS 
const PIO_TOKEN_ADDRESS = import.meta.env.VITE_PIO_TOKEN_ADDRESS 

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

  // Check allowance (skip if local)
  const { data: allowance } = useReadContract({
    address: PIO_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [address, PIOLock_ADDRESS],
    query: {
      enabled: !isLocal && !!address && !!PIO_TOKEN_ADDRESS && !!PIOLock_ADDRESS
    }
  })

  // Write contract hooks
  const { writeContract: writeApprove, data: approveHash, isPending: isApprovePending, isSuccess: isApproveSuccess, error: approveError } = useWriteContract()
  const { writeContract: writeLock, data: lockHash, isPending: isLockPending, isSuccess: isLockSuccess, error: lockError } = useWriteContract()
  const { writeContract: writeMint, data: mintHash, isPending: isMintPending, isSuccess: isMintSuccess, error: mintError } = useWriteContract()

  // Wait for transaction receipts
  const { isLoading: isApproveConfirming, isSuccess: isApproveReceiptSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
  })

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
    if (!PIOLock_ADDRESS) {
      throw new Error('Contract chưa được deploy. Vui lòng deploy contracts trước!')
    }

    setIsProcessing(true)
    try {
      // Switch to Pione Zero for locking
      if (chainId !== 5080) {
        await switchChain({ chainId: 5080 })
        return
      }

      if (!isLocal) {
        console.log('🔒 Starting bridge transaction...')
        console.log('Contract address:', PIOLock_ADDRESS)
        console.log('PIO Token address:', PIO_TOKEN_ADDRESS)
        console.log('Amount:', amount)
        console.log('Destination:', destination)
      }

      // Step 1: Check PIO token allowance first (skip if local)
      if (!isLocal) {
        console.log(' Step 1: Checking PIO token allowance...')
        console.log('PIO Token Address:', PIO_TOKEN_ADDRESS)
        console.log('PIOLock Address:', PIOLock_ADDRESS)
        console.log('Amount to approve:', parseEther(amount.toString()).toString())
        
        try {
          // Always approve PIO token (simpler approach)
          console.log('📝 Approving PIO token...')
          console.log('📊 Approving to:', PIOLock_ADDRESS)
          console.log('📊 Token address:', PIO_TOKEN_ADDRESS)
          console.log('📊 Amount to approve:', parseEther(amount.toString()).toString())
          
          const requiredAmount = parseEther(amount.toString())
          
          const approveResult = await writeApprove({
            address: PIO_TOKEN_ADDRESS,
            abi: ERC20_ABI,
            functionName: 'approve',
            args: [PIOLock_ADDRESS, requiredAmount],
          })
          
          console.log('✅ PIO token approval submitted:', approveResult)
          
          if (!approveResult) {
            throw new Error('Approval transaction không được submit thành công')
          }
        } catch (approveError) {
          console.error('❌ Approve error:', approveError)
          console.error('❌ Approve error details:', {
            message: approveError.message,
            code: approveError.code,
            data: approveError.data
          })
          throw new Error(`Token approval failed: ${approveError.message}`)
        }
      } else {
        console.log('🏠 Local mode - skipping approval process')
      }

      // Step 2: Wait for approval to be confirmed (skip if local)
      if (!isLocal) {
        console.log(' Waiting for approval confirmation...')
        console.log(' Approval hash:', approveHash)
        console.log(' Approval success:', isApproveSuccess)
        console.log(' Approval pending:', isApprovePending)
        
        // Wait for approval transaction to be confirmed
        let approvalConfirmed = false
        let attempts = 0
        const maxAttempts = 30 // 30 seconds timeout
        
        while (!approvalConfirmed && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
          attempts++
          
          console.log(` Checking approval status... (${attempts}/${maxAttempts})`)
          console.log(` Current approval state: success=${isApproveSuccess}, pending=${isApprovePending}, hash=${approveHash}`)
          
          // Check if approval was successful
          if ((isApproveSuccess || isApproveReceiptSuccess) && approveHash) {
            approvalConfirmed = true
            console.log(' Approval confirmed! Hash:', approveHash)
            break
          }
          
          // Check for approval errors
          if (approveError) {
            console.error(' Approval error detected:', approveError)
            throw new Error(`Approval failed: ${approveError.message}`)
          }
        }
        
        if (!approvalConfirmed) {
          console.error(' Approval failed or timeout!')
          console.log(' Final approval state:', { success: isApproveSuccess, hash: approveHash, pending: isApprovePending })
          console.log(' Approval error:', approveError)
          throw new Error('Approval transaction thất bại hoặc timeout. Vui lòng thử lại.')
        }
      } else {
        console.log(' Local mode - skipping approval confirmation')
      }

      // Step 3: Call PIOLock.lock() (skip if local)
      if (!isLocal) {
        console.log(' Step 2: Calling lock function...')
        console.log('Amount:', amount)
        console.log('Destination:', destination)
        console.log('Parsed amount:', parseEther(amount.toString()).toString())
        
        // Debug: Check contract state before calling
        console.log(' Checking contract state...')
        console.log(' PIOLock Address:', PIOLock_ADDRESS)
        console.log(' PIO Token Address:', PIO_TOKEN_ADDRESS)
        console.log(' User Address:', address)
        console.log('Amount to lock:', parseEther(amount.toString()).toString())
        
        // Validate contract addresses
        if (!PIOLock_ADDRESS || PIOLock_ADDRESS === '0x...') {
          throw new Error('PIOLock contract address không hợp lệ')
        }
        
        if (!PIO_TOKEN_ADDRESS || PIO_TOKEN_ADDRESS === '0x...') {
          throw new Error('PIO Token address không hợp lệ')
        }
        
        console.log('🔍 Contract validation passed, checking allowance...')
        
        // Check current allowance
        const requiredAmount = parseEther(amount.toString())
        console.log('Required amount:', requiredAmount.toString())
        console.log('Current allowance:', allowance?.toString() || '0')
        
        if (!allowance || BigInt(allowance.toString()) < requiredAmount) {
          console.error('Insufficient allowance!')
          console.log(' Current allowance:', allowance?.toString() || '0')
          console.log(' Required amount:', requiredAmount.toString())
          throw new Error(`Allowance không đủ (${allowance?.toString() || '0'} < ${requiredAmount.toString()}). Vui lòng approve tokens trước.`)
        }
        
        console.log('🔍 Allowance check passed, calling lock function...')
        
        try {
          const result = await writeLock({
            address: PIOLock_ADDRESS,
            abi: PIOLock_ABI,
            functionName: 'lock',
            args: [parseEther(amount.toString()), destination],
          })

          console.log('🔗 writeLock result:', result)
          
          if (!result) {
            console.error('❌ writeLock returned undefined - contract call may have failed')
            throw new Error('Contract call không trả về transaction hash. Có thể do gas limit thấp hoặc contract lỗi.')
          }
          
          console.log(' Lock transaction submitted successfully:', result)
        } catch (writeError) {
          console.error(' writeLock error:', writeError)
          console.error(' Error details:', {
            message: writeError.message,
            code: writeError.code,
            data: writeError.data
          })
          throw new Error(`Contract call failed: ${writeError.message}`)
        }
      } else {
        console.log('🏠 Local mode - skipping lock function call')
      }
      
      // Store pending transaction info with validation
      if (amount && destination) {
        setPendingTransaction({
          amount: amount.toString(),
          destination: destination.toString(),
          timestamp: Date.now()
        })
        console.log('💾 Stored pending transaction:', { amount, destination })
      } else {
        console.warn('⚠️ Cannot store pending transaction - missing data:', { amount, destination })
      }
      
      return 'pending'

    } catch (error) {
      console.error(' Bridge error:', error)
      
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
    if (approveHash && typeof approveHash === 'string' && approveHash !== '0x...' && !transactions.find(tx => tx.hash === approveHash)) {
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
    // Skip processing in local mode - handled by fallback useEffect
    if (isLocal) return

    // Check if both lockHash and pendingTransaction are valid
    const isValidLockHash = lockHash && typeof lockHash === 'string' && lockHash !== '0x...'
    const isValidPendingTransaction = pendingTransaction && 
      typeof pendingTransaction === 'object' && 
      pendingTransaction.amount !== undefined && 
      pendingTransaction.destination !== undefined && 
      pendingTransaction.timestamp !== undefined

    // Only log when there's actually something to process
    if (isValidLockHash || isValidPendingTransaction) {
      console.log('🔍 Checking for new lock transaction hash:', { 
        lockHash: lockHash || 'undefined', 
        pendingTransaction: pendingTransaction || 'null', 
        isValidLockHash,
        isValidPendingTransaction,
        hasExisting: isValidLockHash ? transactions.find(tx => tx.hash === lockHash) : false
      })
    }
    
    if (isValidLockHash && isValidPendingTransaction && !transactions.find(tx => tx.hash === lockHash)) {
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
    // Handle local mode immediately
    if (isLocal && pendingTransaction) {
      const timeout = setTimeout(() => {
        console.log('🏠 Local mode - creating mock successful transaction')
        const mockHash = `0xlocal${Math.random().toString(16).substr(2, 60)}` // Mock hash for local
        const tx = {
          hash: mockHash,
          amount: pendingTransaction.amount,
          destination: pendingTransaction.destination,
          timestamp: pendingTransaction.timestamp,
          status: 'confirmed', // Mark as confirmed immediately in local mode
          type: 'lock'
        }
        setTransactions(prev => [tx, ...prev])
        setPendingTransaction(null)
      }, 500) // Faster response for local mode (0.5 seconds)

      return () => clearTimeout(timeout)
    }

    // Skip if local mode but no pending transaction
    if (isLocal) return

    // Check if pendingTransaction is valid and lockHash is not available
    const isValidPendingTransaction = pendingTransaction && 
      typeof pendingTransaction === 'object' && 
      pendingTransaction.amount !== undefined && 
      pendingTransaction.destination !== undefined && 
      pendingTransaction.timestamp !== undefined
    
    const hasNoLockHash = !lockHash || lockHash === '0x...'
    
    if (isValidPendingTransaction && hasNoLockHash) {
      const timeout = setTimeout(() => {
        console.log('⏱️ Creating fallback transaction hash for monitoring')
        const fallbackHash = `0x${Math.random().toString(16).substr(2, 64)}` // Generate a proper 64-char hash
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
      }, 3000) // 3 seconds for real transactions

      return () => clearTimeout(timeout)
    }
  }, [pendingTransaction, lockHash])

  // Real-time transaction monitoring function
  const monitorTransaction = async (txHash) => {
    // Skip monitoring in local mode or for mock transactions
    if (isLocal || (txHash && txHash.startsWith('0xlocal'))) {
      console.log('🏠 Skipping monitoring for local/mock transaction:', txHash)
      return
    }

    // Validate transaction hash
    if (!txHash || typeof txHash !== 'string' || txHash === '0x...' || txHash.length < 10) {
      console.warn('⚠️ Invalid transaction hash for monitoring:', txHash)
      return
    }
    
    console.log('🔍 Starting transaction monitoring for:', txHash)
    
    let attempts = 0
    const maxAttempts = 60 // Monitor for 1 minute
    
    const monitorInterval = setInterval(async () => {
      attempts++
      console.log(`📊 Monitoring attempt ${attempts}/${maxAttempts} for ${txHash}`)
      
      try {
        // Check if transaction is confirmed (with safe comparison)
        if (isLockReceiptSuccess && lockHash && typeof lockHash === 'string' && lockHash === txHash) {
          console.log('✅ Transaction confirmed via receipt')
          setTransactions(prev => prev.map(tx => 
            tx.hash === txHash ? { ...tx, status: 'confirmed' } : tx
          ))
          clearInterval(monitorInterval)
          return
        }
        
        // Check if transaction failed (with safe comparison)
        if (lockError && lockHash && typeof lockHash === 'string' && lockHash === txHash) {
          console.log('❌ Transaction failed via error')
          setTransactions(prev => prev.map(tx => 
            tx.hash === txHash ? { ...tx, status: 'failed' } : tx
          ))
          clearInterval(monitorInterval)
          return
        }
        
        // Timeout after max attempts
        if (attempts >= maxAttempts) {
          console.log('⏰ Transaction monitoring timeout for:', txHash)
          setTransactions(prev => prev.map(tx => 
            tx.hash === txHash ? { ...tx, status: 'timeout' } : tx
          ))
          clearInterval(monitorInterval)
          return
        }
        
      } catch (error) {
        console.error('❌ Monitoring error for', txHash, ':', error)
        // Continue monitoring even if there's an error
      }
    }, 1000) // Check every second
  }

  // Update transaction status with better error handling
  useEffect(() => {
    if (isLockReceiptSuccess && lockHash && typeof lockHash === 'string' && lockHash !== '0x...') {
      setTransactions(prev => prev.map(tx => 
        tx.hash === lockHash ? { ...tx, status: 'confirmed' } : tx
      ))
      refetchBalance()
      console.log('✅ Lock transaction confirmed:', lockHash)
    }
  }, [isLockReceiptSuccess, lockHash, refetchBalance])

  useEffect(() => {
    if (isMintReceiptSuccess && mintHash && typeof mintHash === 'string' && mintHash !== '0x...') {
      setTransactions(prev => prev.map(tx => 
        tx.hash === mintHash ? { ...tx, status: 'minted' } : tx
      ))
      refetchBalance()
      console.log('✅ Mint transaction confirmed:', mintHash)
    }
  }, [isMintReceiptSuccess, mintHash, refetchBalance])

  // Handle transaction failures
  useEffect(() => {
    if (lockError && lockHash && typeof lockHash === 'string' && lockHash !== '0x...') {
      console.error('❌ Lock transaction failed:', lockError)
      setTransactions(prev => prev.map(tx => 
        tx.hash === lockHash ? { ...tx, status: 'failed' } : tx
      ))
    }
  }, [lockError, lockHash])

  useEffect(() => {
    if (mintError && mintHash && typeof mintHash === 'string' && mintHash !== '0x...') {
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
