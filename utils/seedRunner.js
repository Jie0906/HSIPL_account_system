const db = require('../models/index');
const path = require('path');
const { Umzug, SequelizeStorage } = require('umzug');
const sequelize = db.sequelize;

const umzug = new Umzug({
  migrations: {
    path: path.join(path.join(__dirname, '/', 'seeders')),
    params: [
      sequelize.getQueryInterface(),
      db.Sequelize
    ],
    pattern: /\.js$/,
    glob: '*.js'  
  },
  storage: new SequelizeStorage({ sequelize }),
  context: sequelize.getQueryInterface(),
  logger: console
});

async function runSeeds() {
  try {
    await umzug.up();
    console.log('All seeds have been executed successfully');
  } catch (error) {
    console.error('Error executing seeds:', error);
    throw error;  
  }
}

module.exports = runSeeds;