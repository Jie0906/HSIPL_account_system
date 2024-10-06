const request = require('supertest');
const express = require('express');
const fundController = require('../../../controllers/fundController');
const { Fund } = require('../../../models');
const TokenController = require('../../../middleware/tokenController');
const { Op } = require('@sequelize/core');

jest.mock('../../../models');
jest.mock('../../../middleware/tokenController');

const app = express();
app.use(express.json());
app.get('/api/fund/search', TokenController.verifyToken, fundController.searchItem);

describe('Fund Controller - searchItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should search fund items successfully', async () => {
    const mockFunds = [
      { id: 1, content: 'Test content 1' },
      { id: 2, content: 'Test content 2' }
    ];

    Fund.findAll.mockResolvedValue(mockFunds);
    TokenController.verifyToken.mockImplementation((req, res, next) => next());

    const response = await request(app)
      .get('/api/fund/search?searchQuery=Test')
      .set('Authorization', 'Bearer mockToken');

    expect(response.statusCode).toBe(200);
    expect(response.body.contentExist).toEqual(mockFunds);
    expect(Fund.findAll).toHaveBeenCalledWith({
      where: { content: { [Op.like]: '%Test%' } }
    });
  });

  it('should return 400 if search query is empty', async () => {
    TokenController.verifyToken.mockImplementation((req, res, next) => next());

    const response = await request(app)
      .get('/api/fund/search')
      .set('Authorization', 'Bearer mockToken');

    expect(response.statusCode).toBe(400);
    expect(response.body.error.message).toBe('Field cannot be empty.');
  });

  it('should return 404 if no items are found', async () => {
    Fund.findAll.mockResolvedValue([]);
    TokenController.verifyToken.mockImplementation((req, res, next) => next());

    const response = await request(app)
      .get('/api/fund/search?searchQuery=NonexistentItem')
      .set('Authorization', 'Bearer mockToken');

    expect(response.statusCode).toBe(404);
    expect(response.body.error.message).toBe('Data not found.');
  });
});