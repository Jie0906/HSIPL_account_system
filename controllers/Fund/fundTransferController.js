const db = require('../../models/index')
const User = db.User
const FundTransfer = db.FundTransfer
const FundLog = db.FundLog
const UserBalance = db.UserBalance
const LabBalance = db.LabBalance
const sequelize = db.sequelize;

class fundTransferController {
    fundTransfer = async (req, res, next) => {
        const t = await sequelize.transaction()
        try{
        const { fromUserId, toUserId, amount, transferDate, description } = req.body
        const recorderUserName = req.user.payload.name
        if (!fromUserId || !toUserId || !amount || !transferDate || !description){
            const error = new Error('Field cannot be empty.');
            error.status = 400;
            throw error;
        }
        const numericAmount = Number(amount)

        const recorder = await User.findOne({ where: { name: recorderUserName }, transaction: t });
        if (!recorder) {
          const error = new Error('Recorder not found.');
          error.status = 404;
          throw error;
        }
        //獲取匯款人相關訊息
        const fromUser = await UserBalance.findOne({ where: { userId: fromUserId }, transaction: t });
        if (!fromUser) {
            const error = new Error('formUser not found.');
            error.status = 404;
            throw error;
          }
        //獲取被轉帳人相關訊息
        const toUser = await UserBalance.findOne({ where: { userId: toUserId }, transaction: t });
        if (!toUser) {
            const error = new Error('toUser not found.');
            error.status = 404;
            throw error;
          }

        //轉帳前確認
        if (fromUser.currentBalance < numericAmount){
            const error = new Error('Balance not enough.');
            error.status = 400;
            throw error;
        }

        //進行扣款
        //更新轉出方餘額
        const newFromUserBalance = fromUser.currentBalance - numericAmount;
        await UserBalance.update(
            { currentBalance: newFromUserBalance, lastUpdated: new Date() },
            { where: { userId: fromUserId }, transaction: t }
        );

        //更新轉入方餘額
        const newToUserBalance = toUser.currentBalance + numericAmount;
        await UserBalance.update(
            { currentBalance: newToUserBalance, lastUpdated: new Date() },
            { where: { userId: toUserId }, transaction: t }
        );

        // 創建轉帳記錄
        const transferDetail = await FundTransfer.create({
            recorderUserId: recorder.id,
            fromUserId,
            toUserId,
            amount: numericAmount,
            transferDate,
            description
        }, { transaction: t });

        //寫入FundLog
        await FundLog.create({
            type: 'TRANSFER',
            amount,
            description: `User ${fromUserId} transferred ${numericAmount} to User ${toUserId}`,
            fundTransferId: transferDetail.id,
            date: new Date()
          }, { transaction: t });

        await t.commit();

        return res.status('200').json({
            TransferStatus: "Sucess!",
            Detail: transferDetail
        })
        }
        catch(error){
            await t.rollback();
            next(error)
        }
    }
}


module.exports = new fundTransferController()