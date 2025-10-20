import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { http, createConfig } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { Buffer } from 'buffer'

// Polyfill for buffer
if (typeof globalThis.Buffer === 'undefined') {
  globalThis.Buffer = Buffer
}

export const pioneZero = {
  id: 5080,
  name: 'Pione Zero',
  network: 'pionezero',
  nativeCurrency: { name: 'PZO', symbol: 'PZO', decimals: 18 },
  rpcUrls: {
    default: { http: [import.meta.env.VITE_PIONEZERO_RPC || 'https://rpc.zeroscan.org'] },
    public: { http: [import.meta.env.VITE_PIONEZERO_RPC || 'https://rpc.zeroscan.org'] },
  },
  blockExplorers: { default: { name: 'ZeroScan', url: 'https://zeroscan.org' } },
}

export const chains = [sepolia, pioneZero]

export const wagmiConfig = getDefaultConfig({
  appName: 'PIO Bridge',
  projectId: 'YOUR_PROJECT_ID', // Có thể để trống cho test
  chains,
  transports: {
    [sepolia.id]: http(import.meta.env.VITE_SEPOLIA_RPC || 'https://rpc.ankr.com/eth_sepolia'),
    [pioneZero.id]: http(import.meta.env.VITE_PIONEZERO_RPC || 'https://rpc.zeroscan.org'),
  },
  ssr: false,
})


