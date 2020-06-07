//googleMaps library
const { Client } = require("@googlemaps/google-maps-services-js");
const GoogleMap = new Client();

// Calculate Distance between user and drivers && access api key

module.exports.distanceMatrix = async function (origin, destination) {
  // More Info Distance Matrix Api:
  // https://developers.google.com/maps/documentation/distance-matrix/start

  let distanceMatrixResponse = await GoogleMap.distancematrix({
    params: {
      origins: origin,
      destinations: destination,
      key: "AIzaSyBkN4KS6PmgIVOwS4p_ceT5SlYqyQ4AsmA",
    },
    language: 'ar',
    timeout: 1000, // milliseconds
  });

  return {
    // Array containing Object of Distance and Duration Data of Each Location
    elements: distanceMatrixResponse.data.rows[0]["elements"]
    // Original station name
    , originalName: distanceMatrixResponse.data.origin_addresses
  };
};
