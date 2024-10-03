const db = require('../models/index')
const { FundLog } = db;

const createFundLog = async (logData, transaction) => {
  await FundLog.create({
    type: logData.type,
    amount: logData.amount,
    date: new Date(),
    description: logData.description,
    fundId: logData.fundId,
    fundTransferId: logData.fundTransferId,
  }, { transaction });
};

module.exports = { createFundLog };