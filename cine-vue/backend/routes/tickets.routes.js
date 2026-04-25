const express = require("express");
const router = express.Router();
const ticketsController = require("../controllers/tickets.controller");

router.post("/", ticketsController.create);
router.get("/booking/:bookingId", ticketsController.getByBooking);
router.delete("/:id", ticketsController.delete);

module.exports = router;
