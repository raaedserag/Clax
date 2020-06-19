const { Lines } = require("../../models/lines-model");

let lines = async (req, res) => {
  const viewlines = await Lines.find({})
    .select("from to _stations cost")
    .populate({
      path: "_stations",
      select: "coordinates name id",
    })
    .sort({ $natural: -1 });
  if (!viewlines) return res.status(404).send("error");

  res.send(viewlines);
};

module.exports.lines = lines;
