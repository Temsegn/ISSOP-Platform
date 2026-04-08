/**
 * Integration tests use jest.mock to bypass real DB + auth.
 * They test the full Express routing + controller + service layer together.
 */

require('dotenv').config();

// Mock auth middleware BEFORE app is loaded
jest.mock('../../src/middleware/auth.middleware', () => {
  return jest.fn((req, res, next) => {
    const role = req.headers['x-test-role'] || 'USER';
    const id   = req.headers['x-test-id']   || 'cit1';
    const area = req.headers['x-test-area']  || 'Central';
    req.user = { id, role, area, isActive: true, isDeleted: false };
    next();
  });
});

// Note: Notification service uses real logic but prisma is mocked

require('dotenv').config();
const prismaMock = require('../prisma.mock');
const supertest  = require('supertest');
const app        = require('../../src/app');

// ─── Helpers ─────────────────────────────────────────────────────────────────
const asUser  = (req) => req.set('Authorization', 'Bearer tok').set('x-test-role', 'USER').set('x-test-id', 'cit1');
const asAdmin = (req) => req.set('Authorization', 'Bearer tok').set('x-test-role', 'ADMIN').set('x-test-id', 'admin1').set('x-test-area', 'Central');
const asAgent = (req) => req.set('Authorization', 'Bearer tok').set('x-test-role', 'AGENT').set('x-test-id', 'agt1').set('x-test-area', 'Central');
const asSA    = (req) => req.set('Authorization', 'Bearer tok').set('x-test-role', 'SUPERADMIN').set('x-test-id', 'super1');

// ─── Fixtures ─────────────────────────────────────────────────────────────────
const baseRequest = {
  id: 'req1', title: 'Pothole Fix', description: 'Big hole in road', category: 'Road',
  status: 'PENDING', citizenId: 'cit1', agentId: null,
  mediaUrls: [], latitude: 9.0, longitude: 38.0, isDeleted: false,
  createdAt: new Date(), updatedAt: new Date(),
};

const mockAgent = {
  id: 'agt1', name: 'Agent X', role: 'AGENT', area: 'Central',
  email: 'agent@issop.com', status: 'AVAILABLE', isActive: true, isDeleted: false,
};

// ─── SUITE 1: Auth ─────────────────────────────────────────────────────────────
describe('Auth API', () => {
  it('POST /register → 201 with user + token', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({
      id: 'u1', name: 'Bob', email: 'bob@test.com', role: 'USER',
      password: 'hashed', isActive: true, isDeleted: false,
      phone: null, area: null, latitude: null, longitude: null,
      createdAt: new Date(), updatedAt: new Date(),
    });

    const res = await supertest(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Bob', email: 'bob@test.com', password: 'Password1!' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('data.token');
    expect(res.body.data.user.email).toBe('bob@test.com');
    expect(res.body.data.user).not.toHaveProperty('password');
  });

  it('POST /register → 400 if email already exists', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u9', email: 'bob@test.com' });

    const res = await supertest(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Bob', email: 'bob@test.com', password: 'Password1!' });

    expect(res.status).toBe(400);
  });
});

// ─── SUITE 2: Requests ──────────────────────────────────────────────────────────
describe('Requests API', () => {
  it('POST /requests → 201 creates a request', async () => {
    prismaMock.request.create.mockResolvedValue(baseRequest);

    // title min 5, description min 10 chars
    const res = await asUser(supertest(app).post('/api/v1/requests'))
      .send({ title: 'Pothole fix', description: 'Big hole in road', category: 'Road', latitude: 9.0, longitude: 38.0 });

    expect(res.status).toBe(201);
    expect(res.body.data.request.status).toBe('PENDING');
  });

  it('POST /requests → 400 on missing required fields', async () => {
    // Missing description, category, lat, lon
    const res = await asUser(supertest(app).post('/api/v1/requests'))
      .send({ title: 'Bad' });

    expect(res.status).toBe(400);
  });

  it('GET /requests → 200 returns list of requests', async () => {
    prismaMock.request.findMany.mockResolvedValue([baseRequest]);

    const res = await asUser(supertest(app).get('/api/v1/requests'));

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.requests)).toBe(true);
    expect(res.body.data.requests).toHaveLength(1);
  });

  it('GET /requests/:id → 200 returns specific request for owner', async () => {
    prismaMock.request.findUnique.mockResolvedValue(baseRequest);

    const res = await asUser(supertest(app).get('/api/v1/requests/req1'));

    expect(res.status).toBe(200);
    expect(res.body.data.request.id).toBe('req1');
  });

  it('GET /requests/:id → 404 for non-existent request', async () => {
    prismaMock.request.findUnique.mockResolvedValue(null);

    const res = await asUser(supertest(app).get('/api/v1/requests/nonexistent'));

    expect(res.status).toBe(404);
  });

  it('PATCH /requests/:id/assign → 200 assigns request to agent', async () => {
    prismaMock.request.findUnique.mockResolvedValue(baseRequest);
    prismaMock.user.findUnique.mockResolvedValue(mockAgent);
    prismaMock.request.update.mockResolvedValue({ ...baseRequest, status: 'ASSIGNED', agentId: 'agt1' });

    const res = await asAdmin(supertest(app).patch('/api/v1/requests/req1/assign'))
      .send({ agentId: 'agt1' });

    expect(res.status).toBe(200);
    expect(res.body.data.request.status).toBe('ASSIGNED');
  });
});

