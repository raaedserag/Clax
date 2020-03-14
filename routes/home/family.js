const router = require("express").Router();
const authentication = require("../../middlewares/authentication");

const {
  getFamilyMembers,
  sendFamilyRequest,
  cancelFamilyRequest,
  fetchRequests,
  acceptRequest,
  denyRequest
} = require("../../controllers/home/family");

router.get("/", authentication, getFamilyMembers);
router.put("/add", authentication, sendFamilyRequest);
router.put("/cancel", authentication, cancelFamilyRequest);
router.get("/fetch-requests", authentication, fetchRequests);
router.put("/accept-request", authentication, acceptRequest);
router.put("/deny-request", authentication, denyRequest);

module.exports = router;
