const router = require("express").Router();
const verifyToken = require("../middleware/verifyToken");
const attackController = require("../controllers/attack.controller");

router.post("/", verifyToken, attackController.attackUser);

module.exports = router;
