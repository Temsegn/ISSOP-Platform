# ISSOP Backend – Production Ready Plan

## 1. Backend Overview

The backend handles all business logic, data storage, authentication, authorization, notifications, and analytics. It exposes REST APIs for the frontend (Next.js) and mobile app (Flutter/React Native).

---

## 2. Technology Stack

| Layer | Technology / Tool |
|---|---|
| Runtime / Framework | Node.js + Express |
| ORM / Database | Prisma (PostgreSQL) |
| Authentication | JWT (with refresh token) |
| Validation | Joi or Zod |
| Real-Time Updates | Socket.io / Pusher |
| API Documentation | Swagger (OpenAPI 3.0) |
| Testing | Jest (unit + integration), Supertest (API testing) |
| CI/CD | GitHub Actions |

---

## 3. Backend Architecture

Layered structure for scalability and maintainability:

- **Routes** – Define API endpoints, separate by module (auth, requests, tasks, users, analytics, notifications).
- **Controllers** – Handle request/response and call the service layer.
- **Services** – Contain business logic, enforce workflow rules.
- **Repositories (Prisma ORM)** – Handle all database interactions.
- **Middleware** – Auth, role-based access, input validation, error handling.
- **Utils / Helpers** – Common functions, notifications, logging.

### Modules

- Auth
- Users
- Requests
- Tasks
- Notifications
- Analytics

---

## 4. API Endpoints & Logic

### 4.1 Authentication & Authorization

| Endpoint | Method | Description |
|---|---|---|
| `/api/v1/auth/register` | POST | Register a new user (citizen/admin/agent) |
| `/api/v1/auth/login` | POST | Login, return JWT |
| `/api/v1/auth/refresh-token` | POST | Refresh JWT token |
| `/api/v1/auth/me` | GET | Get current user profile |

**Logic:**
- Validate input
- Hash passwords
- Generate JWT tokens
- Role-based access control

---

### 4.2 Users Module

| Endpoint | Method | Description |
|---|---|---|
| `/api/v1/users` | GET | Admin: list all users |
| `/api/v1/users/:id` | GET | Get user by ID |
| `/api/v1/users/:id` | PATCH | Update user info |
| `/api/v1/users/:id` | DELETE | Soft delete user |

---

### 4.3 Requests Module

| Endpoint | Method | Description |
|---|---|---|
| `/api/v1/requests` | POST | Create a new request (citizen) |
| `/api/v1/requests` | GET | List requests (admin or citizen) |
| `/api/v1/requests/:id` | GET | Get request details |
| `/api/v1/requests/:id` | PATCH | Update request status (admin) |
| `/api/v1/requests/:id/assign` | PATCH | Assign task to agent |

**Logic:**
- Store images/videos
- Track status transitions: `Pending → Assigned → In Progress → Completed → Rejected`
- Optional GPS location

---

### 4.4 Agent Tasks Module

| Endpoint | Method | Description |
|---|---|---|
| `/api/v1/agent/tasks` | GET | List assigned tasks for agent |
| `/api/v1/agent/tasks/:id/accept` | PATCH | Accept assigned task |
| `/api/v1/agent/tasks/:id/reject` | PATCH | Reject task |
| `/api/v1/agent/tasks/:id/progress` | PATCH | Update task progress |
| `/api/v1/agent/tasks/:id/complete` | PATCH | Complete task and upload proof |

---

### 4.5 Notifications Module

| Endpoint | Method | Description |
|---|---|---|
| `/api/v1/notifications` | GET | List notifications for user |
| `/api/v1/notifications/:id/read` | PATCH | Mark as read |

**Logic:**
- Notify user on status change
- Notify agent when assigned task
- Store in database for history

---

### 4.6 Analytics Module

| Endpoint | Method | Description |
|---|---|---|
| `/api/v1/analytics/summary` | GET | Dashboard: total requests, completed vs pending, requests per category, agent performance |

**Logic:**
- Aggregate statistics from requests table
- Group by category, status, and agent

---

### 4.7 Real-Time Updates

Socket.io / Pusher channels:
- `request_created`
- `task_assigned`
- `status_updated`

Frontend listens and updates dashboards in real-time.

---

## 5. API Documentation

Swagger (OpenAPI 3.0):
- `/api-docs` route serves Swagger UI
- Define all endpoints with:
  - Request body
  - Query parameters
  - Response codes and schemas
- Helps frontend and mobile teams integrate faster

---

## 6. Testing Strategy

### 6.1 Unit Tests
- Test service logic (business rules)
- Test utilities and helpers
- Example: Validate task assignment, status transitions

### 6.2 Integration Tests
- Test API endpoints with Supertest
- Include:
  - Auth flow
  - Request CRUD
  - Task assignment
  - Notifications
- Use test database with Prisma
- Coverage Goal: ≥ 80%

---

## 7. CI/CD Pipeline (GitHub Actions)

### Workflow
Push / PR triggers workflow

### Steps
1. Install dependencies (`npm ci`)
2. Run lint (`eslint`)
3. Run unit & integration tests (`jest`)
4. Generate Swagger docs
5. Deploy to staging/production (e.g., AWS EC2 or Render)

### Benefits
- Automated testing on every push
- Catch errors before deployment
- Ensure code quality

---

## 8. Backend Best Practices

- Modular architecture (modules for each feature)
- Layer separation (controllers → services → repositories)
- Validation for all inputs
- Error handling via global middleware
- Role-based access enforced at route level
- Swagger for API standardization
- Jest + Supertest for reliable testing
- Prisma for type-safe database queries

---

## 9. Folder Structure

```
Backend/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.js
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js
│   │   │   └── auth.repository.js
│   │   ├── users/
│   │   ├── requests/
│   │   ├── tasks/
│   │   ├── notifications/
│   │   └── analytics/
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── role.middleware.js
│   │   ├── validate.middleware.js
│   │   └── error.middleware.js
│   ├── utils/
│   │   ├── logger.js
│   │   ├── notifications.js
│   │   └── helpers.js
│   ├── config/
│   │   ├── db.js
│   │   └── swagger.js
│   └── app.js
├── prisma/
│   └── schema.prisma
├── tests/
│   ├── unit/
│   └── integration/
├── .github/
│   └── workflows/
│       └── ci.yml
├── .env.example
├── package.json
└── README.md
```

---

## 10. Environment Variables

```env
# Server
PORT=3000
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:password@host:5432/issop_db

# JWT
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Real-Time
PUSHER_APP_ID=
PUSHER_KEY=
PUSHER_SECRET=
PUSHER_CLUSTER=

# Storage (for images/videos)
STORAGE_BUCKET=
STORAGE_REGION=
```

---

## 11. ERD Summary (Entity Relations)

```
User ──< Request >── Task ──< Notification
         │
         └── Category
             └── GPS Location (optional)

User roles: citizen | admin | agent
Request statuses: Pending | Assigned | In Progress | Completed | Rejected
```

---

> This design is production-ready, maintainable, and scalable for ISSOP without Docker.
