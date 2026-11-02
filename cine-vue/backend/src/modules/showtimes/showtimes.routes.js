import express from "express";
import * as showtimesController from "./showtimes.controller.js";
import authMiddleware from "../../shared/middleware/auth.js";
import requireRole from "../../shared/middleware/role.js";
import validate from "../../shared/middleware/validate.js";
import {
  showtimeCreateSchema,
  showtimeUpdateSchema,
} from "./showtimes.validation.js";

const router = express.Router();
const adminOnly = requireRole(["admin"]);

router.get("/", showtimesController.getAll);
router.get("/schedule/tree", showtimesController.getScheduleTree);
router.get("/movie/:movieId/tree", showtimesController.getMovieScheduleTree);
router.get("/movie/:movieId", showtimesController.getByMovie);
router.get("/:id/seats", showtimesController.getSeats);
router.use(authMiddleware);
router.post("/", adminOnly, validate(showtimeCreateSchema), showtimesController.create);
router.put("/:id", adminOnly, validate(showtimeUpdateSchema), showtimesController.update);
router.delete("/:id", adminOnly, showtimesController.remove);

export default router;
