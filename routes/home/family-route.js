const router = require("express").Router();

const {
  getFamilyInfo,
  sendFamilyRequest,
  cancelFamilyRequest,
  deleteFamilyMember,
  denyRequest,
} = require("../../controllers/home/family-controller");

router.get("/", getFamilyInfo);
router.put("/add", sendFamilyRequest);
router.put("/cancel", cancelFamilyRequest);
router.put("/delete", deleteFamilyMember);
router.put("/deny-request", denyRequest);

module.exports = router;
