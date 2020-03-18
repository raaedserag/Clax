// Modules
const express = require("express");
const router = express.Router();
const _ = require("lodash");
//---------------------

router.get("/me", async (req, res) => {
    const passenger = await Passengers.findById(req.passenger._id).select(
      "name mail phone"
    );
    res.send(passenger);
  });

module.exports = router;
