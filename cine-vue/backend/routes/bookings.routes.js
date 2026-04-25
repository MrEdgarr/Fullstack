const express = require("express");
const router = express.Router();
const bookingsController = require("../controllers/bookings.controller");
const authMiddleware = require("../middleware/auth");

const validate = require("../middleware/validate");
const schemas = require("../validations/schemas");

router.use(authMiddleware);

router.post("/", validate(schemas.booking), bookingsController.create);
router.get("/customer/:customerId", bookingsController.getByCustomer);
router.put("/:id/status", bookingsController.updateStatus);
router.delete("/:id", bookingsController.delete);

module.exports = router;
