const request = require('supertest');
const express = require('express');
const fundController = require('../../../controllers/fundController');
const { Fund, User } = require('../../../models');
const TokenController = require('../../../middleware/tokenController');
const { updateBalances } = require('../../../utils/balanceUtils');
const { createFundLog } = require('../../../utils/fundLogUtils');

jest.mock('../../../models');
jest.mock('../../../middleware/tokenController');
jest.mock('../../../utils/balanceUtils');
jest.mock('../../../utils/fundLogUtils');

const app = express();
app.use(express.json());
app.put('/api/fund/:id', TokenController.verifyToken, fundController.updateItem);

describe('Fund Controller - updateItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update a fund item successfully', async () => {
    const mockFund = {
      id: 1,
      type: 'income',
      amount: 1000,
      purchaseDate: '2023-01-01',
      description: 'Test income',
      userId: 1,
      update: jest.fn().mockResolvedValue(true)
    };

    const mockUser = { id: 1, name: 'Test User' };
    const mockRecorder = { id: 2, name: 'Recorder' };

    Fund.findByPk.mockResolvedValue(mockFund);
    User.findByPk.mockResolvedValue(mockUser);
    User.findOne.mockResolvedValue(mockRecorder);
    updateBalances.mockResolvedValue({ newUserBalance: 2000, newLabBalance: 6000 });
    TokenController.verifyToken.mockImplementation((req, res, next) => {
      req.user = { payload: { name: 'Recorder' } };
      next();
    });

    const response = await request(app)
      .put('/api/fund/1')
      .send({
        type: 'income',
        amount: 2000,
        purchaseDate: '2023-01-02',
        description: 'Updated test income',
        userId: 1
      })
      .set('Authorization', 'Bearer mockToken');

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Fund updated successfully');
    expect(mockFund.update).toHaveBeenCalled();
    expect(updateBalances).toHaveBeenCalled();
    expect(createFundLog).toHaveBeenCalled();
  });

  it('should return 404 if fund is not found', async () => {
    Fund.findByPk.mockResolvedValue(null);
    TokenController.verifyToken.mockImplementation((req, res, next) => next());

    const response = await request(app)
      .put('/api/fund/999')
      .send({
        type: 'income',
        amount: 2000,
        purchaseDate: '2023-01-02',
        description: 'Updated test income',
        userId: 1
      })
      .set('Authorization', 'Bearer mockToken');

    expect(response.statusCode).toBe(404);
    expect(response.body.error.message).toBe('Fund not found');
  });
});