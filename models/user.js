const Sequelize = require('sequelize');

const sequelize = require('../utility/database');

const User = sequelize.define('user', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        required: true
    },
    email: {
        type: Sequelize.STRING,
        required: true
    },
    password: {
        type: Sequelize.STRING,
        required: true
    },
    resetToken: Sequelize.STRING,
    resetTokenExpiration: Sequelize.DATE,
    isAdmin: {
        type: Sequelize.BOOLEAN,
        default: false
    }
});

module.exports = User;