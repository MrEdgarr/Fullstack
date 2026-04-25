const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

const validate = require("../middleware/validate");
const schemas = require("../validations/schemas");

router.post("/register", validate(schemas.register), authController.register);
router.post("/login", validate(schemas.login), authController.login);

module.exports = router;
