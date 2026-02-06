const router = require("express").Router();
const { getGame, seedGame, updateProgress, getCurrentQuestion, submitAnswer } = require("../controllers/game.controller");
const verifyToken = require("../middleware/verifyToken");

router.get("/", getGame); // Keep for legacy or general info
router.post("/seed", seedGame); // Keep for legacy
router.post("/update-progress", verifyToken, updateProgress);

// NEW: Core Gameplay Routes
router.get("/current-question", verifyToken, getCurrentQuestion);
router.post("/answer", verifyToken, submitAnswer);

module.exports = router;
