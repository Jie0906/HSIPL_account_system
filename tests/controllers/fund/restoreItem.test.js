const request = require('supertest');
const express = require('express');
const fundController = require('../../../controllers/fundController');
const { Fund } = require('../../../models');
const TokenController = require('../../../middleware/tokenController');
const { updateBalances } = require('../../../utils/balanceUtils');
const { createFundLog } = require('../../../utils/fundLogUtils');

jest.mock('../../../models');
jest.mock('../../../middleware/tokenController');
jest.mock('../../../utils/balanceUtils');
jest.mock('../../../utils/fundLogUtils');

const app = express();
app.use(express.json());
app.post('/api/fund/:id', TokenController.verifyToken, fundController.restoreItem);

describe('Fund Controller - restoreItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should restore a deleted fund item successfully', async () => {
    const mockFund = {
      id: 1,
      type: 'income',
      amount: 1000,
      userId: 1,
      restore: jest.fn().mockResolvedValue(true)
    };

    Fund.findByPk.mockResolvedValue(mockFund);
    updateBalances.mockResolvedValue({ newUserBalance: 1000, newLabBalance: 5000 });
    TokenController.verifyToken.mockImplementation((req, res, next) => next());

    const response = await request(app)
      .post('/api/fund/1')
      .set('Authorization', 'Bearer mockToken');

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Fund restored successfully');
    expect(mockFund.restore).toHaveBeenCalled();
    expect(updateBalances).toHaveBeenCalledWith(mockFund.type, mockFund.userId, mockFund.amount, 'restore', null, 0, expect.anything());
    expect(createFundLog).toHaveBeenCalledWith({
      type: mockFund.type,
      amount: mockFund.amount,
      description: 'Restored fund: 1',
      fundId: 1,
      operation: 'restore'
    }, expect.anything());
  });

  it('should return 404 if fund is not found', async () => {
    Fund.findByPk.mockResolvedValue(null);
    TokenController.verifyToken.mockImplementation((req, res, next) => next());

    const response = await request(app)
      .post('/api/fund/999')
      .set('Authorization', 'Bearer mockToken');

    expect(response.statusCode).toBe(404);
    expect(response.body.error.message).toBe('Fund not found');
  });
});