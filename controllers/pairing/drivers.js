const { Drivers} = require('../../models/drivers-model');
const {Lines} = require('../../models/lines-model');
const {ObjectId} = require('mongodb');
const googleApi = require ("../../services/google-map.js");
let u_driver=[];
let distance=[];
let index=[];
let dis=[];
let last=[];



let drivers = async(req, res) => {
 
  const line =req.body.lineid;
  const seats = req.body.seats;
  //get user location from post man
  const loc =[req.body.loc]; 
  //const userloc=["1600 Amphitheatre Parkway"];
  
  //get drivers' locations from web socket
  //enter theese points at map by (latitudes and longitudes) 
  //must be logic points to calculate distance 
  const des = [{ "lat": 55, "lng": -110 },{ "lat": 50, "lng": -110 },{ "lat": 40, "lng": -110 }]; 

 //first filteration driver by (active and line) and get its id
  const driver= await Drivers.find({'status._activeLine':line,'status.is_available':true,'status.availableSeats': { $gte: seats }});
  if(!driver) return res.status(404).send('no driver is  available');
  const len = driver.length;
  for (i = 0; i < len; i++) {
      u_driver[i]=driver[i]._id;
   };
  //console.log(u_driver);
  //get distances from drivers and user 
  const response =  await googleApi.distancematrix(loc,des);
 
 
  // parse these distances
  const distance = await parseResponse(response.data);
  //console.log(distance);

  //mapping and sorting distances with id
  const nearest = await mapping(distance);
  console.log(nearest);
  res.send(nearest);  
};




//mapping id and sorting distance function
async function mapping (dis){
  
  index=[0,1];

  var result =  Object.assign.apply({}, index.map( (v, i) => ( {[v]: dis[i]} ) ) );
  console.log(result);

  var sorted=dis.sort();
  console.log(sorted.length);
  var obj_len =Object.keys(result).length;

  for (i=0;i<sorted.length;i++){
    for (j=0;j<obj_len;j++){
      if (sorted[i]==result[j]){
        last[i]= u_driver[j];
      }
    }
  };
  return last;
};


// parse function
async function parseResponse (response) {
  var origins = response.origin_addresses;
  var destinations = response.destination_addresses;
  
  for (var i = 0; i < origins.length; i++) {
    var results = response.rows[i].elements;
    for (var j = 0; j < results.length; j++) {
      var element = results[j];
      distance [j]= element.distance.text;
      var duration = element.duration.text;
      var from = origins[i];
      var to = destinations[j];
      
    }
  }
  return  distance;


};


module.exports.drivers=drivers;
