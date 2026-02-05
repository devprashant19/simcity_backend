const r = require("express").Router();
const v = require("../middleware/verifyToken");
const war = require("../middleware/checkWar");
const c = require("../controllers/battle.controller");

r.post("/attack", v, war, c.attack);
r.post("/help", v, c.acceptHelp);
r.post("/resolve", c.resolveBattle);
r.get("/status/:battleId", v, c.getBattleStatus);


module.exports = r;
