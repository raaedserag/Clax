const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("index", { title: "Graduation", trips: "trips" });
});

module.exports = router;
