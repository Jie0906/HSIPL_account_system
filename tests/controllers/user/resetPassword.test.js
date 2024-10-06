const request = require('supertest');
const express = require('express');
const userController = require('../../../controllers/userController');
const { User, ResetPasswordToken } = require('../../../models');
const { encrypt, decrypt } = require('../../../utils/encryptPassword');
const nodemailer = require('nodemailer');

jest.mock('../../../models');
jest.mock('../../../utils/encryptPassword');
jest.mock('nodemailer');

const app = express();
app.use(express.json());
app.put('/api/user/resetPassword', userController.resetPassword);

describe('User Controller - resetPassword', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should reset password successfully', async () => {
    const mockUser = { 
      id: 1, 
      email: 'test@example.com',
      update: jest.fn().mockResolvedValue(true)
    };
    const mockResetRequest = {
      User: mockUser,
      token: 'hashedToken',
      update: jest.fn().mockResolvedValue(true)
    };
    ResetPasswordToken.findOne.mockResolvedValue(mockResetRequest);
    decrypt.mockResolvedValue(true);
    encrypt.mockResolvedValue('newHashedPassword');

    const mockTransporter = {
      sendMail: jest.fn().mockResolvedValue(true)
    };
    nodemailer.createTransport.mockReturnValue(mockTransporter);

    const response = await request(app)
      .put('/api/user/resetPassword')
      .query({ token: 'validToken' })
      .send({ newPassword: 'newPassword123' });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Password reset successful.');
    expect(mockUser.update).toHaveBeenCalled();
    expect(mockResetRequest.update).toHaveBeenCalledWith({ used: true });
    expect(mockTransporter.sendMail).toHaveBeenCalled();
  });

  it('should return 400 if token is invalid or expired', async () => {
    ResetPasswordToken.findOne.mockResolvedValue(null);

    const response = await request(app)
      .put('/api/user/resetPassword')
      .query({ token: 'invalidToken' })
      .send({ newPassword: 'newPassword123' });

    expect(response.statusCode).toBe(400);
    expect(response.body.error.message).toBe('Password reset token is invalid or has expired.');
  });

  it('should return 400 if token does not match', async () => {
    const mockResetRequest = {
      token: 'hashedToken'
    };
    ResetPasswordToken.findOne.mockResolvedValue(mockResetRequest);
    decrypt.mockResolvedValue(false);

    const response = await request(app)
      .put('/api/user/resetPassword')
      .query({ token: 'wrongToken' })
      .send({ newPassword: 'newPassword123' });

    expect(response.statusCode).toBe(400);
    expect(response.body.error.message).toBe('Invalid token.');
  });
});