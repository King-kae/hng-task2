const request = require('supertest');
const app = require('../app');
const { sequelize } = require('../config/database');
const { User, Organisation } = require('../models');

let token;
let userId;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  // Register a user and get the token
  const res = await request(app)
    .post('/auth/register')
    .send({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123',
      phone: '1234567890',
    });

  token = res.body.data.accessToken;
  userId = res.body.data.userId;
});

afterAll(async () => {
  await sequelize.close();
});

describe('Auth and Organisation Endpoints', () => {
  // Auth Tests
  it('should register a new user and create an organisation', async () => {
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
    expect(res.body.data).toHaveProperty('userId');
    expect(res.body.data.firstName).toBe('Jane');

    const user = await User.findOne({ where: { email: 'jane.doe@example.com' } });
    expect(user).not.toBeNull();

    const org = await Organisation.findOne({ where: { name: "Jane's Organisation" } });
    expect(org).not.toBeNull();
  });

  it('should not register a user with an existing email', async () => {
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
  });

  it('should log in a user and return a JWT token', async () => {
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

  it('should not log in with incorrect credentials', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'john.doe@example.com',
        password: 'wrongpassword',
      });

    expect(res.statusCode).toEqual(401);
    expect(res.body.status).toBe('Bad request');
  });

  // Organisation Tests
  it('should get all organisations for the logged in user', async () => {
    const res = await request(app)
      .get('/api/organisations')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.organisations[0].name).toBe("John's Organisation");
  });

  it('should create a new organisation', async () => {
    const res = await request(app)
      .post('/api/organisations')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'New Organisation',
        description: 'A new organisation',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data.name).toBe('New Organisation');

    const org = await Organisation.findOne({ where: { name: 'New Organisation' } });
    expect(org).not.toBeNull();
  });

  it('should add a user to an organisation', async () => {
    const org = await Organisation.findOne({ where: { name: 'New Organisation' } });

    const res = await request(app)
      .post(`/api/organisations/${org.orgId}/users`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        userId: userId,
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toBe('success');

    const users = await org.getUsers();
    expect(users.length).toBe(1);
    expect(users[0].email).toBe('john.doe@example.com');
  });
});
