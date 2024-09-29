const Sequelize = require('sequelize')

module.exports = (sequelize, DataTypes) =>{
    const ResetPasswordToken = sequelize.define('ResetPasswordToken', {
        token:{
            type:DataTypes.STRING,
        },
        expireAt:{
            type:DataTypes.DATE,
        },
        used: {
            type:DataTypes.BOOLEAN,
            defaultValue: false
        }
        
    },{
        paranoid: true,
    });


    return ResetPasswordToken;
};