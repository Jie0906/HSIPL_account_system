const request = require('supertest');
const express = require('express');
const userController = require('../../../controllers/userController');
const { User } = require('../../../models');
const TokenController = require('../../../middleware/tokenController');

jest.mock('../../../models');
jest.mock('../../../middleware/tokenController');

const app = express();
app.use(express.json());
app.delete('/api/user/:id', TokenController.verifyToken, userController.deleteUser);

describe('User Controller - deleteUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete user successfully', async () => {
    const mockUser = {
      id: 1,
      name: 'Test User',
      balance: 0,
      destroy: jest.fn().mockResolvedValue(true)
    };
    User.findOne.mockResolvedValue(mockUser);
    TokenController.verifyToken.mockImplementation((req, res, next) => next());

    const response = await request(app)
      .delete('/api/user/1')
      .set('Authorization', 'Bearer mockToken');

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Soft deleted Test User Sucessfully.');
    expect(mockUser.destroy).toHaveBeenCalled();
  });

  it('should return 409 if user balance is not 0', async () => {
    const mockUser = {
      id: 1,
      name: 'Test User',
      balance: 100
    };
    User.findOne.mockResolvedValue(mockUser);
    TokenController.verifyToken.mockImplementation((req, res, next) => next());

    const response = await request(app)
      .delete('/api/user/1')
      .set('Authorization', 'Bearer mockToken');

    expect(response.statusCode).toBe(409);
    expect(response.body.error.message).toBe('Balance should be 0.');
  });

  it('should return 404 if user is not found', async () => {
    User.findOne.mockResolvedValue(null);
    TokenController.verifyToken.mockImplementation((req, res, next) => next());

    const response = await request(app)
      .delete('/api/user/999')
      .set('Authorization', 'Bearer mockToken');

    expect(response.statusCode).toBe(404);
    expect(response.body.error.message).toBe('Data not found.');
  });
});