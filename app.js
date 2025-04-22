const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const agentModel = require("./model/Auth/agentAuth");
const PaymentHistory = require("./model/paymentHistory"); 

const razorpay = new Razorpay({
  key_id: "rzp_test_1iDoeKTN6YVLnj",
  key_secret: "fqKOeA1zDlRrQP0pkm9fn1xL",
});

mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() =>
    console.log("=============MongoDb Database connected successfuly")
  )
  .catch((err) => console.log("Database Not connected !!!", err));

//middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(morgan("dev"));
app.use(express.static("public"));

const adminLogin = require("./route/Auth/adminLogin");
const agentAuth = require("./route/Auth/agentAuth");
const tags = require("./route/tags");
const banner = require("./route/banner");
const vehicleRoutes = require("./route/Vehicle");

//api

const custRegRoutes = require("./route/customer/custReg");
const paymentHistory = require("./model/paymentHistory");
const customerRoutes = require('./route/customer/customer');
const walletRoutes = require("./route/paymentHistory"); // adjust path



app.use("/api/subpartner", adminLogin);
app.use("/api/agent", agentAuth);
app.use("/api/tags", tags);
app.use("/api/banner", banner);
app.use("/api/vehicle", vehicleRoutes);

//api routes
app.use("/api/customer", custRegRoutes);
app.use('/api/customer', customerRoutes);
app.use("/", walletRoutes);

// ✅ Create Razorpay Order
app.post("/create-order", async (req, res) => {
  try {
    const { amount, agentId } = req.body; // ✅ Get agentId from request

    const options = {
      amount: amount * 100, // Razorpay requires amount in paisa
      currency: "INR",
      receipt: `receipt_${Math.random() * 1000}`,
    };

    const order = await razorpay.orders.create(options);
    
    // ✅ Store agentId in the order for tracking
    order.agentId = agentId;

    console.log("✅ Order Created:", order);
    res.json(order);
  } catch (error) {
    console.error("❌ Order Creation Error:", error);
    res.status(500).json({ error: error.message });
  }
});




app.post("/verify-payment", async (req, res) => {
  try {
    console.log("Received Payment Verification Request:", req.body);

    const { order_id, payment_id, signature, agentId, amount } = req.body;

    if (!order_id || !payment_id || !signature || !agentId || !amount) {
      console.log("❌ Missing required fields:", req.body);
      return res.status(400).json({ message: "Missing required fields" });
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      console.log("❌ Invalid Amount:", amount);
      return res.status(400).json({ message: "Invalid amount" });
    }

    // ✅ Verify Razorpay Signature
    const body = order_id + "|" + payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", "fqKOeA1zDlRrQP0pkm9fn1xL")
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.log("❌ Signature Mismatch: Expected:", expectedSignature, "Received:", signature);
      return res.status(400).json({ message: "Payment verification failed - Signature mismatch" });
    }

    // ✅ Check if Agent Exists
    const agent = await agentModel.findOne({ _id:agentId });
    if (!agent) return res.status(404).json({ message: "Agent not found" });

    // ✅ Ensure wallet exists and update balance
    if (!agent.wallet) agent.wallet = 0; 
    agent.wallet += numericAmount;
    await agent.save();

    // ✅ Save Payment History
    const paymentRecord = new PaymentHistory({
      agentId,
      orderId: order_id,
      paymentId: payment_id,
      amount: numericAmount,
      status: "Success",
      createdAt: new Date(),
    });
    await paymentRecord.save();

    console.log(`✅ Wallet updated for Agent ${agentId}: +${numericAmount} INR`);
    res.json({ message: "Payment successful, wallet updated & recorded!" });
  } catch (error) {
    console.error("❌ Payment Verification Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/wallet-details/:agentId", async (req, res) => {
  try {
    const { agentId } = req.params;

    console.log("agentId",agentId)
    if (!agentId) {
      return res.status(400).json({ message: "Agent ID is required" });
    }

    // ✅ Fetch agent details
    const agent = await agentModel.findOne({ _id:agentId });

    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    // ✅ Fetch transaction history
    const transactions = await PaymentHistory.find({ agentId }).sort({ createdAt: -1 });

  
    res.json({ balance: agent.wallet || 0, transactions });
  } catch (error) {
    console.error("❌ Error fetching wallet details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});




const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log("Server is running on", PORT);
});
