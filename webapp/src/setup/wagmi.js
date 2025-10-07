import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { http, createConfig } from 'wagmi'
import { goerli } from 'wagmi/chains'

export const pioneZero = {
  id: 5080,
  name: 'Pione Zero',
  network: 'pionezero',
  nativeCurrency: { name: 'PIO', symbol: 'PIO', decimals: 18 },
  rpcUrls: {
    default: { http: [import.meta.env.VITE_PIONEZERO_RPC || 'https://rpc.pioneer-zero.invalid'] },
    public: { http: [import.meta.env.VITE_PIONEZERO_RPC || 'https://rpc.pioneer-zero.invalid'] },
  },
  blockExplorers: { default: { name: 'Explorer', url: '#' } },
}

export const chains = [goerli, pioneZero]

export const wagmiConfig = createConfig(getDefaultConfig({
  appName: 'PIO Bridge',
  projectId: import.meta.env.VITE_WALLETCONNECT_ID || 'demo',
  chains,
  transports: {
    [goerli.id]: http(import.meta.env.VITE_GOERLI_RPC || 'https://rpc.ankr.com/eth_goerli'),
    [pioneZero.id]: http(import.meta.env.VITE_PIONEZERO_RPC || 'https://rpc.pioneer-zero.invalid'),
  },
}))


