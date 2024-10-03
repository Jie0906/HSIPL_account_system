const app = require('./app');
const db = require('./models/index')

//{force:true}
db.sequelize.sync().then(() => {
    app.listen(3000, "0.0.0.0", () => console.log(`Server is running at port `))
}).catch(error => {
    console.error("數據庫同步時發生錯誤：", error);
});

