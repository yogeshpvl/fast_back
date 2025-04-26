const express = require('express');
const router = express.Router();
const { generateReport } = require('../../controller/report/report');


router.post('/generate',  generateReport);

module.exports = router;
