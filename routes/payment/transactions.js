// Modules
const router = require("express").Router();
// Controllers
const {
  acceptRequest,
  addRequest,
  fetchRequests,
  cancelRequest
} = require("../../controllers/payment/transactions");
//-------------------------------------------------------------------------

router.get("/", fetchRequests);
router.post("/add", addRequest);
router.post("/accept", acceptRequest);
router.post("/cancel", cancelRequest);

module.exports = router;
