const r = require("express").Router();
const v = require("../middleware/verifyToken");
const c = require("../controllers/power.controller");

r.post("/upgrade", v, c.upgradePower);
r.post("/aid", v, c.sendAid);

module.exports = r;
