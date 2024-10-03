const db = require('../models/index')
const User = db.User
const FundTransfer = db.FundTransfer
const FundLog = db.FundLog
const UserBalance = db.UserBalance
const LabBalance = db.LabBalance
const FundCategory = db.FundCategory
const sequelize = db.sequelize;
const errorHandler = require('../middleware/errorHandler')

class fundTransfer {
    fundTransfer = async (req, res, next) => {
        try{
        const { type, content, date, fromName, toName, amount } = req.body
        //獲取匯款人相關訊息
        const fromNameExist = await User.findOne({
            where: { name: fromName }
        })
        //獲取被轉帳人相關訊息
        const toNameExist = await User.findOne({
            where: { name: toName }
        })

        //獲取紀錄者相關訊息
        const recorderName = await User.findOne({
            where: { name: req.user.payload.name }
        })
        //確認轉帳方 & 收款方皆存在於資料庫內
        if (!fromNameExist || !toNameExist) {
            const error = new Error('Data not found.')
            error.status = 404
            throw error
        }
        //計算目前實驗室經費
        const totalAmount = await Fund.sum('sum', {
            where: { type: { [Op.or]: ['EXPENDITURE', 'INCOME'] } }
        })
        //若實驗室目前經費小於匯款金額 則轉帳失敗
        if (totalAmount < amount) {
            const error = new Error('Balabnce not enough.')
            error.status = 400
            throw error
        }
        let transferInfor = {
            transferLog:`${fromName} transfered ${amount} to ${toName}.`,
            date
        }

        const transferLog = await FundTransferLog.create(transferInfor)
        let fromNameInfor = {
            type,
            tag: 'REMITTER',
            content,
            date,
            name: fromName,
            sum: amount,
            note: `to ${toName}`,
            recorderName: recorderName.name,
            userId: fromNameExist.id,
            transferId: transferLog.id
        }

        let toNameInfor = {
            type,
            tag: 'REMITTEE',
            content,
            date,
            name: toName,
            sum: amount,
            note: `from ${fromName}`,
            recorderName: recorderName.name,
            userId: toNameExist.id,
            transferId: transferLog.id
        }
        await Fund.create(fromNameInfor)
        await Fund.create(toNameInfor)
        await UserLog.create({
            message: `${fromName} transfered ${amount} to ${toName}.`,
            userId: fromNameExist.id
        })

        //更新轉帳方餘額
        const fromNameAllPayedSum = await conutTotalAmount(fromName)
        await User.update({ balance: fromNameAllPayedSum }, { where: { name: fromName } })

        //更新收款方餘額
        const toNameAllPayedSum = await conutTotalAmount(toName)
        await User.update({ balance: toNameAllPayedSum }, { where: { name: toName } })

        return res.status('200').json({
            state: "Sucess!"
        })
        }
        catch(error){
            next(error)
        }
    }
}


module.exports = new fundTransfer()