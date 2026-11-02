import express from "express";
import * as ticketsController from "./tickets.controller.js";
import authMiddleware from "../../shared/middleware/auth.js";
import requireRole from "../../shared/middleware/role.js";
import validate from "../../shared/middleware/validate.js";
import { ticketSchema } from "./tickets.validation.js";

const router = express.Router();
const adminOnly = requireRole(["admin"]);

router.use(authMiddleware);
router.post("/", adminOnly, validate(ticketSchema), ticketsController.create);
router.get("/booking/:bookingId", ticketsController.getByBooking);
router.delete("/:id", adminOnly, ticketsController.remove);

export default router;
