const express = require('express');
const router = express.Router();
const { registerCustomer ,findentityID,updateKycStatus,AgentReport} = require('../../controller/customer/customer');

router.post('/register', registerCustomer);
router.get('/entityID', findentityID);
router.put('/updateKycStatus', updateKycStatus);
router.get('/AgentReport', AgentReport);




module.exports = router;
