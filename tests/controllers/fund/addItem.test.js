const request = require('supertest');
const express = require('express');
const fundController = require('../../../controllers/fundController');
const { User, Fund } = require('../../../models');
const TokenController = require('../../../middleware/tokenController');
const { updateBalances } = require('../../../utils/balanceUtils');
const { createFundLog } = require('../../../utils/fundLogUtils');

jest.mock('../../../models');
jest.mock('../../../middleware/tokenController');
jest.mock('../../../utils/balanceUtils');
jest.mock('../../../utils/fundLogUtils');

const app = express();
app.use(express.json());
app.post('/api/fund', TokenController.verifyToken, fundController.addItem);

describe('Fund Controller - addItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should add a new fund item successfully', async () => {
    const mockUser = { id: 1, name: 'Test User' };
    const mockRecorder = { id: 2, name: 'Recorder' };
    const mockFund = { id: 1, type: 'income', amount: 1000 };

    User.findByPk.mockResolvedValue(mockUser);
    User.findOne.mockResolvedValue(mockRecorder);
    Fund.create.mockResolvedValue(mockFund);
    updateBalances.mockResolvedValue({ newUserBalance: 1000, newLabBalance: 5000 });
    TokenController.verifyToken.mockImplementation((req, res, next) => {
      req.user = { payload: { name: 'Recorder' } };
      next();
    });

    const response = await request(app)
      .post('/api/fund')
      .send({
        type: 'income',
        amount: 1000,
        purchaseDate: '2023-01-01',
        description: 'Test income',
        userId: 1
      })
      .set('Authorization', 'Bearer mockToken');

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe('Added new item successfully.');
    expect(response.body.item).toEqual(mockFund);
    expect(response.body.newUserBalance).toBe(1000);
    expect(response.body.newLabBalance).toBe(5000);
    expect(createFundLog).toHaveBeenCalled();
  });

  it('should return 400 if required fields are missing', async () => {
    const response = await request(app)
      .post('/api/fund')
      .send({
        type: 'income',
        amount: 1000
      })
      .set('Authorization', 'Bearer mockToken');

    expect(response.statusCode).toBe(400);
    expect(response.body.error.message).toBe('Field cannot be empty.');
  });

  it('should return 404 if user is not found', async () => {
    User.findByPk.mockResolvedValue(null);

    const response = await request(app)
      .post('/api/fund')
      .send({
        type: 'income',
        amount: 1000,
        purchaseDate: '2023-01-01',
        description: 'Test income',
        userId: 999
      })
      .set('Authorization', 'Bearer mockToken');

    expect(response.statusCode).toBe(404);
    expect(response.body.error.message).toBe('UserId not found.');
  });
});