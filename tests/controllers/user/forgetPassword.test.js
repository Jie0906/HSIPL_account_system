const request = require('supertest');
const express = require('express');
const userController = require('../../../controllers/userController');
const { User, ResetPasswordToken } = require('../../../models');
const { encrypt } = require('../../../utils/encryptPassword');
const nodemailer = require('nodemailer');

jest.mock('../../../models');
jest.mock('../../../utils/encryptPassword');
jest.mock('nodemailer');

const app = express();
app.use(express.json());
app.post('/api/user/forgetPassword', userController.forgetPassword);

describe('User Controller - forgetPassword', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send reset password email successfully', async () => {
    const mockUser = { id: 1, email: 'test@example.com' };
    User.findOne.mockResolvedValue(mockUser);
    encrypt.mockResolvedValue('hashedToken');
    ResetPasswordToken.create.mockResolvedValue({});
    
    const mockTransporter = {
      sendMail: jest.fn().mockResolvedValue(true)
    };
    nodemailer.createTransport.mockReturnValue(mockTransporter);

    const response = await request(app)
      .post('/api/user/forgetPassword')
      .send({ email: 'test@example.com' });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Password reset email sent successfully.');
    expect(mockTransporter.sendMail).toHaveBeenCalled();
  });

  it('should return 404 if user is not found', async () => {
    User.findOne.mockResolvedValue(null);

    const response = await request(app)
      .post('/api/user/forgetPassword')
      .send({ email: 'nonexistent@example.com' });

    expect(response.statusCode).toBe(404);
    expect(response.body.error.message).toBe('Data not found.');
  });
});