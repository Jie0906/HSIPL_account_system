module.exports = (sequelize, DataTypes) =>{
    const LabBalance = sequelize.define('LabBalance', {
        currentBalance:{
            type:DataTypes.STRING,
        },
        lastUpdated:{
            type:DataTypes.DATE,
        }
    },{
        paranoid: true,
    });
    return LabBalance
};