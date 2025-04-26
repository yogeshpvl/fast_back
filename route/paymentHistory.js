const express = require("express");
const router = express.Router();
const PaymentHistory = require("../model/paymentHistory");
const Agent = require("../model/Auth/agentAuth");




router.get("/payments-details", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { startDate, endDate, agentId } = req.query;

    const filter = { status: "Success" };

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    if (agentId) {
      filter.agentId = agentId;
    }

    const total = await PaymentHistory.countDocuments(filter);

    const transactions = await PaymentHistory.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("agentId", "name number email city state"); // populate agent info

    res.status(200).json({
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
      transactions,
    });
  } catch (error) {
    console.error("❌ Error fetching wallet details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



router.get("/total-amount-success", async (req, res) => {
  try {
    const totalAmount = await PaymentHistory.aggregate([
      { $match: { status: "Success" } },  // Match successful transactions
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } }  // Sum up the amounts
    ]);

    res.status(200).json({
      totalAmount: totalAmount[0] ? totalAmount[0].totalAmount : 0,  // If no successful transactions, return 0
    });
  } catch (error) {
    console.error("❌ Error fetching total amount:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
module.exports = router;
