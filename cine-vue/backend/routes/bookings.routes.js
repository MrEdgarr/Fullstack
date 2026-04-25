const express = require("express");
const router = express.Router();
const bookingsController = require("../controllers/bookings.controller");

router.post("/", bookingsController.create);
router.get("/customer/:customerId", bookingsController.getByCustomer);
router.put("/:id/status", bookingsController.updateStatus);
router.delete("/:id", bookingsController.delete);

module.exports = router;
