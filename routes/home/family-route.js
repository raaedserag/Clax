const router = require("express").Router();

const {
  getFamilyInfo,
  sendFamilyRequest,
  cancelFamilyRequest,
  deleteFamilyMember,
  acceptRequest,
  denyRequest,
} = require("../../controllers/home/family-controller");

router.get("/", getFamilyInfo);
router.put("/add", sendFamilyRequest);
router.put("/cancel", cancelFamilyRequest);
router.put("/delete", deleteFamilyMember);
router.put("/accept-request", acceptRequest);
router.put("/deny-request", denyRequest);

module.exports = router;
