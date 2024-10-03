module.exports = (sequelize, DataTypes) =>{
    const UserBalance = sequelize.define('UserBalance', {
        currentBalance: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0
          },
          lastUpdated: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
          }
    },{
        paranoid: true,
    });
    return UserBalance
};