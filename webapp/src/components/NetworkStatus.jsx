import React from 'react'
import { useChainId, useAccount } from 'wagmi'

export default function NetworkStatus() {
  const chainId = useChainId()
  const { isConnected } = useAccount()

  const getNetworkInfo = (chainId) => {
    switch (chainId) {
      case 5080:
        return {
          name: 'Pione Zero',
          symbol: 'PZO',
          explorer: 'https://zeroscan.org',
          faucet: 'https://faucet.zeroscan.org',
          color: '#7C3AED',
          status: 'connected'
        }
      case 5:
        return {
          name: 'Goerli',
          symbol: 'ETH',
          explorer: 'https://goerli.etherscan.io',
          faucet: 'https://goerlifaucet.com',
          color: '#22D3EE',
          status: 'connected'
        }
      default:
        return {
          name: 'Unknown Network',
          symbol: '?',
          explorer: null,
          faucet: null,
          color: '#EF4444',
          status: 'unsupported'
        }
    }
  }

  const network = getNetworkInfo(chainId)

  if (!isConnected) {
    return (
      <div style={{
        padding: '8px 12px',
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '8px',
        fontSize: '12px',
        color: '#EF4444',
        textAlign: 'center'
      }}>
        🔌 Chưa kết nối ví
      </div>
    )
  }

  return (
    <div style={{
      padding: '8px 12px',
      background: `rgba(${network.color === '#7C3AED' ? '124, 58, 237' : '34, 211, 238'}, 0.1)`,
      border: `1px solid rgba(${network.color === '#7C3AED' ? '124, 58, 237' : '34, 211, 238'}, 0.3)`,
      borderRadius: '8px',
      fontSize: '12px',
      color: network.color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          width: '8px',
          height: '8px',
          background: network.color,
          borderRadius: '50%',
          animation: 'pulse 2s infinite'
        }} />
        <span style={{ fontWeight: 600 }}>
          {network.name} (Chain ID: {chainId})
        </span>
      </div>
      
      {network.faucet && (
        <a
          href={network.faucet}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: network.color,
            textDecoration: 'none',
            fontSize: '10px',
            padding: '2px 6px',
            background: `rgba(${network.color === '#7C3AED' ? '124, 58, 237' : '34, 211, 238'}, 0.2)`,
            borderRadius: '4px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = `rgba(${network.color === '#7C3AED' ? '124, 58, 237' : '34, 211, 238'}, 0.3)`
          }}
          onMouseLeave={(e) => {
            e.target.style.background = `rgba(${network.color === '#7C3AED' ? '124, 58, 237' : '34, 211, 238'}, 0.2)`
          }}
        >
          Faucet
        </a>
      )}
    </div>
  )
}
