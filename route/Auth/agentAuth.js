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
  getAgentCount
} = require("../../controller/Auth/agentAuth");
const userMiddleware = require("../../middleware/auth");
const agentModel = require("../../model/Auth/agentAuth");

// Sign-up route
router.post("/agentSignUp", agentSignUp);

// Login route
router.post("/agentLogin", agentLogin);
router.post("/deductWallet/:agentId/:amount",   DeductmoneyFromWallet);

router.get("/counts", getAgentCount);

router.get("/pendingStatus", pendingStatus);
router.get("/getAllAgents", getAllAgents);
router.get("/particulrSubpartnerAgents/:id", particulrSubpartnerAgents);

router.put("/updateAgentStatus/:id", updateAgentStatus);
router.put("/editAgent/:id", editAgent);
router.delete("/deleteAgent/:id", deleteAgent);
// PUT /api/agents/block/:id
router.put("/block/:id", async (req, res) => {
  const agent = await agentModel.findById(req.params.id);
  if (!agent) return res.status(404).json({ message: "Agent not found" });

  agent.agentStatus = agent. agentStatus === "blocked" ? "active" : "blocked";
  await agent.save();
  res.json({ message: `Agent ${agent.agentStatus === "blocked" ? "blocked" : "unblocked"} successfully.` });
});

module.exports = router;
