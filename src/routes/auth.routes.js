const router = require("express").Router();
const { firebaseAuth } = require("../controllers/auth.controller");

router.post("/firebase-auth", firebaseAuth);

module.exports = router;
