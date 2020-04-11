const authorization = require("../../middlewares/authorization");
const {
  adminLogin,
  getUsers,
  adminRegister,
  getAdminInfo,
} = require("../../controllers/home/admin");
const express = require("express");
const router = express.Router();

router.post("/register", adminRegister);
router.post("/login", adminLogin);
router.get("/me", authorization, getAdminInfo);
router.get("/get-users", authorization, getUsers);
router.post("/add-offer", authorization, getUsers);

module.exports = router;
