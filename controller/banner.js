const bannerModel = require("../model/banner");
const NodeCache = require("node-cache");
const nodeCache = new NodeCache();

class banner {
  async postaddbanner(req, res) {
    const nodeCache = new NodeCache();
    let file = req.file?.filename;
    const { bannerurl } = req.body;
    try {
      let newbanner = new bannerModel({
        banner: file,

        bannerurl,
      });

      let save = newbanner.save();
      nodeCache.del("banner");
      if (save) {
        return res.json({ success: "banner added successfully" });
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getallbanner(req, res) {
    const nodeCache = new NodeCache();

    let banner;
    try {
      if (nodeCache.has("banner")) {
        banner = nodeCache.get("banner");
      } else {
        banner = await bannerModel.find({}).sort({ _id: -1 });
        nodeCache.set("banner", JSON.stringify(banner));
      }

      if (banner && banner.length > 0) {
        return res.json({ data:banner });
      } else {
        return res.status(404).json({ error: "Banner not found" });
      }
    } catch (error) {
      console.error("Error retrieving banner:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async postdeletebanner(req, res) {
    let id = req.params.id;
    console.log("id: " +id)
    const data = await bannerModel.deleteOne({ _id: id });

    return res.json({ success: "Successfully" });
  }
}

const bannerController = new banner();
module.exports = bannerController;
