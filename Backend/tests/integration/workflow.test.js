require('dotenv').config();
jest.mock('../../src/middleware/auth.middleware', () => {
  return (req, res, next) => {
    // Determine user from mock tokens
    let id = 'cit1';
    let role = 'USER';
    if (req.headers.authorization && req.headers.authorization.includes('admin')) {
      id = 'admin1'; role = 'ADMIN';
    } else if (req.headers.authorization && req.headers.authorization.includes('agent')) {
      id = 'agt1'; role = 'AGENT';
    }
    req.user = { id, role, isActive: true, isDeleted: false };
    next();
  };
});
const request = require('supertest');
const app = require('../../src/app');
const prismaMock = require('../prisma.mock');

describe.skip('Integration Workflow: Request Lifecycle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockCitizen = { id: 'cit1', name: 'Citizen Joe', role: 'USER', email: 'c@test.com', isActive: true, isDeleted: false };
  const mockAdmin = { id: 'admin1', name: 'Admin Jill', role: 'ADMIN', email: 'a@test.com', area: 'Central', isActive: true, isDeleted: false };
  const mockAgent = { id: 'agt1', name: 'Agent Smith', role: 'AGENT', email: 'ag@test.com', area: 'Central', isActive: true, isDeleted: false };

  it('Citizen creates request, Admin assigns it, Agent completes it', async () => {
    // 1. Tokens
    const citizenToken = 'cit_token';
    const adminToken = 'admin_token';
    const agentToken = 'agent_token';

    // Mocks for Auth Middleware and internal checks
    prismaMock.user.findUnique.mockImplementation(async (query) => {
      if (query.where.id === 'cit1') return mockCitizen;
      if (query.where.id === 'admin1') return mockAdmin;
      if (query.where.id === 'agt1') return mockAgent;
      return null;
    });

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
    
    console.log('CREATE RES BODY:', createRes.body);
    expect(createRes.status).toBe(201);
    expect(createRes.body.status).toBe('success');

    // --- Admin Assigns Logic ---
    prismaMock.request.findUnique.mockImplementation(async (query) => {
      if (query.where.id === 'req1') {
        // Return updated request if it was already assigned (agent's perspective)
        if (prismaMock.request.update.mock.calls.length > 0) {
           return { ...createdRequest, status: 'ASSIGNED', agentId: mockAgent.id };
        }
        return createdRequest;
      }
      return null;
    });

    // Mocks for Admin assigned and Notification
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
