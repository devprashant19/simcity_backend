const express = require('express');
const router = express.Router();
const advisorController = require('../controllers/advisor.controller');

router.post('/chat', advisorController.getAdvice);

module.exports = router;
