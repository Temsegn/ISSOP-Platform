import type {
  User,
  Request,
  Task,
  Agent,
  Notification,
  DashboardStats,
  RequestsByCategory,
  RequestsTrend,
  ApiResponse,
  PaginationParams,
} from './types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://issop-platform.onrender.com/api/v1'

class ApiService {
  private token: string | null = null
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private readonly CACHE_TTL = 30000 // 30 seconds

  setToken(token: string | null) {
    this.token = token
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token)
        document.cookie = `auth_token=${token}; path=/; max-age=${30 * 24 * 60 * 60}; samesite=lax`
      } else {
        localStorage.removeItem('auth_token')
        document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      }
    }
  }

  getToken(): string | null {
    if (this.token) return this.token
    if (typeof window !== 'undefined') {
      const match = document.cookie.match(/(^| )auth_token=([^;]+)/)
      if (match) return match[2]
      return localStorage.getItem('auth_token')
    }
    return null
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const isGet = !options.method || options.method === 'GET'

    // Check cache for GET requests
    if (isGet && this.cache.has(endpoint)) {
      const cached = this.cache.get(endpoint)!
      if (Date.now() - cached.timestamp < this.CACHE_TTL) {
        return cached.data as T
      }
      this.cache.delete(endpoint)
    }

    const token = this.getToken()
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      // Handle 401 Unauthorized - invalid/expired token
      if (response.status === 401) {
        console.warn('[API] 401 Unauthorized - clearing invalid token')
        this.setToken(null)
        this.clearCache()
        
        // Redirect to login if in browser
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
        
        throw new Error('Session expired. Please login again.')
      }

      const error = await response.json().catch(() => ({ message: 'Request failed' }))
      throw new Error(error.message || `HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    // Store in cache if it's a GET request
    if (isGet) {
      this.cache.set(endpoint, { data, timestamp: Date.now() })
    }

    return data as T
  }

  // Clear cache method
  clearCache() {
    this.cache.clear()
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async register(data: Partial<User> & { password: string }): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async logout(): Promise<void> {
    this.setToken(null)
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request('/auth/me')
  }

  // User endpoints
  async getUsers(params?: PaginationParams): Promise<ApiResponse<User[]>> {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, String(value))
      })
    }
    const res = await this.request<ApiResponse<{ users: User[] }>>(`/users?${queryParams.toString()}`)
    return { ...res, data: res.data?.users || [] }
  }

  async getUser(id: string): Promise<ApiResponse<User>> {
    const res = await this.request<ApiResponse<{ user: User }>>(`/users/${id}`)
    return { ...res, data: res.data?.user }
  }

  async updateUser(id: string, data: Partial<User>): Promise<ApiResponse<User>> {
    const res = await this.request<ApiResponse<{ user: User }>>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
    return { ...res, data: res.data?.user }
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return this.request(`/users/${id}`, { method: 'DELETE' })
  }

  async updateUserRole(id: string, role: User['role']): Promise<ApiResponse<User>> {
    const res = await this.request<ApiResponse<{ user: User }>>(`/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    })
    return { ...res, data: res.data?.user }
  }

  // Request endpoints
  async getRequests(params?: PaginationParams): Promise<ApiResponse<Request[]>> {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, String(value))
      })
    }
    const res = await this.request<ApiResponse<{ requests: Request[] }>>(`/requests?${queryParams.toString()}`)
    return { ...res, data: res.data?.requests || [] }
  }

  async getRequest(id: string): Promise<ApiResponse<Request>> {
    const res = await this.request<ApiResponse<{ request: Request }>>(`/requests/${id}`)
    return { ...res, data: res.data?.request }
  }

  async assignRequest(requestId: string, agentId: string): Promise<ApiResponse<Request>> {
    const res = await this.request<ApiResponse<{ request: Request }>>(`/requests/${requestId}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ agentId }),
    })
    return { ...res, data: res.data?.request }
  }

  async updateRequestStatus(id: string, status: Request['status']): Promise<ApiResponse<Request>> {
    const res = await this.request<ApiResponse<{ request: Request }>>(`/requests/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
    return { ...res, data: res.data?.request }
  }

  // Location/Agents endpoints
  async getNearestAgents(lat: number, lon: number, radius?: number): Promise<ApiResponse<User[]>> {
    const res = await this.request<ApiResponse<{ agents: User[] }>>(`/users/nearest-agents?lat=${lat}&lon=${lon}${radius ? `&radius=${radius}` : ''}`)
    return { ...res, data: res.data?.agents || [] }
  }

  // Analytics endpoints
  async getSummaryStats(): Promise<ApiResponse<DashboardStats>> {
    return this.request('/analytics/summary')
  }

  async getAgentPerformance(): Promise<ApiResponse<{ agentId: string; name: string; completed: number; avgTime: string }[]>> {
    const res = await this.request<ApiResponse<{ agents: any[] }>>('/analytics/agents')
    return { ...res, data: res.data?.agents || [] }
  }

  // Notification endpoints
  async getNotifications(): Promise<ApiResponse<Notification[]>> {
    const res = await this.request<ApiResponse<{ notifications: Notification[] }>>('/notifications')
    return { ...res, data: res.data?.notifications || [] }
  }

  async markNotificationRead(id: string): Promise<ApiResponse<Notification>> {
    return this.request(`/notifications/${id}/read`, { method: 'PATCH' })
  }
}

export const api = new ApiService()
