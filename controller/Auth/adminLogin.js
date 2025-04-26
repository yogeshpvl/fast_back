const AdminModel = require("../../model/Auth/adminLogin");
const JWT_SECRET_KEY = require("../../config/jwtSecret");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

async function adminSignUp(req, res) {
  try {
    const { name, email, password,number, role, status, state,type, city, address,fastTagPrice } =
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
    console.log("error: " + error)
    res.status(500).json({ error: error });
  }
}

async function adminUpdate(req, res) {
  try {
    const { name, email, password,number, role, status, state, city,type, address,fastTagPrice } =
    req.body;

  const {id} = req.params

    // Check if an admin with this email already exists
    let admin = await AdminModel.findOne({ _id: id});

    if (admin) {
      // If the admin exists, we update their details
      admin.name = name || admin.name;
      admin.number = number || admin.number;
      admin.role = role || admin.role;
      admin.status = status || admin.status;
      admin.state = state || admin.state;
      admin.city = city || admin.city;
      admin.address = address || admin.address;
      admin.type = type || admin.type;
      admin.fastTagPrice =  fastTagPrice || admin.fastTagPrice;
     

      // Update password only if a new password is provided
      if (password) {
        admin.password = await bcrypt.hash(password, 10);
      }

      await admin.save(); // Save the updated admin details

      const token = await jwt.sign({ email }, JWT_SECRET_KEY, {
        expiresIn: "3h",
      });

      return res.status(200).json({ success: "Admin details updated successfully", token });
    } else {
      // If the admin doesn't exist, we create a new one
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
        password: await bcrypt.hash(password, 10), // Hash the password
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

    // Check if the user exists
    const admin = await AdminModel.findOne({ email });
    if (!admin) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Generate a token with an expiry of 1 hour
    const token = jwt.sign({ email }, JWT_SECRET_KEY, { expiresIn: "1h" });

    res.status(200).json({ success: "Logged in successfully", token ,data:admin});
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
    // Check if the user exists
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
      {
        new: true,
      }
    );
    if (isData) {
      return res
        .status(200)
        .json({ message: "Updated successfully", data: isData });
    } else {
      return res.status(500).json({ status: false, msg: "No such profile" });
    }
  } catch (error) {
    console.log("Error in updateprofile : ", error);
    return res.status(403).send({
      message:
        "Something went wrong while updating your details Please try again later.",
    });
  }
}

async function getSubpartners(req, res) {
  try {
    const data = await AdminModel.find({}).sort({ _id: -1 });

    if (data) {
      res.status(200).json({ success: "subpatners data", data });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getSubpartnerDatails(req, res) {
  try {
    const {id}=req.params.id
    const data = await AdminModel.findOne({_id:id}).sort({ _id: -1 });

    if (data) {
      res.status(200).json({ success: "subpatners data", data });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
async function getSubpartnerCount(req, res) {
  try {
    const count = await AdminModel.countDocuments({ role: 'subpartner' });

    res.status(200).json({ success: "total subpartner count", count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function changePassword(req, res) {
  try {
    const { email, oldPassword, newPassword } = req.body;

    console.log("email",email)
    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Email, oldPassword, and newPassword are required" });
    }

  
    // Find the admin by email
    const admin = await AdminModel.findOne({ email });

    console.log("admin",admin)
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    // Compare old password
    const isMatch = await bcrypt.compare(oldPassword, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Old password is incorrect" });
    }

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    admin.password = hashedPassword;
    await admin.save();

    return res.status(200).json({ success: true, message: "Password updated successfully" });

  } catch (error) {
    console.error("Error changing password:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
module.exports = {
  adminSignUp,
  adminLogin,
  giveRightsSubpartners,
  getSubpartners,
  subpartnerCount,
  adminUpdate,
  getSubpartnerCount,
  getSubpartnerDatails,
  changePassword
};
