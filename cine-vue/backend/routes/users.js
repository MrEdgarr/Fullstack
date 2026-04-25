var express = require("express");
var router = express.Router();
const test = require("../controllers/test");

router.get("/", test.getAllCinemas);

module.exports = router;
