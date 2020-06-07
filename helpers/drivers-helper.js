// Services
const { distanceMatrix } = require("../services/google-map.js");
const { getLineDrivers } = require("../services/firebase");
// Helpers
const { sortingDrivers } = require("./algorithms")
//--------------------------------------------

// Returns array of sorted drivers -according to duration- entries, Example:
/*drivers[][0] => driverobjectId
  drivers[][1] => {"loc": {"lat": "0.0", "lng": "0.0"}, "seats": "5", "fireBaseId": "rrr"}, "tripId": "tripObjectId"
  drivers[][2] => {"distance": {"text": "5 Km", "value": "5000"},
                   "duration": {"text": "1 h", "value": "3600"},
                   "status": "OK"}*/
module.exports.getAvailableDrivers = async function (originLoc, lineId, requiredSeats) {
  try {
    let drivers = await getLineDrivers(lineId, requiredSeats)
    // Check if passed 'drivers' is an array
    if (!Array.isArray(drivers)) throw new Error('\'drivers\' must be an array')

    // Query for drivers distances, storing it with the driver's array
    let result = await distanceMatrix([originLoc],
      drivers.map(d => d[1].loc)) // Pass drivers locations only
    // Check if result is an array
    if (!Array.isArray(drivers)) throw new Error("Can't get drivers locations")

    // Map every result to the corresponding driver
    result.elements.map((value, i) => drivers[i].push(value))
    // Now drivers array contains distance info, let's sort it 
    drivers = sortingDrivers(drivers)
    // Check if result isn't null, (Can happen when filtering with distance status flag)
    if (!(drivers && drivers.length)) throw new Error('No available drivers')
    // If all is well
    return { drivers, stationName: result.originalName };

  } catch (error) {
    throw new Error(error.message)
  }
};

