const authentication = require("../../middlewares/authentication");
const { authorizeAdmin } = require("../../middlewares/authorization");
const {
  adminLogin,
  adminRegister,
  getAdminInfo,
} = require("../../controllers/admin/admin");
const {
  getPassengers,
  getPassengerById,
  editPassengers,
} = require("../../controllers/admin/passengers");
const { getDrivers } = require("../../controllers/admin/drivers");
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
router.get("/me", [authentication, authorizeAdmin], getAdminInfo);

//passengers
router.get("/get-passengers", [authentication, authorizeAdmin], getPassengers);
router.get(
  "/get-passengers/:id",
  [authentication, authorizeAdmin],
  getPassengerById
);
router.post(
  "/passengers/edit",
  [authentication, authorizeAdmin],
  editPassengers
);

//passengers offers
router.post("/add-offer", [authentication, authorizeAdmin], addOffer);
router.get("/get-offers", [authentication, authorizeAdmin], getOffers);
router.post("/delete-offer", [authentication, authorizeAdmin], deleteOffer);

//complaints
router.get("/complaints", [authentication, authorizeAdmin], getComplaints);
router.get(
  "/complaints/:id",
  [authentication, authorizeAdmin],
  getComplaintById
);
router.post(
  "/complaints/respond/:id",
  [authentication, authorizeAdmin],
  respondToComplaint
);

//statistics
router.get("/statistics", [authentication, authorizeAdmin], getStatistics);

//drivers
router.post("/get-drivers", [authentication, authorizeAdmin], getDrivers);

module.exports = router;
