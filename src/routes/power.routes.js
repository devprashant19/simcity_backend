const r = require("express").Router();
const v = require("../middleware/verifyToken");
const c = require("../controllers/power.controller");



r.post("/upgrade", v, c.upgradePower);

module.exports = r;


module.exports = r;
