const { DataTypes } = require("sequelize");
const sequelize = require("../db");


const Booking = sequelize.define("Booking", {
  BookingName: DataTypes.STRING,
  ProjectName: DataTypes.STRING,
  ProgramName: DataTypes.STRING, // 👈 NEW FIELD
  ProgramTitle: DataTypes.STRING,
  Participants: DataTypes.INTEGER,
  EventInCharge: DataTypes.STRING,
  InChargeEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { isEmail: true },
  },
  ApproverEmail: DataTypes.STRING,
  MeetingRoom: DataTypes.STRING,
  StartTime: DataTypes.DATE,
  EndTime: DataTypes.DATE,
  AudioVisual: DataTypes.BOOLEAN,
  VideoConf: DataTypes.BOOLEAN,
  Catering: DataTypes.BOOLEAN,
  Status: {
    type: DataTypes.STRING,
    defaultValue: "pending",
  },
});

module.exports = Booking;
