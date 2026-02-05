const r = require("express").Router();
const v = require("../middleware/verifyToken");
const isAdmin = require("../middleware/isAdmin");
const admin = require("../controllers/admin.controller");

r.post("/war", v, isAdmin, admin.toggleWar);
r.post("/war/reset", v, isAdmin, admin.resetWar);

module.exports = r;
