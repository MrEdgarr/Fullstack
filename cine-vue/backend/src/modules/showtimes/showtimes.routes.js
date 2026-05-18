const express = require("express");
const showtimesController = require("./showtimes.controller");
const authMiddleware = require("../../shared/middleware/auth");
const requireRole = require("../../shared/middleware/role");
const validate = require("../../shared/middleware/validate");
const {
  showtimeCreateSchema,
  showtimeUpdateSchema,
} = require("./showtimes.validation");

const router = express.Router();
const adminOnly = requireRole(["admin"]);

router.get("/", showtimesController.getAll);
router.get("/movie/:movieId", showtimesController.getByMovie);
router.get("/:id/seats", showtimesController.getSeats);
router.use(authMiddleware);
router.post("/", adminOnly, validate(showtimeCreateSchema), showtimesController.create);
router.put("/:id", adminOnly, validate(showtimeUpdateSchema), showtimesController.update);
router.delete("/:id", adminOnly, showtimesController.delete);

module.exports = router;
