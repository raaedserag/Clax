const { Drivers} = require('../../models/drivers-model');



module.exports.getLocation = function(id){
    var info = [];
    for (var i=0;i<id.length;i++){
        var driver = Drivers.id[i];
        info[i]= {id: id,loc:driver.loc}; // replace it with real-time drivers location
    }

    return info;
};