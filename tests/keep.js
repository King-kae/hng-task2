
const jwt = require('jsonwebtoken');

describe('Token Generation', () => {
  it('should generate a token with correct user details and expiration', () => {
    const user = {
      userId: '1',
      email: 'john.doe@example.com',
    };
    const token = jwt.sign(user, 'secret', { expiresIn: '1h' });
    const decodedToken = jwt.verify(token, 'secret');

    expect(decodedToken.userId).toBe(user.userId);
    expect(decodedToken.email).toBe(user.email);
    expect(decodedToken.exp).toBeGreaterThan(decodedToken.iat); // Ensure token has an expiration
    const expirationTime = decodedToken.exp - decodedToken.iat;
    expect(expirationTime).toBe(3600); // Token should expire in 1 hour (3600 seconds)
  });

  it('should fail verification for expired tokens', () => {
    const user = {
      userId: '1',
      email: 'john.doe@example.com',
    };
    const token = jwt.sign(user, 'secret', { expiresIn: '1s' });
    
    // Wait for the token to expire
    setTimeout(() => {
      expect(() => jwt.verify(token, 'secret')).toThrow(jwt.JsonWebTokenError);
    }, 2000);
  });
});

const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

// Mock the database operations
const mockUserService = {
  getUserOrganisations: jest.fn(),
  getOrganisationById: jest.fn(),
};

// Create an express app for testing
const app = express();
app.use(bodyParser.json());

// Middleware for protected routes
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      status: 'Unauthorized',
      message: 'Authentication required',
      statusCode: 401,
    });
  }
  try {
    req.user = jwt.verify(token, 'secret');
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'Unauthorized',
      message: 'Invalid token',
      statusCode: 401,
    });
  }
};

// API Routes
app.get('/api/organisations/:orgId', authMiddleware, async (req, res) => {
  try {
    const organisation = await mockUserService.getOrganisationById(req.params.orgId);
    if (organisation.users.includes(req.user.userId)) {
      res.status(200).json({
        status: 'success',
        message: 'Organisation retrieved successfully',
        data: organisation,
      });
    } else {
      res.status(403).json({
        status: 'Forbidden',
        message: 'Access denied',
        statusCode: 403,
      });
    }
  } catch (error) {
    res.status(400).json({
      status: 'Bad request',
      message: 'Organisation retrieval unsuccessful',
      statusCode: 400,
    });
  }
});

describe('Organisation Access Control', () => {
  let token;

  beforeAll(() => {
    // Create a JWT token for authentication
    token = jwt.sign({ userId: '1', email: 'john.doe@example.com' }, 'secret', { expiresIn: '1h' });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should allow access to an organisation the user belongs to', async () => {
    const organisation = {
      orgId: '1',
      name: "John's Organisation",
      description: 'A default organisation',
      users: ['1', '2'],
    };
    mockUserService.getOrganisationById.mockResolvedValue(organisation);

    const res = await request(app)
      .get('/api/organisations/1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data).toEqual(organisation);
    expect(mockUserService.getOrganisationById).toHaveBeenCalledTimes(1);
  });

  it('should deny access to an organisation the user does not belong to', async () => {
    const organisation = {
      orgId: '2',
      name: "Jane's Organisation",
      description: 'Another organisation',
      users: ['2', '3'],
    };
    mockUserService.getOrganisationById.mockResolvedValue(organisation);

    const res = await request(app)
      .get('/api/organisations/2')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(403);
    expect(res.body.status).toBe('Forbidden');
    expect(res.body.message).toBe('Access denied');
    expect(mockUserService.getOrganisationById).toHaveBeenCalledTimes(1);
  });
});