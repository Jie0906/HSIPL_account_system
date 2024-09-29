module.exports = (sequelize, DataTypes) => {
    const FundCategory = sequelize.define('FundCategory',{
        name:{
            type:DataTypes.STRING,
            allowNull: false
        },
        description:{
            type:DataTypes.STRING,
            allowNull: false
        },
    },{
        paranoid: true,
    })
    return FundCategory
}

