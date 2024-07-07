

const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

// Mock the database operations
const mockUserService = {
  registerUser: jest.fn(),
  loginUser: jest.fn(),
  getUserById: jest.fn(),
  getUserOrganisations: jest.fn(),
  createOrganisation: jest.fn(),
  getOrganisationById: jest.fn(),
  addUserToOrganisation: jest.fn(),
};

// Create an express server for testing
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

// Auth Routes
app.post('/auth/register', async (req, res) => {
  try {
    const user = await mockUserService.registerUser(req.body);
    const token = jwt.sign({ userId: user.userId, email: user.email }, 'secret', { expiresIn: '1h' });
    res.status(201).json({
      status: 'success',
      message: 'Registration successful',
      data: { accessToken: token, user },
    });
  } catch (error) {
    res.status(422).json({
      status: 'Bad request',
      message: 'Registration unsuccessful',
      statusCode: 422,
    });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const user = await mockUserService.loginUser(req.body);
    const token = jwt.sign({ userId: user.userId, email: user.email }, 'secret', { expiresIn: '1h' });
    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: { accessToken: token, user },
    });
  } catch (error) {
    res.status(401).json({
      status: 'Bad request',
      message: 'Authentication failed',
      statusCode: 401,
    });
  }
});

// API Routes
app.get('/api/users/:id', authMiddleware, async (req, res) => {
  try {
    const user = await mockUserService.getUserById(req.params.id);
    res.status(200).json({
      status: 'success',
      message: 'User retrieved successfully',
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      status: 'Bad request',
      message: 'User retrieval unsuccessful',
      statusCode: 400,
    });
  }
});

app.get('/api/organisations', authMiddleware, async (req, res) => {
  try {
    const organisations = await mockUserService.getUserOrganisations(req.user.userId);
    res.status(200).json({
      status: 'success',
      message: 'Organisations retrieved successfully',
      data: { organisations },
    });
  } catch (error) {
    res.status(400).json({
      status: 'Bad request',
      message: 'Organisation retrieval unsuccessful',
      statusCode: 400,
    });
  }
});

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

app.post('/api/organisations', authMiddleware, async (req, res) => {
  try {
    const organisation = await mockUserService.createOrganisation(req.body);
    res.status(201).json({
      status: 'success',
      message: 'Organisation created successfully',
      data: organisation,
    });
  } catch (error) {
    res.status(400).json({
      status: 'Bad request',
      message: 'Organisation creation unsuccessful',
      statusCode: 400,
    });
  }
});

app.post('/api/organisations/:orgId/users', authMiddleware, async (req, res) => {
  try {
    await mockUserService.addUserToOrganisation(req.params.orgId, req.body.userId);
    res.status(200).json({
      status: 'success',
      message: 'User added to organisation successfully',
    });
  } catch (error) {
    res.status(400).json({
      status: 'Bad request',
      message: 'User addition unsuccessful',
      statusCode: 400,
    });
  }
});
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

describe('Auth and Organisation Endpoints', () => {
  let token;

  beforeAll(() => {
    // Create a JWT token for authentication
    token = jwt.sign({ userId: '1', email: 'john.doe@example.com' }, 'secret', { expiresIn: '1h' });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Auth Tests
  it('should register a new user and create an organisation', async () => {
    const newUser = {
      userId: '2',
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@example.com',
      phone: '0987654321',
    };
    mockUserService.registerUser.mockResolvedValue(newUser);

    const res = await request(app)
      .post('/auth/register')
      .send({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        password: 'password123',
        phone: '0987654321',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data.user).toHaveProperty('userId');
    expect(res.body.data.user.firstName).toBe('Jane');
  });

  
  it('should log in a user and return a JWT token', async () => {
    const existingUser = {
      userId: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '1234567890',
    };
    mockUserService.loginUser.mockResolvedValue(existingUser);

    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'john.doe@example.com',
        password: 'password123',
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data).toHaveProperty('accessToken');
  });

  // User Tests
  it('should get user details for a logged-in user', async () => {
    const user = {
      userId: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '1234567890',
    };
    mockUserService.getUserById.mockResolvedValue(user);

    const res = await request(app)
      .get('/api/users/1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data).toEqual(user);
    expect(mockUserService.getUserById).toHaveBeenCalledTimes(1);
  });

  it('should not get user details without authentication', async () => {
    const res = await request(app)
      .get('/api/users/1');

    expect(res.statusCode).toEqual(401);
    expect(res.body.status).toBe('Unauthorized');
  });

  // Organisation Tests
  it('should get all organisations for the logged-in user', async () => {
    const organisations = [{
      orgId: '1',
      name: "John's Organisation",
      description: 'A default organisation',
    }];
    mockUserService.getUserOrganisations.mockResolvedValue(organisations);

    const res = await request(app)
      .get('/api/organisations')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.organisations).toEqual(organisations);
    expect(mockUserService.getUserOrganisations).toHaveBeenCalledTimes(1);
  });

  it('should create a new organisation', async () => {
    const newOrganisation = {
      orgId: '2',
      name: "Jane's Organisation",
      description: 'Another organisation',
    };
    mockUserService.createOrganisation.mockResolvedValue(newOrganisation);

    const res = await request(app)
      .post('/api/organisations')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: "Jane's Organisation",
        description: 'Another organisation',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data).toEqual(newOrganisation);
    expect(mockUserService.createOrganisation).toHaveBeenCalledTimes(1);
  });

  it('should add a user to an organisation', async () => {
    mockUserService.addUserToOrganisation.mockResolvedValue(true);

    const res = await request(app)
      .post('/api/organisations/1/users')
      .set('Authorization', `Bearer ${token}`)
      .send({
        userId: '2',
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toBe('success');
    expect(res.body.message).toBe('User added to organisation successfully');
    expect(mockUserService.addUserToOrganisation).toHaveBeenCalledTimes(1);
  });
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
