import express from "express";
import * as seatsController from "./seats.controller.js";
import authMiddleware from "../../shared/middleware/auth.js";
import requireRole from "../../shared/middleware/role.js";
import validate from "../../shared/middleware/validate.js";
import { seatSchema, seatStatusSchema } from "./seats.validation.js";

const router = express.Router();
const adminOnly = requireRole(["admin"]);

router.get("/room/:roomId", seatsController.getByRoom);
router.use(authMiddleware);
router.post("/", adminOnly, validate(seatSchema), seatsController.create);
router.put("/:id/status", adminOnly, validate(seatStatusSchema), seatsController.updateStatus);
router.delete("/:id", adminOnly, seatsController.remove);

export default router;
