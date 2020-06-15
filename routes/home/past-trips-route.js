const router = require("express").Router();

const {
  pastTrips,
  getFavourtieTrips,
  addToFavourite,
} = require("../../controllers/home/past-trips-controller");

router.get("/", pastTrips);
router.get("/favourite", getFavourtieTrips);
router.put("/favourite", addToFavourite);

module.exports = router;
