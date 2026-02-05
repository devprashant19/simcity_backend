const router = require("express").Router();
const { getGame, seedGame, updateProgress } = require("../controllers/game.controller");
const verifyToken = require("../middleware/verifyToken");

router.get("/", getGame);
router.post("/seed", seedGame);
router.post("/update-progress", verifyToken, updateProgress); // Protected route

module.exports = router;
