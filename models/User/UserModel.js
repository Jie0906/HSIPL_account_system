module.exports = (sequelize, DataTypes) =>{
    const User = sequelize.define('User', {
        name:{
            type:DataTypes.STRING,
        },
        username:{
            type:DataTypes.STRING,
        },
        password:{
            type:DataTypes.STRING,
        },
        email:{
            type: DataTypes.STRING,
        },
        studentId:{
            type: DataTypes.STRING,
        },
        phoneNumber: {
            type: DataTypes.STRING,
        },
        birthday: {
            type: DataTypes.DATE,
        },
        headshot:{
            type: DataTypes.STRING,                                
        },
        
    },{
        paranoid: true,
    });


    return User;
};