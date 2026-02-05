const mongoose = require("mongoose");

const warStateSchema = new mongoose.Schema({
  warEnabled: { type: Boolean, default: false }
});

module.exports = mongoose.model("WarState", warStateSchema);
