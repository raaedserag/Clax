//googleMaps library
const Client = require("@googlemaps/google-maps-services-js").Client;
const client = new Client({});

//calculate distance between user and drivers && access api key
module.exports.distancematrix =async function (origin,dest) {
  return await client
    .distancematrix({
      params: {
        origins:origin,
        destinations:dest ,
        key: 'AIzaSyBkN4KS6PmgIVOwS4p_ceT5SlYqyQ4AsmA'
      },
    timeout: 1000 // milliseconds
    })
  };
  //)
  //   .then(r => {
  //      return r.data;
  //   })
  //   .catch(e => {
  //     return e ;
  //   })
  // };


