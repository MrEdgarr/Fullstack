const express = require("express");
const router = express.Router();
const cinemasController = require("../controllers/cinemas.controller");
const authMiddleware = require("../middleware/auth");
const requireRole = require("../middleware/role");
const adminOnly = requireRole(["admin"]);

const validate = require("../middleware/validate");
const schemas = require("../validations/schemas");

router.get("/", cinemasController.getAll);
router.get("/:id", cinemasController.getById);

router.use(authMiddleware);
router.post("/", adminOnly, validate(schemas.cinema), cinemasController.create);
router.put("/:id", adminOnly, validate(schemas.cinema), cinemasController.update);
router.delete("/:id", adminOnly, cinemasController.delete);

module.exports = router;
