module.exports = (sequelize, DataTypes) =>{
    const FundLog = sequelize.define('FundLog',{
        amount:{
            type:DataTypes.INTEGER,
            allowNull: false
        },
        date: {
            type:DataTypes.DATE,
            allowNull: false
        },
        description: {
            type:DataTypes.STRING,
            allowNull: false
        }
    },{
        paranoid: true,
    })

    return FundLog
}