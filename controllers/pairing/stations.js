const { Stations } = require('../../models/stations-model');
const { Lines } = require('../../models/lines-model');

let name = "";
let lineView = [];




let locStation = async (req, res) => {
    let station = new Stations({
        type: 'Point',
        coordinates: req.body.location
    });
    station.save();
    //recive location from flutter
    locc = req.body.location;
    let ver = locc.longitude;
    let hor = locc.latitude;
    let correctStation = "";
    let send = [];
    const stations = await Stations.findOne({ 'coordinates.longitude': ver, 'coordinates.latitude': hor });
    if (!stations) return res.status(404).send('the customer with the given name was not found');
    name = stations.name;





    //plz change parmaters for search in DataBase && using correct name  
    // for (i=0;i<Stations.estimatedDocumentCount();i++){
    //   if (ver>1000&&ver<3000&&hor>100&&hor<500)
    //     correctStation=Stations[i].name;

    //   else 
    //   return res.status(404).send('the customer with the given name was not found');
    //   console.log(correctStation);
    // }

    //console.log(correctStation)

    const avaLines = await Lines.find({ stations: name });
    if (!avaLines) return res.status(404).send('no lines at this location');

    const len = avaLines.length;
    for (i = 0; i < len; i++) {
        send[i] = { "id": avaLines[i]._id, "fees": (avaLines[i].cost).toString(), "line": avaLines[i].to };

    }
    res.send(send);
};





module.exports.locStation = locStation;

// module.exports.avlines= avLines ;