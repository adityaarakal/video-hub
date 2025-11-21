const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('../../src/routes/auth');
const Database = require('../../src/utils/database');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

describe('Auth Routes', () => {
  let app;
  const testDataDir = path.join(__dirname, '../../data');
  const testFilePath = path.join(testDataDir, 'users.json');

  beforeAll(() => {
    app = express();
    app.use(bodyParser.json());
    app.use('/api/auth', authRoutes);
    
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
    }
  });

  beforeEach(async () => {
    // Initialize test database with clean data
    const hashedPassword = await bcrypt.hash('password123', 10);
    const testData = {
      users: [
        {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          password: hashedPassword,
          avatar: 'T',
          createdAt: '2024-01-01T00:00:00.000Z'
        }
      ],
      nextId: 2
    };
    fs.writeFileSync(testFilePath, JSON.stringify(testData));
  });

  afterEach(() => {
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  });

  describe('POST /api/auth/register', () => {
    test('should register new user with valid data', async () => {
      const newUser = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'Password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('username', 'newuser');
      expect(response.body.user).toHaveProperty('email', 'newuser@example.com');
      expect(response.body.user).not.toHaveProperty('password');
    });

    test('should return 400 for missing fields', async () => {
      const invalidUser = {
        username: 'newuser'
        // Missing email and password
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUser)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('should return 400 for invalid email', async () => {
      const invalidUser = {
        username: 'newuser',
        email: 'invalid-email',
        password: 'Password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUser)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('should return 400 for weak password', async () => {
      const invalidUser = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'weak' // Too short, no uppercase/number
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUser)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('should return 400 for duplicate user', async () => {
      const duplicateUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(duplicateUser)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    test('should login with valid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe('test@example.com');
    });

    test('should return 401 for invalid email', async () => {
      const credentials = {
        email: 'wrong@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    test('should return 401 for invalid password', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    test('should return 400 for missing fields', async () => {
      const credentials = {
        email: 'test@example.com'
        // Missing password
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });
});

