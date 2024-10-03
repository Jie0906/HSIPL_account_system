const Sequelize = require('sequelize')

module.exports = (sequelize, DataTypes) =>{
    const FundTransfer = sequelize.define('FundTransfer', {
        amount:{
            type:DataTypes.BIGINT,
            allowNull: true,
        },
        transferDate:{
            type:DataTypes.DATE,
            allowNull: false
        },
        description:{
            type:DataTypes.STRING,
            allowNull: true
        },
    },{
        paranoid: true,
    });

    return FundTransfer;
};