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
      // Try to get from cookie first for consistency with middleware
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
      const error = await response.json().catch(() => ({ message: 'Request failed' }))
      throw new Error(error.message || `HTTP error! status: ${response.status}`)
    }

    return response.json()
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
    return this.request(`/users?${queryParams.toString()}`)
  }

  async getUser(id: string): Promise<ApiResponse<User>> {
    return this.request(`/users/${id}`)
  }

  async updateUser(id: string, data: Partial<User>): Promise<ApiResponse<User>> {
    return this.request(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return this.request(`/users/${id}`, { method: 'DELETE' })
  }

  async updateUserRole(id: string, role: User['role']): Promise<ApiResponse<User>> {
    return this.request(`/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    })
  }

  // Request endpoints
  async getRequests(params?: PaginationParams): Promise<ApiResponse<Request[]>> {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, String(value))
      })
    }
    return this.request(`/requests?${queryParams.toString()}`)
  }

  async getRequest(id: string): Promise<ApiResponse<Request>> {
    return this.request(`/requests/${id}`)
  }

  async assignRequest(requestId: string, agentId: string): Promise<ApiResponse<Request>> {
    return this.request(`/requests/${requestId}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ agentId }),
    })
  }

  async updateRequestStatus(id: string, status: Request['status']): Promise<ApiResponse<Request>> {
    return this.request(`/requests/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  }

  // Location/Agents endpoints
  async getNearestAgents(lat: number, lon: number, radius?: number): Promise<ApiResponse<User[]>> {
    return this.request(`/users/nearest-agents?lat=${lat}&lon=${lon}${radius ? `&radius=${radius}` : ''}`)
  }

  // Analytics endpoints
  async getSummaryStats(): Promise<ApiResponse<DashboardStats>> {
    return this.request('/analytics/summary')
  }

  async getAgentPerformance(): Promise<ApiResponse<{ agentId: string; name: string; completed: number; avgTime: string }[]>> {
    return this.request('/analytics/agents')
  }

  // Notification endpoints
  async getNotifications(): Promise<ApiResponse<Notification[]>> {
    return this.request('/notifications')
  }

  async markNotificationRead(id: string): Promise<ApiResponse<Notification>> {
    return this.request(`/notifications/${id}/read`, { method: 'PATCH' })
  }
}

export const api = new ApiService()
