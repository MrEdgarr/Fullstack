import express from "express";
import * as paymentsController from "./payments.controller.js";
import authMiddleware from "../../shared/middleware/auth.js";
import validate from "../../shared/middleware/validate.js";
import { paymentSchema, paymentStatusSchema } from "./payments.validation.js";

const router = express.Router();

router.get("/methods", paymentsController.getMethods);

router.use(authMiddleware);
router.post("/", validate(paymentSchema), paymentsController.create);
router.get("/booking/:bookingId", paymentsController.getByBooking);
router.put("/:id/status", validate(paymentStatusSchema), paymentsController.updateStatus);

export default router;
