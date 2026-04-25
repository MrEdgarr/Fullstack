const express = require("express");
const router = express.Router();
const ticketsController = require("../controllers/tickets.controller");
const authMiddleware = require("../middleware/auth");

const validate = require("../middleware/validate");
const schemas = require("../validations/schemas");

router.use(authMiddleware);

router.post("/", validate(schemas.ticket), ticketsController.create);
router.get("/booking/:bookingId", ticketsController.getByBooking);
router.delete("/:id", ticketsController.delete);

module.exports = router;
