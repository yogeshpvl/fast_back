// routes/customer.js
const express = require('express');
const router = express.Router();
const { registerCustomer,registerVehicle } = require('../../controller/customer/custReg');

router.post('/register-with-otp', registerCustomer);
router.post('/vehicle-registration',registerVehicle);


module.exports = router;
