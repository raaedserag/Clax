// Modules
const express = require("express");
const router = express.Router();
// Controllers
const {
  complaintsPost,
  complaintsGet,
} = require("../../controllers/driver/driver-complaints");
//------------

// Create a complaint
router.post("/add", complaintsPost);

// Get all passenger complains
router.get("/all", complaintsGet);

module.exports = router;
