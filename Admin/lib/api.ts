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
      } else {
        localStorage.removeItem('auth_token')
      }
    }
  }

  getToken(): string | null {
    if (this.token) return this.token
    if (typeof window !== 'undefined') {
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
    await this.request('/auth/logout', { method: 'POST' })
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

  async createUser(data: Partial<User> & { password: string }): Promise<ApiResponse<User>> {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateUser(id: string, data: Partial<User>): Promise<ApiResponse<User>> {
    return this.request(`/users/${id}`, {
      method: 'PUT',
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

  async toggleUserStatus(id: string): Promise<ApiResponse<User>> {
    return this.request(`/users/${id}/toggle-status`, { method: 'PATCH' })
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

  async createRequest(data: Partial<Request>): Promise<ApiResponse<Request>> {
    return this.request('/requests', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateRequest(id: string, data: Partial<Request>): Promise<ApiResponse<Request>> {
    return this.request(`/requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async updateRequestStatus(id: string, status: Request['status'], note?: string): Promise<ApiResponse<Request>> {
    return this.request(`/requests/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note }),
    })
  }

  // Task endpoints
  async getTasks(params?: PaginationParams): Promise<ApiResponse<Task[]>> {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, String(value))
      })
    }
    return this.request(`/tasks?${queryParams.toString()}`)
  }

  async getTask(id: string): Promise<ApiResponse<Task>> {
    return this.request(`/tasks/${id}`)
  }

  async assignTask(requestId: string, agentId: string): Promise<ApiResponse<Task>> {
    return this.request('/tasks/assign', {
      method: 'POST',
      body: JSON.stringify({ requestId, agentId }),
    })
  }

  async updateTaskStatus(id: string, status: Task['status'], notes?: string): Promise<ApiResponse<Task>> {
    return this.request(`/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    })
  }

  // Agent endpoints
  async getAgents(params?: PaginationParams): Promise<ApiResponse<Agent[]>> {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, String(value))
      })
    }
    return this.request(`/agents?${queryParams.toString()}`)
  }

  async getAgent(id: string): Promise<ApiResponse<Agent>> {
    return this.request(`/agents/${id}`)
  }

  async getNearestAgents(lat: number, lng: number, limit?: number): Promise<ApiResponse<Agent[]>> {
    return this.request(`/agents/nearest?lat=${lat}&lng=${lng}${limit ? `&limit=${limit}` : ''}`)
  }

  async updateAgentLocation(id: string, lat: number, lng: number): Promise<ApiResponse<Agent>> {
    return this.request(`/agents/${id}/location`, {
      method: 'PATCH',
      body: JSON.stringify({ lat, lng }),
    })
  }

  // Notification endpoints
  async getNotifications(params?: { unreadOnly?: boolean }): Promise<ApiResponse<Notification[]>> {
    const queryParams = new URLSearchParams()
    if (params?.unreadOnly) queryParams.append('unreadOnly', 'true')
    return this.request(`/notifications?${queryParams.toString()}`)
  }

  async markNotificationRead(id: string): Promise<ApiResponse<Notification>> {
    return this.request(`/notifications/${id}/read`, { method: 'PATCH' })
  }

  async markAllNotificationsRead(): Promise<ApiResponse<void>> {
    return this.request('/notifications/read-all', { method: 'PATCH' })
  }

  // Analytics endpoints
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return this.request('/analytics/dashboard')
  }

  async getRequestsByCategory(): Promise<ApiResponse<RequestsByCategory[]>> {
    return this.request('/analytics/requests-by-category')
  }

  async getRequestsTrend(days?: number): Promise<ApiResponse<RequestsTrend[]>> {
    return this.request(`/analytics/requests-trend${days ? `?days=${days}` : ''}`)
  }

  async getAgentPerformance(): Promise<ApiResponse<{ agentId: string; name: string; completed: number; avgTime: number }[]>> {
    return this.request('/analytics/agent-performance')
  }
}

export const api = new ApiService()
