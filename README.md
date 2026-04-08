# 🏙️ ISSOP - Intelligent Smart City Operations Platform

> A comprehensive smart city management system connecting citizens, field agents, and administrators for efficient urban service delivery.

[![Version](https://img.shields.io/badge/version-2.5.0-blue.svg)](https://github.com/Temsegn/ISSOP-Platform)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20.11.1-brightgreen.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/react-19-blue.svg)](https://reactjs.org)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Notification System](#-notification-system)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Testing](#-testing)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

ISSOP (Intelligent Smart City Operations Platform) is a modern, real-time platform designed to streamline urban service management. It enables citizens to report issues, field agents to respond efficiently, and administrators to monitor and manage city operations from a centralized dashboard.

### Key Capabilities

- 📱 **Mobile App** - Citizens report issues with photos and location
- 👷 **Agent Portal** - Field agents receive and manage assigned tasks
- 🖥️ **Admin Dashboard** - Real-time monitoring and analytics
- 🔔 **Smart Notifications** - Hourly reminders and instant updates
- 🗺️ **Live Tracking** - Real-time agent location and task status
- 📊 **Analytics** - Comprehensive insights and performance metrics

---

## ✨ Features

### For Citizens (Mobile App)
- ✅ Report issues with photos, location, and description
- ✅ Track request status in real-time
- ✅ Receive notifications when issues are resolved
- ✅ Hourly reminders for pending requests
- ✅ View nearby agents and estimated response time
- ✅ Rate and review completed services

### For Field Agents (Mobile App)
- ✅ Receive task assignments instantly
- ✅ Update task status (In Progress, Completed)
- ✅ Upload completion proof with photos
- ✅ Navigate to task locations with maps
- ✅ Hourly reminders for assigned tasks
- ✅ View task history and performance metrics

### For Administrators (Web Dashboard)
- ✅ Real-time dashboard with live statistics
- ✅ Monitor all requests and agent activities
- ✅ Assign tasks to available agents
- ✅ View analytics and performance reports
- ✅ Manage users and roles (SUPERADMIN)
- ✅ Live map with agent locations
- ✅ Daily summary reports at 9 AM
- ✅ Alert notifications for urgent issues

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     ISSOP Platform                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Mobile     │  │    Admin     │  │   Backend    │    │
│  │     App      │  │  Dashboard   │  │     API      │    │
│  │  (React      │  │  (Next.js)   │  │  (Node.js)   │    │
│  │   Native)    │  │              │  │              │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                  │                  │            │
│         └──────────────────┴──────────────────┘            │
│                            │                               │
│                    ┌───────▼────────┐                      │
│                    │   Socket.IO    │                      │
│                    │  (Real-time)   │                      │
│                    └───────┬────────┘                      │
│                            │                               │
│         ┌──────────────────┼──────────────────┐           │
│         │                  │                  │           │
│  ┌──────▼───────┐  ┌──────▼───────┐  ┌──────▼───────┐   │
│  │  PostgreSQL  │  │  Cloudinary  │  │   Node-Cron  │   │
│  │  (Database)  │  │   (Images)   │  │ (Scheduler)  │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### System Flow

1. **Citizen** reports issue via mobile app
2. **Backend** stores request and notifies admins
3. **Admin** assigns task to available agent
4. **Agent** receives notification and accepts task
5. **Agent** updates status and uploads completion proof
6. **Citizen** receives completion notification
7. **Scheduler** sends hourly reminders for pending tasks

---

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js 20.x
- **Framework:** Express.js
- **Database:** PostgreSQL with Prisma ORM
- **Real-time:** Socket.IO
- **Authentication:** JWT (JSON Web Tokens)
- **File Storage:** Cloudinary
- **Scheduling:** node-cron
- **API Docs:** Swagger/OpenAPI

### Admin Dashboard
- **Framework:** Next.js 16 (React 19)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI + shadcn/ui
- **State Management:** Redux Toolkit
- **Maps:** Leaflet + React Leaflet
- **Charts:** Recharts
- **Animations:** Framer Motion

### Mobile App
- **Framework:** React Native (Expo)
- **Language:** TypeScript
- **Navigation:** React Navigation
- **State:** Redux Toolkit
- **Maps:** React Native Maps
- **Camera:** Expo Camera & Image Picker

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20.11.1
- npm >= 9.8.1
- PostgreSQL >= 14
- Git

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/Temsegn/ISSOP-Platform.git
cd ISSOP-Platform
```

#### 2. Setup Backend

```bash
cd Backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local

# Edit .env.local with your credentials:
# - DATABASE_URL
# - JWT_SECRET
# - CLOUDINARY credentials

# Run database migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed

# Start server
npm run dev
```

**Backend runs on:** http://localhost:3000

#### 3. Setup Admin Dashboard

```bash
cd Admin

# Install dependencies
npm install

# Environment is pre-configured in .env.local
# Points to: https://issop-platform.onrender.com/api/v1

# Start development server
npm run dev
```

**Admin Dashboard runs on:** http://localhost:3000

#### 4. Setup Mobile App

```bash
cd mobile

# Install dependencies
npm install

# Start Expo
npm start

# Scan QR code with Expo Go app
# Or press 'a' for Android, 'i' for iOS simulator
```

---

## 📁 Project Structure

```
ISSOP-Platform/
├── Backend/                    # Node.js API Server
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.js            # Database seeding
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   ├── middleware/        # Express middlewares
│   │   ├── modules/           # Feature modules
│   │   │   ├── auth/          # Authentication
│   │   │   ├── users/         # User management
│   │   │   ├── requests/      # Request handling
│   │   │   ├── tasks/         # Task management
│   │   │   ├── notifications/ # Notifications
│   │   │   └── analytics/     # Analytics & reports
│   │   ├── services/          # Business logic
│   │   │   └── notification-scheduler.js
│   │   ├── app.js             # Express app
│   │   └── server.js          # Server entry point
│   ├── tests/                 # Unit & integration tests
│   ├── .env.example           # Environment template
│   └── package.json
│
├── Admin/                      # Next.js Admin Dashboard
│   ├── app/                   # App router pages
│   │   ├── dashboard/         # Dashboard pages
│   │   │   ├── page.tsx       # Main dashboard
│   │   │   ├── requests/      # Request management
│   │   │   ├── users/         # User management
│   │   │   ├── agents/        # Agent monitoring
│   │   │   ├── analytics/     # Analytics
│   │   │   ├── roles/         # Role management
│   │   │   └── settings/      # Settings
│   │   └── login/             # Login page
│   ├── components/            # React components
│   │   ├── dashboard/         # Dashboard components
│   │   └── ui/                # UI components (shadcn)
│   ├── lib/                   # Utilities
│   │   ├── api.ts             # API client
│   │   ├── socket.ts          # Socket.IO client
│   │   └── types.ts           # TypeScript types
│   ├── store/                 # Redux store
│   ├── .env.local             # Environment config
│   └── package.json
│
├── mobile/                     # React Native Mobile App
│   ├── src/
│   │   ├── screens/           # App screens
│   │   ├── components/        # React components
│   │   ├── navigation/        # Navigation config
│   │   ├── services/          # API & services
│   │   ├── store/             # Redux store
│   │   └── utils/             # Utilities
│   ├── app.json               # Expo configuration
│   └── package.json
│
├── docs/                       # Documentation
├── COMPLETE-FIXES-SUMMARY.md  # All fixes summary
└── README.md                   # This file
```

---

## 🔔 Notification System

### Overview

ISSOP features a comprehensive notification system with real-time delivery and scheduled reminders.

### Notification Types

| Type | Recipient | Trigger | Frequency |
|------|-----------|---------|-----------|
| **Task Assignment** | Agent | Request assigned | Instant |
| **Status Update** | Citizen | Status changes | Instant |
| **Completion** | Citizen | Request completed | Instant |
| **Hourly Reminder** | Citizen/Agent | Pending >1 hour | Every hour |
| **Alert** | Admin | Pending >24 hours | Every 24 hours |
| **Daily Summary** | Admin | Platform stats | 9:00 AM daily |

### Hourly Reminders

**How it works:**
- Cron job runs every hour at minute 0 (10:00, 11:00, 12:00, etc.)
- Checks all requests pending for more than 1 hour
- Sends reminders to:
  - **Citizens:** "Your request has been pending for X hours. We're working on it!"
  - **Agents:** "Reminder: Task assigned to you for X hours. Please update status."
  - **Admins:** For requests >24 hours old

**Configuration:**
```javascript
// Backend/src/services/notification-scheduler.js
cron.schedule('0 * * * *', async () => {
  // Hourly reminder logic
});
```

### Completion Notifications

When a request is marked as **COMPLETED**:
```
✅ Great news! Your request "Fix Pothole" has been completed. 
Thank you for using ISSOP!
```

When a request is **IN_PROGRESS**:
```
🔧 Your request "Fix Pothole" is now being worked on by our team.
```

### Real-Time Delivery

All notifications are delivered via **Socket.IO** for instant updates:

```javascript
// Client connects
socket.on('notification_received', (notification) => {
  // Display notification in app
});

// Server sends
socketService.emitToUser(userId, 'notification_received', notification);
```

### API Endpoints

**Get Notifications:**
```http
GET /api/v1/notifications
Authorization: Bearer <token>
```

**Mark as Read:**
```http
PATCH /api/v1/notifications/:id/read
Authorization: Bearer <token>
```

---

## 📚 API Documentation

### Base URL
```
Production: https://issop-platform.onrender.com/api/v1
Local: http://localhost:3000/api/v1
```

### Authentication

All protected endpoints require JWT token:
```http
Authorization: Bearer <your-jwt-token>
```

### Key Endpoints

#### Authentication
```http
POST /auth/register          # Register new user
POST /auth/login             # Login
GET  /auth/me                # Get current user
```

#### Requests
```http
GET    /requests             # List all requests
POST   /requests             # Create new request
GET    /requests/:id         # Get request details
PATCH  /requests/:id/status  # Update status
PATCH  /requests/:id/assign  # Assign to agent
```

#### Users
```http
GET    /users                # List users
GET    /users/:id            # Get user details
PATCH  /users/:id            # Update user
DELETE /users/:id            # Delete user
PATCH  /users/:id/role       # Update user role
```

#### Notifications
```http
GET    /notifications        # Get user notifications
PATCH  /notifications/:id/read  # Mark as read
```

#### Analytics
```http
GET /analytics/summary       # Dashboard statistics
GET /analytics/agents        # Agent performance
```

### Swagger Documentation

Interactive API documentation available at:
```
http://localhost:3000/api-docs
```

---

## 🌐 Deployment

### Backend (Render.com)

1. **Create Web Service**
   - Connect GitHub repository
   - Select `Backend` folder
   - Build Command: `npm install && npx prisma generate`
   - Start Command: `npm start`

2. **Environment Variables**
   ```
   DATABASE_URL=postgresql://...
   JWT_SECRET=your-secret-key
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   PORT=3000
   ```

3. **Database**
   - Create PostgreSQL database on Render
   - Run migrations: `npx prisma migrate deploy`

### Admin Dashboard (Vercel)

1. **Deploy to Vercel**
   ```bash
   cd Admin
   vercel
   ```

2. **Environment Variables**
   ```
   NEXT_PUBLIC_API_URL=https://issop-platform.onrender.com/api/v1
   NEXT_PUBLIC_SOCKET_URL=https://issop-platform.onrender.com
   ```

### Mobile App (Expo)

1. **Build for Production**
   ```bash
   cd mobile
   eas build --platform android
   eas build --platform ios
   ```

2. **Submit to Stores**
   ```bash
   eas submit --platform android
   eas submit --platform ios
   ```

---

## 🧪 Testing

### Backend Tests

```bash
cd Backend

# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test
npm test -- auth.service.test.js
```

**Test Suites:**
- Unit tests for services
- Integration tests for API endpoints
- Database tests with Prisma mock

### Admin Dashboard

```bash
cd Admin

# Type checking
npm run type-check

# Linting
npm run lint

# Build test
npm run build
```

### Mobile App

```bash
cd mobile

# Run tests
npm test

# Type checking
npm run type-check
```

---

## 👥 User Roles

### USER (Citizen)
- Report issues
- Track request status
- Receive notifications
- Rate completed services

### AGENT (Field Agent)
- View assigned tasks
- Update task status
- Upload completion proof
- Navigate to locations

### ADMIN (Administrator)
- View all requests
- Assign tasks to agents
- Monitor agent activities
- View analytics (area-specific)

### SUPERADMIN (Super Administrator)
- All ADMIN permissions
- Manage users and roles
- System-wide analytics
- Platform configuration

---

## 🔐 Security

- **Authentication:** JWT with secure token storage
- **Authorization:** Role-based access control (RBAC)
- **Data Validation:** Zod schema validation
- **SQL Injection:** Protected by Prisma ORM
- **XSS Protection:** Helmet.js middleware
- **CORS:** Configured for specific origins
- **Rate Limiting:** Implemented on sensitive endpoints
- **Password Hashing:** bcrypt with salt rounds

---

## 📊 Performance

- **Real-time Updates:** Socket.IO for instant notifications
- **Caching:** API response caching (30 seconds TTL)
- **Database Indexing:** Optimized queries with indexes
- **Image Optimization:** Cloudinary transformations
- **Code Splitting:** Next.js automatic code splitting
- **Lazy Loading:** Components loaded on demand

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Coding Standards

- **Backend:** ESLint configuration
- **Frontend:** TypeScript strict mode
- **Commits:** Conventional commits format
- **Tests:** Required for new features

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support

For issues, questions, or contributions:

- **GitHub Issues:** [Create an issue](https://github.com/Temsegn/ISSOP-Platform/issues)
- **Documentation:** Check `/docs` folder
- **Email:** support@issop.platform

---

## 🙏 Acknowledgments

- **Prisma** - Modern database toolkit
- **Next.js** - React framework
- **Socket.IO** - Real-time engine
- **Cloudinary** - Media management
- **shadcn/ui** - UI components
- **Render.com** - Hosting platform

---

## 📈 Roadmap

### Version 2.6.0 (Planned)
- [ ] Push notifications (FCM/APNS)
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Multi-language support
- [ ] Dark mode for mobile app
- [ ] Offline mode support

### Version 3.0.0 (Future)
- [ ] AI-powered task routing
- [ ] Predictive maintenance
- [ ] Citizen feedback system
- [ ] Integration with city IoT sensors
- [ ] Advanced analytics dashboard
- [ ] Mobile app for iOS

---

## 📸 Screenshots

### Admin Dashboard
![Dashboard](docs/screenshots/dashboard.png)
*Real-time monitoring with live statistics*

### Mobile App
![Mobile App](docs/screenshots/mobile.png)
*Citizen request submission interface*

### Live Map
![Live Map](docs/screenshots/map.png)
*Real-time agent tracking*

---

## 🎯 Project Status

**Current Version:** 2.5.0  
**Status:** ✅ Production Ready  
**Last Updated:** April 8, 2026  
**Maintained:** Yes

---

<div align="center">

**Built with ❤️ for Smart Cities**

[⬆ Back to Top](#-issop---intelligent-smart-city-operations-platform)

</div>
