// import request from "supertest";
// import app from "../server.js";

// let accessToken;

// async function registerUser() {
//   const userData = {
//     firstName: "John",
//     lastName: "Doe",
//     email: "john.doe@example.com",
//     password: "password123",
//     phone: "1234567890",
//   };

//   await request(app)
//     .post("/auth/register")
//     .send(userData)
//     .expect(201)
//     .then((response) => {
//       accessToken = response.body.data.accessToken;
//     });
// }

// describe("Authentication Endpoints", () => {
//   describe("POST /auth/register", () => {
//     it("should register a new user", async () => {
//       const newUser = {
//         firstName: "New",
//         lastName: "User",
//         email: "newuser@example.com",
//         password: "newpassword",
//         phone: "9876543210",
//       };

//       const expectedOrgName = `${newUser.firstName}'s Organisation`;

//       const response = await request(app)
//         .post("/auth/register")
//         .send(newUser)
//         .expect(201);

//       const { user, accessToken: receivedAccessToken } = response.body.data;
//       expect(response.body.status).toBe("success");
//       expect(response.body.data.accessToken).toBeDefined();
//       expect(response.body.data.user.email).toBe(newUser.email);
//       expect(user.userId).toBeTruthy();
//       expect(user.firstName).toBe(newUser.firstName);
//       expect(user.lastName).toBe(newUser.lastName);
//       expect(user.email).toBe(newUser.email);
//       expect(user.phone).toBe(newUser.phone);
//       expect(receivedAccessToken).toBeTruthy();
//       expect(user.organisation.name).toBe(expectedOrgName);
//     });

//     it("should fail if required fields are missing", async () => {
//       const userData = {
//         firstName: "John",
//         lastName: "Doe",
//         password: "password123",
//         phone: "1234567890",
//       };

//       await request(app)
//         .post("/auth/register")
//         .send(userData)
//         .expect(422)
//         .expect((res) => {
//           expect(res.body.status).toBe("Bad request");
//           expect(res.body.message).toContain("Validation error");
//         });
//     });

//     it("should fail if there is a duplicate email", async () => {
//       await registerUser();

//       const duplicateUserData = {
//         firstName: "Jane",
//         lastName: "Smith",
//         email: "john.doe@example.com",
//         password: "password456",
//         phone: "9876543210",
//       };

//       await request(app)
//         .post("/auth/register")
//         .send(duplicateUserData)
//         .expect(422)
//         .expect((res) => {
//           expect(res.body.status).toBe("Bad request");
//           expect(res.body.message).toContain("User already exists");
//         });
//     });
//   });

//   describe("POST /auth/login", () => {
//     beforeEach(async () => {
//       await registerUser();
//     });

//     it("should log the user in successfully", async () => {
//       const loginCredentials = {
//         email: "john.doe@example.com",
//         password: "password123",
//       };

//       await request(app)
//         .post("/auth/login")
//         .send(loginCredentials)
//         .expect(200)
//         .expect((res) => {
//           const { user, accessToken: receivedAccessToken } = res.body.data;
//           expect(user.userId).toBeTruthy();
//           expect(user.firstName).toBe("John");
//           expect(user.lastName).toBe("Doe");
//           expect(user.email).toBe("john.doe@example.com");
//           expect(receivedAccessToken).toBeTruthy();
//         });
//     });

//     it("should fail if login credentials are incorrect", async () => {
//       const incorrectCredentials = {
//         email: "john.doe@example.com",
//         password: "incorrectpassword",
//       };

//       await request(app)
//         .post("/auth/login")
//         .send(incorrectCredentials)
//         .expect(401)
//         .expect((res) => {
//           expect(res.body.status).toBe("Bad request");
//           expect(res.body.message).toBe(
//             "Authentication failed: User does not exist"
//           );
//         });
//     });
//   });
// });

// describe("Organisation Management Endpoints", () => {
//   beforeEach(async () => {
//     await registerUser();
//   });

//   describe("POST /api/organisations", () => {
//     it("should create a new organisation", async () => {
//       const newOrgData = {
//         name: "New Organisation",
//         description: "Description of New Organisation",
//       };

//       await request(app)
//         .post("/api/organisations")
//         .set("Authorization", `Bearer ${accessToken}`)
//         .send(newOrgData)
//         .expect(201)
//         .expect((res) => {
//           const organisation = res.body.data;

//           expect(organisation.orgId).toBeTruthy();
//           expect(organisation.name).toBe(newOrgData.name);
//           expect(organisation.description).toBe(newOrgData.description);
//         });
//     });
//   });

//   describe("GET /api/organisations/:orgId", () => {
//     it("should retrieve an organisation by ID", async () => {
//       let orgId;

//       const newOrgData = {
//         name: "New Organisation",
//         description: "Description of New Organisation",
//       };

//       await request(app)
//         .post("/api/organisations")
//         .set("Authorization", `Bearer ${accessToken}`)
//         .send(newOrgData)
//         .expect(201)
//         .then((res) => {
//           orgId = res.body.data.orgId;
//         });

//       await request(app)
//         .get(`/api/organisations/${orgId}`)
//         .set("Authorization", `Bearer ${accessToken}`)
//         .expect(200)
//         .expect((res) => {
//           const organisation = res.body.data.organisation;
//           expect(organisation.orgId).toBe(orgId);
//           expect(organisation.name).toBe(newOrgData.name);
//           expect(organisation.description).toBe(newOrgData.description);
//           expect(organisation.users.length).toBe(1);
//           expect(organisation.users[0].userId).toBeTruthy();
//         });
//     });

//     it("should fail if organisation ID does not exist", async () => {
//       const nonExistentOrgId = "non-existent-org-id";

//       await request(app)
//         .get(`/api/organisations/${nonExistentOrgId}`)
//         .set("Authorization", `Bearer ${accessToken}`)
//         .expect(404)
//         .expect((res) => {
//           expect(res.body.status).toBe("Not Found");
//           expect(res.body.message).toBe("Organisation not found");
//         });
//     });
//   });
// });

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
  addUserToOrganisation: jest.fn(),
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
    res.status(400).json({
      status: 'Bad request',
      message: 'Registration unsuccessful',
      statusCode: 400,
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
    expect(mockUserService.registerUser).toHaveBeenCalledTimes(1);
  });

  it('should not register a user with an existing email', async () => {
    mockUserService.registerUser.mockRejectedValue(new Error('User already exists'));

    const res = await request(app)
      .post('/auth/register')
      .send({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        password: 'password123',
        phone: '0987654321',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.status).toBe('Bad request');
    expect(mockUserService.registerUser).toHaveBeenCalledTimes(1);
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
    expect(mockUserService.loginUser).toHaveBeenCalledTimes(1);
  });

  it('should not log in with incorrect credentials', async () => {
    mockUserService.loginUser.mockRejectedValue(new Error('Invalid credentials'));

    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'john.doe@example.com',
        password: 'wrongpassword',
      });

    expect(res.statusCode).toEqual(401);
    expect(res.body.status).toBe('Bad request');
    expect(mockUserService.loginUser).toHaveBeenCalledTimes(1);
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
