const request = require('supertest');
const express = require('express');
const fundTransferController = require('../../../controllers/Fund/fundTransferController');
const { User, UserBalance, FundTransfer, FundLog } = require('../../../models');
const TokenController = require('../../../middleware/tokenController');
const checkPermission = require('../../../middleware/checkPermission');

jest.mock('../../../models');
jest.mock('../../../middleware/tokenController');
jest.mock('../../../middleware/checkPermission');

const app = express();
app.use(express.json());
app.post('/api/fundTransfer', TokenController.verifyToken, checkPermission('fundTransfer'), fundTransferController.fundTransfer);

describe('Fund Transfer Controller - fundTransfer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should transfer funds successfully', async () => {
    const mockRecorder = { id: 1, name: 'Recorder' };
    const mockFromUser = { userId: 2, currentBalance: 1000 };
    const mockToUser = { userId: 3, currentBalance: 500 };
    const mockTransferDetail = { id: 1, amount: 500 };

    User.findOne.mockResolvedValue(mockRecorder);
    UserBalance.findOne.mockImplementation((query) => {
      if (query.where.userId === 2) return Promise.resolve(mockFromUser);
      if (query.where.userId === 3) return Promise.resolve(mockToUser);
    });
    UserBalance.update.mockResolvedValue([1]);
    FundTransfer.create.mockResolvedValue(mockTransferDetail);
    FundLog.create.mockResolvedValue({});

    TokenController.verifyToken.mockImplementation((req, res, next) => {
      req.user = { payload: { name: 'Recorder' } };
      next();
    });
    checkPermission.mockImplementation(() => (req, res, next) => next());

    const response = await request(app)
      .post('/api/fundTransfer')
      .send({
        fromUserId: 2,
        toUserId: 3,
        amount: 500,
        transferDate: '2023-01-01',
        description: 'Test transfer'
      })
      .set('Authorization', 'Bearer mockToken');

    expect(response.statusCode).toBe(200);
    expect(response.body.TransferStatus).toBe('Sucess!');
    expect(response.body.Detail).toEqual(mockTransferDetail);
    expect(UserBalance.update).toHaveBeenCalledTimes(2);
    expect(FundTransfer.create).toHaveBeenCalled();
    expect(FundLog.create).toHaveBeenCalled();
  });

  it('should return 400 if required fields are missing', async () => {
    TokenController.verifyToken.mockImplementation((req, res, next) => next());
    checkPermission.mockImplementation(() => (req, res, next) => next());

    const response = await request(app)
      .post('/api/fundTransfer')
      .send({
        fromUserId: 2,
        toUserId: 3,
        amount: 500
      })
      .set('Authorization', 'Bearer mockToken');

    expect(response.statusCode).toBe(400);
    expect(response.body.error.message).toBe('Field cannot be empty.');
  });

  it('should return 404 if recorder is not found', async () => {
    User.findOne.mockResolvedValue(null);
    TokenController.verifyToken.mockImplementation((req, res, next) => {
      req.user = { payload: { name: 'NonexistentRecorder' } };
      next();
    });
    checkPermission.mockImplementation(() => (req, res, next) => next());

    const response = await request(app)
      .post('/api/fundTransfer')
      .send({
        fromUserId: 2,
        toUserId: 3,
        amount: 500,
        transferDate: '2023-01-01',
        description: 'Test transfer'
      })
      .set('Authorization', 'Bearer mockToken');

    expect(response.statusCode).toBe(404);
    expect(response.body.error.message).toBe('Recorder not found.');
  });

  it('should return 404 if fromUser is not found', async () => {
    const mockRecorder = { id: 1, name: 'Recorder' };
    User.findOne.mockResolvedValue(mockRecorder);
    UserBalance.findOne.mockImplementation((query) => {
      if (query.where.userId === 2) return Promise.resolve(null);
    });
    TokenController.verifyToken.mockImplementation((req, res, next) => {
      req.user = { payload: { name: 'Recorder' } };
      next();
    });
    checkPermission.mockImplementation(() => (req, res, next) => next());

    const response = await request(app)
      .post('/api/fundTransfer')
      .send({
        fromUserId: 2,
        toUserId: 3,
        amount: 500,
        transferDate: '2023-01-01',
        description: 'Test transfer'
      })
      .set('Authorization', 'Bearer mockToken');

    expect(response.statusCode).toBe(404);
    expect(response.body.error.message).toBe('formUser not found.');
  });

  it('should return 400 if balance is not enough', async () => {
    const mockRecorder = { id: 1, name: 'Recorder' };
    const mockFromUser = { userId: 2, currentBalance: 100 };
    const mockToUser = { userId: 3, currentBalance: 500 };

    User.findOne.mockResolvedValue(mockRecorder);
    UserBalance.findOne.mockImplementation((query) => {
      if (query.where.userId === 2) return Promise.resolve(mockFromUser);
      if (query.where.userId === 3) return Promise.resolve(mockToUser);
    });
    TokenController.verifyToken.mockImplementation((req, res, next) => {
      req.user = { payload: { name: 'Recorder' } };
      next();
    });
    checkPermission.mockImplementation(() => (req, res, next) => next());

    const response = await request(app)
      .post('/api/fundTransfer')
      .send({
        fromUserId: 2,
        toUserId: 3,
        amount: 500,
        transferDate: '2023-01-01',
        description: 'Test transfer'
      })
      .set('Authorization', 'Bearer mockToken');

    expect(response.statusCode).toBe(400);
    expect(response.body.error.message).toBe('Balance not enough.');
  });
});