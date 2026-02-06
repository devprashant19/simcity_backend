const r = require("express").Router();
const c = require("../controllers/war.controller");

r.get("/status", c.getWarStatus);

module.exports = r;
