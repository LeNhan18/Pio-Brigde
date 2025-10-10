import { useState, useEffect } from 'react'
import { useAccount, useBalance, useChainId, useSwitchChain, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther } from 'viem'

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

export function useBridge() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const [transactions, setTransactions] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)

  // Get balance
  const { data: balance, refetch: refetchBalance } = useBalance({
    address: address,
    chainId: chainId === 5080 ? 5080 : 5,
  })

  // Write contract hooks
  const { writeContract: writeLock, data: lockHash, isPending: isLockPending } = useWriteContract()
  const { writeContract: writeMint, data: mintHash, isPending: isMintPending } = useWriteContract()

  // Wait for transaction receipts
  const { isLoading: isLockConfirming, isSuccess: isLockSuccess } = useWaitForTransactionReceipt({
    hash: lockHash,
  })

  const { isLoading: isMintConfirming, isSuccess: isMintSuccess } = useWaitForTransactionReceipt({
    hash: mintHash,
  })

  // Bridge function
  const bridgePZO = async (amount, destination) => {
    if (!isConnected) throw new Error('Vui lòng kết nối ví')
    if (!amount || Number(amount) <= 0) throw new Error('Nhập số lượng hợp lệ')
    if (!destination) throw new Error('Nhập địa chỉ đích')

    setIsProcessing(true)
    try {
      // Switch to Pione Zero for locking
      if (chainId !== 5080) {
        await switchChain({ chainId: 5080 })
        return
      }

      // Call PIOLock.lock()
      const lockId = await writeLock({
        address: PIOLock_ADDRESS,
        abi: PIOLock_ABI,
        functionName: 'lock',
        args: [parseEther(amount.toString()), destination],
      })

      // Add to transaction history
      const tx = {
        hash: lockId,
        amount: amount,
        destination: destination,
        timestamp: Date.now(),
        status: 'pending',
        type: 'lock'
      }
      
      setTransactions(prev => [tx, ...prev])
      return lockId

    } catch (error) {
      throw new Error('Bridge failed: ' + error.message)
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

  // Update transaction status
  useEffect(() => {
    if (isLockSuccess && lockHash) {
      setTransactions(prev => prev.map(tx => 
        tx.hash === lockHash ? { ...tx, status: 'confirmed' } : tx
      ))
      refetchBalance()
    }
  }, [isLockSuccess, lockHash, refetchBalance])

  useEffect(() => {
    if (isMintSuccess && mintHash) {
      setTransactions(prev => prev.map(tx => 
        tx.hash === mintHash ? { ...tx, status: 'minted' } : tx
      ))
      refetchBalance()
    }
  }, [isMintSuccess, mintHash, refetchBalance])

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
  }
}
