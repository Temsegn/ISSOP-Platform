// User and Auth Types
export type UserRole = 'CITIZEN' | 'AGENT' | 'ADMIN' | 'SUPERADMIN'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  role: UserRole
  isActive: boolean
  avatar?: string
  createdAt: string
  updatedAt: string
  location?: {
    lat: number
    lng: number
  }
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
export type RequestCategory = 'INFRASTRUCTURE' | 'SANITATION' | 'TRAFFIC' | 'UTILITIES' | 'PUBLIC_SAFETY' | 'OTHER'

export interface Request {
  id: string
  title: string
  description: string
  category: RequestCategory
  status: RequestStatus
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  location: {
    lat: number
    lng: number
    address?: string
  }
  media?: string[]
  citizenId: string
  citizen?: User
  agentId?: string
  agent?: User
  createdAt: string
  updatedAt: string
  resolvedAt?: string
  timeline?: RequestTimeline[]
}

export interface RequestTimeline {
  id: string
  status: RequestStatus
  note?: string
  createdAt: string
  createdBy: User
}

// Task Types
export interface Task {
  id: string
  requestId: string
  request?: Request
  agentId: string
  agent?: User
  status: RequestStatus
  notes?: string
  startedAt?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}

// Agent Types
export interface Agent extends User {
  currentLocation?: {
    lat: number
    lng: number
    updatedAt: string
  }
  assignedTasks: number
  completedTasks: number
  rating?: number
  availability: 'AVAILABLE' | 'BUSY' | 'OFFLINE'
}

// Notification Types
export interface Notification {
  id: string
  title: string
  message: string
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR'
  isRead: boolean
  createdAt: string
  link?: string
}

// Analytics Types
export interface DashboardStats {
  totalRequests: number
  pendingRequests: number
  completedRequests: number
  activeAgents: number
  requestsChange: number
  completionRate: number
}

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string
  }[]
}

export interface RequestsByCategory {
  category: RequestCategory
  count: number
  percentage: number
}

export interface RequestsTrend {
  date: string
  total: number
  completed: number
  pending: number
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  status?: RequestStatus
  category?: RequestCategory
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Socket Events
export type SocketEvent = 
  | 'request_created'
  | 'task_assigned'
  | 'status_updated'
  | 'agent_location_updated'
  | 'notification'
