const config = require("../../config/config");
const CustRegModel = require("../../model/customer/custReg");

// Create a new customer registration
const axios = require("axios");


exports.createCustomer = async (req, res) => {

  console.log(req.body)

  const headers = {
    TENANT: process.env.TENANT,
    partnerId: process.env.PARTNER_ID,
    partnerToken: process.env.PARTNER_TOKEN,
    "Content-Type": "application/json",
  };

  try {
    const response = await axios.post(
      config.CUSTOMER_REGISTER_WITH_OTP,
      req.body,
      { headers }
    );

    if (response.data?.status === "SUCCESS") {
      const newCustomer = new CustRegModel({
        entityId: response.data.entityId,
        token: response.data.token,
        agentId: req.params.agentId,
        contactNo: req.body.customerId,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
      });

      await newCustomer.save();
      return res.status(201).json({ success: true, data: newCustomer });
    } else {
      console.error("API Error:", response.data);
      return res.status(400).json({
        success: false,
        message: response.data?.message || "Failed to register customer.",
      });
    }
  } catch (error) {
    console.error(
      "Error:",
      error.response ? error.response.data : error.message
    );

    const errorMessage =
      error.response?.data?.exception?.shortMessage ||
      error.response?.data?.detailMessage ||
      "An error occurred during registration.";

    return res.status(500).json({ success: false, message: errorMessage });
  }
};

// Get all customer registrations
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await CustRegModel.find();
    res.status(200).json({ success: true, data: customers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a single customer by ID
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await CustRegModel.findById(req.params.id);
    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }
    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a customer by ID
exports.updateCustomer = async (req, res) => {
  try {
    const updatedCustomer = await CustRegModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedCustomer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }
    res.status(200).json({ success: true, data: updatedCustomer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a customer by ID
exports.deleteCustomer = async (req, res) => {
  try {
    const deletedCustomer = await CustRegModel.findByIdAndDelete(req.params.id);
    if (!deletedCustomer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Customer deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
