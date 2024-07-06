const request = require('supertest');
const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');
const User = require('../models/userModel.js');
const Organisation = require('../models/orgModel.js');
const app = require('../server.js');

describe('Auth Endpoints', () => {
  beforeAll(async () => {
    await User.deleteMany({});
    await Organisation.deleteMany({});
  });

  describe('POST /auth/register', () => {
    it('should register user successfully with default organisation', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'password123',
          phone: '1234567890'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('status', 'success');
      expect(res.body.data.user).toMatchObject({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '1234567890'
      });
      expect(res.body.data).toHaveProperty('accessToken');
    });

    it('should fail if required fields are missing', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(422);
      expect(res.body.errors).toBeInstanceOf(Array);
    });

    it('should fail if there is duplicate email', async () => {
      const res1 = await request(app)
        .post('/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'password123',
          phone: '1234567890'
        });

      expect(res1.status).toBe(201);

      const res2 = await request(app)
        .post('/auth/register')
        .send({
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'password456',
          phone: '0987654321'
        });

      expect(res2.status).toBe(422);
      expect(res2.body.errors).toBeInstanceOf(Array);
    });
  });

  describe('POST /auth/login', () => {
    it('should log the user in successfully', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'john@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'success');
      expect(res.body.data).toHaveProperty('accessToken');
    });

    it('should fail if credentials are invalid', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'john@example.com',
          password: 'wrongpassword'
        });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message', 'Authentication failed');
    });
  });
});

describe('Token Generation', () => {
  it('should contain correct user details and expire at the correct time', () => {
    const token = jwt.sign({ userId: 'testUserId', email: 'test@example.com' }, 'your_jwt_secret', { expiresIn: '1h' });
    const decoded = jwt.verify(token, 'your_jwt_secret');

    expect(decoded).toHaveProperty('userId', 'testUserId');
    expect(decoded).toHaveProperty('email', 'test@example.com');
    expect(decoded.exp).toBeDefined();
  });
});
