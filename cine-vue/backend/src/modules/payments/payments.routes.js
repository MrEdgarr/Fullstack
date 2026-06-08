const express = require("express");
const paymentsController = require("./payments.controller");
const authMiddleware = require("../../shared/middleware/auth");
const validate = require("../../shared/middleware/validate");
const { paymentSchema, paymentStatusSchema } = require("./payments.validation");

const router = express.Router();

router.get("/methods", paymentsController.getMethods);

router.use(authMiddleware);
router.post("/", validate(paymentSchema), paymentsController.create);
router.get("/booking/:bookingId", paymentsController.getByBooking);
router.put("/:id/status", validate(paymentStatusSchema), paymentsController.updateStatus);

module.exports = router;