// ─── SUITE 3: Agent Task Actions ───────────────────────────────────────────────
describe('Agent Tasks API', () => {
  it('GET /agent/tasks/my-tasks → 200 returns assigned tasks', async () => {
    prismaMock.request.findMany.mockResolvedValue([{ ...baseRequest, status: 'ASSIGNED', agentId: 'agt1' }]);

    const res = await asAgent(supertest(app).get('/api/v1/agent/tasks/my-tasks'));

    expect(res.status).toBe(200);
    expect(res.body.data.tasks).toHaveLength(1);
  });

  it('PATCH /agent/tasks/:id/accept → 200 accepts task → IN_PROGRESS', async () => {
    prismaMock.request.update.mockResolvedValue({ ...baseRequest, status: 'IN_PROGRESS', agentId: 'agt1' });

    const res = await asAgent(supertest(app).patch('/api/v1/agent/tasks/req1/accept'));

    expect(res.status).toBe(200);
    expect(res.body.data.task.status).toBe('IN_PROGRESS');
  });

  it('PATCH /agent/tasks/:id/reject → 200 rejects task → PENDING', async () => {
    prismaMock.request.update.mockResolvedValue({ ...baseRequest, status: 'PENDING', agentId: null });

    const res = await asAgent(supertest(app).patch('/api/v1/agent/tasks/req1/reject'));

    expect(res.status).toBe(200);
    expect(res.body.data.task.status).toBe('PENDING');
  });

  it('PATCH /agent/tasks/:id/complete → 200 completes task with proof', async () => {
    const proofUrl = 'http://example.com/proof.jpg';
    prismaMock.request.update.mockResolvedValue({
      ...baseRequest, status: 'COMPLETED', agentId: 'agt1', completionProofUrl: proofUrl,
    });

    const res = await asAgent(supertest(app).patch('/api/v1/agent/tasks/req1/complete'))
      .send({ completionProofUrl: proofUrl });

    expect(res.status).toBe(200);
    expect(res.body.data.task.status).toBe('COMPLETED');
    expect(res.body.data.task.completionProofUrl).toBe(proofUrl);
  });

  it('PATCH /agent/tasks/:id/complete → 400 when proof URL missing', async () => {
    const res = await asAgent(supertest(app).patch('/api/v1/agent/tasks/req1/complete'))
      .send({});

    expect(res.status).toBe(400);
  });
});

// ─── SUITE 4: Notifications ────────────────────────────────────────────────────
describe('Notifications API', () => {
  it('GET /notifications → 200 returns user notifications', async () => {
    prismaMock.notification.findMany.mockResolvedValue([
      { id: 'n1', type: 'TASK_ASSIGNED', message: 'New task', isRead: false, userId: 'cit1', createdAt: new Date() },
    ]);

    const res = await asUser(supertest(app).get('/api/v1/notifications'));

    expect(res.status).toBe(200);
    expect(res.body.data.notifications).toHaveLength(1);
  });

  it('PATCH /notifications/:id/read → 200 marks as read', async () => {
    prismaMock.notification.update.mockResolvedValue({ id: 'n1', isRead: true });

    const res = await asUser(supertest(app).patch('/api/v1/notifications/n1/read'));

    expect(res.status).toBe(200);
    expect(res.body.data.notification.isRead).toBe(true);
  });
});

// ─── SUITE 5: Analytics ────────────────────────────────────────────────────────
describe('Analytics API', () => {
  it('GET /analytics/summary → 200 returns summary for SuperAdmin', async () => {
    prismaMock.request.count.mockResolvedValue(25);
    prismaMock.request.groupBy
      .mockResolvedValueOnce([
        { status: 'PENDING',   _count: { id: 10 } },
        { status: 'COMPLETED', _count: { id: 15 } },
      ])
      .mockResolvedValueOnce([
        { category: 'Road', _count: { id: 10 } },
      ]);

    const res = await asSA(supertest(app).get('/api/v1/analytics/summary'));

    // Controller: res.json({ status, data: summary }) → data IS the summary object
    expect(res.status).toBe(200);
    expect(res.body.data.totalRequests).toBe(25);
    expect(res.body.data.statusCounts.COMPLETED).toBe(15);
    expect(res.body.data.categoryCounts).toHaveLength(1);
  });

  it('GET /analytics/agents → 200 returns agent performance for SuperAdmin', async () => {
    prismaMock.user.findMany.mockResolvedValue([
      { id: 'agt1', name: 'Agent X', email: 'a@t.com', area: 'Central', _count: { assignedTasks: 7 } },
    ]);

    const res = await asSA(supertest(app).get('/api/v1/analytics/agents'));

    expect(res.status).toBe(200);
    expect(res.body.data.agents[0].completedTasks).toBe(7);
    expect(res.body.data.agents[0]).not.toHaveProperty('_count');
  });

  it('GET /analytics/summary → 403 for non-admin users', async () => {
    const res = await asUser(supertest(app).get('/api/v1/analytics/summary'));
    expect(res.status).toBe(403);
  });
});
