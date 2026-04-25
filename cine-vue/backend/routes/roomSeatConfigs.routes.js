const express = require("express");
const router = express.Router();
const roomSeatConfigsController = require("../controllers/roomSeatConfigs.controller");
const authMiddleware = require("../middleware/auth");
const requireRole = require("../middleware/role");
const adminOnly = requireRole(["admin"]);

const validate = require("../middleware/validate");
const schemas = require("../validations/schemas");

router.get("/:roomId", roomSeatConfigsController.getByRoom);

router.use(authMiddleware);
router.post("/", adminOnly, validate(schemas.roomConfig), roomSeatConfigsController.create);
router.put("/:roomId", adminOnly, validate(schemas.roomConfig), roomSeatConfigsController.update);

module.exports = router;
