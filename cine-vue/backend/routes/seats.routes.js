const express = require("express");
const router = express.Router();
const seatsController = require("../controllers/seats.controller");
const authMiddleware = require("../middleware/auth");
const requireRole = require("../middleware/role");
const adminOnly = requireRole(["admin"]);

const validate = require("../middleware/validate");
const schemas = require("../validations/schemas");

router.get("/room/:roomId", seatsController.getByRoom);

router.use(authMiddleware);
router.post("/", adminOnly, validate(schemas.seat), seatsController.create);
router.put("/:id/status", adminOnly, seatsController.updateStatus);
router.delete("/:id", adminOnly, seatsController.delete);

module.exports = router;
