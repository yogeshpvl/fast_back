const express = require("express");
const router = express.Router();
const TagController = require("../controller/tags");


router.get("/counts", TagController.getAllTagsCounts);
router.post("/", TagController.createTag);
router.get("/", TagController.getAllTags);
router.get("/:id", TagController.getTagById);


router.get("/createdBy/:createdId", TagController.getTagsByCreatedBy); 

router.get("/agent/:agentId", TagController.getTagsByAgent); 
router.delete("/:id", TagController.deleteTag);
router.put("/assign", TagController.assignTag);

module.exports = router;
