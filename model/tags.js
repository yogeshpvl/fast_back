const mongoose = require("mongoose");

const tagsSchema = new mongoose.Schema({
  kitNo: {
    type: String,
    required: true,
    unique: true, // Assuming kitNo should be unique
  },
  status: {
    type: String,
   default:"inactive"

  },
  kitType: {
    type: String,

  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "agent", 
  },
  agentName: {
    type: String,
    ref: "agent", // Reference to Agent model

  },
  tagClass:{
    type: String,
  },
  mapperClass:{
    type: String,
  },
  color:{
    type: String,
  },
  createdBy: {
    type: String,
    
  },
  createdId: {
    type: String,
    
    
  },
}, { timestamps: true }); 

const TagModel = mongoose.model("Tag", tagsSchema);
module.exports = TagModel;
