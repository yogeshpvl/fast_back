const agentModel = require("../../model/Auth/agentAuth");
const JWT_SECRET_KEY = require("../../config/jwtSecret");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const paymentHistory = require("../../model/paymentHistory");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
require("dotenv").config();

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
      number,
    } = req.body;

    const agent = await agentModel.findOne({ email });

    if (agent) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const newAgent = await agentModel.create({
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
    res.status(201).json({ success: "Agent signed up successfully", token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
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
    const agent = await agentModel.findById(id);
    if (!agent) {
      return res.status(404).json({ error: "Agent not found" });
    }

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

    if (password) {
      updatedAgentData.password = await bcrypt.hash(password, 10);
    }

    const updatedAgent = await agentModel.findByIdAndUpdate(id, updatedAgentData, { new: true });

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

    const agent = await agentModel.findOne({ email });
    if (!agent) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    if (!agent || agent.status !== "approved") {
      return res.status(400).json({ error: "Your account is not approved. Please contact support." });
    }

    const isPasswordValid = await bcrypt.compare(password, agent.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ email }, JWT_SECRET_KEY, { expiresIn: "1d" });

    const userData = {
      id: agent._id,
      name: agent.name,
      email: agent.email,
      status: agent.status,
      adminID: agent.adminID,
      wallet: agent.wallet,
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
      res.status(200).json({ success: "Pending agents", data });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function agentsCount(req, res) {
  try {
    const data = await agentModel.find({}).countDocuments();
    if (data) {
      res.status(200).json({ success: "Total agents", data });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function particulrSubpartnerAgents(req, res, next) {
  try {
    const { id } = req.params;
    console.log("id: " + id);
    const data = await agentModel.find({ adminID: id }).sort({ _id: -1 });

    if (data) {
      res.status(200).json({ success: "Subpartner agents", data });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getAllAgents(req, res) {
  try {
    const data = await agentModel.find({}).sort({ _id: -1 });

    if (data) {
      res.status(200).json({ success: "Pending agents", data });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getAgentCount(req, res) {
  try {
    const count = await agentModel.countDocuments();

    res.status(200).json({ success: "Total agent count", count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updateAgentStatus(req, res) {
  const { id } = req.params;

  try {
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

async function DeductmoneyFromWallet(req, res) {
  const { agentId, amount } = req.params;
  const { reason } = req.body;

  try {
    const deductAmount = parseFloat(amount);

    const agent = await agentModel.findById(agentId);
    if (!agent) {
      return res.status(404).json({ error: "Agent not found" });
    }

    if (agent.wallet < deductAmount) {
      return res.status(400).json({ error: "Insufficient wallet balance" });
    }

    agent.wallet -= deductAmount;
    await agent.save();

    const paymentRecord = new paymentHistory({
      agentId,
      amount: deductAmount,
      status: "Debit",
      reason: reason,
      createdAt: new Date(),
    });
    await paymentRecord.save();

    res.status(200).json({
      success: "Amount deducted successfully",
      data: agent,
    });
  } catch (error) {
    console.log("err", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}

async function deleteAgent(req, res) {
  const { id } = req.params;

  try {
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

async function resetPasswordRequest(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const agent = await agentModel.findOne({ email });
    if (!agent) {
      return res.status(404).json({ success: false, message: "Agent not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour expiry

    agent.resetToken = resetToken;
    agent.resetTokenExpiry = resetTokenExpiry;
    await agent.save();

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetLink = `https://admin.aktollpark.com/reset-password/${resetToken}?type=agent`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested a password reset for your agent account.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; color: #fff; background-color: #1976d2; text-decoration: none; border-radius: 4px;">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request this, please ignore this email.</p>
        <p>Best regards,<br>Your App Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: "Password reset link sent to your email.",
    });
  } catch (error) {
    console.error("Error in agent reset password request:", error);
    return res.status(500).json({ success: false, message: "Failed to send reset link." });
  }
}

async function resetPassword(req, res) {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Reset token and new password are required" });
    }

    const agent = await agentModel.findOne({
      resetToken,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!agent) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired reset token" });
    }

    agent.password = await bcrypt.hash(newPassword, 10);
    agent.resetToken = undefined;
    agent.resetTokenExpiry = undefined;
    await agent.save();

    return res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error("Error in agent reset password:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

async function deleteAgent(req, res) {
  const { id } = req.params;

  try {
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
  particulrSubpartnerAgents,
  DeductmoneyFromWallet,
  getAgentCount,
  resetPasswordRequest,
  resetPassword,
};