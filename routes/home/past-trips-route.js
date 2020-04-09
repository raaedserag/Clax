const router = require("express").Router();

const {
  pastTrips,
  getFavourtieTrips,
  addToFavourite,
  removeFromFavourites
} = require("../../controllers/home/past-trips-controller");

router.get("/", pastTrips);
router.get("/favourite", getFavourtieTrips);
router.put("/favourite", addToFavourite);
router.put("/favourite/delete", removeFromFavourites);

module.exports = router;
