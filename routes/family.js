const router = require("express").Router();
const authentication = require("../middlewares/authentication");

const {
  getFamilyMembers,
  addMember,
  removeMember
} = require("../controllers/family");

router.get("/", authentication, getFamilyMembers);
router.put("/add", authentication, addMember);
router.put("/delete", authentication, removeMember);

module.exports = router;
