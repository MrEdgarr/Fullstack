const express = require("express");
const bookingsController = require("./bookings.controller");
const authMiddleware = require("../../shared/middleware/auth");
const validate = require("../../shared/middleware/validate");
const { bookingSchema, bookingStatusSchema } = require("./bookings.validation");

const router = express.Router();

router.use(authMiddleware);
router.post("/", validate(bookingSchema), bookingsController.create);
router.get("/customer/:customerId", bookingsController.getByCustomer);
router.put("/:id/status", validate(bookingStatusSchema), bookingsController.updateStatus);
router.delete("/:id", bookingsController.delete);

module.exports = router;
