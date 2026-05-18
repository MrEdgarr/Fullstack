const express = require("express");
const promotionsController = require("./promotions.controller");

const router = express.Router();

router.get("/:code/validate", promotionsController.validate);

module.exports = router;
