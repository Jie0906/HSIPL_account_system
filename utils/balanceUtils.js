const db = require('../models/index');
const { UserBalance, LabBalance } = db;
const sequelize = db.sequelize;

const updateBalances = async (type, userId, amount, operation, oldType = null, oldAmount = 0, transaction) => {
  console.log(`Operation: ${operation}, Type: ${type}, Amount: ${amount}, OldType: ${oldType}, OldAmount: ${oldAmount}`);
  
  amount = Number(amount);
  oldAmount = Number(oldAmount);
  let deltaAmount = 0

  switch (operation) {
    case 'create':
    case 'restore':
      if (type === 'income') {
        deltaAmount = amount;
      } else {
        deltaAmount = -amount;
      }
      break;
    
    case 'update':
      if (oldType.toUpperCase() === type.toUpperCase()) {
        // 類型沒有改變
        deltaAmount = amount - oldAmount;
      } else {
        // 類型改變
        if (oldType.toUpperCase() === 'INCOME') {
          deltaAmount = -oldAmount - amount;
        } else {
          deltaAmount = oldAmount + amount;
        }
      }
      break;

    case 'delete':
      if (type === 'income') {
        deltaAmount = -amount;
      } else {
        deltaAmount = amount;
      }
      break;

    default:
      throw new Error('Invalid operation');
  }

  // 更新用戶餘額
  let userBalance = await UserBalance.findOne({
    where: { userId },
    transaction
  });

  if (!userBalance) {
    userBalance = await UserBalance.create({
      userId,
      currentBalance: 0,
      lastUpdated: new Date()
    }, { transaction });
  }

  const newUserBalance = userBalance.currentBalance + deltaAmount;

  await UserBalance.update(
    { currentBalance: newUserBalance, lastUpdated: new Date() },
    { where: { userId }, transaction }
  );

  // 更新實驗室餘額
  let labBalance = await LabBalance.findOne({
    order: [['lastUpdated', 'DESC']],
    transaction
  });

  if (!labBalance) {
    labBalance = await LabBalance.create({
      totalBalance: 0,
      lastUpdated: new Date()
    }, { transaction });
  }

  const newLabBalance = labBalance.totalBalance + deltaAmount;

  await LabBalance.update(
    { totalBalance: newLabBalance, lastUpdated: new Date() },
    { where: { id: labBalance.id }, transaction }
  );

  console.log(`DeltaAmount: ${deltaAmount}`);
  console.log(`Old UserBalance: ${userBalance.currentBalance}, New UserBalance: ${newUserBalance}`);
  console.log(`Old LabBalance: ${labBalance.totalBalance}, New LabBalance: ${newLabBalance}`);

  // 檢查並警告總經費小於 0 的情況
  if (newLabBalance < 0) {
    console.warn(`WARNING: Total lab balance is now negative. Current balance: ${newLabBalance}`);
  }

  return { newUserBalance, newLabBalance };
};

module.exports = { updateBalances };