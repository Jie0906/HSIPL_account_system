const Sequelize = require('sequelize');
require('dotenv').config()
const sequelize = new Sequelize(process.env.DB_DB, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    port: 3306,
    timezone: '+08:00',
    logging: false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});


const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// 導入Model
db.User = require("./User/UserModel")(sequelize, Sequelize);
db.Role = require("./User/RoleModel")(sequelize, Sequelize);
db.Permission = require("./User/PermissionModel")(sequelize, Sequelize);
db.UserRole = require("./User/UserRoleModel")(sequelize, Sequelize);
db.RolePermission = require("./User/RolePermissionModel")(sequelize, Sequelize);
db.ResetPasswordToken = require("./User/ResetPasswordTokenModel")(sequelize, Sequelize);
db.UserBalance = require("./User/UserBalanceModel")(sequelize, Sequelize);

db.Fund = require("./Fund/FundModel")(sequelize, Sequelize);
db.FundTransfer = require("./Fund/FundTransferModel")(sequelize, Sequelize);
db.FundLog = require("./Fund/FundLogModel")(sequelize, Sequelize);
db.FundCategory = require("./Fund/FundCategoryModel")(sequelize, Sequelize);
db.LabBalance = require("./Fund/LabBalanceModel")(sequelize, Sequelize);

// 定義關聯
// User relations
db.User.hasMany(db.UserRole, { foreignKey: 'userId' });
db.User.hasOne(db.ResetPasswordToken, { foreignKey: 'userId' });
db.User.hasOne(db.UserBalance, { foreignKey: 'userId' });
db.User.hasMany(db.Fund, { as: 'Purchases', foreignKey: 'userId' });
db.User.hasMany(db.Fund, { as: 'RecordedFunds', foreignKey: 'recorderUserId' });
db.User.hasMany(db.FundTransfer, { as: 'RecordedTransfers', foreignKey: 'recorderUserId' });
db.User.hasMany(db.FundTransfer, { as: 'SentTransfers', foreignKey: 'fromUserId' });
db.User.hasMany(db.FundTransfer, { as: 'ReceivedTransfers', foreignKey: 'toUserId' });

// Role relations
db.Role.hasMany(db.UserRole, { foreignKey: 'roleId' });
db.Role.hasMany(db.RolePermission, { foreignKey: 'roleId' });

// Permission relations
db.Permission.hasMany(db.RolePermission, { foreignKey: 'permissionId' });

// UserRole relations
db.UserRole.belongsTo(db.User, { foreignKey: 'userId' });
db.UserRole.belongsTo(db.Role, { foreignKey: 'roleId' });

// RolePermission relations
db.RolePermission.belongsTo(db.Role, { foreignKey: 'roleId' });
db.RolePermission.belongsTo(db.Permission, { foreignKey: 'permissionId' });

// ResetPasswordToken relations
db.ResetPasswordToken.belongsTo(db.User, { foreignKey: 'userId' });

// UserBalance relations
db.UserBalance.belongsTo(db.User, { foreignKey: 'userId' });

// LabBalance relations
db.LabBalance.belongsTo(db.Fund, { foreignKey: 'fundId' });
db.LabBalance.belongsTo(db.FundTransfer, { foreignKey: 'fundTransferId' });

// Fund relations
db.Fund.belongsTo(db.User, { as: 'Purchaser', foreignKey: 'userId' });
db.Fund.belongsTo(db.User, { as: 'Recorder', foreignKey: 'recorderUserId' });
db.Fund.belongsTo(db.FundCategory, { foreignKey: 'categoryId' });
db.Fund.hasOne(db.LabBalance, { foreignKey: 'fundId' });
db.Fund.hasMany(db.FundLog, { foreignKey: 'fundId' });

// FundCategory relations
db.FundCategory.hasMany(db.Fund, { foreignKey: 'categoryId' });

// FundTransfer relations
db.FundTransfer.belongsTo(db.User, { as: 'Recorder', foreignKey: 'recorderUserId' });
db.FundTransfer.belongsTo(db.User, { as: 'Sender', foreignKey: 'fromUserId' });
db.FundTransfer.belongsTo(db.User, { as: 'Receiver', foreignKey: 'toUserId' });
db.FundTransfer.hasOne(db.LabBalance, { foreignKey: 'fundTransferId' });
db.FundTransfer.hasMany(db.FundLog, { foreignKey: 'fundTransferId' });

// FundLog relations
db.FundLog.belongsTo(db.Fund, { foreignKey: 'fundId' });
db.FundLog.belongsTo(db.FundTransfer, { foreignKey: 'fundTransferId' });

module.exports = db;