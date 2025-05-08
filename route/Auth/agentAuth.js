const express = require("express");
const router = express.Router();
const {
  agentSignUp,
  agentLogin,
  pendingStatus,
  getAllAgents,
  updateAgentStatus,
  deleteAgent,
  editAgent,
  particulrSubpartnerAgents,
  DeductmoneyFromWallet,
  getAgentCount,
  resetPasswordRequest,
  resetPassword,
} = require("../../controller/Auth/agentAuth");
const userMiddleware = require("../../middleware/auth");
const agentModel = require("../../model/Auth/agentAuth");

// Sign-up route
router.post("/agentSignUp", agentSignUp);

// Login route
router.post("/agentLogin", agentLogin);

// Reset password routes
router.post("/reset-password-request", resetPasswordRequest);
router.post("/reset-password", resetPassword);

// Wallet deduction route
router.post("/deductWallet/:agentId/:amount", DeductmoneyFromWallet);

// Get agent count
router.get("/counts", getAgentCount);

// Get pending agents
router.get("/pendingStatus", pendingStatus);

// Get all agents
router.get("/getAllAgents", getAllAgents);

// Get agents under a specific subpartner
router.get("/particulrSubpartnerAgents/:id", particulrSubpartnerAgents);

// Update agent status to approved
router.put("/updateAgentStatus/:id", updateAgentStatus);

// Edit agent details
router.put("/editAgent/:id", editAgent);

// Delete agent
router.delete("/deleteAgent/:id", deleteAgent);

// Block or unblock agent
router.put("/block/:id", async (req, res) => {
  const agent = await agentModel.findById(req.params.id);
  if (!agent) return res.status(404).json({ message: "Agent not found" });

  agent.agentStatus = agent.agentStatus === "blocked" ? "active" : "blocked";
  await agent.save();
  res.json({ message: `Agent ${agent.agentStatus === "blocked" ? "blocked" : "unblocked"} successfully.` });
});

module.exports = router;