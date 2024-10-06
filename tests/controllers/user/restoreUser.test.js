const request = require('supertest');
const express = require('express');
const userController = require('../../../controllers/userController');
const { User } = require('../../../models');
const TokenController = require('../../../middleware/tokenController');

jest.mock('../../../models');
jest.mock('../../../middleware/tokenController');

const app = express();
app.use(express.json());
app.post('/api/user/:id', TokenController.verifyToken, userController.restoreUser);

describe('User Controller - restoreUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should restore a deleted user successfully', async () => {
    const mockUser = {
      id: 1,
      name: 'Deleted User',
      deletedAt: new Date(),
      restore: jest.fn().mockResolvedValue(true)
    };
    User.findOne.mockResolvedValue(mockUser);
    TokenController.verifyToken.mockImplementation((req, res, next) => next());

    const response = await request(app)
      .post('/api/user/1')
      .set('Authorization', 'Bearer mockToken');

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Restored Deleted User successfully.');
    expect(mockUser.restore).toHaveBeenCalled();
  });

  it('should return 404 if user is not found', async () => {
    User.findOne.mockResolvedValue(null);
    TokenController.verifyToken.mockImplementation((req, res, next) => next());

    const response = await request(app)
      .post('/api/user/999')
      .set('Authorization', 'Bearer mockToken');

    expect(response.statusCode).toBe(404);
    expect(response.body.error.message).toBe('Data not found.');
  });

  it('should return 400 if user is not deleted', async () => {
    const mockUser = {
      id: 1,
      name: 'Active User',
      deletedAt: null
    };
    User.findOne.mockResolvedValue(mockUser);
    TokenController.verifyToken.mockImplementation((req, res, next) => next());

    const response = await request(app)
      .post('/api/user/1')
      .set('Authorization', 'Bearer mockToken');

    expect(response.statusCode).toBe(400);
    expect(response.body.error.message).toBe('User is not deleted.');
  });
});