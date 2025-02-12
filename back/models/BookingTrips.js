const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const BookingTrips = sequelize.define(
    "BookingTrips",
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, },
        departure: { type: DataTypes.STRING, allowNull: false, },
        arrival: { type: DataTypes.STRING, allowNull: false, },
        date: { type: DataTypes.DATE, allowNull: false, },
        price: { type: DataTypes.FLOAT, allowNull: false,},
    },
    { timestamps: true }
);

module.exports = BookingTrips;
