// Modules
const path = require('path');
const mongoose = require('mongoose');
// Configuration
const { dbType } = require("../../startup/config").dbConfig();
const dbStatusDict = ["Disconnected", "Connected", "Connecting", "Disconnecting"]
//----------------

module.exports.getServerStatus = async (req, res) => {
    res.set({
        'x-dbType': dbType[0].toUpperCase() + dbType.slice(1).toString(),
        'x-dbStatus': dbStatusDict[mongoose.connection.readyState].toString()
    }).sendFile(path.resolve(__dirname + '../../../views/index.html'));


}
