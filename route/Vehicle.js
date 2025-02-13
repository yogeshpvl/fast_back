const express = require("express");
const router = express.Router();
const vehicleController = require("../controller/Vehicle");

router.post("/vehicle", vehicleController.createVehicle);
router.get("/vehicles", vehicleController.getAllVehicles);
router.get("/vehicle/:entityId", vehicleController.getVehicleById);
router.put("/vehicle/:entityId", vehicleController.updateVehicle);
router.delete("/vehicle/:entityId", vehicleController.deleteVehicle);

module.exports = router;
