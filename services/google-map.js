//googleMaps library
const GoogleMap = new (require("@googlemaps/google-maps-services-js").Client);
const { googleMapsKey } = require("../startup/config").googleMapsCredentials()
//------------------------

// Calculate Distance between user and drivers && access api key

module.exports.calculateDistances = async function (userLoc, destLoc, drivers) {
  // More Info Distance Matrix Api:
  // https://developers.google.com/maps/documentation/distance-matrix/start

  let response = await GoogleMap.distancematrix({
    params: {
      origins: [destLoc],
      destinations: [userLoc].concat(drivers),
      key: googleMapsKey
    },
    language: 'ar',
    timeout: 1000, // milliseconds
  });
  return {
    userDistance: response.data.rows[0].elements[0],
    driversDistances: response.data.rows[0].elements.slice(1),
    stationName: response.data.destination_addresses[0]
  }
};
