const {Sequelize} = require('sequelize');
require('dotenv').config(); 

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST, // where your DB is running (usually localhost or remote IP)
        dialect: 'mysql', // tells Sequelize you're using MySQL
        logging: false // disables SQL query logging in console
    }
);

sequelize.sync()
.then(()=> console.log('DB synced with sequelize'))
.catch((e)=> console.error('DB failed to sync with sequelize',e));


module.exports = sequelize;
