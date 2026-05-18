const express = require("express");
const combosController = require("./combos.controller");

const router = express.Router();

router.get("/", combosController.getActive);

module.exports = router;
