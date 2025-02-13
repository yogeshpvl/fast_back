const Vehicle = require("../model/Vehicle");

// Store data in MongoDB
exports.createVehicle = async (req, res) => {
  try {
    const newVehicle = new Vehicle(req.body);
    await newVehicle.save();
    res.status(201).json({ success: true, message: "Vehicle data stored successfully!", data: newVehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error storing vehicle data", error: error.message });
  }
};

// Get all stored vehicles
exports.getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.status(200).json({ success: true, data: vehicles });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error retrieving vehicle data", error: error.message });
  }
};

// Get a single vehicle by entityId
exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({ entityId: req.params.entityId });
    if (!vehicle) {
      return res.status(404).json({ success: false, message: "Vehicle not found!" });
    }
    res.status(200).json({ success: true, data: vehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error retrieving vehicle data", error: error.message });
  }
};

// Update vehicle data
exports.updateVehicle = async (req, res) => {
  try {
    const updatedVehicle = await Vehicle.findOneAndUpdate({ entityId: req.params.entityId }, req.body, { new: true });
    if (!updatedVehicle) {
      return res.status(404).json({ success: false, message: "Vehicle not found!" });
    }
    res.status(200).json({ success: true, message: "Vehicle updated successfully!", data: updatedVehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating vehicle data", error: error.message });
  }
};

// Delete a vehicle
exports.deleteVehicle = async (req, res) => {
  try {
    const deletedVehicle = await Vehicle.findOneAndDelete({ entityId: req.params.entityId });
    if (!deletedVehicle) {
      return res.status(404).json({ success: false, message: "Vehicle not found!" });
    }
    res.status(200).json({ success: true, message: "Vehicle deleted successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting vehicle data", error: error.message });
  }
};
