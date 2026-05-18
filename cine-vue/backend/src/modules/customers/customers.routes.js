const express = require("express");
const customersController = require("./customers.controller");
const authMiddleware = require("../../shared/middleware/auth");
const requireRole = require("../../shared/middleware/role");
const validate = require("../../shared/middleware/validate");
const { customerUpdateSchema } = require("./customers.validation");

const router = express.Router();
const adminOnly = requireRole(["admin"]);

router.use(authMiddleware);
router.get("/:id", adminOnly, customersController.getById);
router.put("/:id", adminOnly, validate(customerUpdateSchema), customersController.update);

module.exports = router;
