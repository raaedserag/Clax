const router = require("express").Router();

const {
    getDriver,
    updateDriver,
    addCar,
    requestMailVerification,
    confirmMail,
    requestPhoneVerification,
    confirmPhone
} = require("../../controllers/driverHome/settings");

router.get("/", getDriver);
router.put("/",updateDriver);

router.post("/addCar",addCar);

router.post("/mail-verification", requestMailVerification);
router.put("/mail-verification", confirmMail);

router.post("/phone-verification", requestPhoneVerification)
router.put("/phone-verification", confirmPhone);

module.exports = router;
