const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
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
    password: {
      type: String,
      required: true,
    },
    number:{
      type: String,
      required: true,
      unique: true,
    },
    address: {
      type: String,
    },
    state: {
      type: String,
      required: true,
      default: "karnataka",
    },
    city: {
      type: String,
      required: true,
      default: "bangalore",
    },
    pincode: {
      type: String,
    },
    role: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: "active",
    },
    wallet: {
      type: Number,
      required: true,
      default: 0,
    },
    dashboard: {
      type: Boolean,
    },
    subpartner: {
      type: Boolean,
    },
    agent: {
      type: Boolean,
    },
    fastTag: {
      type: Boolean,
    },
    approval: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

const AdminModel = mongoose.model("admin", adminSchema);
module.exports = AdminModel;
