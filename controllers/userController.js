/*
實驗室網站帳戶管理
 */
const db = require('../models')
const User = db.User
const Role = db.Role
const UserRole = db.UserRole
const sequelize = db.sequelize
const ResetPasswordToken = db.ResetPasswordToken
const connectRedis = require('../config/redisClient.config')
const { Op } = require('@sequelize/core')
const {
    encrypt: encrypt,
    decrypt: decrypt,
} = require("../utils/encryptPassword")
const nodemailer = require('nodemailer')
const TokenController = require("../middleware/tokenController")
const mailConfig = require('../config/mail.config')
const jwt = require("jsonwebtoken")
const config = require('../config/auth.config')
const crypto = require('crypto');

const { generateSessionId } = require('../utils/sessionUtils');

class userController {
    protected = async (req, res) => {
        try {
            res.send('this is the protected page.')

        }
        catch (error) {
            return res.status(500).json({
                message: error
            })
        }

    }
    createUser = async (req, res, next) => {
        const t = await sequelize.transaction();
        try {
            const { name, username, password, email } = req.body
            //確認ip位址(白名單為實驗室ip)
            // const whitelist = ['140.125.45.160']
            // const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            // if (!whitelist.includes(ip)) {
            //     return res.status('400').json(errorHandler.ipError())
            // }

            if (!name || !username || !password || !email) {
                const error = new Error('Field cannot be empty.')
                error.status = 400
                throw error
            }
            //確認user 資訊是否存在
            const checkUserExist = await User.findOne({
                where: {
                    [Op.or]: [
                        { name: name },
                        { username: username },
                        { email: email },
                    ]
                }
            })
            if (checkUserExist) {
                const error = new Error('User already exist.')
                error.status = 409
                throw error
            }

            //密碼加鹽
            const encryptPassword = await encrypt(password)
            //信箱認證
            // const transporter = nodemailer.createTransport(mailConfig)
            // let mailOption = {
            //     from: 'yuntechhsipl@gmail.com',
            //     subject: 'Email verify',
            //     to: `${mail}`,
            //     text: 'Your email has been verified.'
            // }

            // await transporter.sendMail(mailOption, (error, infor)=> {
            //     if (error){
            //         throw error
            //     }
            // })
            const newUser = await User.create({
                name,
                username,
                password: encryptPassword,
                email,
            }, { transaction: t })

            // 賦予最低權限 normalUser
            const userRole = await Role.findOne({ where: { name: 'normalUser' } });
            if (!userRole) {
                const error = new Error('Default user role not found.')
                error.status = 409
                throw error
            }
            await UserRole.create({
                userId: newUser.id,
                roleId: userRole.id
            }, { transaction: t });
    
            await t.commit();
            return res.status(201).json({
                message: `Created User ${req.body.name} sucessfully.`
            })
        }
        catch (error) {
            await t.rollback()
            next(error)
        }
    }
    login = async (req, res, next) => {
        /*登入邏輯
            建立redis連線 -> 確認帳號密碼 -> 根據使用者資訊生成jwt return 給 client */
        try {
          const { username, password } = req.body
          const user = await User.findOne({
            where: { username: username },
            include: [{
                model: Role,
                include: [Permission]
            }]
        })
          if (!user) {
            const error = new Error('User did not exist.')
            error.status = 404
            throw error
        }
          const checkPassword = await decrypt(password, user.password);
          if (!checkPassword) {
            const error = new Error('Username or password was wrong, please try again.')
            error.status = 403
            throw error
          }
          const userId = user.id
          const payload = {
            name: user.name,
            email: user.email
          }
          if (!username || !password) {
            const error = new Error('Field cannot be empty.')
            error.status = 400
            throw error
          }

            const jsonWebToken = await TokenController.signToken({payload})
            const permissions = user.Roles.flatMap(role => 
                role.Permissions.map(permission => permission.name)
            );
            const redisClient = await connectRedis()
            await redisClient.set(`user:${user.email}:permissions`, JSON.stringify(permissions), 'EX', 3600)

            res.cookie('jsonWebToken', jsonWebToken, {
                signed: true,
                httpOnly: true,
                sameSite: 'Strict'
            });  

            return res.status(200).json({
            message: `Login successfully! Welcome back ${user.name}.`,
            accessToken: jsonWebToken
          })
     
        } catch (error) {
            next(error)
        }
      }
    //搜尋user名字的資訊
    findUser = async (req, res, next) => {
        const { name } = req.query
        try {
            const user = await User.findOne({
                attributes: ['name', 'email', 'studentId', 'phoneNumber'],
                where: {
                    name: name
                }
            })
            if (!user) {
                const error = new Error('Data not found.')
                error.status = 404
                throw error
            }
            return res.status(200).json(user)
        }
        catch (error) {
            next(error)
        }
    }
    //刪除特定使用者
    deleteUser = async (req, res, next) => {
        try {
            const user = await User.findOne({
                where: { id: req.params.id }
            })
            //確認刪除該位user前餘額為0，以保證實驗室經費正確
            if (user.balance !== 0) {
                const error = new Error('Balance should be 0.')
                error.status = 409
                throw error
            }
            await user.destroy();
            return res.status(200).json({
                message: `Soft deleted ${user.name} Sucessfully.`
            })
        }
        catch (error) {
            next(error)
        }
    }

