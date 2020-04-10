// Modules
const express = require("express");
const router = express.Router();
// Routes
const { verifyPassengerMail,
    getPasswordPage } = require("../../controllers/clients/passengerExternal-controller")
//---------------------

router.put("/verify-mail/:id", verifyPassengerMail)
router.get("/set-new-password/:id", getPasswordPage)

module.exports = router;
