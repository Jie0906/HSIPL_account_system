require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DB,
    host: process.env.DB_HOST,
    dialect: 'mysql',
    timezone: '+08:00'
  },
  test: {
    // 測試環境配置
  },
  production: {
    // 生產環境配置
  }
};