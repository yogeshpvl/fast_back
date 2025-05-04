const mongoose = require("mongoose");

const agentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    createdBy: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    address: {
      type: String,
    },
    number:{
      type: String,
      required: true,
      
    },
    adminID:{
      type: String,
    },
    state: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
    },
    role: {
      type: String,
      required: true,
      default: "agent",
    },
    status: {
      type: String,
      required: true,
      default: "pending",
    },
    agentStatus: {
      type: String,
      required: true,
      default: "active",
    },
    wallet: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const agentModel = mongoose.model("agent", agentSchema);
module.exports = agentModel;
