const authentication = require("../../middlewares/authentication");
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
const { getStatistics } = require("../../controllers/admin/statistics");
const express = require("express");
const router = express.Router();

//admin account routes
router.post("/register", adminRegister);
router.post("/login", adminLogin);
router.get("/me", authentication, getAdminInfo);

//passengers
router.get("/get-passengers", authentication, getPassengers);

//passengers offers
router.post("/add-offer", authentication, addOffer);
router.get("/get-offers", authentication, getOffers);
router.post("/delete-offer", authentication, deleteOffer);

//complaints
router.get("/complaints", authentication, getComplaints);
router.get("/complaints/:id", authentication, getComplaintById);
router.post("/complaints/respond/:id", authentication, respondToComplaint);

//statistics
router.get("/statistics", authorization, getStatistics);

module.exports = router;
