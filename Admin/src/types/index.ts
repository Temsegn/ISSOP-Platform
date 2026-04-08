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
export type UserRole = "admin" | "agent" | "citizen";
export type UserStatus = "active" | "inactive" | "suspended";

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  region?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Request ──────────────────────────────────────────────────────────────────
export type RequestStatus = "pending" | "assigned" | "in_progress" | "resolved" | "rejected";
export type RequestPriority = "low" | "medium" | "high" | "critical";
export type RequestCategory =
  | "infrastructure"
  | "public_safety"
  | "environment"
  | "health"
  | "education"
  | "other";

export interface GeoLocation {
  type: "Point";
  coordinates: [number, number]; // [lng, lat]
}

export interface ServiceRequest {
  _id: string;
  title: string;
  description: string;
  category: RequestCategory;
  priority: RequestPriority;
  status: RequestStatus;
  location: GeoLocation;
  address?: string;
  media?: string[];
  submittedBy: User | string;
  assignedTo?: User | string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

// ─── Task ─────────────────────────────────────────────────────────────────────
export type TaskStatus = "open" | "in_progress" | "completed" | "cancelled";

export interface Task {
  _id: string;
  title: string;
  description: string;
  request: ServiceRequest | string;
  assignedTo: User | string;
  assignedBy: User | string;
  status: TaskStatus;
  dueDate?: string;
  completedAt?: string;
  notes?: string;
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
  topRegions: { region: string; count: number }[];
}

// ─── Notification ─────────────────────────────────────────────────────────────
export type NotificationKind = "info" | "success" | "warning" | "error";

export interface Notification {
  _id: string;
  title: string;
  message: string;
  kind: NotificationKind;
  read: boolean;
  createdAt: string;
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
