const Sequelize = require('sequelize');

const sequelize = new Sequelize('node-app', 'root', '123ssk06', {
    dialect: 'mysql',
    host: 'localhost'
});

module.exports = sequelize;