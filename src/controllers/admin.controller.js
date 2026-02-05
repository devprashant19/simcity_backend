const WarState = require("../models/WarState");

exports.toggleWar = async (req, res) => {
  const { status } = req.body; // true / false

  let war = await WarState.findOne();
  if (!war) war = await WarState.create({ warEnabled: status });
  else {
    war.warEnabled = status;
    await war.save();
  }

  res.json({
    message: `War mode ${status ? "ENABLED" : "DISABLED"}`
  });
};

exports.resetWar = async (req, res) => {
  try {
    let war = await WarState.findOne();
    if (!war) {
      war = await WarState.create({ warEnabled: false });
    } else {
      war.warEnabled = false;
      await war.save();
    }

    res.json({ message: "War reset", warEnabled: war.warEnabled });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
