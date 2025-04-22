const express = require("express");
const router = express.Router();
const { adminSignUp, adminLogin ,getSubpartners,subpartnerCount,adminUpdate, getSubpartnerCount} = require("../../controller/Auth/adminLogin");
const userMiddleware = require("../../middleware/auth");
const AdminModel = require("../../model/Auth/adminLogin");

// Sign-up route
router.post("/adminSignUp", adminSignUp);

// Login route
router.post("/adminLogin", adminLogin);
router.get("/getSubpartners", getSubpartners);
router.get("/SubpartnerCount", getSubpartnerCount);

router.get("/subpartnerCount", subpartnerCount);
router.put("/adminUpdate/:id", adminUpdate);
// Protected route to get admin details using the token
router.get("/adminDetails", userMiddleware, async (req, res) => {
  try {
    const email = req.email;
    const admin = await AdminModel.findOne({ email }).select("-password"); // Exclude password
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }
    res.status(200).json({ admin });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
