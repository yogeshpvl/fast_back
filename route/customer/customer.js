const express = require('express');
const router = express.Router();
const { registerCustomer ,findentityID} = require('../../controller/customer/customer');

router.post('/register', registerCustomer);
router.get('/entityID', findentityID);


module.exports = router;
