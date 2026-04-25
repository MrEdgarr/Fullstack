const express = require("express");
const router = express.Router();
const moviesController = require("../controllers/movies.controller");
const authMiddleware = require("../middleware/auth");
const requireRole = require("../middleware/role");
const adminOnly = requireRole(["admin"]);

const validate = require("../middleware/validate");
const schemas = require("../validations/schemas");

router.get("/", moviesController.getAll);
router.get("/:id", moviesController.getById);

router.use(authMiddleware);
router.post("/", adminOnly, validate(schemas.movie), moviesController.create);
router.put("/:id", adminOnly, validate(schemas.movie), moviesController.update);
router.delete("/:id", adminOnly, moviesController.delete);

module.exports = router;
