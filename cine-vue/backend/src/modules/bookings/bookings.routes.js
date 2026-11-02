import express from "express";
import * as bookingsController from "./bookings.controller.js";
import authMiddleware from "../../shared/middleware/auth.js";
import validate from "../../shared/middleware/validate.js";
import {
  bookingSchema,
  bookingStatusSchema,
  bookingDetailsSchema,
} from "./bookings.validation.js";

const router = express.Router();

router.use(authMiddleware);
router.post("/", validate(bookingSchema), bookingsController.create);
router.get("/customer/:customerId", bookingsController.getByCustomer);
router.put("/:id/details", validate(bookingDetailsSchema), bookingsController.updateDetails);
router.put("/:id/status", validate(bookingStatusSchema), bookingsController.updateStatus);
router.delete("/:id", bookingsController.remove);

export default router;
