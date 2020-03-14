const router = require("express").Router();
const authentication = require("../../middlewares/authentication");

const {
  getFamilyMembers,
  sendFamilyRequest,
  cancelFamilyRequest,
  fetchRequests,
  acceptRequest,
  denyRequest,
  deleteFamilyMember,
  fetchSentRequests
} = require("../../controllers/home/family");

router.get("/", authentication, getFamilyMembers);
router.put("/add", authentication, sendFamilyRequest);
router.put("/delete", authentication, deleteFamilyMember);
router.put("/cancel", authentication, cancelFamilyRequest);
router.get("/received-requests", authentication, fetchRequests);
router.get("/sent-requests", authentication, fetchSentRequests);
router.put("/accept", authentication, acceptRequest);
router.put("/deny", authentication, denyRequest);

module.exports = router;
