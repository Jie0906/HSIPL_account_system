const request = require('supertest');
const express = require('express');
const userController = require('../../../controllers/userController');
const TokenController = require('../../../middleware/tokenController');
const connectRedis = require('../../../config/redisClient.config');

jest.mock('../../../middleware/tokenController');
jest.mock('../../../config/redisClient.config');

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  req.cookies = {};
  next();
});
app.post('/api/user/logout', userController.logout);

describe('User Controller - logout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should logout successfully', async () => {
    const mockToken = 'mockJWTToken';
    const mockDecodedToken = {
      payload: {
        email: 'test@example.com'
      }
    };
    
    TokenController.verifyToken.mockResolvedValue(mockDecodedToken);
    
    const mockRedisClient = {
      del: jest.fn().mockResolvedValue(true)
    };
    connectRedis.mockResolvedValue(mockRedisClient);

    const response = await request(app)
      .post('/api/user/logout')
      .set('Cookie', [`jsonWebToken=${mockToken}`]);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Logged out successfully.');
    expect(mockRedisClient.del).toHaveBeenCalledWith('user:test@example.com:permissions');
    expect(response.headers['set-cookie'][0]).toMatch(/jsonWebToken=;/);
  });

  it('should return 400 if no active session found', async () => {
    const response = await request(app)
      .post('/api/user/logout');

    expect(response.statusCode).toBe(400);
    expect(response.body.error.message).toBe('No active session found.');
  });

  it('should handle token verification errors', async () => {
    const mockToken = 'invalidToken';
    TokenController.verifyToken.mockRejectedValue(new Error('Invalid token'));

    const response = await request(app)
      .post('/api/user/logout')
      .set('Cookie', [`jsonWebToken=${mockToken}`]);

    expect(response.statusCode).toBe(500);
    expect(response.body.error.message).toBe('Invalid token');
  });

  it('should handle Redis errors', async () => {
    const mockToken = 'mockJWTToken';
    const mockDecodedToken = {
      payload: {
        email: 'test@example.com'
      }
    };
    
    TokenController.verifyToken.mockResolvedValue(mockDecodedToken);
    
    const mockRedisClient = {
      del: jest.fn().mockRejectedValue(new Error('Redis error'))
    };
    connectRedis.mockResolvedValue(mockRedisClient);

    const response = await request(app)
      .post('/api/user/logout')
      .set('Cookie', [`jsonWebToken=${mockToken}`]);

    expect(response.statusCode).toBe(500);
    expect(response.body.error.message).toBe('Redis error');
  });
});