const express = require("express");
const citiesController = require("./cities.controller");
const authMiddleware = require("../../shared/middleware/auth");
const requireRole = require("../../shared/middleware/role");
const validate = require("../../shared/middleware/validate");
const { citySchema } = require("./cities.validation");

const router = express.Router();
const adminOnly = requireRole(["admin"]);

router.get("/", citiesController.getAll);
router.get("/:id", citiesController.getById);
router.use(authMiddleware);
router.post("/", adminOnly, validate(citySchema), citiesController.create);
router.put("/:id", adminOnly, validate(citySchema), citiesController.update);
router.delete("/:id", adminOnly, citiesController.delete);

module.exports = router;
