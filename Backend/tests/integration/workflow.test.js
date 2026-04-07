const request = require('supertest');
const app = require('../../src/app');
const prismaMock = require('../prisma.mock');
const jwt = require('jsonwebtoken');

describe('Integration Workflow: Request Lifecycle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockCitizen = { id: 'cit1', name: 'Citizen Joe', role: 'USER', email: 'c@test.com', isActive: true, isDeleted: false };
  const mockAdmin = { id: 'admin1', name: 'Admin Jill', role: 'ADMIN', email: 'a@test.com', area: 'Central', isActive: true, isDeleted: false };
  const mockAgent = { id: 'agt1', name: 'Agent Smith', role: 'AGENT', email: 'ag@test.com', area: 'Central', isActive: true, isDeleted: false };

  it('Citizen creates request, Admin assigns it, Agent completes it', async () => {
    // 1. Authenticate (Mock the middleware DB query & generate tokens)
    const citizenToken = jwt.sign({ id: mockCitizen.id, role: mockCitizen.role }, process.env.JWT_SECRET || 'secret');
    const adminToken = jwt.sign({ id: mockAdmin.id, role: mockAdmin.role }, process.env.JWT_SECRET || 'secret');
    const agentToken = jwt.sign({ id: mockAgent.id, role: mockAgent.role }, process.env.JWT_SECRET || 'secret');

    // Mocks for Auth Middleware inside app.js
    prismaMock.user.findUnique.mockResolvedValueOnce(mockCitizen) // Citizen requests logic
      .mockResolvedValueOnce(mockAdmin) // Admin assign logic
      .mockResolvedValueOnce(mockAgent); // Agent complete logic

    // --- Create Request Details ---
    const createdRequest = {
      id: 'req1',
      title: 'Pothole',
      description: 'Big hole',
      category: 'Road',
      status: 'PENDING',
      citizenId: mockCitizen.id,
      mediaUrls: [],
      latitude: 10,
      longitude: 20
    };

    prismaMock.request.create.mockResolvedValueOnce(createdRequest);

    // [ACTION 1] Citizen creates request
    const createRes = await request(app)
      .post('/api/v1/requests')
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({ title: 'Pothole', description: 'Big hole', category: 'Road', latitude: 10, longitude: 20 });
    
    expect(createRes.status).toBe(201);
    expect(createRes.body.status).toBe('success');

    // --- Admin Assigns Logic ---
    prismaMock.request.findUnique.mockResolvedValueOnce(createdRequest); // Admin checking request exists
    prismaMock.user.findUnique.mockResolvedValueOnce(mockAgent); // Admin checking agent exists
    prismaMock.request.update.mockResolvedValueOnce({ ...createdRequest, status: 'ASSIGNED', agentId: mockAgent.id });
    prismaMock.notification.create.mockResolvedValueOnce({ id: 'notif1' }); // Notification mock return

    // [ACTION 2] Admin Assigns request
    const assignRes = await request(app)
      .patch('/api/v1/requests/req1/assign')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ agentId: mockAgent.id });
    
    expect(assignRes.status).toBe(200);
    expect(assignRes.body.data.request.status).toBe('ASSIGNED');

    // --- Agent Completes Logic ---
    const assignedRequest = { ...createdRequest, status: 'ASSIGNED', agentId: mockAgent.id };
    prismaMock.request.update.mockResolvedValueOnce({ ...assignedRequest, status: 'COMPLETED' });
    prismaMock.notification.create.mockResolvedValueOnce({ id: 'notif2' }); // Citizen notification

    // [ACTION 3] Agent completes task
    const completeRes = await request(app)
      .patch('/api/v1/agent/tasks/req1/complete')
      .set('Authorization', `Bearer ${agentToken}`)
      .send({ completionProofUrl: 'http://example.com/proof.jpg' });

    expect(completeRes.status).toBe(200);
    expect(completeRes.body.data.task.status).toBe('COMPLETED');
  });
});
