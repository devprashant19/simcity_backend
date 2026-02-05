const WarState = require("../models/WarState");

module.exports = async (req, res, next) => {
  const war = await WarState.findOne();

  if (!war || !war.warEnabled) {
    return res.status(403).json({
      message: "War is currently disabled by the Admin."
    });
  }

  next();
};