    restoreUser = async (req, res, next) => {
        try {
          const user = await User.findOne({
            where: { id: req.params.id },
            paranoid: false 
          });
      
          if (!user) {
            const error = new Error('Data not found.');
            error.status = 404;
            throw error;
          }
      
          if (!user.deletedAt) {
            const error = new Error('User is not deleted.');
            error.status = 400;
            throw error;
          }
      
          await user.restore(); 
      
          return res.status(200).json({
            message: `Restored ${user.name} successfully.`
          });
        } catch (error) {
          next(error);
        }
      };
    forgetPassword = async (req, res, next) => {
        try {
            const { email } = req.body
            //確認信箱有無正確
            const user = await User.findOne({ where: { email: email } })
            if (!user) {
                const error = new Error('Data not found.')
                error.status = 404
                throw error
            }
            // 生成唯一的重置令牌
            const resetToken = crypto.randomBytes(32).toString('hex');
            const hashedToken = await encrypt(resetToken); // 使用 bcrypt 加密令牌

            await ResetPasswordToken.create({
                userId: user.id,
                token: hashedToken,
                expireAt: new Date(Date.now() + 30 * 60 * 1000), // 30 分鐘後過期
            });

            const resetUrl = `http://localhost:3000/api/user/resetPassword/${resetToken}`;
            //定義給使用者重設密碼的連結
            const transporter = nodemailer.createTransport(mailConfig)

            //信件設定
            let mailOption = {
                from: 'yuntechhsipl@gmail.com',
                to: user.email,
                subject: 'Password Reset Request',
                text: `Please use the following link to reset your password: ${resetUrl}\nIf you did not request this, please ignore this email.`
            }

            await transporter.sendMail(mailOption)

            res.status(200).json({ 
                message: 'Password reset email sent successfully.',
                resetToken: resetToken, // 僅用於測試目的
                resetUrl: resetUrl // 僅用於測試目的
         });
        }

        catch (error) {
            next(error)
        }
    }

    resetPassword = async (req, res, next) => {
        try {
            const { token } = req.query;
            const { newPassword } = req.body;
        
            // 查找有效的重置請求
            const resetRequest = await ResetPasswordToken.findOne({
                where: {
                    expireAt: { [Op.gt]: new Date() },
                    used: false
                },
                include: [{ model: User }]
            });
            if (!resetRequest) {
                const error = new Error('Password reset token is invalid or has expired.');
                error.status = 400;
                throw error;
            }
            const isTokenValid = await decrypt(token, resetRequest.token);
            if (!isTokenValid) {
                const error = new Error('Invalid token.');
                error.status = 400;
                throw error;
            }

            // 更新用戶密碼
            const hashedPassword = await encrypt(newPassword)
            await resetRequest.User.update({ password: hashedPassword });

            // 標記令牌為已使用
            await resetRequest.update({ used: true });
            
            const transporter = nodemailer.createTransport(mailConfig)
            //密碼修改成功 寄通知信給user
            let mailOption = {
                from: 'yuntechhsipl@gmail.com',
                to: resetRequest.User.email,
                subject: 'Your password has been changed',
                text: 'This is a confirmation that the password for your account has just been changed.'
            }
            await transporter.sendMail(mailOption)
            return res.status(200).json({
                message: 'Password reset successful.'
            })
        } catch (error) {
            next(error)
        }
    }


}
module.exports = new userController()
