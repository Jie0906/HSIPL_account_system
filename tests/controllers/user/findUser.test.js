const request = require('supertest');
const express = require('express');
const userController = require('../../../controllers/userController');
const { User } = require('../../../models');
const TokenController = require('../../../middleware/tokenController');

jest.mock('../../../models');
jest.mock('../../../middleware/tokenController');

const app = express();
app.use(express.json());
app.get('/api/user/find', TokenController.verifyToken, userController.findUser);

describe('User Controller - findUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should find user successfully', async () => {
    const mockUser = {
      name: 'Test User',
      email: 'test@example.com',
      studentId: '12345',
      phoneNumber: '1234567890'
    };
    User.findOne.mockResolvedValue(mockUser);
    TokenController.verifyToken.mockImplementation((req, res, next) => next());

    const response = await request(app)
      .get('/api/user/find?name=Test User')
      .set('Authorization', 'Bearer mockToken');

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(mockUser);
  });

  it('should return 404 if user is not found', async () => {
    User.findOne.mockResolvedValue(null);
    TokenController.verifyToken.mockImplementation((req, res, next) => next());

    const response = await request(app)
      .get('/api/user/find?name=Nonexistent User')
      .set('Authorization', 'Bearer mockToken');

    expect(response.statusCode).toBe(404);
    expect(response.body.error.message).toBe('Data not found.');
  });
});