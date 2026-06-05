const express = require("express");
const multer = require("multer");
const { upload, getFile, getUsersS3 } = require("../controllers/s3Controller.js");

const router = express.Router();
const multerUpload = multer({ storage: multer.memoryStorage() });

router.get("/users", getUsersS3);
router.post("/upload", multerUpload.single("file"), upload);
router.get("/:fileName", getFile);

module.exports = router;