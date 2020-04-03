// Modules
const router = require("express").Router();
// Controllers
const {
  acceptRequest,
  addRequest,
  fetchRequests,
  cancelRequest
} = require("../../controllers/payment/loaning-controller");
//-------------------------------------------------------------------------

router.get("/fetch-requests", fetchRequests);
router.post("/request-loan", addRequest);
router.put("/accept-request", acceptRequest);
router.delete("/reject-request", cancelRequest);

module.exports = router;
