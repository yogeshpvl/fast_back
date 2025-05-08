const express = require("express");
const router = express.Router();
const {
  adminSignUp,
  adminLogin,
  changePassword,
  getSubpartnerDatails,
  getSubpartners,
  subpartnerCount,
  adminUpdate,
  getSubpartnerCount,
  resetPasswordRequest,
  resetPassword,
  blockUser,
} = require("../../controller/Auth/adminLogin");
const userMiddleware = require("../../middleware/auth");
const AdminModel = require("../../model/Auth/adminLogin");

// Sign-up route
router.post("/adminSignUp", adminSignUp);

// Login route
router.post("/adminLogin", adminLogin);

// Get subpartners
router.get("/getSubpartners", getSubpartners);
router.get("/Subpartner/:id", getSubpartnerDatails);

// Change password
router.post("/change-password", changePassword);

// Reset password routes
router.post("/reset-password-request", resetPasswordRequest);
router.post("/reset-password", resetPassword);

// Block/unblock user
router.put("/block/:id",  blockUser);

// Subpartner counts
router.get("/SubpartnerCount", getSubpartnerCount);
router.get("/subpartnerCount", subpartnerCount);

// Update admin
router.put("/adminUpdate/:id", adminUpdate);

// Protected route to get admin details using the token
router.get("/adminDetails", userMiddleware, async (req, res) => {
  try {
    const email = req.email;
    const admin = await AdminModel.findOne({ email }).select("-password");
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }
    res.status(200).json({ admin });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;