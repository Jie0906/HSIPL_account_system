const request = require('supertest');
const express = require('express');
const fundController = require('../../../controllers/fundController');
const { Fund, User } = require('../../../models');
const TokenController = require('../../../middleware/tokenController');

jest.mock('../../../models');
jest.mock('../../../middleware/tokenController');

const app = express();
app.use(express.json());
app.get('/api/fund', TokenController.verifyToken, fundController.getAllItem);

describe('Fund Controller - getAllItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get all fund items successfully', async () => {
    const mockFunds = [
      {
        id: 1,
        type: 'income',
        amount: 1000,
        purchaseDate: '2023-01-01',
        description: 'Test income 1',
        Purchaser: { id: 1, name: 'Test User 1' },
        Recorder: { id: 2, name: 'Recorder 1' }
      },
      {
        id: 2,
        type: 'expenditure',
        amount: 500,
        purchaseDate: '2023-01-02',
        description: 'Test expenditure 1',
        Purchaser: { id: 3, name: 'Test User 2' },
        Recorder: { id: 4, name: 'Recorder 2' }
      }
    ];

    Fund.findAll.mockResolvedValue(mockFunds);
    TokenController.verifyToken.mockImplementation((req, res, next) => next());

    const response = await request(app)
      .get('/api/fund')
      .set('Authorization', 'Bearer mockToken');

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(mockFunds);
  });

  it('should return an empty array if no funds are found', async () => {
    Fund.findAll.mockResolvedValue([]);
    TokenController.verifyToken.mockImplementation((req, res, next) => next());

    const response = await request(app)
      .get('/api/fund')
      .set('Authorization', 'Bearer mockToken');

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([]);
  });
});