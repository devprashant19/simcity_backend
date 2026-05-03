const r = require("express").Router();

const v = require("../middleware/verifyToken");

const c = require("../controllers/point.controller");
r.post("/update", v, c.updatePower);
r.post("/upgrade", v, c.upgradePower);

module.exports = r;
