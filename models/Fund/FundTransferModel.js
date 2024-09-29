const Sequelize = require('sequelize')

module.exports = (sequelize, DataTypes) =>{
    const FundTransfer = sequelize.define('FundTransfer', {
        amount:{
            type:DataTypes.INTEGER,
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
        reviewStatus:{
            type:Sequelize.ENUM('UNDER_REVIEW','ACCEPTED', 'REJECTED'),
            allowNull: true,
            validate: {
                isIn: {
                    args: [['UNDER_REVIEW', 'ACCEPTED', 'REJECTED']],
                    message: "Must be UNDER_REVIEW, ACCEPTED or REJECTED "
                  }
            }
        }
    },{
        paranoid: true,
    });

    return FundTransfer;
};