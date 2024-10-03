module.exports = (sequelize, DataTypes) =>{
    const FundLog = sequelize.define('FundLog',{
        type: {
            type: DataTypes.ENUM('INCOME', 'EXPENDITURE',  'TRANSFER'),
            allowNull: false
          },
          amount: {
            type: DataTypes.BIGINT,
            allowNull: false
          },
          date: {
            type: DataTypes.DATE,
            allowNull: false
          },
          description: {
            type: DataTypes.TEXT,
            allowNull: true
          }
    },{
        paranoid: true,
    })

    return FundLog
}