const router = require("express").Router();

const {
  getFamilyMembers,
  sendFamilyRequest,
  cancelFamilyRequest,
  deleteFamilyMember,
  fetchSentRequests,
  fetchRequests,
  acceptRequest,
  denyRequest,
} = require("../../controllers/home/family-controller");

router.get("/", getFamilyMembers);
router.put("/add", sendFamilyRequest);
router.put("/cancel", cancelFamilyRequest);
router.put("/delete", deleteFamilyMember);
router.get("/fetch-requests", fetchRequests);
router.put("/accept-request", acceptRequest);
router.put("/deny-request", denyRequest);
router.get("/sent-request", fetchSentRequests);

module.exports = router;
