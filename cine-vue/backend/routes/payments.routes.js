const express = require("express");
const router = express.Router();
const paymentsController = require("../controllers/payments.controller");

router.post("/", paymentsController.create);
router.get("/booking/:bookingId", paymentsController.getByBooking);
router.put("/:id/status", paymentsController.updateStatus);

module.exports = router;
