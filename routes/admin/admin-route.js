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
const { deleteLine, addLine } = require("../../controllers/admin/lines");
const {
  getDriversNames,
  getDrivers,
  getDriver,
  deleteDriver,
  respond,
} = require("../../controllers/admin/drivers");
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
router.post(
  "/drivers/names",
  [authentication, authorizeAdmin],
  getDriversNames
);
router.get("/drivers", [authentication, authorizeAdmin], getDrivers);
router.get("/drivers/:id", [authentication, authorizeAdmin], getDriver);
router.post("/drivers/delete", [authentication, authorizeAdmin], deleteDriver);
router.post("/drivers/respond/:id", [authentication, authorizeAdmin], respond);

//lines
router.post("/lines/delete", [authentication, authorizeAdmin], deleteLine);
router.post("/lines/add", [authentication, authorizeAdmin], addLine);

module.exports = router;
