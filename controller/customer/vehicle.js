

// Add this helper function to call UnregisteredNegativeList
const removeFromHotlist = async (kitNo) => {
    try {
      const response = await axios.post(
        "https://uat-fleetdrive.m2pfintech.com/core/Yappay/fleet-manager/UnregisteredNegativeList",
        {
          kitNo,
          excCode: "01",
          tagOperation: "ADD",
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
      console.error("Error removing from hotlist:", error.response?.data || error.message);
      throw new Error("Failed to remove tag from hotlist");
    }
  };
  

const registerVehicle = async (req, res) => {
    const { kitNo, entityId, ...otherVehicleData } = req.body;
  
    try {
      // Step 1: Remove from hotlist before registering
      const hotlistResponse = await removeFromHotlist(kitNo);
      console.log("Hotlist Removal Response:", hotlistResponse);
  
      // Step 2: Proceed with vehicle registration
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
  
      // Save to DB and return response
      // Assuming you have a Vehicle model:
      const savedVehicle = await Vehicle.create({
        ...req.body,
        registrationResponse: registrationResponse.data,
      });
  
      res.status(200).json({ success: true, vehicle: savedVehicle });
    } catch (err) {
      console.error("Registration Error:", err.message);
      res.status(500).json({ success: false, message: err.message });
    }
  };
  