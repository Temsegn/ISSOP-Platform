'use client'

import { Provider } from 'react-redux'
import { store } from '@/store'
import { ThemeProvider } from './theme-provider'
import { Toaster } from './ui/sonner'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        {children}
        <Toaster position="top-right" richColors closeButton />
      </ThemeProvider>
    </Provider>
  )
}
