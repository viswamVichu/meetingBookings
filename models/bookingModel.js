const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Booking = sequelize.define("Booking", {
  BookingName: DataTypes.STRING,
  ProjectName: DataTypes.STRING,
  ProgramTitle: DataTypes.STRING,
  Participants: DataTypes.STRING,
  EventInCharge: DataTypes.STRING,
  InChargeEmail: DataTypes.STRING,
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
