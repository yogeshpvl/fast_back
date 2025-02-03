// const express = require("express");
// const router = express.Router();
// const bannerController = require("../controller/banner");

// const multer = require("multer");

// var storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "public/userbanner");
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + "_" + file.originalname);
//   },
// });

// const upload = multer({ storage: storage });

// router.post(
//   "/addbanner",
//   upload.single("banner"),
//   bannerController.postaddbanner
// );
// router.get("/getallbanner", bannerController.getallbanner);
// router.post("/deletebanner/:id", bannerController.postdeletebanner);

// module.exports = router;


const express = require("express");
const router = express.Router();
const bannerController = require("../controller/banner");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "public/userbanner";
    // Check if directory exists
    if (!fs.existsSync(dir)){
      // Create directory if it doesn't exist
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "_" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post(
  "/addbanner",
  upload.single("banner"),
  bannerController.postaddbanner
);
router.get("/getallbanner", bannerController.getallbanner);
router.delete("/deletebanner/:id", bannerController.postdeletebanner);

module.exports = router;
