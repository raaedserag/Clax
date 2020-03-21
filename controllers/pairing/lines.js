const {Lines} = require('../../models/lines-model');



 let lines = async(req, res) => {
  console.log("line:")
  const viewlines = await Lines.find({ }).select("from to _stations cost ").populate({
    path:"_stations",
     select:"coordinates name id"});
    if (!viewlines) return res.status(404).send("error");
    console.log('lines here');
   
    res.send(viewlines);
};



module.exports.lines=lines;