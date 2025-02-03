const agentModel = require("../../model/Auth/agentAuth");
const JWT_SECRET_KEY = require("../../config/jwtSecret");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

async function agentSignUp(req, res, next) {
  try {
    const {
      name,
      email,
      password,
      role,
      status,
      address,
      state,
      city,
      pincode,
      createdBy,
      adminID,
      number
    } = req.body;

    const agent = await agentModel.findOne({ email });

    if (agent) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const newagent = await agentModel.create({
      email,
      name,
      role,
      status,
      address,
      state,
      city,
      pincode,
      createdBy,
      adminID,
      number,
      password: await bcrypt.hash(password, 10),
    });

    const token = await jwt.sign({ email }, JWT_SECRET_KEY, {
      expiresIn: "3h",
    });
    res.status(201).json({ success: "agent signed up successfully", token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
}
async function editAgent(req, res) {
  const { id } = req.params;
  const {
    name,
    email,
    role,
    status,
    address,
    state,
    city,
    pincode,
    createdBy,
    adminID,
    number,
    password,
  } = req.body;

  try {
    // Check if the agent exists
    const agent = await agentModel.findById(id);
    if (!agent) {
      return res.status(404).json({ error: "Agent not found" });
    }

    // Update the agent's information
    const updatedAgentData = {
      name,
      email,
      role,
      status,
      address,
      state,
      city,
      pincode,
      createdBy,
      adminID,
      number,
    };

    // If password is provided, hash the new password
    if (password) {
      updatedAgentData.password = await bcrypt.hash(password, 10);
    }

    const updatedAgent = await agentModel.findByIdAndUpdate(
      id,
      updatedAgentData,
      { new: true } // Return the updated document
    );

    res.status(200).json({
      success: "Agent updated successfully",
      data: updatedAgent,
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}


async function agentLogin(req, res) {
  try {
    const { email, password } = req.body;

    // Check if the user exists
    const agent = await agentModel.findOne({ email });
    if (!agent) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    if (!agent || agent.status !== "approved") {
      return res.status(400).json({ error: "Your account is not approved. Please contact support." });
    }
    
    // Validate password
    const isPasswordValid = await bcrypt.compare(password, agent.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Generate a token with an expiry of 1 day
    const token = jwt.sign({ email }, JWT_SECRET_KEY, { expiresIn: "1d" });

    // Send only required fields
    const userData = {
      id: agent._id,
      name: agent.name,
      email: agent.email,
      status: agent.status
    };

    res.status(200).json({ success: "Logged in successfully", token, data: userData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function pendingStatus(req, res) {
  try {
    const data = await agentModel.find({ status: "pending" }).sort({ _id: -1 });

    if (data) {
      res.status(200).json({ success: "pending agents", data });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function agentsCount(req, res) {
try {


  const data = await agentModel.find({}).countDocuments();
  if (data) {
    res.status(200).json({ success: "total agents", data });
  }
  
} catch (error) {
  res.status(500).json({ error: error.message });
}
}

async function particulrSubpartnerAgents(req, res, next) {
try {
  const { id } = req.params;
  console.log("id: " + id)
  const data = await agentModel.find({ adminID:id }).sort({ _id: -1 });

  if (data) {
    res.status(200).json({ success: "subpartner agents", data });
  }
  
} catch (error) {
  res.status(500).json({ error: error.message });
}


}
async function getAllAgents(req, res) {
  try {
    const data = await agentModel.find({}).sort({ _id: -1 });

    if (data) {
      res.status(200).json({ success: "pending agents", data });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updateAgentStatus(req, res) {
  const { id } = req.params;

  try {
    // Find the agent by ID and update the status
    const updatedAgent = await agentModel.findOneAndUpdate(
      { _id: id },
      { status: "approved" },
      { new: true }
    );

    if (!updatedAgent) {
      return res.status(404).json({ error: "Agent not found" });
    }

    res.status(200).json({
      success: "Agent status updated to approved",
      data: updatedAgent,
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}

async function deleteAgent(req, res) {
  const { id } = req.params;

  try {
    // Find and delete the agent by ID
    const deletedAgent = await agentModel.findByIdAndDelete(id);

    if (!deletedAgent) {
      return res.status(404).json({ error: "Agent not found" });
    }

    res.status(200).json({
      success: "Agent deleted successfully",
      data: deletedAgent,
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}


module.exports = {
  agentSignUp,
  agentLogin,
  pendingStatus,
  getAllAgents,
  updateAgentStatus,
  deleteAgent,
  editAgent,
  particulrSubpartnerAgents
};
