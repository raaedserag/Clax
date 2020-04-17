const googleApi = require ("../../services/google-map.js");

// replace this data from database 

let orig = ["1600 Amphitheatre Parkway, Mountain View, CA"];
let des = ["1 Infinite Loop, Cupertino, CA 95014, USA"];

// using distancematrix from googlemap services and parsing it 

async function getData(){
    const data =  await googleApi.distancematrix(orig,des)
        .then(r => {
            distance = parseResponse(r.data);
            console.log(distance);     
            //return  distance ; // can't return distance out this promise 

                });

                            
} ;

//??? have aproplem to use distance out promise 

//console.log(getData());

getData();


// parse  response and return distance between user && drivers 
async function parseResponse (response) {
    var origins = response.origin_addresses;
    var destinations = response.destination_addresses;
    var distance =[];
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