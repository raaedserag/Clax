// Modules
const path = require('path');
const mongoose = require('mongoose');
// Configuration
const { dbType } = require("../../startup/config").dbConfig();
//----------------

module.exports.getServerStatus = async (req, res) => {
    res.set({
        'x-dbType': dbType,
        'x-dbStatus': mongoose.connection.readyState.toString()
    }).sendFile(path.resolve(__dirname + '../../../views/index.html'));


}
