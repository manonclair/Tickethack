const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Trips = sequelize.define(
    "Trips",
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, },
        departure: { type: DataTypes.STRING, allowNull: false, },
        arrival: { type: DataTypes.STRING, allowNull: false, },
        date: { type: DataTypes.DATE, allowNull: false, },
        price: { type: DataTypes.FLOAT, allowNull: false,},
        in_cart: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    { timestamps: true }
);

module.exports = Trips;
