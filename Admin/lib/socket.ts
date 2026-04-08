import { io, Socket } from 'socket.io-client'
import { api } from './api'

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://issop-platform.onrender.com'

class SocketService {
  private socket: Socket | null = null

  connect() {
    if (this.socket?.connected) return

    const token = api.getToken()
    if (!token) {
      console.warn('[Socket] No token available, skipping connection')
      return
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    })

    this.socket.on('connect', () => {
      console.log('[Socket] ✓ Connected to ISSOP Real-time Hub')
    })

    this.socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason)
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        this.socket?.connect()
      }
    })

    this.socket.on('connect_error', (error) => {
      console.error('[Socket] Connection Error:', error.message)
    })

    this.socket.on('error', (error) => {
      console.error('[Socket] Error:', error)
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.socket) this.connect()
    this.socket?.on(event, callback)
  }

  off(event: string, callback?: (data: any) => void) {
    this.socket?.off(event, callback)
  }

  emit(event: string, data: any) {
    if (!this.socket) this.connect()
    this.socket?.emit(event, data)
  }
}

export const socketService = new SocketService()
