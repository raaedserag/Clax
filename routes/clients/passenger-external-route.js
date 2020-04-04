// Modules
const express = require("express");
const router = express.Router();
// Routes
const { verifyPassengerMail } = require("../../controllers/clients/passenger-external-controller")
//---------------------

router.put("/verify-mail/:id", verifyPassengerMail)


module.exports = router;
