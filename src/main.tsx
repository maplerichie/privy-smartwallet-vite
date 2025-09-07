import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PrivyProvider } from '@privy-io/react-auth';
import { SmartWalletsProvider } from '@privy-io/react-auth/smart-wallets';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { polygonAmoy } from 'viem/chains';
/// Vitejs Polyfill configuration
import { Buffer as BufferPolyfill } from 'buffer'
declare var Buffer: typeof BufferPolyfill;
globalThis.Buffer = BufferPolyfill
/// End of Vitejs Polyfill configuration

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="privy-vite-ui-theme">
      <PrivyProvider
        appId={import.meta.env.VITE_PRIVY_APP_ID}
        clientId={import.meta.env.VITE_PRIVY_CLIENT_ID}
        config={{
          defaultChain: polygonAmoy,
          supportedChains: [polygonAmoy],
          embeddedWallets: {
            createOnLogin: "all-users",
          },
          appearance: {
            theme: 'dark',
          },
        }}
      >
        <SmartWalletsProvider>
          <App />
          <Toaster />
        </SmartWalletsProvider>
      </PrivyProvider>
    </ThemeProvider>
  </StrictMode>,
)
