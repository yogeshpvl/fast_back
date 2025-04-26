// models/Customer.js
const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  entityId: { type: String,  },
  firstName: String,
  lastName: String,
  gender: String,
  dob: String,
  token:String,
  agentId:String,
  contactNo: String,
  emailAddress: String,
  panNumber: String,
  kitNo: String,
  tagClass:{
    type: String,
  },
  mapperClass:{
    type: String,
  },
  address: {
    address1: String,
    address2: String,
    city: String,
    state: String,
    country: String,
    pincode: String
  },
  otp: String,
  status: {
    type: String,
     default: "Pending",
  },
 
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
