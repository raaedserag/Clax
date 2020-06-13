const router = require("express").Router();

const {
    getDriver,
    updateDriver,
    addCar
} = require("../../controllers/driverHome/settings");

router.get("/", getDriver);
router.put("/",updateDriver);
router.post("/addCar",addCar);

module.exports = router;
