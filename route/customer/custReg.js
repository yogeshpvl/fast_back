const express = require("express");
const router = express.Router();
const customerController = require("../../controller/customer/custReg");

router.post("/:agentId", customerController.createCustomer);
router.get("/", customerController.getAllCustomers);
router.get("/:id", customerController.getCustomerById);
router.put("/:id", customerController.updateCustomer);
router.delete("/:id", customerController.deleteCustomer);

module.exports = router;
