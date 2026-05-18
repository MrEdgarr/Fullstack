const express = require("express");
const ticketsController = require("./tickets.controller");
const authMiddleware = require("../../shared/middleware/auth");
const requireRole = require("../../shared/middleware/role");
const validate = require("../../shared/middleware/validate");
const { ticketSchema } = require("./tickets.validation");

const router = express.Router();
const adminOnly = requireRole(["admin"]);

router.use(authMiddleware);
router.post("/", adminOnly, validate(ticketSchema), ticketsController.create);
router.get("/booking/:bookingId", ticketsController.getByBooking);
router.delete("/:id", adminOnly, ticketsController.delete);

module.exports = router;
