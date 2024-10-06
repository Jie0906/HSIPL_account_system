const request = require('supertest');
const express = require('express');
const fundController = require('../../../controllers/fundController');
const { Fund, User } = require('../../../models');
const TokenController = require('../../../middleware/tokenController');

jest.mock('../../../models');
jest.mock('../../../middleware/tokenController');

const app = express();
app.use(express.json());
app.get('/api/fund/:id', TokenController.verifyToken, fundController.getItemById);

describe('Fund Controller - getItemById', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get a fund item by id successfully', async () => {
    const mockFund = {
      id: 1,
      type: 'income',
      amount: 1000,
      purchaseDate: '2023-01-01',
      description: 'Test income',
      Purchaser: { id: 1, name: 'Test User' },
      Recorder: { id: 2, name: 'Recorder' }
    };

    Fund.findByPk.mockResolvedValue(mockFund);
    TokenController.verifyToken.mockImplementation((req, res, next) => next());

    const response = await request(app)
      .get('/api/fund/1')
      .set('Authorization', 'Bearer mockToken');

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(mockFund);
  });

  it('should return 404 if fund item is not found', async () => {
    Fund.findByPk.mockResolvedValue(null);
    TokenController.verifyToken.mockImplementation((req, res, next) => next());

    const response = await request(app)
      .get('/api/fund/999')
      .set('Authorization', 'Bearer mockToken');

    expect(response.statusCode).toBe(404);
    expect(response.body.error.message).toBe('Data not found');
  });
});