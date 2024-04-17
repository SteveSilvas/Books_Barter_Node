"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database = require("../ConnectionDB");
database.sync();
module.exports = database.define('User', {
    Id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    Name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    Birth: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    Email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    Pass: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    }
});
