'use client'

import { Provider } from 'react-redux'
import { useEffect } from 'react'
import { store } from '@/store'
import { useAppDispatch } from '@/store/hooks'
import { fetchCurrentUser } from '@/store/slices/authSlice'
import { api } from '@/lib/api'
import { socketService } from '@/lib/socket'
import { ThemeProvider } from './theme-provider'
import { Toaster } from './ui/sonner'

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const token = api.getToken()
    if (token) {
      dispatch(fetchCurrentUser())
      socketService.connect()
    } else {
      socketService.disconnect()
    }

    return () => {
      socketService.disconnect()
    }
  }, [dispatch])

  return <>{children}</>
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </AuthInitializer>
    </Provider>
  )
}
