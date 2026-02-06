const WarState = require("../models/WarState");

exports.toggleWar = async (req, res) => {
  // Debugging: Log what we received
  console.log("POST /admin/war received:");
  console.log("Headers (Content-Type):", req.headers['content-type']);
  console.log("Body:", req.body);
  console.log("Query:", req.query);

  const body = req.body || {};
  const query = req.query || {};

  // Check both Body and Query params
  const enabled = body.enabled !== undefined ? body.enabled : query.enabled;

  if (enabled === undefined) {
    return res.status(400).json({
      message: "Field 'enabled' (true/false) is required.",
      receivedBody: body,
      receivedQuery: query,
      hint: "Ensure you are using 'x-www-form-urlencoded' in Body, OR adding '?enabled=true' to the URL."
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
