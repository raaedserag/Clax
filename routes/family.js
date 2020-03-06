const router = require("express").Router();
const authentication = require("../middlewares/authentication");

const {
  getFamilyMembers,
  addMember,
  removeMember,
  fetchRequests,
  acceptRequest, 
  denyRequest
} = require("../controllers/family");

router.get("/", authentication, getFamilyMembers);
router.put("/add", authentication, addMember);
router.put("/delete", authentication, removeMember);
router.get("/fetch-requests", authentication, fetchRequests)
router.put("/accept-request", authentication, acceptRequest)
router.put("/deny-request", authentication, denyRequest)

module.exports = router;
