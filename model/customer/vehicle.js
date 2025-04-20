const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  entityId: { type: String, required: true }, // same as vehicle number (VRN)
  parentEntityId: { type: String, required: true }, // link to customer entityId
  kitNo: { type: String, required: true },
  engineNo: String,
  vin: String,
  vrn: String,
  comVehicle: String,
  nationalPermit: String,
  nationalPermitDate: String,
  registeredVehicle: String,
  vehicleDescriptor: String,
  registrationDate: String,
  isCommercial: String,
  programType: String,
  business: String,
  businessId: String,
  profileId: String,
  tagId: String,
  apiResponse: Object,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
