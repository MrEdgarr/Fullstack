const express = require("express");
const seatsController = require("./seats.controller");
const authMiddleware = require("../../shared/middleware/auth");
const requireRole = require("../../shared/middleware/role");
const validate = require("../../shared/middleware/validate");
const { seatSchema, seatStatusSchema } = require("./seats.validation");

const router = express.Router();
const adminOnly = requireRole(["admin"]);

router.get("/room/:roomId", seatsController.getByRoom);
router.use(authMiddleware);
router.post("/", adminOnly, validate(seatSchema), seatsController.create);
router.put("/:id/status", adminOnly, validate(seatStatusSchema), seatsController.updateStatus);
router.delete("/:id", adminOnly, seatsController.delete);

module.exports = router;
