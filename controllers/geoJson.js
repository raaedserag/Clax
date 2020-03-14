/* createGeoJson
    -This function takes:
        [places{name, description, type, coordinates}], 
        [paths{name, type, coordinates}], 
        "name" 
    -This function returns a geoJson object of "FeatureCollection"
*/
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


const parseGeoJson = function(geoJsonObject){
    let stations = []
    geoJsonObject.features.forEach(feature => {
        let coord = feature.geometry.coordinates
        if(!isNaN(coord[0])) {
            coord = [[coord]]
        }
        stations.push({
            name: feature.properties.Name, 
            description: feature.properties.description, 
            type: feature.geometry.type, 
            coordinates: coord
        })
    })
};


module.exports.createGeoJson = createGeoJson;
module.exports.parseGeoJson = parseGeoJson;
