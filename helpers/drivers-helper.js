// Services
const { lineRef } = require("../services/fireBase");

module.exports.getDriversLocation = async function (line, seats) {
    return (await lineRef(line)
        .orderByChild("seats")
        .once("value"))
        .val()
};