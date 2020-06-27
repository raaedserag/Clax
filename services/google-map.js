//googleMaps library
const GoogleMap = new (require("@googlemaps/google-maps-services-js").Client);
const { googleMapsKey } = require("../startup/config").googleMapsCredentials()
//------------------------

// Calculate Distance between user and drivers && access api key

module.exports.calculateDistances = async function (origins, destinations) {
  let response = await GoogleMap.distancematrix({
    params: {
      origins,
      destinations,
      key: googleMapsKey
    },
    language: 'ar',
    timeout: 1000, // milliseconds
  });
  return response.data
};
