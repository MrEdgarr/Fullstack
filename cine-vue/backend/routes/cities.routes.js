const express = require("express");
const router = express.Router();
const citiesController = require("../controllers/cities.controller");
const authMiddleware = require("../middleware/auth");
const requireRole = require("../middleware/role");
const adminOnly = requireRole(["admin"]);

const validate = require("../middleware/validate");
const schemas = require("../validations/schemas");

router.get("/", citiesController.getAll);
router.get("/:id", citiesController.getById);

router.use(authMiddleware);

router.post("/", adminOnly, validate(schemas.city), citiesController.create);
router.put("/:id", adminOnly, validate(schemas.city), citiesController.update);
router.delete("/:id", adminOnly, citiesController.delete);

module.exports = router;
