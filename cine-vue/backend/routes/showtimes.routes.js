const express = require("express");
const router = express.Router();
const showtimesController = require("../controllers/showtimes.controller");
const authMiddleware = require("../middleware/auth");
const requireRole = require("../middleware/role");
const adminOnly = requireRole(["admin"]);

const validate = require("../middleware/validate");
const schemas = require("../validations/schemas");

router.get("/", showtimesController.getAll);
router.get("/movie/:movieId", showtimesController.getByMovie);

router.use(authMiddleware);
router.post("/", adminOnly, validate(schemas.showtime), showtimesController.create);
router.put("/:id", adminOnly, validate(schemas.showtime), showtimesController.update);
router.delete("/:id", adminOnly, showtimesController.delete);

module.exports = router;
