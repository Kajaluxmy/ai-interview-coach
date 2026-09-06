const express = require("express");

const {
  uploadResume,
  getResumes,
  getResume,
  deleteResume,
} = require("../controllers/resumeController");

const protect = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post(
  "/upload",
  protect,
  upload.single("resume"),
  uploadResume
);

router.get(
  "/",
  protect,
  getResumes
);

router.get(
  "/:id",
  protect,
  getResume
);

router.delete(
  "/:id",
  protect,
  deleteResume
);

module.exports = router;