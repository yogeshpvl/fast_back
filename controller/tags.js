const TagModel = require("../model/tags");
const agentModel =require("../model/Auth/agentAuth");


class TagController {
  // Create a new tag
  async createTag(req, res) {

    try {
        const { tags } = req.body; // Expecting an array of tags
        const newTags = await TagModel.insertMany(tags);
        res.status(201).json(newTags);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    
  }

  // Get all tags
  async getAllTags(req, res) {
    try {
      const tags = await TagModel.find().populate("assignedTo", "name"); // Populates assigned agent name
      return res.status(200).json(tags);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  // Get a single tag by ID
  async getTagById(req, res) {
    try {
      const tag = await TagModel.findById(req.params.id);
      if (!tag) return res.status(404).json({ message: "Tag not found" });
      return res.status(200).json(tag);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

   // Get all tags assigned to a specific agent
   async getTagsByAgent(req, res) {
    try {
      const { agentId } = req.params;
      const tags = await TagModel.find({ assignedTo: agentId }).populate("assignedTo", "name email");
      if (!tags.length) return res.status(404).json({ message: "No tags found for this agent" });
      return res.status(200).json(tags);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  // Delete a tag
  async deleteTag(req, res) {
    try {
      const deletedTag = await TagModel.findByIdAndDelete(req.params.id);
      if (!deletedTag) return res.status(404).json({ message: "Tag not found" });
      return res.status(200).json({ message: "Tag deleted successfully" });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  // Assign a tag to an agent
  async assignTag(req, res) {
    try {
        const { tags, agentId ,agentName} = req.body;
    
        // Validate input
        if (!tags || !Array.isArray(tags) || tags.length === 0) {
          return res.status(400).json({ error: "No tags provided for assignment" });
        }
        if (!agentId) {
          return res.status(400).json({ error: "Agent ID is required" });
        }
    
        // Check if Agent exists
        const agent = await agentModel.findById(agentId);
        if (!agent) {
          return res.status(404).json({ error: "Agent not found" });
        }
    
        // Update FastTags in bulk
        await TagModel.updateMany(
          { _id: { $in: tags } },  // Update only selected tags
          { $set: { assignedTo: agentId,agentName:agentName, status: "Assigned" } }
        );
    
        res.json({ message: "FastTags assigned successfully!" });
      } catch (error) {
        console.error("Error assigning FastTags:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
  }
}

module.exports = new TagController();
