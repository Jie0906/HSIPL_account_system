module.exports = (sequelize, DataTypes) =>{
    const UserBalance = sequelize.define('UserBalance', {
        currentBalance:{
            type:DataTypes.INTEGER,
        },
        lastUpdated:{
            type:DataTypes.DATE,
        }
    },{
        paranoid: true,
    });
    return UserBalance
};