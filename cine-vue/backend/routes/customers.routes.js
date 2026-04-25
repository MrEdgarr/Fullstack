const express = require("express");
const router = express.Router();
const customersController = require("../controllers/customers.controller");
const authMiddleware = require("../middleware/auth");
const requireRole = require("../middleware/role");
const adminOnly = requireRole(["admin"]);

const validate = require("../middleware/validate");
const schemas = require("../validations/schemas");

router.use(authMiddleware);

router.get("/:id", adminOnly, customersController.getById);
router.put("/:id", adminOnly, validate(schemas.customer), customersController.update);

module.exports = router;
