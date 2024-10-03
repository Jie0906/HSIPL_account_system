module.exports = (sequelize, DataTypes) =>{
    const LabBalance = sequelize.define('LabBalance', {
          totalBalance: {
            type: DataTypes.BIGINT,
            allowNull: false
          },
          lastUpdated: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
          }
    },{
        paranoid: true,
    });
    return LabBalance
};