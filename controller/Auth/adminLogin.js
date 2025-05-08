const AdminModel = require("../../model/Auth/adminLogin");
const JWT_SECRET_KEY = require("../../config/jwtSecret");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
require("dotenv").config(); // Load environment variables

async function adminSignUp(req, res) {
  try {
    const { name, email, password, number, role, status, state, type, city, address, fastTagPrice } =
      req.body;

    const admin = await AdminModel.findOne({ email });

    if (admin) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const newAdmin = await AdminModel.create({
      email,
      name,
      role,
      status,
      state,
      city,
      number,
      address,
      type,
      fastTagPrice,
      password: await bcrypt.hash(password, 10),
    });

    const token = await jwt.sign({ email }, JWT_SECRET_KEY, {
      expiresIn: "3h",
    });
    res.status(201).json({ success: "Admin signed up successfully", token });
  } catch (error) {
    console.log("error: " + error);
    res.status(500).json({ error: error.message });
  }
}

async function adminUpdate(req, res) {
  try {
    const { name, email, password, number, role, status, state, city, type, address, fastTagPrice } =
      req.body;

    const { id } = req.params;

    let admin = await AdminModel.findOne({ _id: id });

    if (admin) {
      admin.name = name || admin.name;
      admin.number = number || admin.number;
      admin.role = role || admin.role;
      admin.status = status || admin.status;
      admin.state = state || admin.state;
      admin.city = city || admin.city;
      admin.address = address || admin.address;
      admin.type = type || admin.type;
      admin.fastTagPrice = fastTagPrice || admin.fastTagPrice;

      if (password) {
        admin.password = await bcrypt.hash(password, 10);
      }

      await admin.save();

      const token = await jwt.sign({ email }, JWT_SECRET_KEY, {
        expiresIn: "3h",
      });

      return res.status(200).json({ success: "Admin details updated successfully", token });
    } else {
      const newAdmin = await AdminModel.create({
        email,
        name,
        role,
        status,
        state,
        city,
        number,
        address,
        type,
        password: await bcrypt.hash(password, 10),
      });

      const token = await jwt.sign({ email }, JWT_SECRET_KEY, {
        expiresIn: "3h",
      });

      return res.status(201).json({ success: "Admin signed up successfully", token });
    }
  } catch (error) {
    console.log("error: " + error);
    res.status(500).json({ error: error.message });
  }
}

async function adminLogin(req, res) {
  try {
    const { email, password } = req.body;

    const admin = await AdminModel.findOne({ email });
    if (!admin) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Check if user is blocked
    if (admin.status === "blocked") {
      return res.status(403).json({ error: "Account is blocked. Please contact support." });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ email }, JWT_SECRET_KEY, { expiresIn: "1h" });

    res.status(200).json({ success: "Logged in successfully", token, data: admin });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function subpartnerCount(req, res) {
  try {
    const data = await AdminModel.find({}).countDocuments();
    if (data) {
      res.status(200).json({ success: "total agents", data });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function giveRightsSubpartners(req, res) {
  try {
    const userData = req.params.userId;
    const { dashboard, subpartner, agent, fastTag, approval } = req.body;
    let obj = {};

    const user = await AdminModel.findOne({ _id: userData });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (typeof dashboard !== "undefined") {
      obj["dashboard"] = dashboard;
    }
    if (typeof subpartner !== "undefined") {
      obj["subpartner"] = subpartner;
    }
    if (typeof agent !== "undefined") {
      obj["agent"] = agent;
    }
    if (typeof fastTag !== "undefined") {
      obj["fastTag"] = fastTag;
    }
    if (typeof approval !== "undefined") {
      obj["approval"] = approval;
    }

    let isData = await AdminModel.findOneAndUpdate(
      { _id: userData },
      { $set: obj },
      { new: true }
    );
    if (isData) {
      return res.status(200).json({ message: "Updated successfully", data: isData });
    } else {
      return res.status(500).json({ status: false, msg: "No such profile" });
    }
  } catch (error) {
    console.log("Error in updateprofile : ", error);
    return res.status(403).send({
      message: "Something went wrong while updating your details. Please try again later.",
    });
  }
}

async function getSubpartners(req, res) {
  try {
    const data = await AdminModel.find({}).sort({ _id: -1 });

    if (data) {
      res.status(200).json({ success: "subpartners data", data });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getSubpartnerDatails(req, res) {
  try {
    const { id } = req.params;
    const data = await AdminModel.findOne({ _id: id }).sort({ _id: -1 });

    if (data) {
      res.status(200).json({ success: "subpartners data", data });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getSubpartnerCount(req, res) {
  try {
    const count = await AdminModel.countDocuments({ role: "subpartner" });

    res.status(200).json({ success: "total subpartner count", count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function changePassword(req, res) {
  try {
    const { email, oldPassword, newPassword } = req.body;

    if (!email || !oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Email, oldPassword, and newPassword are required" });
    }

    const admin = await AdminModel.findOne({ email });

    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Old password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    admin.password = hashedPassword;
    await admin.save();

    return res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

async function resetPasswordRequest(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const admin = await AdminModel.findOne({ email });
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour expiry

    admin.resetToken = resetToken;
    admin.resetTokenExpiry = resetTokenExpiry;
    await admin.save();

    // Configure Nodemailer
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER || "ak.fasttopup@gmail.com",
        pass: process.env.EMAIL_PASS || "voyo mjvt obou tier", 
      },
    });

    const resetLink = `${process.env.FRONTEND_URL || "https://admin.aktollpark.com/"}/reset-password/${resetToken}?type=subpartners`;
    const mailOptions = {
      from: process.env.EMAIL_USER || "ak.fasttopup@gmail.com",
      to: email,
      subject: "Password Reset Request",
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested a password reset for your account.</p>
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
    console.error("Error in reset password request:", error);
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

    const admin = await AdminModel.findOne({
      resetToken,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!admin) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired reset token" });
    }

    admin.password = await bcrypt.hash(newPassword, 10);
    admin.resetToken = undefined;
    admin.resetTokenExpiry = undefined;
    await admin.save();

    return res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error("Error in reset password:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

async function blockUser(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["active", "blocked"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Valid status (active or blocked) is required" });
    }

    const admin = await AdminModel.findById(id);
    if (!admin) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    admin.status = status;
    await admin.save();

    return res.status(200).json({
      success: true,
      message: `User ${status === "blocked" ? "blocked" : "unblocked"} successfully`,
    });
  } catch (error) {
    console.error("Error in block user:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

module.exports = {
  adminSignUp,
  adminLogin,
  giveRightsSubpartners,
  getSubpartners,
  subpartnerCount,
  adminUpdate,
  getSubpartnerCount,
  getSubpartnerDatails,
  changePassword,
  resetPasswordRequest,
  resetPassword,
  blockUser,
};