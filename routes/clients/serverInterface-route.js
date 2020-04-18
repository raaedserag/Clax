// Modules
const express = require("express");
const router = express.Router();
// Routes
const { getServerStatus } = require("../../controllers/clients/serverInterface-controller")
//---------------------

router.get("/", getServerStatus)

module.exports = router;
