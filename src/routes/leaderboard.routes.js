const router = require("express").Router();
const c = require("../controllers/leaderboard.controller");

router.get("/infrastructure", c.infrastructureLeaderboard);

module.exports = router;
