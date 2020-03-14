const router = require("express").Router();
const authentication = require("../../middlewares/authentication");

const {
  pastTrips,
  getFavourtieTrips,
  addToFavourite,
  removeFromFavourites
} = require("../../controllers/home/past-trips");

router.get("/", authentication, pastTrips);
router.get("/favourite", authentication, getFavourtieTrips);
router.put("/favourite", authentication, addToFavourite);
router.put("/favourite/delete", authentication, removeFromFavourites);

module.exports = router;
