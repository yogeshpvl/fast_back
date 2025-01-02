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
  particulrSubpartnerAgents
} = require("../../controller/Auth/agentAuth");
const userMiddleware = require("../../middleware/auth");

// Sign-up route
router.post("/agentSignUp", agentSignUp);

// Login route
router.post("/agentLogin", agentLogin);

router.get("/pendingStatus", pendingStatus);
router.get("/getAllAgents", getAllAgents);
router.get("/particulrSubpartnerAgents/:id", particulrSubpartnerAgents);

router.put("/updateAgentStatus/:id", updateAgentStatus);
router.put("/editAgent/:id", editAgent);
router.delete("/deleteAgent/:id", deleteAgent);
module.exports = router;
