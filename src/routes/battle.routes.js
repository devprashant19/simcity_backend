const r = require("express").Router();
const v = require("../middleware/verifyToken");
const war = require("../middleware/checkWar");
const c = require("../controllers/battle.controller");

r.post("/attack", v, war, c.attack);
r.post("/request-help", v, c.requestHelp);
r.post("/help", v, c.acceptHelp);
r.post("/resolve", v, c.resolveBattle);
r.get("/status/:battleId", v, c.getBattleStatus);


module.exports = r;
