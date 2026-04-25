const express = require("express");
const router = express.Router();
const paymentsController = require("../controllers/payments.controller");
const authMiddleware = require("../middleware/auth");

const validate = require("../middleware/validate");
const schemas = require("../validations/schemas");

router.use(authMiddleware);

router.post("/", validate(schemas.payment), paymentsController.create);
router.get("/booking/:bookingId", paymentsController.getByBooking);
router.put("/:id/status", paymentsController.updateStatus);

module.exports = router;
