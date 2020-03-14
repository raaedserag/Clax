const express = require("express");
const router = require("express").Router();
// const {complaintsPost} = require('../controllers/complaints');
const {
  complaintsPost,
  complaintsGet,
  tripGet
} = require("../controllers/complaints");

router.post("/complaint", complaintsPost);
router.post("/mycomplaint", complaintsGet);
router.post("/", tripGet);

module.exports = router;
