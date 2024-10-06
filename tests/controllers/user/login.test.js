const request = require('supertest');
const express = require('express');
const userController = require('../../../controllers/userController');
const { User } = require('../../../models');
const TokenController = require('../../../middleware/tokenController');
const { decrypt } = require('../../../utils/encryptPassword');
const connectRedis = require('../../../config/redisClient.config');

jest.mock('../../../models');
jest.mock('../../../middleware/tokenController');
jest.mock('../../../utils/encryptPassword');
jest.mock('../../../config/redisClient.config');

const app = express();
app.use(express.json());
app.post('/api/user/login', userController.login);

describe('User Controller - login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should login successfully', async () => {
    const mockUser = {
      id: 1,
      name: 'nameTest',
      email: 'test@example.com',
      password: 'hashedPassword',
      Roles: [{ Permissions: [{ name: 'read' }] }]
    };
    User.findOne.mockResolvedValue(mockUser);
    decrypt.mockResolvedValue(true);
    TokenController.signToken.mockResolvedValue('mockJWTToken');
    connectRedis.mockResolvedValue({ set: jest.fn() });

    const response = await request(app)
      .post('/api/user/login')
      .send({
        username: 'usernameTest',
        password: 'password123'
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toContain('Login successfully');
    expect(response.body.accessToken).toBe('mockJWTToken');
  });

  it('should return 404 if user does not exist', async () => {
    User.findOne.mockResolvedValue(null);

    const response = await request(app)
      .post('/api/user/login')
      .send({
        username: 'nonexistentuser',
        password: 'password123'
      });

    expect(response.statusCode).toBe(404);
    expect(response.body.error.message).toBe('User did not exist.');
  });

  it('should return 403 if password is incorrect', async () => {
    User.findOne.mockResolvedValue({ id: 1, name: 'Test User', password: 'hashedPassword' });
    decrypt.mockResolvedValue(false);

    const response = await request(app)
      .post('/api/user/login')
      .send({
        username: 'testuser',
        password: 'wrongpassword'
      });

    expect(response.statusCode).toBe(403);
    expect(response.body.error.message).toBe('Username or password was wrong, please try again.');
  });
});