// Models
const {Stations, validateStations} = require('../../models/stations-model')
const {Lines, validateLine} = require('../../models/lines-model')
// Modules
const _ = require('lodash')
// Setup Debugger
const geoJsonDebugger = require("debug")("Clax:geoJson");
//--------------

const parseGeoJson = function(geoJsonObject){
    let stations = []
    geoJsonObject.features.forEach(feature => {
        stations.push({
            name: feature.properties.Name,
            type: feature.geometry.type, 
            coordinates: feature.geometry.coordinates
        })
    })
    return stations
};

const createStations = async function(geoJsonStations){
    try {
        const newStations = await Stations.create(geoJsonStations)
        return {success: true, result: _.map(newStations, s => {
            return s._id.toString()
        })}
    } 
    catch (error) {
        geoJsonDebugger(error.message)
        return {success: false, result: error.message}
    }
}

const createLine = async function(line){
  try {
      const newLine = await Lines.create(line)
      return {success: true, result: newLine}
  } catch (error) {
      geoJsonDebugger(error.message)
      return {success: false, result: error.message}
  }
  
}

const createGeoJson = function(places, paths, name)
{
    if (!(places || paths)) return null
    let featuresList = []
    if(places)
    {
        places.forEach(place => {
            featuresList.push(
                {
                    type: "Feature",
                    properties: {
                        Name: place.name,
                        description: place.description
                    },
                    geometry: {
                        type: place.type,
                        coordinates: place.coordinates
                    }
                }
            )
        });
    }
    if(paths)
    {
        paths.forEach(path => {
            featuresList.push(
                {
                    type: "Feature",
                    properties: {
                        Name: path.name,
                        tessellate: 1,
                        extrude: 0, 
                        visibility: -1 
                    },
                    geometry: {
                        type: path.type,
                        coordinates: path.coordinates
                    }
                }
            )
        });
    }
    
    return {
        type: "FeatureCollection",
        name: name,
        crs: { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
        features: featuresList
    };
};

module.exports.createNewLine = async function(req, res){
    // Check for _stations attribute
    if(!req.body._stations) return res.status(400).send('missing \'_stations\' attribute')

    // Parse geoJson object of _stations attribute and validate Stations Object
    const stations = parseGeoJson(req.body._stations)
    const stationError = validateStations(stations).error
    if(stationError) return res.status(400).send(stationError.details[0].message)
    

    // Store stations and return ids
    const stationsIds = await createStations(stations)
    // if creating stations failed 
    if(!(stationsIds.success && stationsIds.result)) res.status(500).send("internal server error")
    
    //  replace _stations attribute with stationsIds
    req.body._stations = stationsIds.result

    // Validate line object
    const lineError = validateLine(req.body).error
    if(lineError) return res.status(400).send(lineError.details[0].message)
 
    // Create Line object
    const lineCreation = await createLine(req.body)
    // if creating line failed 
    if(!(lineCreation.success && lineCreation.result)) return res.status(500).send("internal server error")

    // IF ALL IS WELL 
    return res.status(200).send(lineCreation.result)
    
    
}

