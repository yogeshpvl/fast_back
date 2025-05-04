// controllers/registerCustomer.js
const axios = require('axios');
const Customer = require('../../model/customer/customer');
const generateEntityId = require('../../utils/generateEntityId');
const agentModel = require('../../model/Auth/agentAuth');
const TagModel = require('../../model/tags');



const removeFromHotlist = async (kitNo) => {
  try {
    const response = await axios.post(
      "https://uat-fleetdrive.m2pfintech.com/core/Yappay/fleet-manager/UnregisteredNegativeList",
      {
        kitNo,
        excCode: "01",
        tagOperation: "REMOVE",
      },
      {
        headers: {
          TENANT: "LQFLEET",
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    // Check if error.response exists (when the error comes from the server)
    if (error.response) {
      // Server responded with a status code outside the 2xx range
      console.error("Error response status:", error.response.status);
      console.error("Error response headers:", error.response.headers);
      console.error("Error response data:", error.response.data);
      // You can create a more descriptive error message or log it as per your requirement
      throw new Error(`Failed to remove tag from hotlist: ${error.response.data?.message || error.response.statusText || "Unknown error"}`);
    } else if (error.request) {
      // The request was made but no response was received
      console.error("Error request:", error.request);
      throw new Error("No response received from the server.");
    } else {
      // Something else triggered the error
      console.error("Error message:", error.message);
      throw new Error(`Unexpected error: ${error.message}`);
    }
  }
};


exports.registerCustomer = async (req, res) => {
  try {
    const data = req.body;
    const {customerNumber,agentId}=req.query;
    const {emailAddress,dob,gender,firstName,lastName,addressInfo}=req.body;
    const entityId = generateEntityId(); 
    const businessId = generateEntityId(); 




    // Include entityId in payload
    const payload = {
      ...data,
      entityId,businessId
    };

    // Log the payload for debugging purposes
    console.log("Payload being sent:", JSON.stringify(payload, null, 2));

    try {
      const response = await axios.post('https://kycuat.yappay.in/kyc/v2/register', payload, {
        headers: {
          'TENANT': 'LQFLEET',
          'partnerId': 'LQFLEET',
          'partnerToken': 'Basic TFFGTEVFVA',
          'Content-Type': 'application/json'
        }
      });
    
      const result = response.data.result;
      console.log("Registration successful:", result);

     
      
        const updatedCustomer = await Customer.findOneAndUpdate(
          { contactNo:customerNumber },
          { $set: { entityId, token:result?.token, agentId , address:addressInfo,emailAddress,firstName,lastName,gender,dob,status:"CUSTOMER REGISTERED"} },
          { new: true }
        );
        
        if (!updatedCustomer) {
          console.error("Customer not found for contactNo:", customerNumber);
        }
      

      // Respond with success
      res.status(200).json({
        message: 'Customer registered successfully',
        entityId,
        updatedCustomer
        // You can send additional data if needed, e.g., kitNo, token, etc.
      });
    } catch (error) {
      console.error("API Response Error:", error.response?.data);

      // Log the entire error response
      console.error("Registration API error:", error );
      res.status(400).json({
        message: 'Registration failed',
        error: error.response?.data || error.message
      });
    }
  } catch (error) {
   
    res.status(500).json({
      message: "Registration failed",
      error: error?.response?.data || error.message
    });
  }
};


exports.registerVehicle = async (req, res) => {
  const { entityId, type, agentId, amount } = req.body;
  const deductAmount = parseFloat(amount);


  try {
    // Step 1: Remove from hotlist before registering
   await removeFromHotlist(req.body.kitNo);
   

    // Step 2: Register vehicle
    const registrationResponse = await axios.post(
      "https://uat-fleetdrive.m2pfintech.com/core/Yappay/registration-manager/v3/register",
      {
        ...req.body,
        entityId,
      },
      {
        headers: {
          Authorization: "Basic TFFGTEVFVA==",
          "Content-Type": "application/json",
          TENANT: "LQFLEET",
        },
      }
    );

    const registeredData = registrationResponse.data.result;
    console.log("registrationResponse result:", registeredData);

    // Step 3: Update Customer record with the correct kitNo and status
    const updatedCustomer = await Customer.findOneAndUpdate(
      { entityId: entityId },
      {
        $set: {
          kitNo: registeredData.kitNo,
          kycStatus: registeredData.kycStatus,
          kycRefNo: registeredData.kycRefNo,
          status: "VEHICLE REGISTERED",
        },
      },
      { new: true }
    );

    const tag = await TagModel.findOneAndUpdate(
      { kitNo: registeredData.kitNo },
      {
        $set: {
          status: registeredData.kycStatus,
        },
      },
      { new: true }
    );
    // Step 4: Deduct wallet if prepaid
    if (type === "Prepaid") {
      const agent = await agentModel.findById(agentId);
      if (!agent) {
        return res.status(404).json({ success: false, message: "Agent not found" });
      }
      agent.wallet -= deductAmount;
      await agent.save();
    }

    res.status(200).json({ success: true, customer: updatedCustomer });
  } catch (err) {
    if (err.response) {
      console.error("Registration API Error Status:", err.response.status);
      console.error("Registration API Error Data:", err.response.data);
      res.status(err.response.status).json({
        success: false,
        message: err.response.data.shortMessage || "Registration failed",
        details: err.response.data,
      });
    } else if (err.request) {
      console.error("No response received:", err.request);
      res.status(500).json({
        success: false,
        message: "No response received from registration API",
      });
    } else {
      console.error("Unexpected Error:", err.message);
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
};
