const mongoose = require("mongoose");

const tagsSchema = new mongoose.Schema({
  kitNo: {
    type: String,
    required: true,
    unique: true, // Assuming kitNo should be unique
  },
  status: {
    type: String,
    // enum: ["active", "inactive", "assigned"], 

  },
  kitType: {
    type: String,

  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "agent", // Reference to Agent model
  },
  agentName: {
    type: String,
    ref: "agent", // Reference to Agent model

  },
}, { timestamps: true }); 

const TagModel = mongoose.model("Tag", tagsSchema);
module.exports = TagModel;
