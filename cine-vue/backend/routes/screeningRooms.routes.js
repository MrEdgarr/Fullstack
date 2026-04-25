const express = require("express");
const router = express.Router();
const screeningRoomsController = require("../controllers/screeningRooms.controller");
const authMiddleware = require("../middleware/auth");
const requireRole = require("../middleware/role");
const adminOnly = requireRole(["admin"]);

const validate = require("../middleware/validate");
const schemas = require("../validations/schemas");

router.get("/", screeningRoomsController.getAll);
router.get("/:id", screeningRoomsController.getById);

router.use(authMiddleware);

router.post("/", adminOnly, validate(schemas.screeningRoom), screeningRoomsController.create);
router.put("/:id", adminOnly, validate(schemas.screeningRoom), screeningRoomsController.update);
router.delete("/:id", adminOnly, screeningRoomsController.delete);

module.exports = router;
