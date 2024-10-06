const request = require('supertest');
const express = require('express');
const userController = require('../../../controllers/userController');
const { User, Role, UserRole } = require('../../../models');
const { encrypt } = require('../../../utils/encryptPassword');

jest.mock('../../../models');
jest.mock('../../../utils/encryptPassword');

const app = express();
app.use(express.json());
app.post('/api/user/signUp', userController.createUser);

describe('User Controller - createUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new user successfully', async () => {
    User.findOne.mockResolvedValue(null);
    Role.findOne.mockResolvedValue({ id: 1, name: 'normalUser' });
    User.create.mockResolvedValue({ id: 1, name: 'Test User' });
    UserRole.create.mockResolvedValue({});
    encrypt.mockResolvedValue('hashedPassword');

    const response = await request(app)
      .post('/api/user/signUp')
      .send({
        name: 'nameTest',
        username: 'usernameTest',
        password: 'password',
        email: 'test@example.com'
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toContain('Created User Test User sucessfully');
  });

  it('should return 400 if required fields are missing', async () => {
    const response = await request(app)
      .post('/api/user/signUp')
      .send({
        name: 'nameTest',
        username: 'usernameTest'
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.error.message).toBe('Field cannot be empty.');
  });

  it('should return 409 if user already exists', async () => {
    User.findOne.mockResolvedValue({ id: 1, name: 'Existing User' });

    const response = await request(app)
      .post('/api/user/signUp')
      .send({
        name: 'nameTest',
        username: 'usernameTest',
        password: 'password',
        email: 'test@example.com'
      });

    expect(response.statusCode).toBe(409);
    expect(response.body.error.message).toBe('User already exist.');
  });
});