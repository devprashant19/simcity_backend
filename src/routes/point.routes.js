const r = require("express").Router();

const v = require("../middleware/verifyToken");

const c = require("../controllers/power");
r.post("/update", v, c.updatePower);

module.exports = r;
