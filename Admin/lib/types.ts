// User and Auth Types
export type UserRole = 'USER' | 'AGENT' | 'ADMIN' | 'SUPERADMIN'
export type AgentStatus = 'AVAILABLE' | 'BUSY' | 'OFFLINE'

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: UserRole
  isActive: boolean
  status?: AgentStatus
  latitude?: number
  longitude?: number
  area?: string
  createdAt: string
  updatedAt: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

// Request Types
export type RequestStatus = 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED'

export interface Request {
  id: string
  title: string
  description: string
  category: string
  status: RequestStatus
  latitude: number
  longitude: number
  address?: string
  mediaUrls?: string[]
  completionProofUrl?: string
  citizenId: string
  citizen?: User
  agentId?: string
  agent?: User
  createdAt: string
  updatedAt: string
}

// Task Types (Legacy/Reference)
export interface Task {
  id: string
  requestId: string
  request?: Request
  agentId: string
  agent?: User
  status: RequestStatus
  notes?: string
  createdAt: string
  updatedAt: string
}

// Agent Type (Helper)
export interface Agent extends User {
  assignedTasks?: number
  completedTasks?: number
  rating?: number
}

// Notification Types
export interface Notification {
  id: string
  type: string
  message: string
  isRead: boolean
  createdAt: string
  requestId?: string
}

// Analytics Types
export interface DashboardStats {
  totalRequests: number
  pendingRequests: number
  completedRequests: number
  activeAgents: number
  avgCompletionTime?: string
  statusCounts: Record<string, number>
  categoryCounts: { name: string; value: number; category: string }[]
  trend: RequestsTrend[]
}

export interface RequestsByCategory {
  name: string
  value: number
  category: string
}

export interface RequestsTrend {
  date: string
  total: number
  completed: number
  pending: number
}

// API Response Types
export interface ApiResponse<T> {
  status: string
  data: T
  message?: string
  results?: number
}

export interface PaginationParams {
  page?: number
  limit?: number
  status?: RequestStatus
  fromDate?: string
  toDate?: string
}

// Socket Events
export type SocketEvent = 
  | 'request_created'
  | 'task_assigned'
  | 'status_updated'
  | 'agent_location_updated'
  | 'notification'
