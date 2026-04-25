const express = require("express");
const router = express.Router();
const customersController = require("../controllers/customers.controller");



router.get("/:id", customersController.getById);
router.put("/:id",   customersController.update);

module.exports = router;
