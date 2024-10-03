module.exports = (sequelize, DataTypes) =>{
    const Fund = sequelize.define('Fund', {
        type: {
            type: DataTypes.ENUM('INCOME', 'EXPENDITURE'),
            allowNull: false
          },
          amount: {
            type: DataTypes.BIGINT,
            allowNull: false
          },
          purchaseDate: {
            type: DataTypes.DATE,
            allowNull: false
          },
          description: {
            type: DataTypes.TEXT,
            allowNull: true
          },
    },{
        paranoid: true,
    });

    return Fund;
};

