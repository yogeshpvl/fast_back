const mongoose = require("mongoose");

const custRegSchema = new mongoose.Schema({
  entityId: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  agentId: {
    type: String,
    required: true,
  },
  contactNo: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  customerName: {
    type: String,
    required: true,
  },
  status: {
    type: String,
   
    default: "Pending",
  },
}, { timestamps: true });

const CustRegModel = mongoose.model("CustomerReg", custRegSchema);
module.exports = CustRegModel;
