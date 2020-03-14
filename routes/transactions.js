const express = require("express");
const router = require("express").Router();

const {
  payOgra,
  ograSuccess,
  ograCancel
} = require("../controllers/transactions");

router.post("/pay", payOgra);
router.get("/success/:id/:amount", ograSuccess);
router.get("/cancel", ograCancel);

module.exports = router;
