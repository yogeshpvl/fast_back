const Agent = require('../../model/Auth/agentAuth');
const Tag = require('../../model/tags');
const PaymentHistory = require('../../model/paymentHistory');
const Customer = require('../../model/customer/customer');
const Subpartner = require('../../model/Auth/adminLogin');

const generateReport = async (req, res) => {
  try {
    const { startDate, endDate, subpartnerId, agentId } = req.body;

    console.log(startDate, endDate, subpartnerId, agentId);

    const dateFilter = startDate && endDate ? {
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    } : {};

    const agentFilter = agentId 
    ? { _id: agentId } 
    : subpartnerId 
      ? { adminID: subpartnerId.toString() } 
      : {};
  

  
  const agents = await Agent.find(agentFilter);
 

    const agentIds = agents.map(a => a._id.toString());

    const [tags, customers, payments] = await Promise.all([
      Tag.find({ assignedTo: { $in: agentIds }, ...dateFilter }),
      Customer.find({ agentId: { $in: agentIds }, ...dateFilter }),
      PaymentHistory.find({ agentId: { $in: agentIds }, status: "Debit", ...dateFilter }),
    ]);

    // Fetch all Subpartners once
    const subpartnerIds = agents.map(a => a.adminID).filter(id => id); // remove undefined/null
    const subpartners = await Subpartner.find({ _id: { $in: subpartnerIds } }).lean();
    const subpartnerMap = {};
    subpartners.forEach(sp => {
      subpartnerMap[sp._id.toString()] = sp.name;
    });

    const result = agents.map(agent => {
      const agentTags = tags.filter(tag => tag.assignedTo?.toString() === agent._id.toString());
      const agentCustomers = customers.filter(c => c.agentId === agent._id.toString());
      const agentDebits = payments.filter(p => p.agentId.toString() === agent._id.toString());

      const classCounts = {};
      const kycCounts = { minKYC: 0, fullKYC: 0 };

      agentTags.forEach(tag => {
        classCounts[tag.tagClass] = (classCounts[tag.tagClass] || 0) + 1;
      });

      agentCustomers.forEach(c => {
        if (c.status?.toLowerCase() === 'min') kycCounts.minKYC++;
        if (c.status?.toLowerCase() === 'full') kycCounts.fullKYC++;
      });

      const walletUtilized = agentDebits.reduce((sum, payment) => sum + (payment.amount || 0), 0);

      return {
        agentName: agent.name,
        subpartnerName: subpartnerMap[agent.adminID?.toString()] || null,
        agentId: agent._id,
        tagsAssigned: agentTags.length,
        walletAdded: agent.wallet || 0,
        walletUtilized: walletUtilized,
        tagClassSummary: classCounts,
        kycSummary: kycCounts,
      };
    });

    res.status(200).json({ success: true, data: result });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error generating report" });
  }
};

module.exports = { generateReport };
