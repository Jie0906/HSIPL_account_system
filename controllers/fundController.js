/*
實驗室記帳系統
*/
const db = require('../models/index')
const { Op } = require('@sequelize/core')
const User = db.User
const Fund = db.Fund
const sequelize = db.sequelize;
const { updateBalances } = require('../utils/balanceUtils');
const { createFundLog } = require('../utils/fundLogUtils');
const errorHandler = require('../middleware/errorHandler')

class fundController {
    addItem = async (req, res, next) => {
        const t = await sequelize.transaction();
        try {
          const { type, amount, purchaseDate, description, userId } = req.body;
          const recorderUserName = req.user.payload.name
          const numericAmount = Number(amount)

          if (!type || !amount || !purchaseDate || !description || !userId ) {
            const error = new Error('Field cannot be empty.');
            error.status = 400;
            throw error;
          }
      
          const user = await User.findByPk(userId, { transaction: t });
          if (!user) {
            const error = new Error('UserId not found.');
            error.status = 404;
            throw error;
          }
      
          const recorder = await User.findOne({ where: { name: recorderUserName }, transaction: t });
          if (!recorder) {
            const error = new Error('Recorder not found.');
            error.status = 404;
            throw error;
          }
      
          const newItem = await Fund.create({
            type,
            amount: numericAmount,
            purchaseDate,
            description,
            userId,
            recorderUserId: recorder.id,
          }, { transaction: t });
      
          const { newUserBalance, newLabBalance } = await updateBalances(type, userId, amount, 'create', null, 0, t);
      
          await createFundLog({
            type,
            amount,
            description: `Created new fund: ${newItem.id}`,
            fundId: newItem.id,
          }, t);
      
          await t.commit();
          res.status(201).json({
            message: 'Added new item successfully.',
            item: newItem,
            newUserBalance,
            newLabBalance
          });
        } catch (error) {
          await t.rollback();
          next(error);
        }
      };
    getItemById = async (req, res, next) => {
        try {
            const { id } = req.params;
            const fund = await Fund.findByPk(id, {
              include: [
                { model: User, as: 'Purchaser', attributes: ['id', 'name'] },
                { model: User, as: 'Recorder', attributes: ['id', 'name'] }
              ]
            });
            if (!fund) {
              const error = new Error('Data not found');
              error.status = 404;
              throw error;
            }
            res.status(200).json(fund);
          } catch (error) {
            next(error);
          }
    }

    getAllItem = async (req, res, next) => {
        try {
            const funds = await Fund.findAll({
              include: [
                { model: User, as: 'Purchaser', attributes: ['id', 'name'] },
                { model: User, as: 'Recorder', attributes: ['id', 'name'] }
              ]
            });
            res.status(200).json(funds);
          } catch (error) {
            next(error);
          }
    }

    searchItem = async (req, res, next) => {
        try {
            //根據關鍵字來查找品項
            const { searchQuery } = req.query
            if (!searchQuery) {
                const error = new Error('Field cannot be empty.')
                error.status = 400
                throw error
            }
            const contentExist = await Fund.findAll({ where: { content: { [Op.like]: `%${searchQuery}%` } } })
            if (contentExist.length === 0) {
                const error = new Error('Data not found.')
                error.status = 404
                throw error
            }
            return res.status('200').json({ contentExist })
        }
        catch (error) {
            next(error)
        }
    }
    updateItem = async (req, res, next) => {
        const t = await sequelize.transaction();
        try {
            const { id } = req.params;
            const { type, amount, purchaseDate, description, userId } = req.body
            const recorderUserName = req.user.payload.name;

            //確認item存在
            const fund = await Fund.findByPk(id, { transaction: t });
            if (!fund) {
            const error = new Error('Fund not found');
            error.status = 404;
            throw error;
            }
            const user = await User.findByPk(userId, { transaction: t });
            if (!user) {
              const error = new Error('UserId not found.');
              error.status = 404;
              throw error;
            }
            //確認記錄者存在
            const recorder = await User.findOne({ where: { name: recorderUserName }, transaction: t });
            if (!recorder) {
            const error = new Error('Recorder not found.');
            error.status = 404;
            throw error;
            }
            //取得舊的金額＆類型
            const oldAmount = fund.amount
            const oldType = fund.type

            const updatedFund = await fund.update({
            type,
            amount,
            purchaseDate,
            description,
            userId,
            recorderUserId: recorder.id
            }, { where:{id}, transaction: t });

            const { newUserBalance, newLabBalance } = await updateBalances(type, userId, amount, 'update', oldType, oldAmount, t);

            await createFundLog({
            type,
            amount,
            description: `Updated fund: ${id}`,
            fundId: id
            }, t);

            await t.commit();
            res.status(200).json({
            message: 'Fund updated successfully',
            fund: updatedFund,
            newUserBalance,
            newLabBalance
            });
        } catch (error) {
            await t.rollback();
            next(error);
        }
    }

    deleteItem = async (req, res, next) => {
        const t = await sequelize.transaction();
        try {
          const { id } = req.params;
          const fund = await Fund.findByPk(id, { transaction: t });
          if (!fund) {
            const error = new Error('Fund not found');
            error.status = 404;
            throw error;
          }
      
          await fund.destroy({ transaction: t });
      
          const { newUserBalance, newLabBalance } = await updateBalances(fund.type, fund.userId, fund.amount, 'delete', null ,0, t);
      
          await createFundLog({
            type: fund.type,
            amount: fund.amount,
            description: `Deleted fund: ${id}`,
            fundId: id,
            operation: 'delete'
          }, t);
      
          await t.commit();
          res.status(200).json({ 
            message: 'Fund deleted successfully',
            newUserBalance,
            newLabBalance
          });
        } catch (error) {
          await t.rollback();
          next(error);
        }
    }
    restoreItem = async (req, res, next) => {
        const t = await sequelize.transaction();
        try {
          const { id } = req.params;
          const fund = await Fund.findByPk(id, { 
            paranoid: false,
            transaction: t 
          });
          if (!fund) {
            const error = new Error('Fund not found');
            error.status = 404;
            throw error;
          }
      
          await fund.restore({ transaction: t });
      
          const { newUserBalance, newLabBalance } = await updateBalances(fund.type, fund.userId, fund.amount, 'restore', null, 0, t);
      
          await createFundLog({
            type:fund.type,
            amount: fund.amount,
            description: `Restored fund: ${id}`,
            fundId: id,
            operation: 'restore'
          }, t);
      
          await t.commit();
          res.status(200).json({ 
            message: 'Fund restored successfully',
            fund: fund,
            newUserBalance,
            newLabBalance
          });
        } catch (error) {
          await t.rollback();
          next(error);
        }
    }
}

module.exports = new fundController()