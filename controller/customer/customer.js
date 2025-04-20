const axios = require('../../config/axiosClient');
const Customer = require('../../model/customer/customer');

exports.registerCustomer = async (req, res) => {
    const { customerNumber, panNumber, carNumber } = req.body;
  
    try {
      let customer = await Customer.findOne({ contactNo: customerNumber });
  
      // If customer doesn't exist, create and assign to same variable
      if (!customer) {
        customer = await Customer.create({
          contactNo: customerNumber,
          panNumber,
          carNumber
        });
      }
  
      // Now `customer` will always have valid data here — either found or newly created
      console.log("Customer:", customer);
  
      // 1. Generate OTP
      const otpRes = await axios.post(
        'https://kycuat.yappay.in/kyc/customer/generate/otp',
        {
          entityId: "M2PPTEST",
          mobileNumber: `+91${customerNumber}`,
          businessType: "LQFLEET115",
          entityType: "CUSTOMER"
        },
        {
          headers: {
            TENANT: 'LQFLEET',
            partnerId: 'LQFLEET',
            partnerToken: 'Basic TFFGTEVFVA',
            'Content-Type': 'application/json'
          }
        }
      );
  
      // 2. Get PAN Address
      const panRes = await axios.post(
        'https://sandbox.surepass.io/api/v1/pan/pan-comprehensive',
        {
          id_number: panNumber,
          get_address: "true"
        },
        {
          headers: {
            Authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc0NDk3MjcxNCwianRpIjoiYzAzMDQ3MjUtNDhmOS00YzA4LThmNzAtMDA0MzA4NzRhNDZmIiwidHlwZSI6ImFjY2VzcyIsImlkZW50aXR5IjoiZGV2LmFsdG9sbHBhcmtAc3VyZXBhc3MuaW8iLCJuYmYiOjE3NDQ5NzI3MTQsImV4cCI6MTc0NzU2NDcxNCwiZW1haWwiOiJhbHRvbGxwYXJrQHN1cmVwYXNzLmlvIiwidGVuYW50X2lkIjoibWFpbiIsInVzZXJfY2xhaW1zIjp7InNjb3BlcyI6WyJ1c2VyIl19fQ.DRDlUVA640pQ5uta04C4Lb5zC2SfgXj-kQ9RiDzMtYY',
            'Content-Type': 'application/json'
          }
        }
      );
  
      // 3. Vehicle Details
      const tagRes = await axios.post(
        'https://uat-fleet-netcswitch.m2pfintech.com/web/requestDetail',
        {
          searchParam: "regnum",
          search: carNumber
        },
        {
          headers: {
            'Content-Type': 'application/json',
            TENANT: 'LQFLEET115'
          }
        }
      );
  
      // ✅ Send response
      res.status(200).json({
        otpResponse: otpRes.data,
        panAddress: panRes.data.data || {},
        vehicleDetails: tagRes.data.result?.vehicleDetails || [],
        customer: customer // This will now always return valid customer object
      });
  
    } catch (error) {
      console.error('Error:', error?.response?.data || error.message);
      res.status(500).json({
        message: 'Failed to process customer registration.',
        error: error?.response?.data || error.message
      });
    }
  };
  

  exports.findentityID = async (req, res) => {
    try {
      const { contactNo } = req.query;
  
      if (!contactNo) {
        return res.status(400).json({ success: false, message: "contactNo is required" });
      }
  
      const customer = await Customer.findOne({ contactNo });
  
      if (customer) {
        return res.status(200).json({ success: true, message: "Fetched successfully", customer });
      } else {
        return res.status(404).json({ success: false, message: "Customer not found" });
      }
  
    } catch (error) {
      console.error("Error fetching customer:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  };
  