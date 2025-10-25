import React from 'react'

export default function AddNetworkButton({ chainId, onSuccess }) {
  const addNetwork = async () => {
    if (!window.ethereum) {
      alert('MetaMask không được cài đặt!')
      return
    }

    try {
      // Ethereum Sepolia network configuration
      const networkConfig = {
        chainId: `0x${chainId.toString(16)}`, // 0xaa36a7 for 11155111
        chainName: 'Ethereum Sepolia',
        nativeCurrency: {
          name: 'ETH',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: ['https://ethereum-sepolia.blockpi.network/v1/rpc/public'],
        blockExplorerUrls: ['https://sepolia.etherscan.io'],
      }

      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [networkConfig],
      })

      if (onSuccess) onSuccess()
    } catch (error) {
      console.error('Lỗi khi thêm mạng:', error)
      if (error.code === 4902) {
        // User rejected the request
        alert('Bạn đã từ chối thêm mạng')
      } else {
        alert(`Lỗi: ${error.message}`)
      }
    }
  }

  return (
    <button
      onClick={addNetwork}
      className="add-network-btn"
      style={{
        padding: '8px 16px',
        background: 'linear-gradient(135deg, #7C3AED, #22D3EE)',
        border: 'none',
        borderRadius: '8px',
        color: 'white',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
      }}
    >
      Thêm mạng Sepolia
    </button>
  )
}
