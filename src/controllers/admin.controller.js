const WarState = require("../models/WarState");

exports.toggleWar = async (req, res) => {
  const body = req.body || {};
  const query = req.query || {};

  // Check both Body and Query params
  const enabled = body.enabled !== undefined ? body.enabled : query.enabled;

  if (enabled === undefined) {
    return res.status(400).json({
      message: "Field 'enabled' (true/false) is required."
    });
  }

  const status = String(enabled) === 'true'; // Handle string or boolean input

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
