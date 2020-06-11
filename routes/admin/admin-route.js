const authorization = require("../../middlewares/authorization");
const {
  adminLogin,
  adminRegister,
  getAdminInfo,
} = require("../../controllers/admin/admin");
const { getPassengers } = require("../../controllers/admin/passengers");
const {
  addOffer,
  getOffers,
  deleteOffer,
} = require("../../controllers/admin/offer");
const {
  getComplaints,
  getComplaintById,
  respondToComplaint,
} = require("../../controllers/admin/complaints");
const express = require("express");
const router = express.Router();

//admin account routes
router.post("/register", adminRegister);
router.post("/login", adminLogin);
router.get("/me", authorization, getAdminInfo);

//passengers
router.get("/get-passengers", authorization, getPassengers);

//passengers offers
router.post("/add-offer", authorization, addOffer);
router.get("/get-offers", authorization, getOffers);
router.post("/delete-offer", authorization, deleteOffer);

//complaints
router.get("/complaints", authorization, getComplaints);
router.get("/complaints/:id", authorization, getComplaintById);
router.post("/complaints/respond/:id", authorization, respondToComplaint);

module.exports = router;
