// ─── Auth ────────────────────────────────────────────────────────────────────
export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface DecodedToken {
  id: string;
  email: string;
  role: UserRole;
  exp: number;
  iat: number;
}

// ─── User ─────────────────────────────────────────────────────────────────────
// Aligned with backend prisma/schema.prisma
export type UserRole = "SUPERADMIN" | "ADMIN" | "AGENT" | "USER";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  avatar?: string;
  area?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Request ──────────────────────────────────────────────────────────────────
// Aligned with backend RequestStatus enum
export type RequestStatus = "PENDING" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "REJECTED";

export interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  status: RequestStatus;
  latitude: number;
  longitude: number;
  address?: string;
  mediaUrls?: string[];
  citizenId: string;
  citizen?: User;
  agentId?: string;
  agent?: User;
  createdAt: string;
  updatedAt: string;
}

// ─── Task ─────────────────────────────────────────────────────────────────────
export interface Task {
  id: string;
  title: string;
  description: string;
  requestId: string;
  request?: ServiceRequest;
  agentId: string;
  agent?: User;
  status: RequestStatus; // Using common status as per prisma schema
  createdAt: string;
  updatedAt: string;
}

// ─── Analytics ────────────────────────────────────────────────────────────────
export interface DashboardStats {
  totalRequests: number;
  pendingRequests: number;
  resolvedRequests: number;
  activeAgents: number;
  totalUsers: number;
  avgResolutionHours: number;
  requestsByCategory: { category: string; count: number }[];
  requestsByStatus: { status: string; count: number }[];
  requestsOverTime: { date: string; count: number }[];
}

// ─── Notification ─────────────────────────────────────────────────────────────
export type NotificationKind = "REQUEST_CREATED" | "TASK_ASSIGNED" | "STATUS_UPDATED";

export interface Notification {
  id: string;
  type: NotificationKind;
  message: string;
  isRead: boolean;
  createdAt: string;
  userId: string;
  requestId?: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}
