const express = require("express");
const router = express.Router();
const PaymentHistory = require("../model/paymentHistory");


/**
 * @route   GET /payments-details?page=1&limit=10
 * @desc    Fetch paginated payment history with agent details
 */
router.get("/payments-details", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await PaymentHistory.countDocuments();

    const transactions = await PaymentHistory.find({status:"Success"})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      // .populate("agentId", "name number email city state"); 

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
